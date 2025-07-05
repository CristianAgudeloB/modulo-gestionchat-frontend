# Conexión a Oracle Database

Sistema simple de conexión a Oracle Database con backend en Node.js.

## Estructura del Proyecto

```
modulo-gestionchat-frontend/
├── front-modulo/          # Frontend en React/TypeScript (sin modificar)
└── backend/               # Backend en Node.js
    ├── server.js          # Servidor Express
    ├── database.js        # Conexión a Oracle
    ├── config.js          # Configuración
    └── package.json
```

## Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **Oracle Database** (XE, Standard, o Enterprise)
3. **Oracle Instant Client** (para la conexión desde Node.js)

## Instalación

### 1. Configurar Oracle Database

1. Instalar Oracle Database
2. Descargar Oracle Instant Client desde [Oracle Downloads](https://www.oracle.com/database/technologies/instantclient/downloads.html)
3. Extraer en una carpeta (ej: `C:\oracle\instantclient_21_12`)

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `env.example`:
```env
DB_USER=system
DB_PASSWORD=tu_password_aqui
DB_CONNECT_STRING=localhost:1521/xe
ORACLE_CLIENT=C:\\oracle\\instantclient_21_12
PORT=3001
```

## Ejecutar el Proyecto

### Backend
```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## API Endpoints

- `GET /api/test-connection` - Probar conexión a la base de datos

## Características

- ✅ Conexión a Oracle Database
- ✅ API REST con Express
- ✅ Endpoint de prueba de conexión
- ✅ Manejo de errores

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- Oracle Database (oracledb)
- CORS

## Solución de Problemas

### Error de conexión a Oracle
1. Verificar que Oracle Database esté ejecutándose
2. Confirmar que las credenciales en `.env` sean correctas
3. Verificar que Oracle Instant Client esté instalado y configurado
4. Asegurarse de que la ruta `ORACLE_CLIENT` sea correcta 