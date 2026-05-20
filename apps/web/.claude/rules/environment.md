---
paths:
  - ".env*"
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Environment Variables

Required variables in `.env.local`:

```env
# Backend API
BACKEND_API_BASE_URL="http://localhost:3001"

# Auth (adapt to your provider)
# Only NEXT_PUBLIC_* variables are accessible in client-side code
# NEXT_PUBLIC_AUTH_PROVIDER_CONFIG="..."

# App
NODE_ENV="development"
```

## Rules

1. Never expose server-only environment variables to client components.
2. Only variables prefixed with `NEXT_PUBLIC_` may be used in browser code.
3. Keep `BACKEND_API_BASE_URL` server-only — never expose it to the client.
4. Add new required variables to `.env.example` with a placeholder value.
