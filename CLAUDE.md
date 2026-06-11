# Project Description
This project is an appliation that improves the process of generating context.md files from jira tickets. The goal is to be able to format this files so a developer que send the .md file to claude code to get the work done. Act as a senior developer and plan according to the standars and requests especified here.

## Stack & Architecture
- REST Backend: Node.js (Express), JWT Auth, Pino cors, helmet, bycrypt, express rate limiter.
- Frontend: Next, Zustand + RTK Query, Typescripts
- Style: Tailwind CSS + Headless UI.
- Validation: Zod (shared schemas across Frontend + Backend).
- Testing and standards: jest, prettier, lint.
- Jira api for jira tickets

## Frontend Standards
- Common style for all compontnes.
- Use server components when needed, avoid using client components if you are using sensitive data.
- Use RTK Query for data fetching, loading, caching, throtlinng.
- Validate input using zod
- Make sure to use a standard folder structure
- RTK Query maneja server state (fetching, caching), Zustand maneja client state. 
## Backend Standard
- Use basic securty practices for the user data. 
- Follow folder structure
- Use jwt authentication and role based access.
- Use a global error handler and custom errors for business errors.
- Make sure to use correct http status, requests and responses. Following rest standards
- Log important operations
- Implement rate limiter
- Make sure to add token expiry time

## Data flow
- Backend connects to jira api.
- Backend fetch all the tickets.
- Backend stores the tickets in memory.
- Backend serves the tickets to the frontend.

- Frontend allows user to search by id or keyword.
- Frontend shows the results.
- Frontend allows user to select tickets.
- Frontend sends tickets to backend.
- Backend generates the context.md file.
- Backend sends the context.md file to frontend.
- Frontend allows user to download the context.md file.

## Secrets management
- Make sure to use .env files to sore secrets
    - Jira api secret
    - Our api secret
    - Full URL for jira

## Testing protocol
- Make sure to add unit tests per file.

## Code standards
- Make sure to run the following after generating a new file:
!npm run lint
!npm run prettier:fix

