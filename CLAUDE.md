# Project Description
This project is an application that improves the process of generating context.md files from Jira tickets. The goal is to format these files so a developer can send the .md file to Claude Code to get the work done. Act as a senior developer and plan according to the standards and requests specified here.

## Stack & Architecture
- REST Backend: Node.js (Express), CommonJS (no ESM), JWT Auth, Pino, cors, helmet, bcrypt, express-rate-limit, cookie-parser, Zod.
- Frontend: Next.js 16, Zustand + TanStack React Query, TypeScript, `jose` (JWT verification in Edge Runtime)
- Style: Tailwind CSS v4 (CSS-based config, no `tailwind.config.ts`) + Headless UI
- Validation: Zod — schemas live in the route file, applied via `validate(schema)` middleware before the controller. Controllers trust `req.body` is already validated.
- Testing: Jest, Prettier, ESLint

## Frontend Type Standards
- **All TypeScript interfaces and types go in `src/types/index.ts`** — never inline them in components, stores, or services.
- Import types with `import type { ... } from '@/types'`.

## Frontend Standards
- Common style for all components.
- Use server components when needed; avoid client components for sensitive data.
- Use TanStack React Query for data fetching, loading, caching, throttling (server state).
- Zustand for client state only (UI state, selections, etc.).
- TanStack React Query manages server state; Zustand manages client state.
- Validate input using Zod. Schemas live in `src/lib/schemas.ts`.
- Env vars centralized in `src/lib/env.ts` — never hardcodear URLs ni valores de entorno.
- Error messages from API formatted with `src/lib/formatError.ts` — extrae `json.message` del error body.
- Route protection via `src/proxy.ts` (Next.js 16 — archivo renombrado de `middleware.ts`, función exportada `proxy` no `middleware`).
- `initFromServer()` se llama en `Providers` via `useEffect` al montar la app para hidratar Zustand desde la cookie.

## Backend Standards
- Use basic security practices for user data.
- Follow folder structure.
- JWT authentication via HttpOnly cookie — never Authorization header.
- Auth middleware reads `req.cookies.auth_token` (requires `cookie-parser`).
- Global error handler (`errorHandler.middleware.js`) + custom `AppError` for business errors.
- Correct HTTP status codes following REST standards.
- Log important operations with Pino.
- Rate limiter: global (100 req/15 min) + strict for auth routes (10 req/15 min).
- Token expiry configured via `JWT_EXPIRES_IN` env var.
- **Validation lives in routes** (via `validate.middleware.js`), not in controllers.

## Data Flow
- Backend connects to Jira API (`/rest/api/3/search/jql`) filtering by `JIRA_PROJECT_KEY`.
- Jira descriptions come in **Atlassian Document Format (ADF)** — JSON anidado. Se extrae con `extractAdfText()` en `jira.service.js` que recorre recursivamente el ADF y retorna texto plano. Las imágenes se ignoran.
- Tickets are stored in memory, indexed by ticket **key** (e.g. `KAN-1`), not by numeric ID.
- Store uses **lazy loading** + **TTL de 5 minutos** — tickets se cargan de Jira en el primer request y se refrescan automáticamente si pasaron más de 5 min. Tickets nuevos aparecen sin reiniciar el servidor.
- Backend serves tickets to frontend.
- Frontend allows user to search by key or keyword (debounce 400ms).
- Frontend shows the results. User selects tickets — el markdown se genera automáticamente al cambiar la selección.
- Frontend displays the generated markdown in a side panel. User copies it to clipboard.
- Backend generates the context.md content and returns it as `text/markdown`.

## API Reference

| Method | Route | Auth | Description | Status |
|--------|-------|------|-------------|--------|
| POST | `/auth/register` | No | Register new user | 201 |
| POST | `/auth/login` | No | Login, sets HttpOnly cookie `auth_token`, returns `{ user }` | 200 |
| POST | `/auth/logout` | No | Clears `auth_token` cookie | 200 |
| GET | `/auth/me` | Yes (cookie) | Returns current user from cookie session | 200 |
| GET | `/tickets` | Yes (cookie) | All tickets — returns `{ tickets: Ticket[] }` | 200 |
| GET | `/tickets/:key` | Yes (cookie) | Single ticket by key (e.g. KAN-1) | 200 |
| GET | `/tickets/search?q=` | Yes (cookie) | Search by keyword | 200 |
| POST | `/context` | Yes (cookie) | Receives `{ ticketIds: string[] }`, returns markdown string | 200 |
| GET | `/health` | No | Health check | 200 |

## Secrets Management
Backend — store in `backend/.env`, never commit:
- `JIRA_API_TOKEN`
- `JIRA_EMAIL`
- `JIRA_BASE_URL` — e.g. `https://your-domain.atlassian.net`
- `JIRA_PROJECT_KEY` — e.g. `KAN`
- `JWT_SECRET`
- `FRONTEND_URL` — e.g. `http://localhost:3000`

Frontend — store in `UI/.env.local`, never commit:
- `NEXT_PUBLIC_API_URL` — e.g. `http://localhost:3001`
- `JWT_SECRET` — mismo valor que el backend (sin `NEXT_PUBLIC_` — solo server-side, lo usa `proxy.ts`)

## Auth Flow
- Login → server sets `HttpOnly` cookie `auth_token` (JS cannot read it) + returns `{ user }`
- Every request → browser sends cookie automatically (`credentials: 'include'` in `apiFetch`)
- Auth middleware reads `req.cookies.auth_token` to verify JWT
- Frontend `proxy.ts` verifica JWT con `jose` (Edge Runtime — no Node.js crypto) antes de dar acceso a rutas protegidas
- Frontend Zustand stores `{ user, isAuthenticated }` — never the token
- On app load, `initFromServer()` in `Providers` calls `GET /auth/me` with `credentials: 'include'` to hydrate Zustand — necesario porque la cookie HttpOnly es invisible para JS
- CORS configured with `credentials: true` + specific `FRONTEND_URL`

## Testing Protocol
- Unit tests per file in `__tests__/`.
- Coverage threshold: 70% (branches, functions, lines, statements).
- Run after every new file: `npm run lint` and `npm run prettier:fix`.

## Code Standards
- CommonJS (`require`/`module.exports`) throughout — no ESM.
- Run after generating a new file:
  - `npm run lint`
  - `npm run prettier:fix`

## IMPORTANT
- DO NOT read the @.env file
