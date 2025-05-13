const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

router.get('/', categoriasController.obtenerCategorias);
router.post('/agregar', categoriasController.agregarCategoria);
router.put('/editar/:id', categoriasController.editarCategoria);
router.delete('/eliminar/:id', categoriasController.eliminarCategoria);

module.exports = router;











