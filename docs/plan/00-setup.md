# Fase 0 — Setup Base

## 0.1 Estructura de carpetas

```
ticketGenerator/
├── backend/
│   ├── config/            # configuración de env, db, etc.
│   ├── controllers/       # handlers de rutas
│   ├── middlewares/       # auth, error handler, rate limiter
│   ├── models/            # modelos de datos / schemas Zod
│   ├── routes/            # definición de rutas Express
│   ├── services/          # lógica de negocio, llamadas a Jira API
│   ├── utils/             # helpers reutilizables
│   └── __tests__/         # tests unitarios por módulo
├── UI/
│   ├── src/
│   │   ├── app/           # Next.js App Router (pages, layouts)
│   │   ├── components/    # componentes UI compartidos
│   │   ├── store/         # Zustand stores (client state)
│   │   ├── services/      # React Query hooks (server state)
│   │   ├── hooks/         # custom hooks
│   │   ├── types/         # tipos TypeScript compartidos
│   │   └── lib/           # schemas Zod compartidos
│   └── __tests__/
└── docs/
    └── plan/              # este directorio
```

## 0.2 Instalación de librerías

### Backend
```bash
cd backend
npm init -y
npm install express jsonwebtoken bcrypt cors helmet pino pino-http express-rate-limit zod dotenv
npm install -D jest eslint prettier eslint-config-prettier eslint-plugin-node nodemon
```

### Frontend (UI)
```bash
cd UI
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install @headlessui/react @tanstack/react-query zustand zod
npm install -D prettier eslint-config-prettier jest @testing-library/react @testing-library/jest-dom
```

## 0.3 Archivos de configuración

### `.env` (backend)
```env
PORT=3001
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_API_TOKEN=your_jira_api_token
JIRA_EMAIL=your_jira_email
```

### `.env.local` (UI)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 0.4 Configurar Prettier

### `backend/.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### `UI/.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 0.5 Configurar ESLint

### `backend/.eslintrc.json`
```json
{
  "env": { "node": true, "es2021": true },
  "extends": ["eslint:recommended", "plugin:node/recommended", "prettier"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn"
  }
}
```

## 0.6 Hooks de Git (Husky + lint-staged)

```bash
# En la raíz del proyecto
npm init -y
npm install -D husky lint-staged
npx husky init
```

### `.husky/pre-commit`
```bash
#!/bin/sh
cd backend && npx lint-staged
cd ../UI && npx lint-staged
```

### `backend/package.json` — agregar:
```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

### `UI/package.json` — agregar:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## 0.7 Scripts npm

### `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest --coverage",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "prettier:fix": "prettier --write ."
  }
}
```

### `UI/package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "lint": "next lint",
    "prettier:fix": "prettier --write ."
  }
}
```

## 0.8 Hook Claude Code (PostToolUse)

Crear `.claude/settings.json` en la raíz del proyecto para que lint y prettier corran automáticamente después de cada edición:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "file=$(jq -r '.tool_input.file_path // empty'); if [ -z \"$file\" ]; then exit 0; fi; dir=$(dirname \"$file\"); while [ \"$dir\" != \"/\" ]; do if [ -f \"$dir/package.json\" ]; then cd \"$dir\" && npm run lint 2>/dev/null || true && npm run prettier:fix 2>/dev/null || true; break; fi; dir=$(dirname \"$dir\"); done",
            "timeout": 30,
            "statusMessage": "Running lint + prettier..."
          }
        ]
      }
    ]
  }
}
```
