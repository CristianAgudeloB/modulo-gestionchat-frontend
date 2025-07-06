const oracledb = require('oracledb');
const { executeQuery } = require('./config/database.connect');

async function checkMMType() {
  try {
    console.log('Verificando si existe el tipo de contenido MM...');
    
    const sql = `
      SELECT IDTIPOCONTENIDO, DESCTIPOCONTENIDO 
      FROM TIPOCONTENIDO 
      WHERE IDTIPOCONTENIDO = 'MM'
    `;
    
    const result = await executeQuery(sql);
    
    if (result.rows.length > 0) {
      console.log('✅ El tipo de contenido MM ya existe:', result.rows[0]);
    } else {
      console.log('❌ El tipo de contenido MM NO existe');
      console.log('Ejecutando inserción...');
      
      const insertSql = `
        INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO)
        VALUES ('MM', 'MULTIMEDIA')
      `;
      
      await executeQuery(insertSql, {}, { autoCommit: true });
      console.log('✅ Tipo de contenido MM insertado correctamente');
    }
    
    // Verificar todos los tipos de contenido
    const allTypesSql = `
      SELECT IDTIPOCONTENIDO, DESCTIPOCONTENIDO 
      FROM TIPOCONTENIDO 
      ORDER BY IDTIPOCONTENIDO
    `;
    
    const allTypes = await executeQuery(allTypesSql);
    console.log('\n📋 Todos los tipos de contenido disponibles:');
    allTypes.rows.forEach(row => {
      console.log(`  - ${row.IDTIPOCONTENIDO}: ${row.DESCTIPOCONTENIDO}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkMMType(); 