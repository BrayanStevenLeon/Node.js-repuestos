const express = require('express');
const { login, logout, verificarSesion } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/perfil', verificarSesion);

module.exports = router;
