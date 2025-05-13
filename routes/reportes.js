const express = require('express');
const router = express.Router();
const { generarReporte, obtenerHistorialReportes, obtenerResumen, obtenerVentasPorDia, getProductosMasVendidos, obtenerVentasPorCategoria, obtenerEstadoPedidosPorDia, obtenerLogsProductos, obtenerLogsVentas } = require('../controllers/reportesController');
const usuarioActual = require('../middleware/usuarioActual');

// Ruta para generar el reporte
router.post('/generar',  usuarioActual, generarReporte);

router.get('/historial', usuarioActual, obtenerHistorialReportes);

router.get("/resumen", obtenerResumen);

router.get('/ventas-por-dia', obtenerVentasPorDia);

router.get('/productos-mas-vendidos', getProductosMasVendidos);

router.get('/ventas-por-categoria', obtenerVentasPorCategoria);

router.get('/estados-pedidos', obtenerEstadoPedidosPorDia);

router.get('/logs-productos', obtenerLogsProductos);

router.get('/logs-ventas', obtenerLogsVentas);

module.exports = router;
