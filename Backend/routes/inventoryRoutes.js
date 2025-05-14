const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const inventoryController = require('../controllers/inventoryController');

// Asegurar que exista la carpeta de imágenes
const uploadDir = path.join(__dirname, '../imagenes/productos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Definición de rutas
router.get('/productos', inventoryController.getProducts);
// Al agregar producto, procesar la imagen con multer
router.post('/productos/agregar', upload.single('imagen'), inventoryController.addProduct);
// Al editar producto, opcionalmente procesar nueva imagen
router.put('/productos/editar/:id', upload.single('imagen'), inventoryController.updateProduct);
// Eliminar producto
router.delete('/productos/eliminar/:id', inventoryController.deleteProduct);

module.exports = router;
