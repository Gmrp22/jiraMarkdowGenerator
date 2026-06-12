# Plan Frontend — ticketGenerator

Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Headless UI + React Query + Zustand + Zod + fetch nativo

---

## Paso 1 — Setup del proyecto Next.js

- [ ] Crear proyecto con `create-next-app` con flags: `--typescript --tailwind --eslint --app --src-dir`
- [ ] Instalar dependencias adicionales: `@headlessui/react`, `@tanstack/react-query`, `zustand`, `zod`
- [ ] Crear `UI/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] Configurar `UI/tailwind.config.ts` con colores y tipografía del proyecto
- [ ] Configurar `UI/.prettierrc` con plugin de Tailwind (`prettier-plugin-tailwindcss`)
- [ ] Verificar que `npm run lint` y `npm run prettier:fix` funcionan

## Paso 2 — Estructura de carpetas

```
UI/src/
├── app/
│   ├── layout.tsx              # root layout con Providers
│   ├── page.tsx                # home → redirige a /dashboard o /login
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       └── tickets/
│           └── page.tsx
├── components/
│   ├── ui/                     # botones, inputs, badges reutilizables
│   ├── auth/                   # LoginForm
│   └── tickets/                # TicketCard, TicketList, SearchBar, SelectedPanel
├── store/
│   ├── ticketStore.ts          # Zustand: tickets seleccionados
│   └── authStore.ts            # Zustand: token + cookie auth-token
├── services/
│   ├── api.ts                  # apiFetch con baseURL, Authorization, responseType
│   ├── auth.service.ts         # funciones fetch de auth (login, register)
│   └── tickets.service.ts      # funciones fetch de tickets y context
├── hooks/
│   ├── useAuth.ts              # wrapper sobre authStore
│   ├── useTickets.ts           # React Query: getTickets, searchTickets
│   └── useGenerateContext.ts   # React Query: generateContext (mutation)
├── types/
│   └── index.ts                # tipos TS: Ticket, User, AuthResponse, AuthState, FetchOptions
└── lib/
    ├── env.ts                  # variables de entorno centralizadas (apiUrl, authCookieName)
    └── schemas.ts              # schemas Zod para formularios
```

- [ ] Crear todos los directorios según la estructura arriba

## Paso 3 — React Query setup

- [ ] Crear `UI/src/app/providers.tsx` — `'use client'`, instancia `QueryClient` y wrappea con `<QueryClientProvider>`
- [ ] Agregar `<Providers>` en `UI/src/app/layout.tsx`
- [ ] Configurar `QueryClient` con defaults sensatos:
  - `staleTime: 1000 * 60` — datos frescos por 1 minuto
  - `retry: 1` — reintentar solo una vez en error

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});
```

## Paso 4 — fetch helper + Zustand auth ✅

- [x] `UI/src/store/authStore.ts`:
  - Estado: `user: User | null`, `isAuthenticated: boolean`
  - `setUser(user)` — guarda usuario en Zustand tras login
  - `clearUser()` — limpia estado en logout
  - `initFromServer()` — async, llama `GET /auth/me` con `credentials: 'include'` para hidratar el store al cargar la app (sobrevive F5)

- [x] `UI/src/services/api.ts` — función `apiFetch` wrapper sobre `fetch` nativo:
  - Agrega `baseURL` desde `env.apiUrl`
  - Usa `credentials: 'include'` — el browser envía la cookie HttpOnly automáticamente
  - Sin Authorization header manual — el token viaja solo en la cookie
  - Acepta `responseType: 'json' | 'text'` — necesario para `/context` que devuelve `text/markdown`
  - Lanza error con mensaje del backend si la respuesta no es ok

- [x] `UI/src/middleware.ts` — protege rutas leyendo cookie `auth_token` server-side (Next.js puede leer HttpOnly cookies en middleware)

> **Por qué HttpOnly cookie:**
> - JS nunca puede leer el token → inmune a XSS
> - El browser la envía automáticamente en cada request → sin Authorization header manual
> - Next.js middleware puede leerla server-side → protección de rutas funciona correctamente
> - Zustand guarda el **usuario**, no el token

## Paso 5 — Zustand (client state)

- [x] Crear `UI/src/store/ticketStore.ts`:
  - Estado: `selectedTickets: Ticket[]`
  - Acciones: `selectTicket(ticket)`, `removeTicket(id)`, `clearSelection()`
  - Regla: no duplicados al seleccionar

## Paso 6 — Servicios y hooks React Query ✅

- [x] `UI/src/services/auth.service.ts`:
  - `login(email, password)` — POST `/auth/login`, retorna `{ user: User }` (el servidor setea la cookie)
  - `register(email, password)` — POST `/auth/register`, retorna `{ user: User }`
  - `logout()` — POST `/auth/logout` (el servidor borra la cookie)

- [x] `UI/src/services/tickets.service.ts`:
  - `getTickets()` — GET `/tickets`, retorna `Ticket[]`
  - `searchTickets(query)` — GET `/tickets/search?q=query`, retorna `Ticket[]`
  - `generateContext(ticketIds)` — POST `/context` con `responseType: 'text'`, retorna el string `.md`

- [x] `UI/src/hooks/useTickets.ts`:
```ts
export const useTickets = (query?: string) =>
  useQuery({
    queryKey: ['tickets', query],
    queryFn: () => query ? searchTickets(query) : getTickets(),
  });
```

- [x] `UI/src/hooks/useGenerateContext.ts`:
```ts
export const useGenerateContext = () =>
  useMutation({
    mutationFn: (ticketIds: string[]) => generateContext(ticketIds),
  });
```

- [x] `UI/src/hooks/useAuth.ts`:
  - Lee `user` e `isAuthenticated` de `authStore` con selectores Zustand
  - `logout()` — llama `auth.service.logout()` + `clearUser()` en Zustand

## Paso 7 — Schemas Zod ✅

- [x] `UI/src/types/index.ts` — `User`, `Ticket`, `AuthResponse`, `ContextRequest`, `AuthState`, `TicketStoreState`, `FetchOptions`
- [x] `UI/src/lib/schemas.ts` — schemas Zod para formularios:
  - `loginSchema` → `{ email, password }`
  - `registerSchema` → `{ email, password, confirmPassword }` + refinement que valida que las contraseñas coincidan
  - `searchSchema` → `{ query: string }`
  - Exporta también los tipos inferidos: `LoginFormData`, `RegisterFormData`, `SearchFormData`

## Paso 8 — Componentes UI base ✅

- [x] `UI/src/components/ui/Button.tsx` — variantes: primary, secondary, danger; estados: loading, disabled
- [x] `UI/src/components/ui/Input.tsx` — con label, error message, soporte de Zod errors
- [x] `UI/src/components/ui/Badge.tsx` — colores según status del ticket (To Do, In Progress, Done, Blocked)
- [x] `UI/src/components/ui/Spinner.tsx` — tamaños sm, md, lg
- [x] `UI/src/components/ui/Modal.tsx` — usando Headless UI `Dialog`

## Paso 9 — Autenticación ✅

- [x] `UI/src/app/(auth)/login/page.tsx` — server component, centra el formulario en pantalla
- [x] `UI/src/components/auth/LoginForm.tsx` — `'use client'`, valida con `loginSchema` (Zod `safeParse`), llama `login` de `auth.service.ts`, llama `setUser(user)` en `authStore`, redirige a `/tickets`
- [x] `UI/src/middleware.ts` — verifica el JWT con `jose` antes de dar acceso a rutas protegidas:
  - Lee la cookie `auth_token` del request (server-side, puede leer HttpOnly)
  - Verifica la **firma y expiración** del JWT usando `JWT_SECRET` — no solo comprueba que la cookie exista
  - Sin token válido + ruta protegida → redirect a `/login`
  - Con token válido + ruta de auth → redirect a `/tickets` (ya está logueado)
  - Requiere `JWT_SECRET` en `UI/.env.local` (sin `NEXT_PUBLIC_` — server-only)
  - Usa `jose` en vez de `jsonwebtoken` porque el middleware corre en **Edge Runtime** (no tiene Node.js crypto)

## Paso 10 — Página de tickets

- [ ] Crear `UI/src/app/(dashboard)/tickets/page.tsx` — server component, layout con SearchBar + TicketList + SelectedPanel
- [ ] Crear `UI/src/components/tickets/SearchBar.tsx` — `'use client'`, input con debounce que actualiza el `query` pasado al hook `useTickets`
- [ ] Crear `UI/src/components/tickets/TicketCard.tsx` — muestra `key`, `summary`, `status`, `type`; botón para seleccionar/deseleccionar usando Zustand
- [ ] Crear `UI/src/components/tickets/TicketList.tsx` — usa `useTickets(query)`, maneja estados `isLoading` / `isError` de React Query
- [ ] Crear `UI/src/components/tickets/SelectedPanel.tsx` — `'use client'`, lee `selectedTickets` de Zustand, botón "Generar Context.md"

## Paso 11 — Generación y descarga del context.md

- [ ] En `SelectedPanel.tsx`, al hacer click en "Generar", llamar `useGenerateContext` mutation con los IDs seleccionados
- [ ] Mostrar `Spinner` mientras `isPending` es true (estado de React Query)
- [ ] Al recibir respuesta, crear un `Blob` con el contenido `.md` y disparar descarga con un `<a download>` temporal
- [ ] Mostrar error con `Modal.tsx` si la mutation falla (`isError`)
- [ ] Limpiar selección con `clearSelection()` de Zustand después de descarga exitosa

## Paso 12 — Tests y calidad

- [ ] Configurar Jest + Testing Library en `UI/jest.config.ts`
- [ ] Crear `UI/__tests__/components/LoginForm.test.tsx`
- [ ] Crear `UI/__tests__/components/TicketCard.test.tsx`
- [ ] Crear `UI/__tests__/store/ticketStore.test.ts`
- [ ] Crear `UI/__tests__/hooks/useTickets.test.ts` — mock de React Query
- [ ] Correr `npm run lint` sin errores
- [ ] Correr `npm run prettier:fix` sin cambios pendientes
- [ ] Correr `npm test` con cobertura > 70%

---

## Resumen del flujo de estado

| Estado | Herramienta | Ejemplo |
|---|---|---|
| Datos del servidor | React Query | Lista de tickets, respuesta del login |
| Estado del browser | Zustand | Tickets seleccionados, token JWT |
| Estado de formularios | Zod + useState local | Validación de login form |
