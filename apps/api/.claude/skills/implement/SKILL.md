---
name: implement
description: Executes the TDD implementation loop for a planned task — reads todo.md, iterates cycles via the software-engineer agent, validates with /commit after each cycle, resolves issues if needed, and finishes with a release commit. Supports standalone and delegation modes. In delegation mode, skips branch creation.
---

You are executing the implementation loop for a planned task.

## Modes

### Standalone mode

Invoked directly by the developer inside the API app context. Runs the full pipeline including branch creation.

### Delegation mode

Invoked by the root `implementation-dispatcher` agent. When the prompt contains a `DELEGATION MODE` header, **skip branch creation**. The root `/implement` already created the branch before dispatching. Proceed directly to loading `todo.md`.

---

## Overview

```
[standalone: criar/checar branch] → ler todo.md → para cada ciclo TDD:
  → software-engineer (implementa o ciclo)
  → /commit (valida + commita)
      → se bloqueado por issues: /resolve-issues → /commit novamente
      → repetir até passar
→ /commit com release (ciclo final)
→ relatório
```

---

## Step 1: Identify the Task Folder

If called with an argument (e.g., `/implement TASK-003`): resolve it under `.claude/tasks/`. Accept a full folder name or an unambiguous prefix like `003` or `TASK-003`.

If called with no argument: run `git branch --show-current` and derive the task folder name from the branch (e.g., `task/TASK-003-profile-address` → `.claude/tasks/TASK-003-profile-address/`).

If the folder cannot be resolved, stop and ask the user.

---

## Step 2: Create or Switch to the Task Branch (standalone mode only)

**Delegation mode:** Skip this step. The branch was already created by the root `/implement` skill.

**Standalone mode:** Derive the branch name from the task folder name using the convention `task/TASK-XXX-short-description`.

Run `git branch --show-current` to check the current branch.

- **If already on the correct task branch:** proceed without creating a new one.
- **If on a different branch:** run `git checkout -b task/TASK-XXX-short-description`. If the branch already exists remotely or locally, use `git checkout task/TASK-XXX-short-description` instead.

Report the branch that is active before continuing.

---

## Step 4: Load the TODO List

Read `todo.md` from the task folder. Load every unchecked item (`- [ ]`) into **TodoWrite** so progress is visible during the session.

If `todo.md` does not exist or has no unchecked items, report that the task has nothing to implement and stop.

## Step 4b: Seed the retrospective

Create `retrospective.md` in the task folder if it does not already exist:

```markdown
# Retrospective — <task-folder-name>

## Ciclos

<!-- Preenchido após cada ciclo -->
```

Do not overwrite if the file already exists.

---

## Step 5: TDD Implementation Loop

Identify the cycles in `todo.md`. A cycle is a group of items that belongs together (typically grouped under a heading or sharing a common feature scope). Process **one cycle at a time**.

### For each cycle:

#### 3a. Invoke `software-engineer`

Spawn the `software-engineer` agent. Pass in the prompt:

- The task folder path
- The paths to: `implementation-plan.md`, `test-plan.md`, `todo.md` (the agent reads them directly)
- The specific unchecked items in this cycle (by text, so the agent knows what to work on)
- Explicit instructions for this cycle:
  - Follow TDD order: contract tests → unit tests → implementation → integration tests → e2e tests
  - Mark each completed `todo.md` item as `[x]` in the file as it is done
  - Run `source ~/.asdf/asdf.sh && npm run test` after implementation to confirm tests pass
  - Return a summary of what was done

Wait for the agent to finish. Update TodoWrite to reflect items marked done in `todo.md`.

#### 3a-retro. Append cycle retrospective

After the `software-engineer` agent returns, append an entry to `retrospective.md` in the task folder:

```markdown
## Ciclo N: <cycle-name>

**Divergências do plano:** <o que teve que mudar do implementation-plan.md, ou "Nenhuma">
**Dificuldades:** <o que foi difícil ou inesperado, ou "Nenhuma">
**Decisões notáveis:** <decisões não óbvias tomadas durante a implementação, ou "Nenhuma">
```

Base this on what the `software-engineer` reported. If the cycle ran exactly as planned with no surprises, write "Nenhuma" in each field — do not omit the entry.

#### 3b. Invoke `/commit` (commit only)

After the cycle is implemented, invoke the `/commit` skill. When it asks for workflow type, it should use **"Commit only"** (not release) — inform the user of this before invoking so they can choose accordingly.

**If `/commit` succeeds:** move to the next cycle.

**If `/commit` is blocked by Critical/High issues:**
- Invoke `/resolve-issues` — it will find the open issue files and spawn `software-engineer` to fix them
- After `/resolve-issues` completes, invoke `/commit` again (commit only)
- Repeat this loop until `/commit` passes

---

## Step 6: Final Commit with Release

When all cycles in `todo.md` are complete and the last `/commit` has passed, invoke `/commit` once more. When it asks for workflow type, select or suggest **"Commit + Release"**.

The `/commit` skill with release will handle the changelog, version bump, and marking the task as done.

---

## Step 7: Report

After the release commit completes, report:

```
## ✅ TASK-XXX Implementada

**Branch:** task/TASK-XXX-short-description
**Pasta:** .claude/tasks/TASK-XXX-short-description/

### O que foi feito
<one sentence summary from the cycles completed>

### Próximos passos
- Abrir PR de `task/TASK-XXX-...` → `main`
- Rodar `npm run migrate:latest` no staging (se houver migration)
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| `todo.md` missing | Stop, report, ask user |
| `software-engineer` agent fails mid-cycle | Report the error, stop, ask user how to proceed |
| `/commit` blocked 3+ times on same issues | Stop, show issues, ask user |
| User wants to skip a test layer | Ask for explicit confirmation, then proceed |
