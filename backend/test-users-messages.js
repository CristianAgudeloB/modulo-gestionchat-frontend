const { executeQuery, abrirConexion, cerrarConexion } = require('./config/database.connect');

async function getAllUsers() {
  const sql = `SELECT CONSECUSER, NOMBRE, APELLIDO, NOMBRE_USUARIO, EMAIL FROM USUARIO`;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getMessagesForUser(consecuser) {
  const sql = `
    SELECT m.USE_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN,
           u1.NOMBRE AS REMITENTE_NOMBRE, u1.APELLIDO AS REMITENTE_APELLIDO,
           u2.NOMBRE AS DESTINATARIO_NOMBRE, u2.APELLIDO AS DESTINATARIO_APELLIDO,
           c.CONTENIDOIMAG, c.LOCALIZACONTENIDO
    FROM MENSAJE m
    JOIN USUARIO u1 ON m.CONSECUSER = u1.CONSECUSER
    JOIN USUARIO u2 ON m.USE_CONSECUSER = u2.CONSECUSER
    LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
    WHERE m.CONSECUSER = :consecuser OR m.USE_CONSECUSER = :consecuser
    ORDER BY m.FECHAREGMEN DESC
  `;
  const result = await executeQuery(sql, { consecuser });
  return result.rows;
}

async function main() {
  try {
    await abrirConexion();
    const users = await getAllUsers();
    for (const user of users) {
      console.log(`\nUsuario: ${user.NOMBRE} ${user.APELLIDO} (${user.CONSECUSER})`);
      const messages = await getMessagesForUser(user.CONSECUSER);
      if (messages.length === 0) {
        console.log('  No tiene mensajes.');
      } else {
        messages.forEach(msg => {
          let contenido = msg.LOCALIZACONTENIDO ? msg.LOCALIZACONTENIDO : (msg.CONTENIDOIMAG ? '[BLOB]' : '[Sin contenido]');
          console.log(
            `  [${msg.FECHAREGMEN}] ${msg.REMITENTE_NOMBRE} -> ${msg.DESTINATARIO_NOMBRE} : (ID ${msg.CONSMENSAJE}) Contenido: ${contenido}`
          );
        });
      }
    }
  } catch (err) {
    console.error('Error en test:', err);
  } finally {
    await cerrarConexion();
  }
}

main(); 