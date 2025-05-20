const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generarPDF(tipo, resumen, datos, ruta) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(ruta);
    doc.pipe(stream);

      // 🔻 INSERTAR EL LOGO EN LA ESQUINA SUPERIOR IZQUIERDA
    const logoPath = path.join(__dirname, "../imagenes", "logo1.png");
    try {
      doc.image(logoPath, 40, 30, { width: 80 }); // x = 40, y = 30
      doc.moveDown(3); // Espacio después del logo
    } catch (err) {
      console.error("No se pudo cargar el logo:", err.message);
    }

    // Título e introducción dinámicos
    let titulo = "";
    let introduccion = "";

    switch (tipo) {
      case "ventas":
        titulo = "Reporte de Ventas (últimos 7 días)";
        introduccion = "Este reporte contiene el registro de las ventas realizadas durante la última semana, incluyendo los datos del cliente, método de pago, estado de la transacción y total pagado.";
        break;
      case "productos":
        titulo = "Reporte de Inventario de Productos";
        introduccion = "Este reporte incluye todos los productos registrados en el sistema, mostrando información clave como nombre, precio, cantidad en stock, categoría y proveedor.";
        break;
      case "usuarios":
        titulo = "Reporte de Usuarios Registrados";
        introduccion = "Este documento lista todos los usuarios que tienen acceso al sistema, detallando su nombre, correo electrónico, rol asignado y fecha de registro.";
        break;
      default:
        titulo = `Reporte del sistema: ${tipo}`;
        introduccion = "Este reporte fue generado automáticamente por la plataforma Autorrepuestos.";
    }

    // Cabecera del PDF
    doc.fontSize(20).text(titulo, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(introduccion, { align: "left" });
    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Resumen: ${resumen}`);
    doc.moveDown();

    // Contenido por tipo de reporte
    switch (tipo) {
      case "ventas":
        datos.forEach((venta, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. Compra ID: ${venta.id}`);
          doc.font("Helvetica").text(`  Cliente: ${venta.nombre_cliente}`);
          doc.text(`  Email: ${venta.email_cliente}`);
          doc.text(`  Contacto: ${venta.contacto}`);
          doc.text(`  Dirección: ${venta.direccion_envio}`);
          doc.text(`  Método de pago: ${venta.metodo_pago}`);
          doc.text(`  Estado de pago: ${venta.estado_pago}`);
          doc.text(`  Total: $${venta.total}`);
          doc.text(`  Fecha: ${new Date(venta.fecha_compra).toLocaleString()}`);
          doc.moveDown();
        });
        break;

      case "productos":
        datos.forEach((prod, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. Producto: ${prod.nombre}`);
          doc.font("Helvetica").text(`  Descripción: ${prod.descripcion}`);
          doc.text(`  Precio: $${prod.precio}`);
          doc.text(`  Stock: ${prod.stock}`);
          doc.text(`  Categoría: ${prod.categoria || 'Sin categoría'}`);
          doc.text(`  Proveedor: ${prod.proveedor || 'Sin proveedor'}`);
          doc.moveDown();
        });
        break;

      case "usuarios":
        datos.forEach((user, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. Nombre: ${user.nombre}`);
          doc.font("Helvetica").text(`  Email: ${user.email}`);
          doc.text(`  Rol: ${user.rol}`);
          doc.text(`  Fecha de creación: ${new Date(user.fecha_creacion).toLocaleString()}`);
          doc.moveDown();
        });
        break;

      default:
        doc.text("Tipo de reporte no soportado.");
    }

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
}

module.exports = generarPDF;
