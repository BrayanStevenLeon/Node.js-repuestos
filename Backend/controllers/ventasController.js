const { getConnection } = require('../src/database');

exports.obtenerVentas = async (req, res) => {
  try {
    const db = await getConnection(); // Aquí sí estás esperando la promesa
    const [ventas] = await db.query("SELECT * FROM compras ORDER BY fecha_compra DESC");
    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener las ventas" });
  }
};

exports.marcarComoPagado = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    const conn = await getConnection();
    // 1) Actualizo el estado de la compra
    const [resultado] = await conn.execute(
      "UPDATE compras SET estado_pago = 'pagado' WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    // 2) Inserto el log en logs_actividad
    if (usuario_id) {
      const descripcion = `Cambio de estado de pago de la compra #${id} a "pagado"`;
      await conn.query(
        `INSERT INTO logs_actividad
           (usuario_id, producto_id, compra_id, accion, descripcion)
         VALUES (?, NULL, ?, 'cambio_estado_pago', ?)`,
        [usuario_id, id, descripcion]
      );
    }

    // 3) Devuelvo respuesta
    res.json({ mensaje: "Estado de pago actualizado a 'pagado'" });
  } catch (error) {
    console.error("Error al actualizar el estado de pago a pagado:", error);
    res.status(500).json({ mensaje: "Error al actualizar el estado de pago" });
  }
};


exports.marcarComoCancelado = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    const conn = await getConnection();
    // 1) Actualizo el estado de la compra
    const [resultado] = await conn.execute(
      "UPDATE compras SET estado_pago = 'cancelado' WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    // 2) Inserto el log en logs_actividad
    if (usuario_id) {
      const descripcion = `Cambio de estado de pago de la compra #${id} a "cancelado"`;
      await conn.query(
        `INSERT INTO logs_actividad
           (usuario_id, producto_id, compra_id, accion, descripcion)
         VALUES (?, NULL, ?, 'cambio_estado_pago', ?)`,
        [usuario_id, id, descripcion]
      );
    }

    // 3) Devuelvo respuesta
    res.json({ mensaje: "Estado de pago actualizado a 'cancelado'" });
  } catch (error) {
    console.error("Error al actualizar el estado de pago a cancelado:", error);
    res.status(500).json({ mensaje: "Error al cancelar la venta" });
  }
};

//Factura
exports.descargarFactura = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT factura_pdf FROM compras WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    const facturaPath = rows[0].factura_pdf; // <- este sí existe según tu base
    const fullPath = path.join(__dirname, '..', 'public', facturaPath);

    if (fs.existsSync(fullPath)) {
      res.download(fullPath); // ✅ descarga el archivo
    } else {
      res.status(404).json({ mensaje: "Archivo de factura no encontrado en el servidor" });
    }
  } catch (error) {
    console.error("Error al descargar la factura:", error);
    res.status(500).json({ mensaje: "Error al descargar la factura" });
  }
};

exports.obtenerDetalleCompra = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();
    const [detalle] = await conn.query(`
      SELECT p.nombre AS nombre_producto, dc.cantidad, dc.precio_unitario
      FROM detalle_compra dc
      JOIN productos p ON dc.producto_id = p.id
      WHERE dc.compra_id = ?
    `, [id]);

    res.json(detalle);
  } catch (error) {
    console.error("Error al obtener el detalle de la compra:", error);
    res.status(500).json({ mensaje: "Error al obtener el detalle" });
  }
};
