const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para crear un usuario
router.post('/users', userController.createUser);

// Ruta para obtener todos los usuarios
router.get('/users', userController.getUsers);

// Ruta para actualizar un usuario
router.put('/users/:id', userController.updateUser);

// Ruta para eliminar un usuario
router.delete('/users/:id', userController.deleteUser);


module.exports = router;
