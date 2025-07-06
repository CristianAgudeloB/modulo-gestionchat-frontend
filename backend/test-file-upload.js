const fs = require('fs');
const path = require('path');
const { executeQuery } = require('./config/database.connect');

async function testFileUpload() {
  try {
    console.log('🧪 Probando funcionalidad de archivos...');
    
    // 1. Verificar que las tablas de tipos existen
    console.log('\n1. Verificando tablas de tipos...');
    
    const tipoArchivoResult = await executeQuery('SELECT * FROM TIPOARCHIVO');
    console.log('✅ Tipos de archivo encontrados:', tipoArchivoResult.rows);
    
    const tipoContenidoResult = await executeQuery('SELECT * FROM TIPOCONTENIDO');
    console.log('✅ Tipos de contenido encontrados:', tipoContenidoResult.rows);
    
    // 2. Verificar mensajes existentes con contenido
    console.log('\n2. Verificando mensajes con contenido...');
    
    const mensajesResult = await executeQuery(`
      SELECT m.*, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO, c.LOCALIZACONTENIDO,
             tc.DESCTIPOCONTENIDO, ta.DESCTIPOARCHIVO
      FROM MENSAJE m
      LEFT JOIN CONTENIDO c ON m.USE_CONSECUSER = c.USE_CONSECUSER 
                           AND m.CONSECUSER = c.CONSECUSER 
                           AND m.CONSMENSAJE = c.CONSMENSAJE
      LEFT JOIN TIPOCONTENIDO tc ON c.IDTIPOCONTENIDO = tc.IDTIPOCONTENIDO
      LEFT JOIN TIPOARCHIVO ta ON c.IDTIPOARCHIVO = ta.IDTIPOARCHIVO
      ORDER BY m.FECHAREGMEN DESC
    `);
    
    console.log('✅ Mensajes encontrados:', mensajesResult.rows.length);
    mensajesResult.rows.forEach((msg, index) => {
      console.log(`   Mensaje ${index + 1}:`, {
        id: `${msg.USE_CONSECUSER}-${msg.CONSECUSER}-${msg.CONSMENSAJE}`,
        tipoContenido: msg.DESCTIPOCONTENIDO,
        tipoArchivo: msg.DESCTIPOARCHIVO,
        contenido: msg.LOCALIZACONTENIDO
      });
    });
    
    // 3. Probar inserción de un mensaje con archivo simulado
    console.log('\n3. Probando inserción de mensaje con archivo...');
    
    // Crear un archivo de prueba
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Este es un archivo de prueba para el chat');
    
    // Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(testFilePath);
    
    // Insertar mensaje con archivo
    const messageId = await generateMessageId();
    const messageData = {
      useConsecUser: 'U0001',
      consecUser: 'U0002',
      consMensaje: messageId,
      codGrupo: null
    };
    
    // Insertar mensaje
    await executeQuery(`
      INSERT INTO MENSAJE (
        USE_CONSECUSER, CONSECUSER, CONSMENSAJE, 
        MEN_USE_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE, 
        CODGRUPO, FECHAREGMEN
      ) VALUES (
        :useConsecUser, :consecUser, :consMensaje, 
        NULL, NULL, NULL, 
        :codGrupo, SYSDATE
      )
    `, messageData);
    
    // Verificar que los tipos existen antes de insertar
    const tipoContenidoCheck = await executeQuery('SELECT COUNT(*) as count FROM TIPOCONTENIDO WHERE IDTIPOCONTENIDO = :id', { id: 'MM' });
    const tipoArchivoCheck = await executeQuery('SELECT COUNT(*) as count FROM TIPOARCHIVO WHERE IDTIPOARCHIVO = :id', { id: 'DO' });
    
    if (tipoContenidoCheck.rows[0].COUNT === 0) {
      console.log('⚠️  Tipo de contenido MM no existe. Insertando...');
      await executeQuery('INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES (:id, :desc)', { id: 'MM', desc: 'Multimedia' });
    }
    
    if (tipoArchivoCheck.rows[0].COUNT === 0) {
      console.log('⚠️  Tipo de archivo DO no existe. Insertando...');
      await executeQuery('INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES (:id, :desc)', { id: 'DO', desc: 'Documento' });
    }
    
    // Insertar contenido con archivo
    await executeQuery(`
      INSERT INTO CONTENIDO (
        USE_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECCONTENIDO,
        IDTIPOCONTENIDO, IDTIPOARCHIVO, CONTENIDOIMAG, LOCALIZACONTENIDO
      ) VALUES (
        :useConsecUser, :consecUser, :consMensaje, 1,
        'MM', 'DO', :contenidoImagen, :localizacionContenido
      )
    `, {
      useConsecUser: messageData.useConsecUser,
      consecUser: messageData.consecUser,
      consMensaje: messageData.consMensaje,
      contenidoImagen: fileBuffer,
      localizacionContenido: 'test-file.txt'
    });
    
    console.log('✅ Mensaje con archivo insertado correctamente');
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testFilePath);
    
    // 4. Verificar que el archivo se puede recuperar
    console.log('\n4. Probando recuperación de archivo...');
    
    const fileResult = await executeQuery(`
      SELECT c.CONTENIDOIMAG, c.LOCALIZACONTENIDO, c.IDTIPOARCHIVO, c.IDTIPOCONTENIDO
      FROM CONTENIDO c
      WHERE c.USE_CONSECUSER = :useConsecUser 
        AND c.CONSECUSER = :consecUser 
        AND c.CONSMENSAJE = :consMensaje
    `, {
      useConsecUser: messageData.useConsecUser,
      consecUser: messageData.consecUser,
      consMensaje: messageData.consMensaje
    });
    
    if (fileResult.rows.length > 0) {
      const fileData = fileResult.rows[0];
      console.log('✅ Archivo recuperado:', {
        nombre: fileData.LOCALIZACONTENIDO,
        tipoArchivo: fileData.IDTIPOARCHIVO,
        tipoContenido: fileData.IDTIPOCONTENIDO,
        tamaño: fileData.CONTENIDOIMAG ? fileData.CONTENIDOIMAG.length : 0
      });
    }
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

// Función auxiliar para generar un ID de mensaje único
async function generateMessageId() {
  const sql = `
    SELECT NVL(MAX(CONSMENSAJE), 0) + 1 as nextId
    FROM MENSAJE
  `;
  const result = await executeQuery(sql);
  return result.rows[0].NEXTID;
}

// Ejecutar las pruebas
testFileUpload(); 