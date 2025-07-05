const { abrirConexion, cerrarConexion } = require('./database.connect');

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('=== TEST DE CONEXIÓN A BASE DE DATOS ===\n');
    
    // 1. Probar conexión
    console.log('1. Probando conexión a la base de datos...');
    connection = await abrirConexion();
    console.log('✅ Conexión exitosa\n');
    
    // 2. SELECT - Leer datos de la tabla UBICACION
    console.log('2. Ejecutando SELECT en tabla UBICACION...');
    const selectResult = await connection.execute(
      'SELECT * FROM USUARIO'
    );
    
    console.log('✅ SELECT exitoso. Registros encontrados:', selectResult.rows.length);
    console.log('Datos de la tabla UBICACION:');
    selectResult.rows.forEach(row => {
      console.log(`   - ${row[0]} | ${row[1]} | ${row[2]}`);
    });
    console.log();
    
    console.log('=== TEST COMPLETADO EXITOSAMENTE ===');
    console.log('✅ Conexión a la base de datos verificada');
    console.log('✅ SELECT en tabla UBICACION funcionó correctamente');
    
  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  } finally {
    // Cerrar conexión
    if (connection) {
      await cerrarConexion();
    }
  }
}

// Ejecutar el test
testDatabaseConnection().catch(console.error); 