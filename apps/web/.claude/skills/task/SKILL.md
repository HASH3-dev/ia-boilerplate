---
name: task
description: Plans a Web task. Supports two modes: standalone (interviews user, runs full pipeline) and delegation (receives root context, skips interview). Never creates a branch — branch creation belongs to /implement.
---

You orchestrate the complete local Web planning workflow.

## Modes

### Standalone mode

Invoked directly by the user (e.g. `/task` from inside the web app context).

Run the full pipeline: interview → planning → done.

### Delegation mode

Invoked by the root `local-task-dispatcher` agent with a pre-built context.

When the prompt contains a `DELEGATION MODE` header with a root task plan and app delegation context, **skip the user interview**. Use the provided context to write `task-plan.md`, then run the planning pipeline.

Do not create a branch in delegation mode. Report completion when all four files exist.

---

## Pipeline

```text
[task-plan.md] → implementation-planner → test-planner → todo-generator
```

Each step produces one file in the local task folder.

Local task folder pattern: `.claude/tasks/TASK-XXX-short-description-web/`

---

## Step 1: Requirements Planning

**Standalone mode:** Invoke `planner`. It interviews the user and writes `task-plan.md`.

**Delegation mode:** Write `task-plan.md` directly from the root task plan and app delegation context provided in the prompt. Adapt the content to reflect only what this app (`web`) needs to build, implement, or change. Do not repeat root-level coordination details.

Wait for this step to finish before continuing.

---

## Step 2: Implementation Planning

Invoke `implementation-planner` with the local task folder path.

It reads:
- `task-plan.md`
- `apps/web/.claude/rules/architecture.md`
- `apps/web/.claude/rules/authentication.md` (when auth is in scope)
- other relevant local rules

It writes `implementation-plan.md` with file-by-file steps and test hints per step.

Wait for it to finish before continuing.

---

## Step 3: Test Planning

Invoke `test-planner` with the local task folder path.

It reads both plan files and writes `test-plan.md` with unit, integration, e2e, and Playwright scenarios.

Mark a scenario as smoke when it:
- covers the primary happy path of a critical feature;
- verifies a core integration boundary (auth, BFF → API, session, navigation);
- catches a deployment-breaking regression quickly;
- is stable, deterministic, and inexpensive to run.

Do not mark edge cases or exhaustive validation matrices as smoke.

Wait for it to finish before continuing.

---

## Step 4: TODO

Invoke `todo-generator` with the local task folder path.

It reads all three plan files and writes `todo.md`.

### Cycle structure (mandatory)

`todo.md` **must** be divided into named cycles. Each cycle groups the work for one logical deliverable unit (e.g. a feature, a refactor, an infrastructure change). A task with a single deliverable has one cycle. A task with multiple independent deliverables has one cycle per deliverable.

Each cycle follows frontend TDD order internally:

```
[CONTRACT] → [UNIT] → [IMPL] → [INTEGRATION] → [E2E] → [VALIDATE]
```

Cycle heading format:

```markdown
## Cycle N: short-name
```

Sections inside a cycle that have no items for this task are **omitted** — do not include empty sections. Every cycle must have at least one `[IMPL]` or `[E2E]` section.

Example structure for a two-cycle task:

```markdown
## Cycle 1: setup-infrastructure

### Implementation
- [ ] [IMPL] ...

### E2E
- [ ] [E2E] [smoke] ...

### Validation
- [ ] [VALIDATE] ...

---

## Cycle 2: feature-cleanup

### Implementation
- [ ] [IMPL] ...

### E2E
- [ ] [E2E] ...

### Validation
- [ ] [VALIDATE] ...
```

The `/implement` skill iterates over these cycles one at a time, spawning `software-engineer` per cycle and committing after each one.

Smoke intent from `test-plan.md` must be preserved in `todo.md`.

Wait for it to finish before continuing.

---

## Step 5: Branch (standalone mode only)

**Standalone mode only.** If running standalone (not delegated from root):

```bash
git checkout -b task/TASK-XXX-short-description
```

**Delegation mode:** Skip this step. Branch creation is the responsibility of the root `/implement` skill.

---

## Done

**Standalone:** Report task folder, branch, generated files, and next command `/implement`.

**Delegation:** Report that all four files were created in the local task folder. Do not mention a branch.
