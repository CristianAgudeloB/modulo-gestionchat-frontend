const { executeQuery } = require('./config/database.connect');

async function insertMMType() {
  try {
    console.log('🔧 Insertando tipo MM (Multimedia) en la base de datos...');
    
    // Verificar si ya existe
    const checkResult = await executeQuery('SELECT COUNT(*) as count FROM TIPOCONTENIDO WHERE IDTIPOCONTENIDO = :id', { id: 'MM' });
    
    if (checkResult.rows[0].COUNT > 0) {
      console.log('✅ El tipo MM ya existe en la base de datos');
    } else {
      // Insertar el tipo MM
      await executeQuery(
        'INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES (:id, :desc)',
        { id: 'MM', desc: 'Multimedia' }
      );
      console.log('✅ Tipo MM (Multimedia) insertado correctamente');
    }
    
    // Verificar tipos existentes
    const allTypes = await executeQuery('SELECT * FROM TIPOCONTENIDO');
    console.log('\n📋 Tipos de contenido disponibles:');
    allTypes.rows.forEach(row => {
      console.log(`  - ${row.IDTIPOCONTENIDO}: ${row.DESCTIPOCONTENIDO}`);
    });
    
    console.log('\n🎉 Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

insertMMType(); 