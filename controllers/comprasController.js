const db = require("../src/database");
const path = require('path');
const generarFacturaPDF = require('../utils/generarFacturaPDF');
const fs = require('fs');
const transporter = require("../src/mailer"); 

const registrarCompra = async (req, res) => {
  const { nombre, email, direccion, contacto, metodoPago, carrito } = req.body;

  if (!carrito || carrito.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const estadoPago = metodoPago === 'tarjeta' ? 'pagado' : 'pendiente';
  const conn = await db.getConnection();

  for (const item of carrito) {
    const [stockResult] = await conn.execute(
      'SELECT nombre, stock FROM productos WHERE id = ?',
      [item.id]
    );

    const productoNombre = stockResult[0]?.nombre ?? "Producto desconocido";
    const stockDisponible = stockResult[0]?.stock ?? 0;

    if (stockDisponible < item.cantidad || stockDisponible <= 0) {
      return res.status(400).json({
        error: `No hay suficiente stock para "${productoNombre}". Stock actual: ${stockDisponible}`,
      });
    }
  }

  try {
    console.log("🔄 Iniciando transacción...");
    await conn.beginTransaction();

    const [compraResult] = await conn.execute(
      `INSERT INTO compras (nombre_cliente, email_cliente, direccion_envio, contacto, metodo_pago, estado_pago, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, email, direccion, contacto, metodoPago, estadoPago, total]
    );

    const compraId = compraResult.insertId;
    console.log("📝 Compra registrada con ID:", compraId);

    for (const item of carrito) {
      await conn.execute(
        `INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [compraId, item.id, item.cantidad, item.precio]
      );

      await conn.execute(
        `UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?`,
        [item.cantidad, item.id, item.cantidad]
      );
    }

    const facturaDir = path.join(__dirname, '../public/facturas');
    const pdfRelativePath = `facturas/factura_${compraId}.pdf`;
    const pdfAbsolutePath = path.join(facturaDir, `factura_${compraId}.pdf`);

    if (!fs.existsSync(facturaDir)) {
      fs.mkdirSync(facturaDir, { recursive: true });
    }

    await generarFacturaPDF({
      nombre,
      direccion,
      contacto,
      metodoPago,
      carrito,
      total,
      compraId
    }, pdfAbsolutePath);

    await conn.execute(
      `UPDATE compras SET factura_pdf = ? WHERE id = ?`,
      [pdfRelativePath, compraId]
    );

    await conn.commit();
    console.log("✅ Compra registrada correctamente.");

    // Intenta enviar el correo
    try {
      await enviarFacturaPorCorreo({ nombre, email, direccion, contacto, metodoPago, carrito, total, compraId });
      console.log("📧 Correo enviado");
    } catch (correoError) {
      console.error("⚠️ Error al enviar el correo:", correoError.message);
      // El envío falló, pero la compra ya fue registrada y no debemos romper el flujo
    }

    res.status(200).json({ success: true, compraId });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error al registrar la compra:", error.message);
    res.status(500).json({ error: "Error al registrar la compra." });
  }
};

const enviarFacturaPorCorreo = async ({ nombre, email, direccion, contacto, metodoPago, carrito, total, compraId }) => {
  const productosHtml = carrito.map(item => {
    const precio = Number(item.precio);
    return `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>$${precio.toFixed(2)}</td>
        <td>$${(precio * item.cantidad).toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const htmlFactura = `
    <h2>Factura de Compra #${compraId}</h2>
    <p><strong>Cliente:</strong> ${nombre}</p>
    <p><strong>Dirección:</strong> ${direccion}</p>
    <p><strong>Contacto:</strong> ${contacto}</p>
    <p><strong>Método de pago:</strong> ${metodoPago}</p>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${productosHtml}
      </tbody>
    </table>
    <h3>Total a pagar: $${total.toFixed(2)}</h3>
    <p>¡Gracias por tu compra!</p>
  `;

  const pdfPath = path.join(__dirname, '../public', `facturas/factura_${compraId}.pdf`);
  const pdfBuffer = fs.readFileSync(pdfPath);

  transporter.sendMail({
    from: `"Autorrepuestos" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Factura de tu compra #${compraId}`,
    html: htmlFactura,
    attachments: [
      {
        filename: `factura_${compraId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};


module.exports = {
  registrarCompra,
};
