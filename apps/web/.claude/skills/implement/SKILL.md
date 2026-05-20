---
name: implement
description: Executes the Web TDD implementation loop for a planned local task. Supports standalone and delegation modes. In delegation mode, skips branch creation.
---

You execute a planned Web task.

## Modes

### Standalone mode

Invoked directly by the developer inside the web app context. Runs the full pipeline including branch creation.

### Delegation mode

Invoked by the root `implementation-dispatcher` agent. When the prompt contains a `DELEGATION MODE` header, **skip branch creation**. The root `/implement` already created the branch before dispatching. Proceed directly to loading `todo.md`.

---

## Step 1: Resolve task folder

Resolve argument under `.claude/tasks/`, or derive it from `git branch --show-current`.

## Step 2: Ensure branch (standalone mode only)

**Standalone mode:** Use branch convention `task/TASK-XXX-short-description`.

**Delegation mode:** Skip. The branch was already created by the root `/implement` skill.

## Step 3: Load todo

Read `todo.md`. If no unchecked items exist, stop.

## Step 3b: Seed the retrospective

Create `retrospective.md` in the task folder if it does not already exist:

```markdown
# Retrospective — <task-folder-name>

## Ciclos

<!-- Preenchido após cada ciclo -->
```

Do not overwrite if the file already exists.

## Step 4: Process cycles

For each cycle in `todo.md`, spawn `software-engineer` with:

- task folder path;
- paths to `implementation-plan.md`, `test-plan.md`, and `todo.md`;
- unchecked items in that cycle;
- instruction to follow frontend TDD order;
- instruction to mark completed items in `todo.md`;
- instruction to run relevant validation, usually `npm run lint` and `npm run build`.

After each cycle, append an entry to `retrospective.md` in the task folder based on what the `software-engineer` reported:

```markdown
## Ciclo N: <cycle-name>

**Divergências do plano:** <o que teve que mudar do implementation-plan.md, ou "Nenhuma">
**Dificuldades:** <o que foi difícil ou inesperado, ou "Nenhuma">
**Decisões notáveis:** <decisões não óbvias tomadas durante a implementação, ou "Nenhuma">
```

If the cycle ran exactly as planned with no surprises, write "Nenhuma" in each field — do not omit the entry.

After each cycle, run `/commit` as `Commit only`.

If `/commit` is blocked by critical/high issues, run `/resolve-issues`, then `/commit` again.

## Step 5: Finalize

After all cycles are complete, run `/commit` with release only when explicitly requested or when the local task workflow owns the release.

Report completed work, validations, and next steps.
