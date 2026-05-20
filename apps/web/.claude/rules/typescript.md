---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "next.config.ts"
  - "middleware.ts"
---

# TypeScript

## Configuration

The app uses:

- `strict: true`
- `isolatedModules: true`
- `moduleResolution: bundler`
- `jsx: preserve`
- `@/*` alias for `src/*`
- `@resources/*` alias for `src/app/api/(resourses)/*`

## Rules

1. Use `import type` for type-only imports.
2. Prefer explicit props interfaces for exported components.
3. Avoid `any`; if unavoidable for framework interop, keep it local and explain it.
4. Keep aliases aligned with `tsconfig.json` and `components.json`.
5. Do not import server-only modules into client components.
6. Do not import Firebase Admin/server token helpers into client code.
