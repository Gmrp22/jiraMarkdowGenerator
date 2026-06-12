# Plan Backend — ticketGenerator

Stack: Node.js + Express + JWT + Pino + Zod + Jest

**Estado: ✅ Completo — 46 tests, 8 suites, cobertura > 70%**

---

## Rutas REST — referencia rápida

| Método | Ruta | Auth | Descripción | Status OK |
|--------|------|------|-------------|-----------|
| POST | `/auth/register` | No | Registra un usuario nuevo | 201 |
| POST | `/auth/login` | No | Login — setea cookie HttpOnly `auth_token`, retorna `{ user }` | 200 |
| POST | `/auth/logout` | No | Limpia la cookie `auth_token` | 200 |
| GET | `/auth/me` | Sí (cookie) | Retorna el usuario actual desde la sesión | 200 |
| GET | `/tickets` | Sí (cookie) | Devuelve todos los tickets del store | 200 |
| GET | `/tickets/:key` | Sí (cookie) | Devuelve un ticket por su **key** (ej. KAN-1) | 200 |
| GET | `/tickets/search?q=` | Sí (cookie) | Busca tickets por keyword | 200 |
| POST | `/context` | Sí (cookie) | Recibe `{ ticketIds: string[] }`, devuelve el `.md` como descarga | 200 |
| GET | `/health` | No | Health check | 200 |

---

## Paso 1 — Configuración base ✅

- [x] `backend/package.json` — scripts: `dev`, `start`, `test`, `lint`, `prettier:fix`
- [x] `backend/.env` — variables configuradas con valores reales
- [x] `backend/.env.example` — sin valores, incluye `JIRA_PROJECT_KEY`
- [x] `backend/.gitignore` — `node_modules/` y `.env`
- [x] `backend/config/env.js` — valida con Zod al arrancar. Variables requeridas: `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JIRA_BASE_URL`, `JIRA_PROJECT_KEY`, `JIRA_API_TOKEN`, `JIRA_EMAIL`, `FRONTEND_URL`, `LOG_LEVEL`
- [x] `backend/config/logger.js` — instancia Pino

> ⚠️ **`JWT_SECRET` es compartido:** el backend lo usa para **firmar** el JWT. El frontend (`UI/.env.local`) usa el mismo valor para **verificarlo** en el middleware de Next.js. Si cambias uno, cambia el otro.

---

## Paso 2 — Servidor Express ✅

- [x] `backend/server.js` — arranca con `app.listen()`, graceful shutdown con SIGTERM/SIGINT
- [x] `backend/app.js` — middlewares en orden: `helmet` → `cors` → `express.json()` → `pino-http` (serializers personalizados, sin headers) → rate limiter global (100 req/15 min) → rutas → error handler

---

## Paso 3 — Errores y middlewares ✅

- [x] `backend/utils/AppError.js` — error de negocio con `message` + `statusCode`
- [x] `backend/middlewares/errorHandler.middleware.js` — detecta `AppError` vs inesperado (500), loguea con Pino
- [x] `backend/middlewares/auth.middleware.js` — lee `req.cookies.auth_token`, verifica JWT, adjunta `req.user`, lanza `AppError` 401 si inválido
- [x] `backend/middlewares/rateLimiter.middleware.js` — exporta `{ authLimiter }`, máx 10 req/IP/15 min para rutas de auth
- [x] `backend/middlewares/validate.middleware.js` — middleware genérico `validate(schema)`: parsea `req.body` con Zod, lanza `AppError` 400 si inválido. **La validación vive en las rutas, no en los controllers.**

---

## Paso 4 — Autenticación ✅

Usuarios en Map en memoria (sin base de datos). Auth via HttpOnly cookie.

- [x] `backend/models/user.model.js` — schema Zod: `{ id, email, passwordHash, role: 'admin' | 'user' }`
- [x] `backend/services/auth.service.js` — `register()` con bcrypt + UUID, `login()` retorna `{ token, user }`, logs Pino
- [x] `backend/controllers/auth.controller.js`:
  - `login` — setea cookie HttpOnly `auth_token` (7 días), retorna `{ user }` (sin token en body)
  - `logout` — limpia la cookie con `res.clearCookie`
  - `me` — retorna `req.user` (requiere auth middleware)
- [x] `backend/routes/auth.routes.js`:
  ```
  POST /auth/register  →  authLimiter  →  validate(credentialsSchema)  →  register
  POST /auth/login     →  authLimiter  →  validate(credentialsSchema)  →  login
  POST /auth/logout    →  logout
  GET  /auth/me        →  authMiddleware  →  me
  ```
- [x] `backend/middlewares/auth.middleware.js` — lee `req.cookies.auth_token` (no Authorization header)
- [x] `backend/app.js` — `cookie-parser` + CORS con `credentials: true`
- [x] `backend/__tests__/auth.service.test.js` — 5 tests
- [x] `backend/__tests__/auth.controller.test.js` — 6 tests (login + logout + me)
- [x] `backend/__tests__/middlewares.test.js` — usa `req.cookies` en vez de `req.headers.authorization`

---

## Paso 5 — Jira API + Store en memoria ✅

> ⚠️ El endpoint `/rest/api/3/search` fue eliminado por Atlassian. Usar `/rest/api/3/search/jql`.
> Los fields deben declararse explícitamente: `?fields=summary,description,status,issuetype,assignee`.

- [x] `backend/models/ticket.model.js` — schema Zod: `{ id, key, summary, description, status, type, assignee }`
- [x] `backend/services/jira.service.js`:
  - `fetchAllTickets()` — llama `/rest/api/3/search/jql?jql=project=KAN...&fields=...`
  - `fetchTicketById(key)` — llama `/rest/api/3/issue/{key}?fields=...`
  - Auth Basic: `base64(email:token)`
  - `extractAdfText(node)` — recorre recursivamente el Atlassian Document Format (ADF) y extrae texto plano. Maneja párrafos, texto en negrita/cursiva, listas numeradas, listas con viñetas y saltos de línea. Imágenes (`mediaSingle`, `media`) se ignoran.
  > ⚠️ La descripción de Jira API v3 viene en formato ADF (JSON anidado), no texto plano. Extraer solo el primer nodo resulta en descripciones incompletas.
- [x] `backend/services/ticketStore.service.js` — Map en memoria:
  - Indexado por `ticket.key` (no por `ticket.id` numérico)
  - **Lazy loading**: `ensureLoaded()` llama `refresh()` solo si el store está vacío o expirado
  - **TTL de 5 minutos**: `lastLoadedAt` timestamp — si pasaron más de 5 min desde el último refresh, recarga desde Jira automáticamente. Tickets nuevos aparecen sin reiniciar el servidor.
  - `getAll()`, `getById(key)`, `search(query)` son async
  - No se llama `refresh()` al arrancar el servidor
- [x] `backend/__tests__/jira.service.test.js` — 4 tests (fetch mockeado)
- [x] `backend/__tests__/ticketStore.service.test.js` — 8 tests

---

## Paso 6 — Rutas de tickets ✅

- [x] `backend/controllers/ticket.controller.js` — `getAll`, `getById`, `search`
- [x] `backend/routes/ticket.routes.js`:
  ```
  GET /tickets          →  authMiddleware  →  ticket.controller.getAll
  GET /tickets/search   →  authMiddleware  →  ticket.controller.search   ← debe ir ANTES de /:key
  GET /tickets/:key     →  authMiddleware  →  ticket.controller.getById
  ```
- [x] `backend/__tests__/ticket.controller.test.js` — 8 tests

---

## Paso 7 — Generación del context.md ✅

- [x] `backend/services/contextGenerator.service.js` — `generate(tickets[])` produce bloques Markdown por ticket
- [x] `backend/controllers/context.controller.js`:
  - Lee `{ ticketIds }` del body (validado en ruta)
  - Busca cada key en `ticketStore.getById(key)`
  - Llama `contextGenerator.generate(tickets)`
  - Responde con `Content-Type: text/markdown` + `Content-Disposition: attachment; filename="context.md"`
- [x] `backend/routes/context.routes.js`:
  ```
  POST /context  →  authMiddleware  →  validate(contextSchema)  →  context.controller.generate
  ```
- [x] `backend/__tests__/contextGenerator.service.test.js` — 4 tests
- [x] `backend/__tests__/context.controller.test.js` — 3 tests

---

## Paso 8 — Tests y calidad final ✅

- [x] `npm test -- --coverage` — 46 tests, cobertura > 70%
- [x] `npm run lint` — sin errores
- [x] `npm run prettier:fix` — sin cambios pendientes
- [x] Auditoría: ningún endpoint expone datos de `.env` en la respuesta
- [x] `jest.config.js` — `coverageThreshold` configurado al 70%, excluye `coverage/**` y `eslint.config.js`
