---
paths:
  - "src/middleware.ts"
  - "src/app/api/**/*.ts"
---

# Authentication

## BFF Responsibility

The BFF (Next.js route handlers under `src/app/api`) is a pure adapter layer. It must not own backend secrets or perform backend-internal validation locally.

**Token validation always goes through the API:**

- The BFF must not hold JWT signing keys or any backend secret.
- To validate a session or extract a user, the BFF calls an API endpoint.
- The API is the single source of truth for whether a session is valid.
- If the API returns 401, the BFF propagates the unauthorized response.

This keeps secret ownership in one place (the API) and prevents the BFF from silently drifting out of sync with backend session rules.

## `loggedUser` Middleware

`loggedUser` is a BFF middleware that extracts the authenticated user from the incoming request (e.g. from a cookie or Authorization header) and passes it to the route handler. Its concrete implementation is project-specific.

```typescript
export const GET = routeWrapper({
  middlewares: [loggedUser],
})(async (_req, user) => {
  // user is available here
});
```

## Auth Flow Pattern

```
Client → BFF route (Next.js) → API (NestJS)
          ↑ reads token          ↑ validates token
          ↑ from cookie/header   ↑ returns 401 if invalid
```

The BFF receives the token from the client, forwards it to the API, and propagates errors back. It does not validate the token locally.

## Rules

1. Never expose backend JWT signing secrets to the web app.
2. Only variables prefixed with `NEXT_PUBLIC_` may be used in client-side code.
3. Keep auth redirects centralized in `src/middleware.ts`.
4. Do not duplicate token parsing logic across route handlers.
5. The BFF must never validate backend tokens locally — always delegate to the API.
