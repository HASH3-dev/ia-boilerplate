---
name: commit
description: Web commit/release workflow with validation, audits, and semantic commits.
---

You orchestrate a local Web commit workflow.

## Step 1: Workflow type

Ask for:

- `Commit only`
- `Commit + Release`

Default to `Commit only` when invoked by `/implement`.

## Step 2: Static validation and tests

Run from the monorepo root, stopping on first failure:

```bash
npm run lint:web
npm run build:web
npm run test:app:full
```

`test:app:full` runs Vitest unit tests first, then the full Playwright suite via Docker.

**This step is mandatory and has no fallback.** Running only `npm run test:web` (unit tests) is NOT acceptable — it skips E2E tests and does not satisfy the commit gate. If Docker is unavailable, the commit is BLOCKED until Docker is available. Do not commit with only unit tests passing.

If `test:app:full` reports ANY test failures, stop immediately. Do not proceed to architecture or security checks. Do not create a commit. Report the failures and wait for fixes.

Stop on failure.

## Step 3: Validation scope

Compute changed Web files against `main` when possible. Pass scoped files to:

- `architecture-validator`
- `security-auditor`

## Step 4: Commit

If no blocking findings exist, invoke `smart-committer`.

If release was requested:

1. Invoke `knowledge-refiner` before `release-manager`.

   Collect retrospective files:
   - Local: `.claude/tasks/<task-folder>/retrospective.md` (if it exists)
   - Root: derive the root task folder from the branch name and look for `retrospective.md` at the repo root `.claude/tasks/<task-folder>/`; include it if it exists

   Pass all found retrospective paths and contents to `knowledge-refiner`. If none exist, skip silently.

   The `knowledge-refiner` agent will update `.claude/rules/` files with actionable learnings. Wait for it to complete.

2. Invoke `release-manager` after `knowledge-refiner` completes.

Commit messages must never include AI/model attribution trailers. Do not add or allow `Co-Authored-By:` lines naming Claude, ChatGPT, GPT, an AI model, an AI vendor, a bot, or an assistant tool. Verify the exact message before committing and inspect the created commit body afterward.

## Blocking behavior

Critical/high findings must be logged with `/log-issue` and block commits.
