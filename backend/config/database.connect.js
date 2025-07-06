require('dotenv').config();
const oracledb = require('oracledb');
const config = require('../config');

oracledb.initOracleClient({ libDir: config.ORACLE_CLIENT });

const password = config.PASSWORD;
let connection = null;

async function abrirConexion() {
  if (connection) {
    console.log('Ya existe una conexión a Oracle');
    return connection;
  }
  try {
    connection = await oracledb.getConnection({
      user: 'system',
      password: password,
      connectString: 'localhost:1521/xe',
    });
    console.log('Conectado a Oracle Database');
    return connection;
  } catch (err) {
    console.error('Error al abrir conexión:', err.message);
    throw err;
  }
}

async function cerrarConexion() {
  if (connection) {
    try {
      await connection.close();
      console.log('Se ha cerrado la conexión a Oracle');
      connection = null;
    } catch (err) {
      console.error('Error al cerrar conexión:', err.message);
    }
  }
}

async function executeQuery(sql, binds = {}, options = {}) {
  const conn = await abrirConexion();
  try {
    const result = await conn.execute(sql, binds, { ...options, outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result;
  } catch (err) {
    console.error('Error al ejecutar query:', err.message);
    throw err;
  }
}

module.exports = {
  abrirConexion,
  cerrarConexion,
  executeQuery,
};
