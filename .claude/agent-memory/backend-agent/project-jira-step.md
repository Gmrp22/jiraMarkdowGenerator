---
name: project-jira-step
description: Paso 5 Jira API + store en memoria implementado y testeado
metadata:
  type: project
---

Paso 5 completado: integración con Jira API y store en memoria.

Archivos creados:
- `backend/models/ticket.model.js` — schema Zod para normalizar tickets de Jira
- `backend/services/jira.service.js` — fetchAllTickets() y fetchTicketById(id) usando fetch nativo (Node 18+) con auth Basic base64
- `backend/services/ticketStore.service.js` — Map en memoria con refresh(), getAll(), getById(), search()
- `backend/__tests__/jira.service.test.js` — 4 tests unitarios con jest.spyOn(global, 'fetch')

Archivo modificado:
- `backend/server.js` — agrega ticketStore.refresh() después de app.listen()

**Why:** Data flow requiere que el backend cargue tickets de Jira al arrancar y los sirva desde memoria para búsqueda rápida.

**How to apply:** El store se llena al inicio del servidor. Los controllers de tickets deben usar ticketStore.service, no llamar directamente a jiraService.

[[project-auth-step]]
