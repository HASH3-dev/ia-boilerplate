---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "messages/**/*.json"
---

# Best Practices

## Common pitfalls

1. Do not add `"use client"` to files that can remain Server Components.
2. Do not hardcode user-facing text (prefer constants or i18n keys when the project uses i18n).
3. Do not access server-only environment variables in client code.
4. Do not duplicate auth/token parsing logic.
5. Do not create new UI primitives when an existing `src/components/ui` component fits.
6. Do not bypass Zod validation for form inputs or route-handler inputs.
7. Do not add broad dependencies for narrow UI behavior.
8. Do not silence build/lint issues by changing config unless the task is explicitly about tooling.
9. Do not rely on `.next` generated files as source of truth.
10. Keep route-specific components local until they are reused.
11. Do not call `apps/api` directly from React components or browser-side code. Use the Next BFF route handlers under `src/app/api`.

## Component ordering

Prefer this order:

1. `"use client"` directive when required.
2. Imports.
3. Schemas/constants.
4. Types/interfaces.
5. Component function.
6. Small private helpers.

Keep components focused and extract only when it removes real duplication or clarifies a workflow.
