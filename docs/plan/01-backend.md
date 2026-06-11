# Plan Backend — ticketGenerator

Stack: Node.js + Express + JWT + Pino + Zod + Jest

---

## Rutas REST — referencia rápida

| Método | Ruta | Auth | Descripción | Status OK |
|--------|------|------|-------------|-----------|
| POST | `/auth/register` | No | Registra un usuario nuevo | 201 |
| POST | `/auth/login` | No | Login, devuelve JWT | 200 |
| GET | `/tickets` | Sí | Devuelve todos los tickets del store | 200 |
| GET | `/tickets/:id` | Sí | Devuelve un ticket por su ID | 200 |
| GET | `/tickets/search?q=` | Sí | Busca tickets por keyword | 200 |
| POST | `/context` | Sí | Recibe IDs, devuelve el `.md` generado | 200 |

---

## Paso 1 — Configuración base

Archivos de configuración y arranque del proyecto.

- [ ] Crear `backend/package.json` con scripts:
  - `dev` → `nodemon server.js`
  - `start` → `node server.js`
  - `test` → `jest --coverage`
  - `lint` → `eslint . --ext .js`
  - `prettier:fix` → `prettier --write .`
- [ ] Crear `backend/.env` con:
  ```
  PORT=3001
  JWT_SECRET=
  JWT_EXPIRES_IN=1h
  JIRA_BASE_URL=https://your-domain.atlassian.net
  JIRA_API_TOKEN=
  JIRA_EMAIL=
  ```
- [ ] Crear `backend/.env.example` — igual que `.env` pero sin valores
- [ ] Crear `backend/.gitignore` — incluir `node_modules/` y `.env`
- [ ] Crear `backend/config/env.js` — usa Zod para leer y validar todas las variables de `.env` al arrancar. Si falta alguna, el servidor lanza error antes de iniciar
- [ ] Crear `backend/config/logger.js` — instancia de Pino, exporta el logger para usar en toda la app

---

## Paso 2 — Servidor Express

Dos archivos: uno arranca el servidor, otro configura Express.

- [ ] Crear `backend/server.js`:
  - Importa `app.js`
  - Llama `app.listen(PORT)`
  - Loguea con Pino cuando el servidor está listo

- [ ] Crear `backend/app.js` — configura Express con los middlewares en este orden:
  1. `helmet()` — headers de seguridad
  2. `cors({ origin: process.env.FRONTEND_URL })` — solo permite el frontend
  3. `express.json()` — parsea body JSON
  4. `pino-http` — loguea cada request automáticamente
  5. Rate limiter global — máx 100 requests por IP por 15 minutos
  6. Rutas: `/auth`, `/tickets`, `/context`
  7. Global error handler — siempre al final

---

## Paso 3 — Errores y middlewares

Piezas reutilizables que usan todos los pasos siguientes.

- [ ] Crear `backend/utils/AppError.js`:
  ```js
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  ```
  Se usa para lanzar errores de negocio con su status HTTP correspondiente.

- [ ] Crear `backend/middlewares/errorHandler.middleware.js`:
  - Captura cualquier error lanzado en la app
  - Si es `AppError` usa su `statusCode`
  - Si es error inesperado responde 500
  - Respuesta siempre con formato: `{ error: { message, statusCode } }`

- [ ] Crear `backend/middlewares/auth.middleware.js`:
  - Lee el header `Authorization: Bearer <token>`
  - Verifica el JWT con `jwt.verify()`
  - Si el token es inválido o no existe → lanza `AppError` 401
  - Si es válido → adjunta el usuario decodificado a `req.user` y llama `next()`

- [ ] Crear `backend/middlewares/rateLimiter.middleware.js`:
  - Rate limiter estricto solo para auth: máx 10 requests por IP por 15 minutos
  - Se aplica únicamente en las rutas `/auth/login` y `/auth/register`

---

## Paso 4 — Autenticación

Registro y login de usuarios. Los usuarios se guardan en memoria (sin base de datos).

- [ ] Crear `backend/models/user.model.js` — schema Zod:
  ```js
  { id: string, email: string, passwordHash: string, role: 'admin' | 'user' }
  ```

- [ ] Crear `backend/services/auth.service.js`:
  - `register(email, password)`:
    1. Verifica que el email no exista ya
    2. Hashea la password con `bcrypt.hash(password, 10)`
    3. Guarda el usuario en el Map en memoria
    4. Retorna el usuario sin la password
  - `login(email, password)`:
    1. Busca el usuario por email
    2. Compara password con `bcrypt.compare()`
    3. Si es correcto, genera JWT con `jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })`
    4. Retorna `{ token }`
  - Loguea con Pino: login exitoso, login fallido, registro nuevo usuario

- [ ] Crear `backend/controllers/auth.controller.js`:
  - `register`: valida body con Zod `{ email, password }` → llama `auth.service.register()` → responde 201
  - `login`: valida body con Zod `{ email, password }` → llama `auth.service.login()` → responde 200 con `{ token }`

- [ ] Crear `backend/routes/auth.routes.js`:
  ```
  POST /auth/register  →  rateLimiter  →  auth.controller.register
  POST /auth/login     →  rateLimiter  →  auth.controller.login
  ```

- [ ] Crear `backend/__tests__/auth.service.test.js`

---

## Paso 5 — Jira API + Store en memoria

Conecta con Jira y guarda los tickets en memoria para no llamar a Jira en cada request.

- [ ] Crear `backend/models/ticket.model.js` — schema Zod que normaliza el ticket de Jira:
  ```js
  { id: string, key: string, summary: string, description: string, status: string, type: string, assignee: string | null }
  ```

- [ ] Crear `backend/services/jira.service.js`:
  - `fetchAllTickets()`:
    - Llama `GET {JIRA_BASE_URL}/rest/api/3/search` con autenticación Basic (`email:token` en base64)
    - Normaliza cada issue de Jira al schema `ticket.model.js`
    - Retorna array de tickets normalizados
  - `fetchTicketById(id)`:
    - Llama `GET {JIRA_BASE_URL}/rest/api/3/issue/{id}`
    - Normaliza y retorna el ticket

- [ ] Crear `backend/services/ticketStore.service.js` — Map en memoria:
  - `refresh()` — llama `jira.service.fetchAllTickets()` y actualiza el Map
  - `getAll()` — retorna todos los tickets del Map
  - `getById(id)` — retorna un ticket por ID o lanza `AppError` 404
  - `search(query)` — filtra tickets donde `summary` o `description` contengan el query (case-insensitive)
  - Al arrancar el servidor, llama `refresh()` una vez para cargar los tickets iniciales

- [ ] Crear `backend/__tests__/jira.service.test.js` — mockea `fetch` para no llamar a Jira real

---

## Paso 6 — Rutas de tickets

Expone el store al frontend. Todas requieren JWT válido.

- [ ] Crear `backend/controllers/ticket.controller.js`:
  - `getAll`: llama `ticketStore.getAll()` → responde 200 con array de tickets
  - `getById`: lee `req.params.id` → llama `ticketStore.getById(id)` → responde 200 con el ticket
  - `search`: lee `req.query.q` → valida que no esté vacío → llama `ticketStore.search(q)` → responde 200

- [ ] Crear `backend/routes/ticket.routes.js`:
  ```
  GET /tickets              →  authMiddleware  →  ticket.controller.getAll
  GET /tickets/:id          →  authMiddleware  →  ticket.controller.getById
  GET /tickets/search?q=    →  authMiddleware  →  ticket.controller.search
  ```

- [ ] Crear `backend/__tests__/ticket.controller.test.js`

---

## Paso 7 — Generación del context.md

Recibe una lista de IDs, genera el archivo Markdown y lo devuelve.

- [ ] Crear `backend/services/contextGenerator.service.js`:
  - `generate(tickets[])`:
    - Para cada ticket construye un bloque Markdown:
      ```md
      ## [KEY-123] Título del ticket
      **Tipo:** Bug | Feature | Task
      **Status:** In Progress
      **Asignado:** nombre o Sin asignar

      ### Descripción
      texto de la descripción...

      ---
      ```
    - Une todos los bloques y retorna el string completo

- [ ] Crear `backend/controllers/context.controller.js`:
  - Lee body `{ ticketIds: string[] }`
  - Valida con Zod: array de strings, mínimo 1 elemento
  - Busca cada ticket en `ticketStore.getById(id)` — si alguno no existe lanza `AppError` 404
  - Llama `contextGenerator.generate(tickets)`
  - Responde 200 con `{ content: string }` (el markdown como texto)
  - Loguea con Pino: cuántos tickets se procesaron

- [ ] Crear `backend/routes/context.routes.js`:
  ```
  POST /context  →  authMiddleware  →  context.controller.generate
  ```

- [ ] Crear `backend/__tests__/contextGenerator.service.test.js`

---

## Paso 8 — Tests y calidad final

- [ ] Correr `npm test -- --coverage` — cobertura > 70%
- [ ] Correr `npm run lint` — sin errores
- [ ] Correr `npm run prettier:fix` — sin cambios pendientes
- [ ] Verificar que ningún endpoint expone datos de `.env` en la respuesta
