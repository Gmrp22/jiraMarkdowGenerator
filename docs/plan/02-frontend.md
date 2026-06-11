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
│   └── authStore.ts            # Zustand: token en memoria
├── services/
│   ├── api.ts                  # instancia de axios con baseURL e interceptor de token
│   ├── auth.service.ts         # funciones fetch de auth (login, register)
│   └── tickets.service.ts      # funciones fetch de tickets y context
├── hooks/
│   ├── useAuth.ts              # wrapper sobre authStore
│   ├── useTickets.ts           # React Query: getTickets, searchTickets
│   └── useContext.ts           # React Query: generateContext (mutation)
├── types/
│   └── index.ts                # tipos TS: Ticket, User, AuthResponse
└── lib/
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

## Paso 4 — fetch helper + Zustand auth

- [ ] Crear `UI/src/store/authStore.ts`:
  - Estado: `token: string | null`
  - Acciones: `setToken(token)`, `clearToken()`

- [ ] Crear `UI/src/services/api.ts` — función `apiFetch` wrapper sobre `fetch` nativo que:
  - Agrega `baseURL` desde `NEXT_PUBLIC_API_URL`
  - Lee el token de `authStore` y agrega `Authorization: Bearer <token>`
  - Llama `clearToken()` si recibe 401
  - Lanza error con mensaje si la respuesta no es ok

```ts
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (res.status === 401) useAuthStore.getState().clearToken();
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

## Paso 5 — Zustand (client state)

- [ ] Crear `UI/src/store/ticketStore.ts`:
  - Estado: `selectedTickets: Ticket[]`
  - Acciones: `selectTicket(ticket)`, `removeTicket(id)`, `clearSelection()`
  - Regla: no duplicados al seleccionar

## Paso 6 — Funciones de fetch y hooks React Query

- [ ] Crear `UI/src/services/auth.service.ts`:
  - `login(email, password)` — usa `apiFetch` para POST `/auth/login`, retorna `AuthResponse`
  - `register(email, password)` — usa `apiFetch` para POST `/auth/register`

- [ ] Crear `UI/src/services/tickets.service.ts`:
  - `getTickets()` — usa `apiFetch` para GET `/tickets`
  - `searchTickets(query)` — usa `apiFetch` para GET `/tickets/search?q=query`
  - `generateContext(ticketIds)` — usa `apiFetch` para POST `/context`, retorna el string `.md`

- [ ] Crear `UI/src/hooks/useTickets.ts`:
```ts
export const useTickets = (query?: string) =>
  useQuery({
    queryKey: ['tickets', query],
    queryFn: () => query ? searchTickets(query) : getTickets(),
  });
```

- [ ] Crear `UI/src/hooks/useGenerateContext.ts`:
```ts
export const useGenerateContext = () =>
  useMutation({
    mutationFn: (ticketIds: string[]) => generateContext(ticketIds),
  });
```

- [ ] Crear `UI/src/hooks/useAuth.ts` — wrapper sobre `authStore` que expone `isAuthenticated`, `logout()`

## Paso 7 — Schemas Zod y tipos

- [ ] Crear `UI/src/types/index.ts` — exportar tipos: `Ticket`, `User`, `AuthResponse`, `ContextRequest`
- [ ] Crear `UI/src/lib/schemas.ts` — schemas Zod para formularios:
  - `loginSchema` → `{ email, password }`
  - `registerSchema` → `{ email, password, confirmPassword }`
  - `searchSchema` → `{ query: string }`

## Paso 8 — Componentes UI base

- [ ] Crear `UI/src/components/ui/Button.tsx` — variantes: primary, secondary, danger; estados: loading, disabled
- [ ] Crear `UI/src/components/ui/Input.tsx` — con label, error message, soporte de Zod errors
- [ ] Crear `UI/src/components/ui/Badge.tsx` — para mostrar status del ticket (color según estado)
- [ ] Crear `UI/src/components/ui/Spinner.tsx` — indicador de carga
- [ ] Crear `UI/src/components/ui/Modal.tsx` — usando Headless UI `Dialog`

## Paso 9 — Autenticación

- [ ] Crear `UI/src/app/(auth)/login/page.tsx` — página server, redirige si ya hay token
- [ ] Crear `UI/src/components/auth/LoginForm.tsx` — `'use client'`, valida con `loginSchema` de Zod, llama `login` de `auth.service.ts`, guarda token en Zustand `authStore`
- [ ] Crear middleware de Next.js `UI/src/middleware.ts` — protege rutas `/dashboard/*`, redirige a `/login` si no hay token

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
