const oracledb = require('oracledb');
const { executeQuery } = require('../config/database.connect');

class Message {
  static async create(messageData) {
    const sql = `
      INSERT INTO MENSAJE (
        USE_CONSECUSER, CONSECUSER, CONSMENSAJE, 
        MEN_USE_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE, 
        CODGRUPO, FECHAREGMEN
      ) VALUES (
        :useConsecUser, :consecUser, :consMensaje, 
        :menUseConsecUser, :menConsecUser, :menConsMensaje, 
        :codGrupo, SYSDATE
      )
    `;
    
    const binds = {
      useConsecUser: messageData.useConsecUser,
      consecUser: messageData.consecUser,
      consMensaje: messageData.consMensaje,
      menUseConsecUser: messageData.menUseConsecUser || null,
      menConsecUser: messageData.menConsecUser || null,
      menConsMensaje: messageData.menConsMensaje || null,
      codGrupo: messageData.codGrupo || null
    };

    const options = {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    const result = await executeQuery(sql, binds, options);
    return true;
  }
  
static async getByGroup(groupId) {
  const sql = `
    SELECT 
      m.*, 
      u.NOMBRE, u.APELLIDO, 
      c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
      tc.DESCTIPOCONTENIDO, ta.DESCTIPOARCHIVO,
      parent_c.LOCALIZACONTENIDO as PARENT_CONTENT,
      parent_c.IDTIPOARCHIVO as PARENT_FILE_TYPE
    FROM MENSAJE m
    JOIN USUARIO u ON m.CONSECUSER = u.CONSECUSER
    LEFT JOIN CONTENIDO c 
      ON m.USE_CONSECUSER = c.USE_CONSECUSER 
      AND m.CONSECUSER = c.CONSECUSER 
      AND m.CONSMENSAJE = c.CONSMENSAJE 
      AND c.CONSECCONTENIDO = 1
    LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
    LEFT JOIN TIPOARCHIVO ta ON c.IDTIPOARCHIVO = ta.IDTIPOARCHIVO
    LEFT JOIN MENSAJE parent_m 
      ON m.MEN_USE_CONSECUSER = parent_m.USE_CONSECUSER 
      AND m.MEN_CONSECUSER = parent_m.CONSECUSER 
      AND m.MEN_CONSMENSAJE = parent_m.CONSMENSAJE
    LEFT JOIN CONTENIDO parent_c 
      ON parent_m.USE_CONSECUSER = parent_c.USE_CONSECUSER 
      AND parent_m.CONSECUSER = parent_c.CONSECUSER 
      AND parent_m.CONSMENSAJE = parent_c.CONSMENSAJE
      AND parent_c.CONSECCONTENIDO = 1
    WHERE m.CODGRUPO = :groupId
    ORDER BY m.FECHAREGMEN ASC
  `;
  
  const result = await executeQuery(sql, { groupId });
  
  const messages = result.rows.map(row => {
    const message = {
      ...row,
      hasFile: !!row.IDTIPOARCHIVO,
      fileUrl: row.IDTIPOARCHIVO ? 
        `http://localhost:3000/api/messages/file/${row.USE_CONSECUSER}/${row.CONSECUSER}/${row.CONSMENSAJE}` : 
        null,
      replyTo: null
    };
    
    if (row.MEN_USE_CONSECUSER && row.MEN_CONSECUSER && row.MEN_CONSMENSAJE) {
      message.replyTo = {
        id: `${row.MEN_USE_CONSECUSER}-${row.MEN_CONSECUSER}-${row.MEN_CONSMENSAJE}`,
        text: row.PARENT_CONTENT || (row.PARENT_FILE_TYPE ? '[Archivo]' : '[Mensaje]')
      };
    }
    
    return message;
  });
  
  return messages;
}

  static async getByUser(userId) {
    const sql = `
      SELECT m.*, 
             u1.NOMBRE as NOMBRE_REMITENTE, u1.APELLIDO as APELLIDO_REMITENTE,
             u2.NOMBRE as NOMBRE_DESTINATARIO, u2.APELLIDO as APELLIDO_DESTINATARIO,
             c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
             tc.DESCTIPOCONTENIDO, ta.DESCTIPOARCHIVO
      FROM MENSAJE m
      JOIN USUARIO u1 ON m.CONSECUSER = u1.CONSECUSER
      JOIN USUARIO u2 ON m.USE_CONSECUSER = u2.CONSECUSER
      LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE AND c.CONSECCONTENIDO = 1
      LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
      LEFT JOIN TIPOARCHIVO ta ON c.IDTIPOARCHIVO = ta.IDTIPOARCHIVO
      WHERE m.USE_CONSECUSER = :userId OR m.CONSECUSER = :userId
      ORDER BY m.FECHAREGMEN DESC
    `;
    
  const result = await executeQuery(sql, { userId });
  
  // Procesar resultados para incluir información de respuestas
  result.rows = result.rows.map(row => {
    const message = {
      ...row,
      hasFile: !!row.IDTIPOARCHIVO,
      fileUrl: row.IDTIPOARCHIVO ? `http://localhost:3000/api/messages/file/${row.USE_CONSECUSER}/${row.CONSECUSER}/${row.CONSMENSAJE}` : null
    };
    
    // Si es una respuesta, agregar información del mensaje padre
    if (row.MEN_USE_CONSECUSER && row.MEN_CONSECUSER && row.MEN_CONSMENSAJE) {
      message.replyTo = {
        id: `${row.MEN_USE_CONSECUSER}-${row.MEN_CONSECUSER}-${row.MEN_CONSMENSAJE}`,
        text: row.PARENT_LOCALIZACONTENIDO,
        sender: row.MEN_CONSECUSER === userId ? 'me' : 'them',
        hasFile: !!row.PARENT_IDTIPOARCHIVO
      };
    }
    
    return message;
  });
  
  return result.rows;
}

  static async getByGroup(groupId) {
    const sql = `
      SELECT m.*, u.NOMBRE, u.APELLIDO, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
             tc.DESCTIPOCONTENIDO, ta.DESCTIPOARCHIVO
      FROM MENSAJE m
      JOIN USUARIO u ON m.CONSECUSER = u.CONSECUSER
      LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE AND c.CONSECCONTENIDO = 1
      LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
      LEFT JOIN TIPOARCHIVO ta ON c.IDTIPOARCHIVO = ta.IDTIPOARCHIVO
      WHERE m.CODGRUPO = :groupId
      ORDER BY m.FECHAREGMEN DESC
    `;
    
    const result = await executeQuery(sql, { groupId });
    result.rows = result.rows.map(row => ({
      ...row,
      hasFile: !!row.IDTIPOARCHIVO,
      fileUrl: row.IDTIPOARCHIVO ? `http://localhost:3000/api/messages/file/${row.USE_CONSECUSER}/${row.CONSECUSER}/${row.CONSMENSAJE}` : null
    }));
    console.log("Mensajes enviados al frontend (grupo):", result.rows);
    return result.rows;
  }

  static async getThread(parentMessageId) {
    const sql = `
      SELECT m.*, u.NOMBRE, u.APELLIDO
      FROM MENSAJE m
      JOIN USUARIO u ON m.CONSECUSER = u.CONSECUSER
      WHERE m.MEN_USE_CONSECUSER = :useConsecUser
        AND m.MEN_CONSECUSER = :consecUser
        AND m.MEN_CONSMENSAJE = :consMensaje
      ORDER BY m.FECHAREGMEN
    `;
    
    const result = await executeQuery(sql, parentMessageId);
    return result.rows;
  }
}

function decodeHexToString(hex) {
  if (!hex) return '';
  return Buffer.from(hex, 'hex').toString('utf8');
}

module.exports = Message;
module.exports.decodeHexToString = decodeHexToString;