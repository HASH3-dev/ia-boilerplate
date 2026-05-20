---
paths:
  - "src/app/**/*.tsx"
  - "src/app/api/**/*.ts"
  - "src/components/**/*.tsx"
  - "src/contexts/**/*.tsx"
  - "src/lib/**/*.ts"
  - "src/utils/**/*.ts"
---

# Architecture Overview

This app uses Next.js App Router.

## Main structure

```text
src/
├── app/
│   ├── (public)/         # pages accessible without auth
│   ├── (protected)/      # pages that require auth
│   ├── api/              # BFF route handlers
│   └── globals.css
├── components/
│   ├── sections/
│   ├── shared/
│   └── ui/
├── contexts/
├── lib/
└── utils/
```

## Rules

1. Keep route pages thin. Put reusable UI below route-local `components/` or shared components.
2. Use Server Components by default. Add `"use client"` only when hooks, browser APIs, or client-side interactions are needed.
3. Keep app-wide providers in `src/app/layout.tsx`.
4. Use `@/*` for imports from `src/*`; use `@resources/*` only for route-handler helpers under `src/app/api/(resourses)/*`.
5. Do not duplicate shadcn/Radix primitives outside `src/components/ui`.
6. Keep business/data contracts out of presentational components. Components receive typed props and render.
7. React components and browser code must not call `apps/api` directly. All backend API communication goes through Next route handlers in `src/app/api`.
8. Treat `src/app/api` as the Web BFF boundary. It owns backend request forwarding, response normalization, and app-facing error shape.
