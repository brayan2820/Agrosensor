# Backend API para Proyecto

Este backend expone los datos de la base de datos PostgreSQL llamada "Proyecto" mediante una API REST.

## Endpoints principales
- `GET /api/mediciones` — Devuelve todas las mediciones de la tabla `mediciones`.

## Configuración
1. Crea un archivo `.env` con los datos de conexión a tu base de datos PostgreSQL.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```

## Variables de entorno
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- PORT

## Estructura de la tabla
```sql
CREATE TABLE mediciones (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    temperatura REAL,
    humedad REAL,
    radiacion REAL,
    humedad_suelo REAL,
    almacenamiento REAL,
    bateria REAL
);
```
