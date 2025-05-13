const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const upload = require('../utils/upload'); // Este es el nuevo

// Rutas
router.get('/productos', inventoryController.getProducts);

// Agregar producto con imagen a Cloudinary
router.post('/productos/agregar', upload.single('imagen'), inventoryController.addProduct);

// Editar producto con nueva imagen en Cloudinary
router.put('/productos/editar/:id', upload.single('imagen'), inventoryController.updateProduct);

router.delete('/productos/eliminar/:id', inventoryController.deleteProduct);

module.exports = router;
