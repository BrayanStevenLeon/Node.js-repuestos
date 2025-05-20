const { getConnection } = require("../src/database"); // asegúrate de que exportas getConnection en tu archivo database.js
const generarPDF = require("../utils/generarPDF");
const path = require("path");
const fs = require("fs");

const generarReporte = async (req, res) => {
  try {
    const { tipo, usuario } = req.body;

    if (!usuario) return res.status(401).json({ message: "No autenticado" });

    const connection = await getConnection(); 

    let datos = [];
    let resumen = "";

    switch (tipo) {
      case "ventas":
        [datos] = await connection.query(
          "SELECT * FROM compras WHERE fecha_compra >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
        );
        const total = datos.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
        resumen = `Ventas de la semana: ${datos.length} - Total: $${total}`;
        break;
      case "productos":
        [datos] = await connection.query(`
            SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
          `);
        resumen = `Total de productos: ${datos.length}`;
        break;
      case "usuarios":
        [datos] = await connection.query("SELECT * FROM usuarios");
        resumen = `Total de usuarios: ${datos.length}`;
        break;
      default:
        return res.status(400).json({ message: "Tipo de reporte inválido" });
    }

    const carpetaReportes = path.join(__dirname, "..", "reportes");
    if (!fs.existsSync(carpetaReportes)) {
      fs.mkdirSync(carpetaReportes);
    }

    const archivoNombre = `reporte-${tipo}-${Date.now()}.pdf`;
    const rutaArchivo = path.join(carpetaReportes, archivoNombre);

    await generarPDF(tipo, resumen, datos, rutaArchivo);

    await connection.query(
      `
            INSERT INTO reportes (usuario_id, tipo, archivo)
            VALUES (?, ?, ?)`,
      [usuario.id, tipo, archivoNombre]
    );

    res.json({
      message: "Reporte generado correctamente",
      archivo: archivoNombre,
    });
  } catch (error) {
    console.error("Error generando el reporte:", error);
    res.status(500).json({ message: "Error al generar el reporte" });
  }
};

const obtenerHistorialReportes = async (req, res) => {
  try {
    const connection = await getConnection();

    const [reportes] = await connection.query(`
      SELECT r.id, r.tipo, r.fecha_generacion, r.archivo, u.nombre AS usuario
      FROM reportes r
      JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.fecha_generacion DESC
    `);

    res.json({ reportes });
  } catch (error) {
    console.error("Error al obtener historial de reportes:", error);
    res.status(500).json({ message: "Error al obtener historial de reportes." });
  }
};

const obtenerResumen = async (req, res) => {
  try {
    const connection = await getConnection();

    const [[{ totalVentas }]] = await connection.query('SELECT COUNT(*) AS totalVentas FROM compras');
    const [[{ totalUsuarios }]] = await connection.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');
    const [[{ totalProductos }]] = await connection.query('SELECT COUNT(*) AS totalProductos FROM productos');

    res.json({
      totalVentas,
      totalUsuarios,
      totalProductos
    });
  } catch (err) {
    console.error('Error al obtener resumen:', err);
    res.status(500).json({ error: 'Error al obtener el resumen' });
  }
};

//grafica 1

const obtenerVentasPorDia = async (req, res) => {
  try {
    const connection = await getConnection();
    const [result] = await connection.query(`
      SELECT DATE(fecha_compra) AS fecha, COUNT(*) AS total_ventas
      FROM compras
      WHERE fecha_compra >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_compra)
      ORDER BY fecha ASC
    `);

    res.json(result);
  } catch (error) {
    console.error("Error al obtener ventas por día:", error);
    res.status(500).json({ message: "Error al obtener las ventas por día" });
  }
};

//Grafica 2
const getProductosMasVendidos = async (req, res) => {
  try {
    const connection = await getConnection(); // <- Asegúrate de obtener la conexión

    const [result] = await connection.query(`
      SELECT p.nombre, SUM(dc.cantidad) AS total_vendidos
      FROM detalle_compra dc
      JOIN productos p ON dc.producto_id = p.id
      GROUP BY dc.producto_id
      ORDER BY total_vendidos DESC
      LIMIT 5
    `);

    res.json(result);
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err.message);
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

//grafica 3
const obtenerVentasPorCategoria = async (req, res) => {
  try {
    const connection = await getConnection();
    const [result] = await connection.query(`
      SELECT c.nombre AS categoria, SUM(dc.cantidad) AS total_vendido
      FROM detalle_compra dc
      JOIN productos p ON dc.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      GROUP BY c.nombre
      ORDER BY total_vendido DESC
    `);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener ventas por categoría:', error);
    res.status(500).json({ error: 'Error al obtener ventas por categoría' });
  }
};

//grafica 4

const obtenerEstadoPedidosPorDia = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(`
      SELECT 
        DATE(fecha_compra) AS fecha,
        estado_pago,
        COUNT(*) AS total
      FROM compras
      WHERE fecha_compra >= CURDATE() - INTERVAL 7 DAY
      GROUP BY fecha, estado_pago
      ORDER BY fecha ASC
    `);

    // Estructurar los datos por estado_pago
    const datosPorEstado = {};
    const fechas = [];

    for (const row of rows) {
      const fecha = row.fecha.toISOString().split('T')[0];
      if (!fechas.includes(fecha)) fechas.push(fecha);

      if (!datosPorEstado[row.estado_pago]) {
        datosPorEstado[row.estado_pago] = {};
      }
      datosPorEstado[row.estado_pago][fecha] = row.total;
    }

    // Llenar los arrays con ceros donde no haya datos
    const estados = ['pendiente', 'pagado', 'cancelado'];
    const datasets = estados.map((estado) => {
      return {
        label: estado.charAt(0).toUpperCase() + estado.slice(1),
        data: fechas.map(f => datosPorEstado[estado]?.[f] || 0),
        borderColor: estado === 'pendiente' ? 'orange' : estado === 'pagado' ? 'green' : 'red',
        backgroundColor: 'transparent',
        tension: 0.3
      };
    });

    res.json({ labels: fechas, datasets });
  } catch (error) {
    console.error('Error al obtener estados de pedidos por día:', error);
    res.status(500).json({ error: 'Error al obtener estados de pedidos por día' });
  }
};

// reportesController.js
const obtenerLogsProductos = async (req, res) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.query(`
      SELECT 
        l.id,
        u.nombre AS nombre_usuario,
        l.accion,
        l.descripcion,
        l.fecha
      FROM logs_actividad l
      JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.producto_id IS NOT NULL
         OR l.accion = 'eliminación'
      ORDER BY l.fecha DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener los logs:', err);
    res.status(500).json({ error: 'Error al obtener los logs' });
  }
};

const obtenerLogsVentas = async (req, res) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.query(`
      SELECT 
        l.id,
        u.nombre AS nombre_usuario,
        l.accion,
        l.descripcion,
        l.fecha
      FROM logs_actividad l
      JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.compra_id IS NOT NULL
      ORDER BY l.fecha DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener logs de ventas:', err);
    res.status(500).json({ error: 'Error al obtener logs de ventas' });
  }
};

module.exports = {
  generarReporte,
  obtenerHistorialReportes,
  obtenerResumen,
  obtenerVentasPorDia,
  getProductosMasVendidos,
  obtenerVentasPorCategoria,
  obtenerEstadoPedidosPorDia,
  obtenerLogsProductos,
  obtenerLogsVentas
};
