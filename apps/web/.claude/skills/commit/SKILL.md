---
name: commit
description: Web commit/release workflow with validation, audits, and semantic commits.
---

You orchestrate a local Web commit workflow.

## Step 1: Workflow type

Ask for:

- `Commit only`
- `Commit + Release`

Default to `Commit only` when invoked by `/implement` or by the root `/commit` dispatcher.

## Step 2: Static validation and tests

All commands below must be run from the **monorepo root** (`/`), not from `apps/web/`. Stop on first failure.

```bash
# Run from monorepo root:
npm run lint:web        # ESLint via apps/web
npm run build:web       # Next.js build via apps/web
npm run test:app:full   # Defined in root package.json — runs Vitest + full Playwright suite via Docker
```

`test:app:full` is defined in the **root `package.json`**, not in `apps/web/package.json`. Always run it from the monorepo root. It runs Vitest unit tests first, then the full Playwright suite via Docker. Use `--quiet` to redirect verbose Docker output to `/tmp/test-app-full.log` and print only a one-line summary:

```bash
npm run test:app:full -- --quiet
echo "EXIT: $?"
# Read the log only on failure:
# tail -100 /tmp/test-app-full.log
```

**This step is mandatory and has no fallback.** Running only `npm run test:web` (Vitest only) is NOT acceptable — it skips E2E tests and does not satisfy the commit gate. If Docker is unavailable, the commit is BLOCKED until Docker is available. Do not commit with only unit tests passing.

If `npm run lint:web` exits with a non-zero code:
- **Stop the workflow immediately.**
- Show the ESLint errors to the user.
- Do NOT proceed to build or tests.

If `npm run build:web` exits with a non-zero code:
- **Stop the workflow immediately.**
- Show the build errors to the user.
- Do NOT proceed to tests.

If `test:app:full` exits with a non-zero code:
- **Stop the workflow immediately.**
- Tell the user: `Os testes não passaram. Veja o log em /tmp/test-app-full.log.`
- Do NOT proceed to architecture or security checks.

## Step 3: Validation scope

Compute changed Web files against `main` from the monorepo root:

```bash
git diff --name-only $(git merge-base HEAD main) HEAD
```

Filter the result to only `.ts` and `.tsx` files. This is the **validation scope**. If `git merge-base` fails, fall back to:

```bash
git diff --name-only HEAD
```

Pass the scoped file list to both `architecture-validator` and `security-auditor` under a `Scope:` section:

```
Scope — validate only these files (they are the ones changed in this branch):
- apps/web/src/app/items/page.tsx
- apps/web/src/components/items/items-list.tsx
- ...
```

## Step 4: Handle issues — auto-resolution loop

After each validation agent (architecture-validator and security-auditor), evaluate the results **before** proceeding.

### If any Critical or High issues are found:

**Execute this loop automatically — no user interaction required:**

1. **Invoke `/log-issue`**, passing all critical/high findings. The skill creates individual `issue-NNN.md` files in the task issues folder.

2. **Invoke `/resolve-issues`** immediately after logging. The skill reads the open issue files and delegates fixes to the `software-engineer` agent.

3. **Re-run the full validation sequence** from Step 2 (`lint:web` → `build:web` → `test:app:full` → `architecture-validator` → `security-auditor`).

4. **Repeat** this loop until no Critical or High issues remain.

5. Only after the loop exits clean, proceed to `smart-committer`.

**Do not ask the user for confirmation between loop iterations.** The loop is autonomous and terminates only when validation is clean or when a finding cannot be resolved automatically (e.g., requires an architectural decision beyond the agent's authority). In that case, stop and report the specific blocker to the user.

### If only Warnings or Suggestions are found:

- Report them briefly to the user.
- **Do NOT invoke `/log-issue`** — warnings are not persisted automatically.
- Continue to the next step.

### If no issues are found:

- Report success and continue to the next step.

## Severity classification

| Result | Action |
|---|---|
| Critical (architecture or security) | `/log-issue` → `/resolve-issues` → retry loop |
| High (security) | `/log-issue` → `/resolve-issues` → retry loop |
| Warning | Report + continue |
| Suggestion / Info | Report + continue |

## Step 5: Commit

If no blocking findings exist, invoke `smart-committer`.

Commit messages must never include AI/model attribution trailers. Do not add or allow `Co-Authored-By:` lines naming Claude, ChatGPT, GPT, an AI model, an AI vendor, a bot, or an assistant tool. Verify the exact message before committing and inspect the created commit body afterward.

## Step 5b: Release (Commit + Release only)

If release was requested:

1. **Invoke `knowledge-refiner`** before `release-manager`.

   Collect retrospective files:
   - Local: `.claude/tasks/<task-folder>/retrospective.md` (if it exists)
   - Root: derive the root task folder from the branch name (`task/TASK-XXX-...` → `.claude/tasks/TASK-XXX-.../retrospective.md` at repo root); include if it exists.

   Pass all found retrospective paths and contents to `knowledge-refiner`. If none exist, skip silently. Wait for it to complete.

2. **Invoke `release-manager`** after `knowledge-refiner` completes.

## Example: auto-resolution loop

```
### Step 1/3: Static validation
Running npm run lint:web... ✅
Running npm run build:web... ✅
Running npm run test:app:full (from monorepo root)... ✅ All tests passed.

### Step 2/3: Architecture & Security
Running architecture-validator...
⛔ 1 critical violation found.

[invoking /log-issue → creates issue-001.md]
[invoking /resolve-issues → software-engineer fixes issue]

### Loop iteration 2 — re-running full validation
Running npm run lint:web... ✅
Running npm run build:web... ✅
Running npm run test:app:full... ✅
Running architecture-validator... ✅ No violations.
Running security-auditor... ✅ No critical issues.

### Step 3/3: Creating commits
Running smart-committer...
✅ Commit created.
```

## Example: successful workflow (no issues)

```
### Step 1/3: Static validation
Running npm run lint:web... ✅
Running npm run build:web... ✅
Running npm run test:app:full (from monorepo root)... ✅ All tests passed.

### Step 2/3: Architecture & Security
Running architecture-validator... ✅ No violations. 1 suggestion (optional).
Running security-auditor... ✅ No critical issues. 1 warning: permissive CORS.

### Step 3/3: Creating commits
Running smart-committer...
✅ Commit created.
```
