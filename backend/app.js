// app.js (versión consolidada)
const express = require('express');
const cors = require('cors');
const { abrirConexion, cerrarConexion } = require('../backend/config/database.connect');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

// ===== Mover estos endpoints desde server.js =====
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

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
    message: 'Servidor de gestión de chat',
    endpoints: {
      auth: '/api/auth',
      messages: '/api/messages',
      health: '/api/health',
      testConnection: '/api/test-connection',
      testQuery: '/api/test-query'
    }
  });
});
// ===== Fin de sección movida desde server.js =====

// Configuración de WebSocket (existente en app.js)
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ... (configuración de WebSocket existente)

// ===== Mover el graceful shutdown desde server.js =====
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
// ===== Fin de sección movida =====

// Iniciar servidor (usando server en lugar de app para WebSocket)
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/test-connection`);
  console.log(`   - GET /api/test-query`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - WebSocket /`);
});