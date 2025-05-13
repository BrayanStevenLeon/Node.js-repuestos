const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/', proveedoresController.obtenerProveedores);
router.post('/agregar', proveedoresController.agregarProveedor);
router.put('/editar/:id', proveedoresController.editarProveedor);
router.delete('/eliminar/:id', proveedoresController.eliminarProveedor);

module.exports = router;
