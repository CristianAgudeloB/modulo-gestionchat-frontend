# Conexión a Oracle Database

Backend simple para probar la conexión a Oracle Database usando Thin mode (sin Oracle Instant Client).

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `env.example` a `.env`
   - Configurar las credenciales de Oracle Database

## Configuración

No se requiere Oracle Instant Client. El sistema usa Thin mode que se conecta directamente a Oracle Database.

## Ejecutar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Scripts de prueba

```bash
# Probar la tabla USUARIO (CRUD completo)
npm run test-usuario

# Insertar datos de prueba en la tabla USUARIO
npm run insert-data
```

## Endpoints disponibles

- `GET /api/test-connection` - Probar conexión a la base de datos

## Estructura

- `database.js` - Módulo de conexión a Oracle (Thin mode)
- `config.js` - Configuración de la aplicación
- `server.js` - Servidor Express con endpoint de prueba
- `test-usuario.js` - Script de pruebas para la tabla USUARIO
- `insert-test-data.js` - Script para insertar datos de prueba 