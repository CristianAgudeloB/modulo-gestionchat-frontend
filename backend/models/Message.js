const { executeQuery } = require('../config/db');

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
      ) RETURNING USE_CONSECUSER, CONSECUSER, CONSMENSAJE INTO :id
    `;
    
    const binds = {
      useConsecUser: messageData.useConsecUser,
      consecUser: messageData.consecUser,
      consMensaje: messageData.consMensaje,
      menUseConsecUser: messageData.menUseConsecUser || null,
      menConsecUser: messageData.menConsecUser || null,
      menConsMensaje: messageData.menConsMensaje || null,
      codGrupo: messageData.codGrupo || null,
      id: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
    };

    const options = {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    const result = await executeQuery(sql, binds, options);
    return result.outBinds.id[0];
  }

  static async getByUser(userId) {
    const sql = `
      SELECT m.*, u1.NOMBRE as NOMBRE_REMITENTE, u1.APELLIDO as APELLIDO_REMITENTE,
             u2.NOMBRE as NOMBRE_DESTINATARIO, u2.APELLIDO as APELLIDO_DESTINATARIO
      FROM MENSAJE m
      JOIN USUARIO u1 ON m.CONSECUSER = u1.CONSECUSER
      JOIN USUARIO u2 ON m.USE_CONSECUSER = u2.CONSECUSER
      WHERE m.USE_CONSECUSER = :userId OR m.CONSECUSER = :userId
      ORDER BY m.FECHAREGMEN DESC
    `;
    
    const result = await executeQuery(sql, { userId });
    return result.rows;
  }

  static async getByGroup(groupId) {
    const sql = `
      SELECT m.*, u.NOMBRE, u.APELLIDO
      FROM MENSAJE m
      JOIN USUARIO u ON m.CONSECUSER = u.CONSECUSER
      WHERE m.CODGRUPO = :groupId
      ORDER BY m.FECHAREGMEN DESC
    `;
    
    const result = await executeQuery(sql, { groupId });
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

module.exports = Message;