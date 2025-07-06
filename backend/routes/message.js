const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/message');
const { upload } = require('../middlewares/upload');

// Enviar un nuevo mensaje (con o sin archivo)
router.post('/', upload.single('file'), messagesController.sendMessage);

// Obtener mensajes de un usuario (tanto enviados como recibidos)
router.get('/user/:userId', messagesController.getUserMessages);

// Obtener mensajes de un grupo
router.get('/group/:groupId', messagesController.getGroupMessages);

// Obtener hilo de mensajes (respuestas)
router.get('/thread/:messageId', messagesController.getMessageThread);

// Obtener lista de chats (usuarios y grupos) con último mensaje
router.get('/user/:userId/chats', messagesController.getUserChats);

router.get('/user/contacts/:currentUserId', messagesController.getAllUsersExceptCurrent);

// Obtener archivo adjunto a un mensaje
router.get('/file/:useConsecUser/:consecUser/:consMensaje', messagesController.getFile);

module.exports = router;