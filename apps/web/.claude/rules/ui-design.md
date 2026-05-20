---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
  - "src/app/globals.css"
  - "components.json"
---

# UI and Design System

This app uses Tailwind CSS v4, shadcn-style components, Radix primitives, and lucide icons.

## Rules

1. Reuse `src/components/ui/*` primitives before creating new primitives.
2. Use `cn` from `src/lib/utils.ts` for conditional class composition.
3. Keep reusable app sections under `src/components/sections` or `src/components/shared`.
4. Keep route-specific components inside the route's local `components/` folder.
5. Use existing theme tokens from `src/app/globals.css` such as `primary`, `secondary`, `background`, and `foreground`.
6. Use lucide icons when an icon exists; do not add one-off inline SVG icons unless the asset is brand-specific.
7. Do not introduce unrelated visual systems or new UI libraries without explicit approval.
8. Text must remain responsive and avoid overlap on mobile and desktop.

## shadcn config

`components.json` defines:

- style: `new-york`
- RSC enabled
- aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`
- icon library: `lucide`
