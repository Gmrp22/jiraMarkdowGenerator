# Project Description
This project is an application that improves the process of generating context.md files from Jira tickets. The goal is to format these files so a developer can send the .md file to Claude Code to get the work done. Act as a senior developer and plan according to the standards and requests specified here.

## Stack & Architecture
- REST Backend: Node.js (Express), CommonJS (no ESM), JWT Auth, Pino, cors, helmet, bcrypt, express-rate-limit, Zod.
- Frontend: Next.js, Zustand + RTK Query, TypeScript
- Style: Tailwind CSS + Headless UI
- Validation: Zod — schemas live in the route file, applied via `validate(schema)` middleware before the controller. Controllers trust `req.body` is already validated.
- Testing: Jest, Prettier, ESLint

## Frontend Standards
- Common style for all components.
- Use server components when needed; avoid client components for sensitive data.
- Use RTK Query for data fetching, loading, caching, throttling (server state).
- Zustand for client state only (UI state, selections, etc.).
- RTK Query manages server state; Zustand manages client state.
- Validate input using Zod.
- Standard folder structure.

## Backend Standards
- Use basic security practices for user data.
- Follow folder structure.
- JWT authentication and role-based access.
- Global error handler (`errorHandler.middleware.js`) + custom `AppError` for business errors.
- Correct HTTP status codes following REST standards.
- Log important operations with Pino.
- Rate limiter: global (100 req/15 min) + strict for auth routes (10 req/15 min).
- Token expiry configured via `JWT_EXPIRES_IN` env var.
- **Validation lives in routes** (via `validate.middleware.js`), not in controllers.

## Data Flow
- Backend connects to Jira API (`/rest/api/3/search/jql`) filtering by `JIRA_PROJECT_KEY`.
- Tickets are stored in memory, indexed by ticket **key** (e.g. `KAN-1`), not by numeric ID.
- Store uses **lazy loading** — tickets are fetched from Jira on the first request, not on server startup.
- Backend serves tickets to frontend.

- Frontend allows user to search by key or keyword.
- Frontend shows the results.
- Frontend allows user to select tickets.
- Frontend sends selected ticket keys to backend (`POST /context`).
- Backend generates the context.md file and returns it as `text/markdown` with `Content-Disposition: attachment; filename="context.md"`.
- Frontend triggers the file download.

## API Reference

| Method | Route | Auth | Description | Status |
|--------|-------|------|-------------|--------|
| POST | `/auth/register` | No | Register new user | 201 |
| POST | `/auth/login` | No | Login, returns JWT | 200 |
| GET | `/tickets` | Yes | All tickets from store | 200 |
| GET | `/tickets/:key` | Yes | Single ticket by key (e.g. KAN-1) | 200 |
| GET | `/tickets/search?q=` | Yes | Search by keyword | 200 |
| POST | `/context` | Yes | Receives `{ ticketIds: string[] }`, returns `.md` file | 200 |
| GET | `/health` | No | Health check | 200 |

## Secrets Management
Store in `.env` — never commit:
- `JIRA_API_TOKEN`
- `JIRA_EMAIL`
- `JIRA_BASE_URL` — e.g. `https://your-domain.atlassian.net`
- `JIRA_PROJECT_KEY` — e.g. `KAN`
- `JWT_SECRET`

## Testing Protocol
- Unit tests per file in `__tests__/`.
- Coverage threshold: 70% (branches, functions, lines, statements).
- Run after every new file: `npm run lint` and `npm run prettier:fix`.

## Code Standards
- CommonJS (`require`/`module.exports`) throughout — no ESM.
- Run after generating a new file:
  - `npm run lint`
  - `npm run prettier:fix`
