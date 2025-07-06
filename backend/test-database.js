const { executeQuery } = require('./config/database.connect');

async function testDatabase() {
  try {
    console.log('=== VERIFICANDO DATOS EN LA BASE DE DATOS ===\n');

    // 1. Verificar TIPOCONTENIDO
    console.log('1. TIPOS DE CONTENIDO:');
    const tiposContenido = await executeQuery('SELECT * FROM TIPOCONTENIDO');
    console.log(tiposContenido.rows);
    console.log('');

    // 2. Verificar MENSAJE
    console.log('2. MENSAJES:');
    const mensajes = await executeQuery('SELECT * FROM MENSAJE ORDER BY FECHAREGMEN DESC');
    console.log(mensajes.rows);
    console.log('');

    // 3. Verificar CONTENIDO
    console.log('3. CONTENIDO:');
    const contenido = await executeQuery('SELECT * FROM CONTENIDO');
    console.log(contenido.rows);
    console.log('');

    // 4. Verificar MENSAJES CON CONTENIDO (JOIN)
    console.log('4. MENSAJES CON CONTENIDO (JOIN):');
    const mensajesConContenido = await executeQuery(`
      SELECT 
        m.*,
        u1.NOMBRE as NOMBRE_REMITENTE,
        u1.APELLIDO as APELLIDO_REMITENTE,
        u2.NOMBRE as NOMBRE_DESTINATARIO,
        u2.APELLIDO as APELLIDO_DESTINATARIO,
        c.CONTENIDOIMAG,
        c.LOCALIZACONTENIDO,
        tc.DESCTIPOCONTENIDO
      FROM MENSAJE m
      JOIN USUARIO u1 ON m.CONSECUSER = u1.CONSECUSER
      JOIN USUARIO u2 ON m.USE_CONSECUSER = u2.CONSECUSER
      LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER 
        AND m.CONSECUSER = c.CONSECUSER 
        AND m.CONSMENSAJE = c.CONSMENSAJE
      LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
      ORDER BY m.FECHAREGMEN DESC
    `);
    console.log('Mensajes con contenido:');
    mensajesConContenido.rows.forEach((row, index) => {
      console.log(`Mensaje ${index + 1}:`);
      console.log(`  Remitente: ${row.NOMBRE_REMITENTE} ${row.APELLIDO_REMITENTE}`);
      console.log(`  Destinatario: ${row.NOMBRE_DESTINATARIO} ${row.APELLIDO_DESTINATARIO}`);
      console.log(`  Fecha: ${row.FECHAREGMEN}`);
      console.log(`  CONTENIDOIMAG: ${row.CONTENIDOIMAG ? 'SÍ' : 'NO'}`);
      console.log(`  LOCALIZACONTENIDO: ${row.LOCALIZACONTENIDO || 'NULL'}`);
      console.log(`  Tipo contenido: ${row.DESCTIPOCONTENIDO || 'NULL'}`);
      console.log('');
    });

    // 5. Verificar USUARIOS
    console.log('5. USUARIOS:');
    const usuarios = await executeQuery('SELECT CONSECUSER, NOMBRE, APELLIDO FROM USUARIO');
    console.log(usuarios.rows);
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 