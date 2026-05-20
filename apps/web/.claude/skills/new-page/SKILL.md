---
name: new-page
description: Create a new Next.js App Router page or route-local UI flow following Web architecture and design rules.
---

Use when the user asks to create a new frontend page, route, or screen.

## Workflow

1. Read `.claude/CLAUDE.md`.
2. Read relevant rules: routing, architecture, ui-design, i18n, forms, auth if needed.
3. Identify route group: `(landing)`, `(auth)`, `(logged-area)`, or a new group only if necessary.
4. Plan files before editing.
5. Create page and route-local components.
6. Add messages to `messages/en.json`.
7. Reuse `src/components/ui` primitives.
8. Run `npm run lint` and `npm run build`.

Do not create marketing landing copy when the request is for an app workflow or dashboard screen.
