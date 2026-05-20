---
paths:
  - "src/app/api/**/*.ts"
---

# Route Handlers

Internal Next route handlers live under `src/app/api`.

They are the only supported boundary from the Web app to `apps/api`. Client components, shared UI components, contexts, hooks, and browser utilities must call these Next route handlers instead of calling the backend API directly.

## Existing helper pattern

- `routeWrapper` centralizes response conversion and error handling.
- Middlewares are created with `createMiddleware`.
- Interceptors are created with `createInterceptor`.
- `RouterError` represents expected HTTP errors.
- Zod validation middlewares exist for body, query, and route parameters.

## Rules

1. Every BFF route handler must use `routeWrapper`. Do not export raw `GET`, `POST`, `PUT`, `PATCH`, or `DELETE` handlers that bypass it.
2. Route concerns must go through `routeWrapper` middlewares or interceptors. Use existing middleware/interceptor helpers first.
3. Use `bodyValidate`, `queryValidate`, or `parametersValidate` for request validation.
4. Use `loggedUser` when the route requires authentication.
5. Create a new middleware with `createMiddleware` when a route needs reusable pre-handler behavior such as auth, request parsing, validation, or context loading.
6. Create a new interceptor with `createInterceptor` when a route needs reusable post/around-handler behavior such as status changes, response shaping, logging, or backend error mapping.
7. Throw `RouterError` for expected client or auth errors.
8. Do not leak raw error objects to clients.
9. Keep route handlers focused on adapter/orchestration logic; reusable business behavior belongs in helpers or shared modules.
10. Keep `@resources/*` imports scoped to route-handler resources.
11. Forward calls to `apps/api` only from BFF route handlers or server-only helpers used by those handlers.
12. Normalize backend errors before returning them to UI code; do not expose raw backend exception bodies unless that shape is an explicit contract.
13. Keep backend base URLs, backend-only headers, and backend request details out of client components.

## Required BFF shape

```typescript
export const POST = routeWrapper({
  middlewares: [
    // bodyValidate(...), loggedUser, queryValidate(...), etc.
  ],
  interceptors: [
    // httpStatusInterceptor(...), backend error mapper, etc.
  ],
})(async (request, ...middlewareResults) => {
  // call apps/api or perform route orchestration here
});
```

If the existing middlewares/interceptors do not fit, add a focused one under `src/app/api/(resourses)/middlewares` or `src/app/api/(resourses)/interceptors` instead of inlining that concern in each route.

