const Message = require('../models/Message');
const User = require('../models/User');
const { executeQuery } = require('../config/database.connect');
const fs = require('fs');
const path = require('path');

exports.sendMessage = async (req, res) => {
  try {
    console.log('Petición recibida en sendMessage:', req.body, req.headers['content-type']);
    const io = req.app.get('io');
    // Permitir fallback para el campo de texto
    let content = req.body.content;
    if (!content) {
      content = req.body.text || req.body.message || '';
    }
    const { senderId, receiverId, groupId, parentMessageId } = req.body;
    
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
    
    // Determinar tipo de contenido y archivo
    let idTipoContenido = 'MS'; // Mensaje simple por defecto
    let idTipoArchivo = null;
    let contenidoImagen = null;
    let localizacionContenido = content || '';

    // Si hay archivo adjunto
    if (req.file) {
      const { getFileType } = require('../middlewares/upload');
      idTipoArchivo = getFileType(req.file.mimetype, req.file.originalname);
      idTipoContenido = 'MM'; // Siempre multimedia si hay archivo
      // Leer el archivo como buffer para almacenarlo en BLOB
      let fileBuffer = null;
      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path) {
        fileBuffer = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path);
      }
      contenidoImagen = fileBuffer;
      // Guardar SIEMPRE el nombre original del archivo (con extensión)
      localizacionContenido = req.file.originalname;
    }

    // Insertar el contenido en la tabla CONTENIDO
    await executeQuery(
      `INSERT INTO CONTENIDO (
        USE_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECCONTENIDO,
        IDTIPOCONTENIDO, IDTIPOARCHIVO, CONTENIDOIMAG, LOCALIZACONTENIDO
      ) VALUES (
        :useConsecUser, :consecUser, :consMensaje, 1,
        :idTipoContenido, :idTipoArchivo, :contenidoImagen, :localizacionContenido
      )`,
      {
        useConsecUser: messageData.useConsecUser,
        consecUser: messageData.consecUser,
        consMensaje: messageData.consMensaje,
        idTipoContenido,
        idTipoArchivo,
        contenidoImagen,
        localizacionContenido
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

    res.status(201).json({ 
      success: true, 
      message,
      hasFile: !!req.file,
      fileType: idTipoArchivo,
      fileName: req.file ? req.file.originalname : null
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error, error?.stack);
    res.status(500).json({ error: 'Error al enviar el mensaje', details: error.message });
  }
};

exports.getAllUsersExceptCurrent = async (req, res) => {
  try {
    const currentUserId = req.params.currentUserId;
    
    const sql = `
      SELECT CONSECUSER, NOMBRE, APELLIDO
      FROM USUARIO
      WHERE CONSECUSER != :currentUserId
      ORDER BY NOMBRE, APELLIDO
    `;
    
    const result = await executeQuery(sql, { currentUserId });
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener todos los usuarios'
    });
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
               c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
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
        let lastMsg = result.rows[0];
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

// Obtener archivo adjunto a un mensaje
exports.getFile = async (req, res) => {
  try {
    const { useConsecUser, consecUser, consMensaje } = req.params;
    
    const sql = `
      SELECT c.CONTENIDOIMAG, c.LOCALIZACONTENIDO, c.IDTIPOARCHIVO, c.IDTIPOCONTENIDO,
             ta.DESCTIPOARCHIVO, tc.DESCTIPOCONTENIDO
      FROM CONTENIDO c
      LEFT JOIN TIPOARCHIVO ta ON c.IDTIPOARCHIVO = ta.IDTIPOARCHIVO
      LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
      WHERE c.USE_CONSECUSER = :useConsecUser 
        AND c.CONSECUSER = :consecUser 
        AND c.CONSMENSAJE = :consMensaje
        AND c.CONSECCONTENIDO = 1
    `;
    
    const result = await executeQuery(sql, { useConsecUser, consecUser, consMensaje });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const fileData = result.rows[0];
    
    if (!fileData.CONTENIDOIMAG) {
      return res.status(404).json({ error: 'No hay archivo adjunto' });
    }
    
    // Configurar headers según el tipo de archivo
    const contentType = getContentTypeFromFileType(fileData.IDTIPOARCHIVO);
    const fileName = fileData.LOCALIZACONTENIDO || 'archivo';

    // LOGS DE DEPURACIÓN (eliminados para evitar mostrar ceros)
    // console.log('Tipo de CONTENIDOIMAG:', typeof fileData.CONTENIDOIMAG, Buffer.isBuffer(fileData.CONTENIDOIMAG));
    // console.log('Tamaño del BLOB:', fileData.CONTENIDOIMAG ? fileData.CONTENIDOIMAG.length : 0);

    // Si CONTENIDOIMAG es un stream (Lob), leerlo como buffer
    if (fileData.CONTENIDOIMAG && typeof fileData.CONTENIDOIMAG === 'object' && typeof fileData.CONTENIDOIMAG.pipe === 'function') {
      let chunks = [];
      fileData.CONTENIDOIMAG.on('data', (chunk) => {
        chunks.push(chunk);
      });
      fileData.CONTENIDOIMAG.on('end', () => {
        const buffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', fileData.IDTIPOARCHIVO === 'DO' ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        if (fileData.IDTIPOARCHIVO !== 'DO') {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
        res.send(buffer);
      });
      fileData.CONTENIDOIMAG.on('error', (err) => {
        console.error('Error leyendo BLOB:', err);
        res.status(500).json({ error: 'Error leyendo el archivo' });
      });
      return;
    }
    
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({ error: 'Error al obtener el archivo' });
  }
};

// Función auxiliar para obtener el content type basado en el tipo de archivo
function getContentTypeFromFileType(fileType) {
  const contentTypes = {
    'IM': 'image/jpeg',
    'VD': 'video/mp4',
    'AU': 'audio/mp3',
    'DO': 'application/octet-stream'
  };
  return contentTypes[fileType] || 'application/octet-stream';
}

// Función auxiliar para obtener el content type basado en la extensión del archivo
function getContentTypeFromFileName(fileName) {
  if (!fileName) return 'application/octet-stream';
  
  const extension = fileName.toLowerCase().split('.').pop();
  const contentTypes = {
    // Imágenes
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    
    // Documentos
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf'
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}