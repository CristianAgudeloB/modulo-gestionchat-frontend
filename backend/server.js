const express = require('express');
const cors = require('cors');
const { abrirConexion, cerrarConexion } = require('./database.connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await abrirConexion();
    res.json({ 
      success: true, 
      message: 'Conexión a la base de datos exitosa',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al conectar con la base de datos',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Test query endpoint
app.get('/api/test-query', async (req, res) => {
  try {
    const connection = await abrirConexion();
    const result = await connection.execute('SELECT 1 as test FROM DUAL');
    res.json({ 
      success: true, 
      message: 'Query de prueba ejecutada correctamente',
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing test query:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al ejecutar query de prueba',
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor de prueba para gestión de chat',
    endpoints: {
      health: '/api/health',
      testConnection: '/api/test-connection',
      testQuery: '/api/test-query'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/test-connection`);
  console.log(`   - GET /api/test-query`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await cerrarConexion();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await cerrarConexion();
  process.exit(0);
}); 