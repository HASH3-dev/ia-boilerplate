---
paths:
  - "src/app/**/*.tsx"
  - "src/middleware.ts"
---

# Routing

## App Router

Pages live under `src/app/`. Use route groups to organize product areas:

- `(public)` — pages accessible without authentication (landing, sign-in, sign-up)
- `(protected)` — pages that require authentication

```
src/app/
├── (public)/
│   ├── page.tsx          # landing
│   └── signin/
│       └── page.tsx
└── (protected)/
    └── dashboard/
        └── page.tsx
```

## Navigation

Use `next/link` for client-side navigation. Keep navigation helpers in a shared module if locale or auth-aware redirects are needed.

## Middleware

`src/middleware.ts` handles route protection. Authenticated paths redirect to `/signin?redirect=<path>` when credentials are missing.

Keep matcher exclusions for `api`, `_next`, `_vercel`, and static file paths.

```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```
