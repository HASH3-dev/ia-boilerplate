---
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# Testing and Validation

## Test File Organization

**CRITICAL: This project uses co-located test files.**

All test files must be placed **in the same directory** as the file they test, using the naming convention:

```
src/lib/api-client.ts         → src/lib/api-client.test.ts
src/lib/bff-fetch.ts          → src/lib/bff-fetch.test.ts
src/components/foo.tsx        → src/components/foo.test.tsx
src/app/api/items/route.ts    → src/app/api/items/route.test.ts
```

**DO NOT create separate `__tests__` directories.** This convention is not used in this codebase.

**Exception:** E2E Playwright tests live in the dedicated `e2e/` directory at the app root.

## Commands

From `apps/web`:

```bash
npm run lint
npm run build
```

From the monorepo root:

```bash
npm run lint:web
npm run build:web
```

## Smoke tests

Mark smoke scenarios in plans when they prove a critical flow quickly:

- public landing renders;
- sign-in path reaches auth flow;
- authenticated area redirects correctly when credentials are missing;
- core form validates and submits expected data;
- cross-app flow works against the real API when applicable.

## App E2E credentials

`npm run test:app:headed` loads `containers/app-test/.env` before starting Docker and Playwright, then passes `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` through to the Playwright process. E2E specs that need auth credentials should skip with a clear message when these variables are missing instead of timing out.
