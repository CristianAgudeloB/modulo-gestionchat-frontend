const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/message');

// Enviar un nuevo mensaje
router.post('/', messagesController.sendMessage);

// Obtener mensajes de un usuario (tanto enviados como recibidos)
router.get('/user/:userId', messagesController.getUserMessages);

// Obtener mensajes de un grupo
router.get('/group/:groupId', messagesController.getGroupMessages);

// Obtener hilo de mensajes (respuestas)
router.get('/thread/:messageId', messagesController.getMessageThread);

module.exports = router;