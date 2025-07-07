require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { abrirConexion, cerrarConexion } = require('./config/database.connect');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/message');
const ubicacionRouter = require('./routes/ubicacion');
const groupRouter = require('./routes/group');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

(async () => {
  try {
    await abrirConexion();
    console.log('✅ Conexión a la base de datos establecida');
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  }

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/messages', messagesRouter);
   app.use('/api/groups', groupRouter);
  app.use('/api/ubicaciones', ubicacionRouter);

  app.get('/api/health', (req, res) =>
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() })
  );

  app.get('/api/test-connection', async (req, res) => {
    try {
      await abrirConexion();
      res.json({ success: true, message: 'Conexión a la base de datos exitosa', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error testing connection:', error);
      res.status(500).json({ success: false, message: 'Error al conectar con la base de datos', error: error.message });
    }
  });

  app.get('/api/test-query', async (req, res) => {
    try {
      const connection = await abrirConexion();
      const result = await connection.execute('SELECT 1 AS test FROM DUAL');
      res.json({ success: true, message: 'Query de prueba ejecutada correctamente', data: result.rows[0], timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error executing test query:', error);
      res.status(500).json({ success: false, message: 'Error al ejecutar query de prueba', error: error.message });
    }
  });

  app.get('/', (req, res) =>
    res.json({
      message: 'Servidor de gestión de chat',
      endpoints: {
        auth: '/api/auth',
        messages: '/api/messages',
        health: '/api/health',
        testConnection: '/api/test-connection',
        testQuery: '/api/test-query'
      }
    })
  );

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado (${socket.id})`);

  socket.on('join-groups', (groups) => {
    groups.forEach(groupId => {
      socket.join(`group_${groupId}`);
      console.log(`👥 Usuario unido a grupo: ${groupId}`);
    });
  });

    socket.on('sendMessage', async (msg) => {
      if (msg.groupId) {
        io.to(`group_${msg.groupId}`).emit('newGroupMessage', msg);
      }
      io.emit('receiveMessage', msg);
      try {
        const connection = await abrirConexion();
        await connection.execute(
          'INSERT INTO messages (user_id, content, created_at) VALUES (:user, :text, SYSTIMESTAMP)',
          { user: msg.userId, text: msg.text },
          { autoCommit: true }
        );
      } catch (err) {
        console.error('Error guardando mensaje:', err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Cliente desconectado (${socket.id}): ${reason}`);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
})();

const shutdown = async () => {
  console.log('🛑 Cerrando servidor...');
  server.close(async () => {
    await cerrarConexion();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
