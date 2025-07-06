const { executeQuery } = require('./config/database.connect');

async function fixDatabase() {
  try {
    console.log('🔧 Verificando y corrigiendo la base de datos...');
    
    // 1. Verificar si las tablas de tipos existen y tienen datos
    console.log('\n1. Verificando tablas de tipos...');
    
    const tipoArchivoResult = await executeQuery('SELECT * FROM TIPOARCHIVO');
    console.log('✅ Tipos de archivo encontrados:', tipoArchivoResult.rows.length);
    
    const tipoContenidoResult = await executeQuery('SELECT * FROM TIPOCONTENIDO');
    console.log('✅ Tipos de contenido encontrados:', tipoContenidoResult.rows.length);
    
    // 2. Si no hay datos, insertarlos
    if (tipoArchivoResult.rows.length === 0) {
      console.log('\n2. Insertando tipos de archivo...');
      
      const tiposArchivo = [
        ['IM', 'Imagen'],
        ['VD', 'Video'],
        ['AU', 'Audio'],
        ['DO', 'Documento']
      ];
      
      for (const [id, desc] of tiposArchivo) {
        try {
          await executeQuery(
            'INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES (:id, :desc)',
            { id, desc }
          );
          console.log(`   ✅ Insertado: ${id} - ${desc}`);
        } catch (error) {
          if (error.errorNum === 1) { // ORA-00001: unique constraint violated
            console.log(`   ⚠️  Ya existe: ${id} - ${desc}`);
          } else {
            console.log(`   ❌ Error insertando ${id}:`, error.message);
          }
        }
      }
    }
    
    if (tipoContenidoResult.rows.length === 0) {
      console.log('\n3. Insertando tipos de contenido...');
      
      const tiposContenido = [
        ['MS', 'Mensaje simple'],
        ['MM', 'Multimedia']
      ];
      
      for (const [id, desc] of tiposContenido) {
        try {
          await executeQuery(
            'INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES (:id, :desc)',
            { id, desc }
          );
          console.log(`   ✅ Insertado: ${id} - ${desc}`);
        } catch (error) {
          if (error.errorNum === 1) { // ORA-00001: unique constraint violated
            console.log(`   ⚠️  Ya existe: ${id} - ${desc}`);
          } else {
            console.log(`   ❌ Error insertando ${id}:`, error.message);
          }
        }
      }
    }
    
    // 3. Verificar usuarios de prueba
    console.log('\n4. Verificando usuarios de prueba...');
    
    const usuariosResult = await executeQuery('SELECT COUNT(*) as count FROM USUARIO');
    console.log(`   Usuarios encontrados: ${usuariosResult.rows[0].COUNT}`);
    
    if (usuariosResult.rows[0].COUNT === 0) {
      console.log('   ⚠️  No hay usuarios. Ejecutando insert.sql...');
      console.log('   💡 Ejecuta manualmente: sqlplus usuario/password@database @insert.sql');
    }
    
    // 4. Verificar ubicaciones
    console.log('\n5. Verificando ubicaciones...');
    
    const ubicacionesResult = await executeQuery('SELECT COUNT(*) as count FROM UBICACION');
    console.log(`   Ubicaciones encontradas: ${ubicacionesResult.rows[0].COUNT}`);
    
    if (ubicacionesResult.rows[0].COUNT === 0) {
      console.log('   ⚠️  No hay ubicaciones. Insertando datos básicos...');
      
      try {
        // Insertar tipos de ubicación
        await executeQuery("INSERT INTO TIPOUBICA (CODTIPOUBICA, DESCTIPOUBICA) VALUES ('PAS', 'País')");
        await executeQuery("INSERT INTO TIPOUBICA (CODTIPOUBICA, DESCTIPOUBICA) VALUES ('DEP', 'Departamento')");
        await executeQuery("INSERT INTO TIPOUBICA (CODTIPOUBICA, DESCTIPOUBICA) VALUES ('CIU', 'Ciudad')");
        
        // Insertar ubicaciones básicas
        await executeQuery("INSERT INTO UBICACION (CODUBICA, UBI_CODUBICA, CODTIPOUBICA, NOMUBICA) VALUES ('COL', NULL, 'PAS', 'Colombia')");
        await executeQuery("INSERT INTO UBICACION (CODUBICA, UBI_CODUBICA, CODTIPOUBICA, NOMUBICA) VALUES ('ANT', 'COL', 'DEP', 'Antioquia')");
        await executeQuery("INSERT INTO UBICACION (CODUBICA, UBI_CODUBICA, CODTIPOUBICA, NOMUBICA) VALUES ('MED', 'ANT', 'CIU', 'Medellín')");
        
        console.log('   ✅ Ubicaciones básicas insertadas');
      } catch (error) {
        console.log('   ⚠️  Error insertando ubicaciones:', error.message);
      }
    }
    
    // 5. Verificar que todo esté correcto
    console.log('\n6. Verificación final...');
    
    const finalTipoArchivo = await executeQuery('SELECT * FROM TIPOARCHIVO');
    const finalTipoContenido = await executeQuery('SELECT * FROM TIPOCONTENIDO');
    
    console.log('   Tipos de archivo disponibles:');
    finalTipoArchivo.rows.forEach(row => {
      console.log(`     ${row.IDTIPOARCHIVO} - ${row.DESCTIPOARCHIVO}`);
    });
    
    console.log('   Tipos de contenido disponibles:');
    finalTipoContenido.rows.forEach(row => {
      console.log(`     ${row.IDTIPOCONTENIDO} - ${row.DESCTIPOCONTENIDO}`);
    });
    
    console.log('\n🎉 Base de datos verificada y corregida exitosamente!');
    console.log('💡 Ahora puedes ejecutar: npm run test-files');
    
  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la verificación
fixDatabase(); 