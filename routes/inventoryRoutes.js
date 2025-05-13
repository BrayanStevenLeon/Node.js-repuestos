const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const inventoryController = require('../controllers/inventoryController');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../imagenes/productos')),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

const upload = multer({ storage });

// Definición de rutas
router.get('/productos', inventoryController.getProducts);
router.post('/productos/agregar', upload.single('imagen'), inventoryController.addProduct);
router.put('/productos/editar/:id', upload.single('imagen'), inventoryController.updateProduct);
router.delete('/productos/eliminar/:id', inventoryController.deleteProduct);

module.exports = router;
