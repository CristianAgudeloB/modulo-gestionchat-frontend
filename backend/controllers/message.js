const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { senderId, receiverId, groupId, parentMessageId, content } = req.body;
    
    // Validar que el mensaje tenga un destinatario o grupo
    if (!receiverId && !groupId) {
      return res.status(400).json({ error: 'Debe especificar un destinatario o grupo' });
    }

    // Crear el mensaje base
    const messageData = {
      useConsecUser: receiverId || null, // Para mensajes directos
      consecUser: senderId,
      consMensaje: await generateMessageId(),
      codGrupo: groupId || null // Para mensajes de grupo
    };

    // Si es respuesta a otro mensaje
    if (parentMessageId) {
      const parentParts = parentMessageId.split('-');
      messageData.menUseConsecUser = parentParts[0];
      messageData.menConsecUser = parentParts[1];
      messageData.menConsMensaje = parentParts[2];
    }

    const message = await Message.create(messageData);
    
    // Aquí podrías agregar lógica para guardar contenido (texto, archivos, etc.)
    // usando la tabla CONTENIDO

    // Emitir evento de nuevo mensaje (para WebSocket)
    if (receiverId) {
      // Mensaje directo
      io.to(receiverId).emit('newMessage', message);
    } else if (groupId) {
      // Mensaje a grupo
      io.to(`group_${groupId}`).emit('newGroupMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};

exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.getByUser(userId);
    res.json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.getByGroup(groupId);
    res.json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes de grupo:', error);
    res.status(500).json({ error: 'Error al obtener mensajes de grupo' });
  }
};

exports.getMessageThread = async (req, res) => {
  try {
    const { messageId } = req.params;
    const parts = messageId.split('-');
    const thread = await Message.getThread({
      useConsecUser: parts[0],
      consecUser: parts[1],
      consMensaje: parts[2]
    });
    res.json(thread);
  } catch (error) {
    console.error('Error al obtener hilo de mensajes:', error);
    res.status(500).json({ error: 'Error al obtener hilo de mensajes' });
  }
};

// Función auxiliar para generar un ID de mensaje único
async function generateMessageId() {
  const sql = `
    SELECT NVL(MAX(CONSMENSAJE), 0) + 1 as nextId
    FROM MENSAJE
  `;
  const result = await executeQuery(sql);
  return result.rows[0].NEXTID;
}