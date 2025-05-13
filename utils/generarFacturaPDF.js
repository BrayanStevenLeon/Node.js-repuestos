const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generarFacturaPDF = (data, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Estilos
    const azul = '#ab2727';
    const grisClaro = '#f2f2f2';
    const negro = '#000000';

    // Ruta del logo
    const logoPath = path.join(__dirname, '../imagenes/logo1.png');

    // Insertar imagen del logo (si existe)
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 80 }); // Tamaño y posición del logo
    }

    // Título de la factura alineado a la derecha del logo
    doc.fillColor(azul)
       .fontSize(18)
       .text(`Factura de Compra #${data.compraId}`, 0, 50, { align: 'right' });

    doc.moveDown(2);

    // Datos del cliente
    doc.fillColor(negro).fontSize(12);
    doc.text(` Cliente: ${data.nombre}`);
    doc.text(` Dirección: ${data.direccion}`);
    doc.text(` Contacto: ${data.contacto}`);
    doc.text(` Método de pago: ${data.metodoPago}`);
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(14).fillColor(azul).text(' Detalle de productos', { underline: true });
    doc.moveDown(0.5);

    // Encabezados
    doc.fontSize(12).fillColor(negro);
    const startX = doc.x;
    const tableTop = doc.y;

    const columnWidths = {
      producto: 200,
      cantidad: 80,
      precio: 100,
      subtotal: 100,
    };

    // Fila de encabezados
    doc.rect(startX, tableTop, columnWidths.producto + columnWidths.cantidad + columnWidths.precio + columnWidths.subtotal, 20)
      .fill(grisClaro)
      .stroke();

    doc.fillColor(negro).text('Producto', startX + 5, tableTop + 5, { width: columnWidths.producto });
    doc.text('Cantidad', startX + columnWidths.producto + 5, tableTop + 5, { width: columnWidths.cantidad });
    doc.text('Precio', startX + columnWidths.producto + columnWidths.cantidad + 5, tableTop + 5, { width: columnWidths.precio });
    doc.text('Subtotal', startX + columnWidths.producto + columnWidths.cantidad + columnWidths.precio + 5, tableTop + 5, { width: columnWidths.subtotal });

    doc.moveDown(1.5);

    // Productos
    let y = tableTop + 25;
    data.carrito.forEach((item, index) => {
      const precio = Number(item.precio);
      const cantidad = Number(item.cantidad);
      const subtotal = precio * cantidad;

      // Alternancia de color por fila
      doc.rect(startX, y, columnWidths.producto + columnWidths.cantidad + columnWidths.precio + columnWidths.subtotal, 20)
        .fill(index % 2 === 0 ? '#ffffff' : '#e6e6e6')
        .stroke();

      doc.fillColor(negro).text(item.nombre, startX + 5, y + 5, { width: columnWidths.producto });
      doc.text(`${cantidad}`, startX + columnWidths.producto + 5, y + 5, { width: columnWidths.cantidad });
      doc.text(`$${precio.toFixed(2)}`, startX + columnWidths.producto + columnWidths.cantidad + 5, y + 5, { width: columnWidths.precio });
      doc.text(`$${subtotal.toFixed(2)}`, startX + columnWidths.producto + columnWidths.cantidad + columnWidths.precio + 5, y + 5, { width: columnWidths.subtotal });

      y += 20;
    });

    doc.y = y + 20;

    // Total
    const total = Number(data.total);
    doc.fontSize(14).fillColor(azul).text(`Total a pagar: $${total.toFixed(2)}`, {
      align: 'right'
    });

    doc.moveDown();
    doc.fillColor(negro).fontSize(12).text('¡Gracias por tu compra!', {
      align: 'center',
    });

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};

module.exports = generarFacturaPDF;
