const { executeQuery } = require('../config/database.connect');

class User {
  static async getById(userId) {
    const sql = `
      SELECT CONSECUSER, NOMBRE, APELLIDO, USUARIO, EMAIL, IMAGEUSER
      FROM USUARIO
      WHERE CONSECUSER = :userId
    `;
    
    const result = await executeQuery(sql, { userId });
    return result.rows[0];
  }

  static async getContacts(userId) {
    const sql = `
      (
        SELECT u.CONSECUSER, u.NOMBRE, u.APELLIDO, u.NOMBRE_USUARIO
        FROM AMIGO a
        JOIN USUARIO u ON a.CONSECUSER = u.CONSECUSER
        WHERE a.USE_CONSECUSER = :userId
      )
      UNION
      (
        SELECT u.CONSECUSER, u.NOMBRE, u.APELLIDO, u.NOMBRE_USUARIO
        FROM AMIGO a
        JOIN USUARIO u ON a.USE_CONSECUSER = u.CONSECUSER
        WHERE a.CONSECUSER = :userId
      )
    `;
    
    const result = await executeQuery(sql, { userId });
    return result.rows;
  }

  static async getGroups(userId) {
    const sql = `
      SELECT g.CODGRUPO, g.NOMGRUPO, g.IMAGGRUPO
      FROM PERTENECE p
      JOIN GRUPO g ON p.CODGRUPO = g.CODGRUPO
      WHERE p.CONSECUSER = :userId
    `;
    
    const result = await executeQuery(sql, { userId });
    return result.rows;
  }
}

module.exports = User;