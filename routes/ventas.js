// routes/ventas.js
const express = require('express');
const router = express.Router();
const { obtenerVentas, marcarComoPagado, marcarComoCancelado, descargarFactura, obtenerDetalleCompra} = require('../controllers/ventasController');

router.get('/', obtenerVentas);
router.put("/pagar/:id", marcarComoPagado);
router.put("/cancelar/:id", marcarComoCancelado);
router.get("/factura/:id", descargarFactura);
router.get('/detalle/:id', obtenerDetalleCompra);


module.exports = router;
