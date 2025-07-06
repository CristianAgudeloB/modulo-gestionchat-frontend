const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Usar almacenamiento en memoria para guardar archivos como BLOB
const storage = multer.memoryStorage();

// Filtrar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    'audio': ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  const allAllowedTypes = Object.values(allowedTypes).flat();
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});

// Función para determinar el tipo de archivo basado en MIME type y extensión
const getFileType = (mimetype, filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();

  // Imágenes
  if (mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'IM';
  // Videos
  if (mimetype.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) return 'VD';
  // Audios
  if (mimetype.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'AU';
  // Documentos
  if (
    mimetype.startsWith('application/') || mimetype.startsWith('text/') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(ext)
  ) return 'DO';

  return 'DO'; // Por defecto, tratar como documento
};

// Función para determinar el tipo de contenido
const getContentType = (mimetype) => {
  if (mimetype.startsWith('image/') || mimetype.startsWith('video/') || mimetype.startsWith('audio/')) {
    return 'MM'; // Multimedia
  }
  return 'MS'; // Mensaje simple
};

module.exports = {
  upload,
  getFileType,
  getContentType,
  uploadDir
}; 