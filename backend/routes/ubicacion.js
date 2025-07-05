const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');

router.get('/', ubicacionController.getUbicaciones);

module.exports = router;