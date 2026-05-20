---
name: task
description: Plans a task. Supports two modes: standalone (interviews user, runs full pipeline) and delegation (receives root context, skips interview). Never creates a branch — branch creation belongs to /implement.
---

You orchestrate the complete local API planning workflow.

## Modes

### Standalone mode

Invoked directly by the user (e.g. `/task` from inside the API app context).

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

Each step produces one file. All four live in the local task folder.

Local task folder pattern: `.claude/tasks/TASK-XXX-short-description/`

```
.claude/tasks/
└── TASK-XXX-short-description/
    ├── task-plan.md            ← what & why
    ├── implementation-plan.md  ← how to build
    ├── test-plan.md            ← how to verify
    └── todo.md                 ← ordered TDD items
```

---

## Step 1: Requirements Planning

**Standalone mode:** Invoke the `planner` agent. It interviews the user and produces `task-plan.md`.

**Delegation mode:** Write `task-plan.md` directly from the root task plan and app delegation context provided in the prompt. Adapt the content to reflect only what this app (`api`) needs to build, implement, or change. Do not repeat root-level coordination details.

Wait for this step to finish before continuing.

---

## Step 2: Implementation Planning

Invoke the `implementation-planner` agent with the task folder path.

It reads `task-plan.md` + architecture rules and produces `implementation-plan.md` with file-by-file steps and test hints per step.

Wait for it to finish before continuing.

---

## Step 3: Test Planning

Invoke the `test-planner` agent with the task folder path.

It reads both plan files and produces `test-plan.md` with unit, integration, e2e, and contract scenarios.

Mark a test as smoke when it has these characteristics:

- It covers the primary happy path of a critical feature.
- It verifies that a core integration boundary still works, such as auth, persistence, external-port orchestration, token/session flow, or a public HTTP contract.
- It catches a deployment-breaking regression quickly.
- It is stable, deterministic, and inexpensive enough to run often.

Do not mark a test as smoke just because it is important. Keep edge cases, exhaustive validation matrices, rare error branches, security abuse cases, and detailed repository mapping tests in the normal suite unless they are the single best fast signal for system health.

When writing smoke tests in Jest, prefix the `describe` or `it` name with `[smoke]`.

Wait for it to finish before continuing.

---

## Step 4: Generate the TODO List

Invoke the `todo-generator` agent with the task folder path.

It reads all three plan files and produces `todo.md`.

### Cycle structure (mandatory)

`todo.md` **must** be divided into named cycles. Each cycle groups the work for one logical deliverable unit (e.g. a feature, a refactor, an infrastructure change). A task with a single deliverable has one cycle. A task with multiple independent deliverables has one cycle per deliverable.

Each cycle follows backend TDD order internally:

```
[CONTRACT] → [UNIT] → [IMPL] → [INTEGRATION] → [E2E] → [VALIDATE]
```

Cycle heading format:

```markdown
## Cycle N: short-name
```

Sections inside a cycle that have no items for this task are **omitted** — do not include empty sections. Every cycle must have at least one `[UNIT]` or `[IMPL]` section.

Example structure for a two-cycle task:

```markdown
## Cycle 1: domain-entity

### Unit
- [ ] [UNIT] [smoke] ...

### Implementation
- [ ] [IMPL] ...

### Validation
- [ ] [VALIDATE] ...

---

## Cycle 2: persistence-layer

### Unit
- [ ] [UNIT] ...

### Implementation
- [ ] [IMPL] ...

### Integration
- [ ] [INTEGRATION] [smoke] ...

### Validation
- [ ] [VALIDATE] ...
```

The `/implement` skill iterates over these cycles one at a time, spawning `software-engineer` per cycle and committing after each one.

TODO items for tests should preserve smoke intent from `test-plan.md`. If a planned test is an essential smoke test, include `[smoke]` in the future Jest test name and make that explicit in the TODO item text.

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

**Standalone:** Report to the user:

```
✅ Task planejada com sucesso.

Branch: task/TASK-XXX-short-description
Pasta:  .claude/tasks/TASK-XXX-short-description/

Arquivos gerados:
- task-plan.md
- implementation-plan.md
- test-plan.md
- todo.md

Rode /implement para iniciar o loop TDD.
```

**Delegation mode:** Report that all four files were created in the local task folder. Do not mention a branch.

## Error Handling

| Situation | Action |
|-----------|--------|
| Planner interview takes multiple rounds | Normal — wait for it to finish |
| Any planning agent fails | Report error to user and stop |
