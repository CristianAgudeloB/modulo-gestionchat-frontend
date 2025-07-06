const Message = require('../models/Message');
const User = require('../models/User');
const { executeQuery } = require('../config/database.connect');

exports.sendMessage = async (req, res) => {
  try {
    console.log('Petición recibida en sendMessage:', req.body);
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
    
    // Insertar el contenido textual en la tabla CONTENIDO
    await executeQuery(
      `INSERT INTO CONTENIDO (
        USE_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECCONTENIDO,
        IDTIPOCONTENIDO, IDTIPOARCHIVO, CONTENIDOIMAG, LOCALIZACONTENIDO
      ) VALUES (
        :useConsecUser, :consecUser, :consMensaje, 1,
        'MS', NULL, EMPTY_BLOB(), :content
      )`,
      {
        useConsecUser: messageData.useConsecUser,
        consecUser: messageData.consecUser,
        consMensaje: messageData.consMensaje,
        content: content
      }
    );

    // Emitir evento de nuevo mensaje (para WebSocket)
    if (io) {
      if (receiverId) {
        // Mensaje directo
        io.to(receiverId).emit('newMessage', message);
      } else if (groupId) {
        // Mensaje a grupo
        io.to(`group_${groupId}`).emit('newGroupMessage', message);
      }
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error al enviar mensaje:', error, error?.stack);
    res.status(500).json({ error: 'Error al enviar el mensaje', details: error.message });
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

exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = require('../config/database.connect');
    // Buscar todos los usuarios con los que el usuario ha intercambiado mensajes
    const contactsSql = `
      SELECT DISTINCT
        CASE WHEN m.CONSECUSER = :userId THEN m.USE_CONSECUSER ELSE m.CONSECUSER END AS CONTACT_ID
      FROM MENSAJE m
      WHERE m.CONSECUSER = :userId OR m.USE_CONSECUSER = :userId
    `;
    const contactsResult = await db.executeQuery(contactsSql, { userId });
    const contactIds = contactsResult.rows.map(r => r.CONTACT_ID).filter(id => id !== userId);
    let chats = [];
    for (const contactId of contactIds) {
      // Obtener datos del contacto
      const userSql = `SELECT CONSECUSER, NOMBRE, APELLIDO, NOMBRE_USUARIO FROM USUARIO WHERE CONSECUSER = :contactId`;
      const userResult = await db.executeQuery(userSql, { contactId });
      const contact = userResult.rows[0];
      // Obtener el último mensaje entre el usuario y el contacto
      const lastMessageSql = `
        SELECT m.*, 
               u1.NOMBRE as NOMBRE_REMITENTE, u1.APELLIDO as APELLIDO_REMITENTE,
               u2.NOMBRE as NOMBRE_DESTINATARIO, u2.APELLIDO as APELLIDO_DESTINATARIO,
               c.CONTENIDOIMAG, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO,
               tc.DESCTIPOCONTENIDO
        FROM MENSAJE m
        JOIN USUARIO u1 ON m.CONSECUSER = u1.CONSECUSER
        JOIN USUARIO u2 ON m.USE_CONSECUSER = u2.CONSECUSER
        LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE AND c.CONSECCONTENIDO = 1
        LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
        WHERE (m.CONSECUSER = :userId AND m.USE_CONSECUSER = :contactId)
           OR (m.CONSECUSER = :contactId AND m.USE_CONSECUSER = :userId)
        ORDER BY m.FECHAREGMEN DESC
      `;
      const result = await db.executeQuery(lastMessageSql, { userId, contactId });
      if (result.rows.length > 0) {
        // Decodificar CONTENIDOIMAG si existe
        let lastMsg = result.rows[0];
        if (lastMsg.CONTENIDOIMAG) {
          lastMsg.CONTENIDOIMAG = require('../models/Message').decodeHexToString
            ? require('../models/Message').decodeHexToString(lastMsg.CONTENIDOIMAG)
            : lastMsg.CONTENIDOIMAG;
        }
        chats.push({
          type: 'user',
          contact,
          lastMessage: lastMsg
        });
      }
    }
    // (Opcional) Puedes mantener la lógica de grupos si usas grupos
    // Ordenar por fecha del último mensaje descendente
    chats.sort((a, b) => new Date(b.lastMessage.FECHAREGMEN) - new Date(a.lastMessage.FECHAREGMEN));
    console.log('Chats enviados al frontend:', JSON.stringify(chats, null, 2));
    res.json(chats);
  } catch (error) {
    console.error('Error al obtener lista de chats:', error);
    res.status(500).json({ error: 'Error al obtener lista de chats' });
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