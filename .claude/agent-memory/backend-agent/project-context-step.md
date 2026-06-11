---
name: project-context-step
description: Paso 7 generación de context.md implementado y testeado: contextGenerator.service, context.controller, context.routes, ruta /context en app.js
metadata:
  type: project
---

Paso 7 completado: generación del context.md a partir de tickets seleccionados.

**Why:** El objetivo del proyecto es generar archivos context.md desde tickets de Jira para que los desarrolladores los envíen a Claude Code.

**How to apply:** La ruta `POST /context` requiere JWT auth y body `{ ticketIds: string[] }`. El controller busca cada ticket en ticketStore.getById (lanza AppError 404 si no existe), genera el markdown con contextGenerator.generate, y responde `{ content: string }`.

Archivos creados/modificados:
- `backend/services/contextGenerator.service.js` — función pura `generate(tickets)` que retorna string Markdown
- `backend/controllers/context.controller.js` — llama ticketStore + contextGenerator, loguea con Pino
- `backend/routes/context.routes.js` — POST `/` con authMiddleware + validate(contextSchema) + controller
- `backend/app.js` — ruta `/context` registrada entre `/tickets` y errorHandler
- `backend/__tests__/contextGenerator.service.test.js` — 4 tests unitarios (sin mocks, lógica pura), todos pasando

Tests: 4/4 pasando. Lint: limpio. Prettier: sin cambios.

Nota de testing: la verificación del separador entre bloques debe usar `toContain('---\n\n## [PROJ-2]')` en lugar de extraer el slice manualmente (el slice fallaba por el offset exacto del `---`).

[[project-auth-step]]
[[project-jira-step]]
