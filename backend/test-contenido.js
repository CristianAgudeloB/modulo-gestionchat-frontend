const { executeQuery } = require('./config/database.connect');

(async () => {
  const sql = `
    SELECT m.USE_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, c.CONSECCONTENIDO, c.LOCALIZACONTENIDO
    FROM MENSAJE m
    INNER JOIN CONTENIDO c ON TRIM(m.USE_CONSECUSER) = TRIM(c.USE_CONSECUSER)
      AND TRIM(m.CONSECUSER) = TRIM(c.CONSECUSER)
      AND TO_NUMBER(m.CONSMENSAJE) = TO_NUMBER(c.CONSMENSAJE)
      AND TO_NUMBER(c.CONSECCONTENIDO) = 1
    WHERE m.USE_CONSECUSER = '739D9' AND m.CONSECUSER = '22DDA' AND m.CONSMENSAJE = 1
  `;
  const result = await executeQuery(sql);
  console.log(result.rows);
  process.exit(0);
})(); 