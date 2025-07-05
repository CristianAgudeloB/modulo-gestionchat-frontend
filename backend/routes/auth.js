const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

// Login
router.post('/login', authController.login);

// Registro
router.post('/register', authController.register);

// Obtener datos del usuario autenticado
router.get('/me', authMiddleware, authController.getUserData);

module.exports = router;