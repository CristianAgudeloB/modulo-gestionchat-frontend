# Módulo de Gestión de Chat - Frontend y Backend

Este proyecto implementa un sistema de chat completo con funcionalidad de adjuntar archivos, similar a WhatsApp.

## 🚀 Funcionalidades

### Chat Básico
- ✅ Mensajería en tiempo real
- ✅ Chat individual y grupal
- ✅ Historial de mensajes
- ✅ Interfaz responsive

### **NUEVA FUNCIONALIDAD: Adjuntar Archivos** 🎉
- ✅ **Imágenes**: JPG, PNG, GIF, WebP
- ✅ **Videos**: MP4, AVI, MOV, WMV
- ✅ **Audio**: MP3, WAV, OGG, M4A
- ✅ **Documentos**: PDF, DOC, DOCX, TXT
- ✅ Vista previa de archivos
- ✅ Descarga de archivos
- ✅ Límite de 10MB por archivo

## 🏗️ Arquitectura

### Backend (Node.js + Express + Oracle)
```
backend/
├── app.js                 # Servidor principal
├── routes/
│   ├── auth.js           # Autenticación
│   ├── message.js        # Mensajes y archivos
│   └── ubicacion.js      # Ubicaciones
├── controllers/
│   ├── message.js        # Lógica de mensajes y archivos
│   └── auth.js           # Lógica de autenticación
├── middlewares/
│   ├── upload.js         # Manejo de archivos (MULTER)
│   └── auth.js           # Middleware de autenticación
├── models/
│   ├── Message.js        # Modelo de mensajes
│   └── User.js           # Modelo de usuarios
└── config/
    └── database.connect.js # Conexión Oracle
```

### Frontend (React + TypeScript + Vite)
```
front-modulo/
├── src/
│   ├── components/
│   │   ├── ChatView.tsx   # Vista principal del chat
│   │   ├── ChatList.tsx   # Lista de chats
│   │   └── Login.tsx      # Pantalla de login
│   ├── services/
│   │   └── api.ts         # Servicios API
│   └── App.tsx            # Componente principal
```

## 🗄️ Base de Datos

### Tablas Principales
- **USUARIO**: Información de usuarios
- **MENSAJE**: Mensajes del chat
- **CONTENIDO**: Contenido de mensajes (texto y archivos)
- **TIPOARCHIVO**: Tipos de archivo (IM, VD, AU, DO)
- **TIPOCONTENIDO**: Tipos de contenido (MS, MM)

### Estructura de Archivos
```sql
-- Tipos de archivo soportados
INSERT INTO TIPOARCHIVO VALUES ('IM', 'Imagen');
INSERT INTO TIPOARCHIVO VALUES ('VD', 'Video');
INSERT INTO TIPOARCHIVO VALUES ('AU', 'Audio');
INSERT INTO TIPOARCHIVO VALUES ('DO', 'Documento');

-- Tipos de contenido
INSERT INTO TIPOCONTENIDO VALUES ('MS', 'Mensaje simple');
INSERT INTO TIPOCONTENIDO VALUES ('MM', 'Multimedia');
```

## 🛠️ Instalación y Configuración

### 1. Configurar Base de Datos
```bash
# Ejecutar el script SQL principal
sqlplus usuario/password@database @prueba-modulo-(usuario).sql

# Insertar datos de prueba
sqlplus usuario/password@database @insert.sql
```

### 2. Configurar Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Configurar Frontend
```bash
cd front-modulo
npm install
npm run dev
```

## 📁 Uso de la Funcionalidad de Archivos

### Enviar un Archivo
1. Hacer clic en el botón de adjuntar (📎)
2. Seleccionar el archivo deseado
3. Opcional: Agregar texto al mensaje
4. Hacer clic en enviar

### Tipos de Archivo Soportados
- **Imágenes**: Se muestran como vista previa
- **Videos**: Se reproducen con controles nativos
- **Audio**: Se reproducen con controles nativos
- **Documentos**: Se muestran con icono y botón de descarga

### Límites
- Tamaño máximo: 10MB por archivo
- Formatos soportados: Ver lista arriba

## 🧪 Pruebas

### Probar Funcionalidad de Archivos
```bash
cd backend
npm run test-files
```

### Probar Conexión a Base de Datos
```bash
cd backend
npm run test-db
```

## 🔧 Endpoints API

### Mensajes
- `POST /api/messages` - Enviar mensaje (con o sin archivo)
- `GET /api/messages/user/:userId` - Obtener mensajes de usuario
- `GET /api/messages/file/:useConsecUser/:consecUser/:consMensaje` - Obtener archivo

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse

## 🎨 Características de la UI

### Interfaz de Chat
- Diseño responsive
- Burbujas de chat estilo WhatsApp
- Indicadores de archivos adjuntos
- Vista previa de imágenes
- Controles de reproducción para audio/video

### Manejo de Archivos
- Botón de adjuntar integrado
- Vista previa antes de enviar
- Indicadores visuales de tipo de archivo
- Botones de descarga para documentos

## 🚀 Despliegue

### Variables de Entorno (Backend)
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_CONNECT_STRING=tu_connection_string
```

### Variables de Entorno (Frontend)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📝 Notas Técnicas

### Almacenamiento de Archivos
- Los archivos se almacenan como BLOB en Oracle
- Se eliminan archivos temporales después de procesar
- Se mantiene el nombre original en LOCALIZACONTENIDO

### Seguridad
- Validación de tipos de archivo
- Límites de tamaño
- Sanitización de nombres de archivo

### Rendimiento
- Streaming de archivos para descarga
- Compresión automática de imágenes (futuro)
- Cache de archivos frecuentes (futuro)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 