# Backend de Horas Sociales

Backend separado del frontend en la carpeta `backend/`, construido con:

- Express + TypeScript
- Sequelize + PostgreSQL
- Swagger/OpenAPI en `/api-docs`
- Arquitectura por capas: models, services, controllers, middlewares y routes
- Migraciones CommonJS con control de versiones (`up/down`)

## Estructura

```text
backend/
	index.ts
	core/
		config/
		server/
	migrations/
		001_...cjs
		002_...cjs
		...
	src/
		app.ts
		server.ts
		config/
		controllers/
		core/
		middlewares/
		models/
		modules/
		database/
			migrate.ts
			migrationRunner.ts
		routes/
		services/
		utils/
```

## Variables de entorno

1. Copia `.env.example` a `.env`.
2. Ajusta los valores según tu entorno local.

Ejemplo:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/horas_sociales_db
CORS_ORIGIN=http://localhost:5173
```

## Scripts

- `npm install`: instala dependencias.
- `npm run dev`: inicia servidor en modo desarrollo.
- `npm run clean`: elimina la carpeta compilada `dist`.
- `npm run build`: compila TypeScript.
- `npm run start`: ejecuta build compilado.
- `npm run migrate:run`: aplica migraciones pendientes.
- `npm run migrate:revert`: revierte 1 migracion.
- `npm run db:migrate`: alias de `migrate:run`.
- `npm run db:rollback`: alias de `migrate:revert`.
- `npm run db:reset`: revierte todo y vuelve a aplicar migraciones.

Cada archivo en `migrations/` exporta `up` y `down` con formato CommonJS, por ejemplo `module.exports = { up, down }`.

Nota: `dist` es solo salida compilada (generada automaticamente desde `src`) y no se versiona en git.

Ejemplo rollback de 2 migraciones:

```bash
npm run migrate:revert
```

## Swagger

Con el backend encendido:

- URL: `https://proyecto-de-horas-sociales-frontend.onrender.com/api-docs`

## Endpoints principales

- `GET /api/health`
- `GET /api/institutions`
- `GET /api/institutions/:id`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `GET /api/projects/:id/enrollments`
- `POST /api/projects/:id/enrollments`
- `GET /api/students`
- `POST /api/students`
- `GET /api/dashboard/summary`
- `GET /api/map-markers`

## Pasos desde cero para crear la base de datos en pgAdmin

### 1. Instalar PostgreSQL + pgAdmin

1. Descarga PostgreSQL (incluye pgAdmin) desde la web oficial.
2. Durante instalacion, define una clave para el usuario `postgres`.
3. Recuerda el puerto (normalmente `5432`).

### 2. Crear servidor en pgAdmin (si no aparece)

1. Abre pgAdmin.
2. Click derecho en `Servers` -> `Register` -> `Server...`.
3. En `General`, pon nombre: `Local PostgreSQL`.
4. En `Connection`:
	 - Host: `localhost`
	 - Port: `5432`
	 - Username: `postgres`
	 - Password: tu clave
5. Guarda.

### 3. Crear la base de datos

1. Expande `Servers` -> tu servidor -> `Databases`.
2. Click derecho en `Databases` -> `Create` -> `Database...`.
3. Nombre sugerido: `horas_sociales_db`.
4. Owner: `postgres`.
5. Click en `Save`.

### 4. Configurar `.env` en el backend

En `backend/.env`, usa una URL como:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/horas_sociales_db
```

### 5. Ejecutar migraciones

Desde la carpeta `backend/`:

```bash
npm install
npm run migrate:run
```

Esto crea tablas, enum, indices y triggers.

### 6. Verificar en pgAdmin

1. Ve a `Databases` -> `horas_sociales_db` -> `Schemas` -> `public` -> `Tables`.
2. Debes ver:
	 - `institutions`
	 - `projects`
	 - `students`
	 - `project_enrollments`
	 - `map_markers`
	 - `schema_migrations`

### 7. Levantar API

```bash
npm run dev
```

Prueba:

- `https://proyecto-de-horas-sociales-frontend.onrender.com/api/health`
- `https://proyecto-de-horas-sociales-frontend.onrender.com/api-docs`