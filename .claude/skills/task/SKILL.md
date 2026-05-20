---
name: task
description: Root manager workflow for every demand. Interviews, scopes, plans contracts, dispatches local app task planning, and prepares coordination artifacts. Does not create branches.
---

You are orchestrating root task intake for the Genemunology monorepo.

## Mission

Every demand starts at the root. Create the manager task, classify scope, plan contracts if needed, dispatch planning to each affected app's local task skill, and prepare coordination artifacts.

Do not implement app code and do not write app-local technical TODO lists directly.
Do not create a git branch — that is the responsibility of `/implement`.

Before starting, read `.claude/agent.config.yml` and resolve all `@agentConfig/...` references used by this workflow.

## Workflow

Run these agents in order:

### Step 1 — `root-manager`

- Interviews the user.
- Creates `@agentConfig/rootManager/taskDirectory/TASK-XXX-short-description/@agentConfig/rootManager/taskPlanFile`.
- Must ask questions when a ticket or external source lacks requirements.

Wait for it to finish before continuing.

### Step 2 — `scope-router`

- Reads the root task plan.
- Writes `@agentConfig/rootManager/scopeFile`.
- Classifies the task as `api`, `web`, or `cross-app`.

Wait for it to finish before continuing.

### Step 3 — `contract-planner`

- Run only when `@agentConfig/rootManager/scopeFile` says `contract_required: true`.
- Writes `@agentConfig/rootManager/contractFile`.
- Decides whether `@agentConfig/contracts/packagePath` is needed.

Skip this step when no contract is required.

### Step 4 — `work-item-planner`

- Writes `@agentConfig/rootManager/workItemsFile` with the execution graph, affected apps, dependencies, and parallelism rationale.
- Creates initial `@agentConfig/rootManager/coordinationFile` and `@agentConfig/rootManager/statusFile`.

Wait for it to finish before continuing.

### Step 5 — `local-task-dispatcher`

- Reads `@agentConfig/rootManager/workItemsFile` to identify affected apps.
- For each affected app, invokes that app's local task skill (`@agentConfig/apps/<appKey>/localTasksPath/../skills/task/SKILL.md`) in **delegation mode**.
- Passes: root task folder, root `@agentConfig/rootManager/taskPlanFile` content, and app-specific delegation context.
- The local skill creates its own task folder under `@agentConfig/apps/<appKey>/localTasksPath/TASK-XXX-feature-<appKey>/` with: `task-plan.md`, `implementation-plan.md`, `test-plan.md`, `todo.md`.
- Apps required in the same wave may be dispatched in parallel when `work-items.md` declares them parallelizable.

Wait for all dispatched local task plannings to finish before continuing.

### Step 6 — `delivery-coordinator`

- Verifies the root task and all local task artifacts are ready for implementation.
- Updates `@agentConfig/rootManager/coordinationFile` and `@agentConfig/rootManager/statusFile`.

## Done report

Report:

- root task folder;
- classification and affected apps;
- contract required or not;
- local task folders created per app;
- which local plannings ran in parallel;
- next command: `/implement`.

## Rules

- Root task is mandatory for every demand.
- Root task artifacts are coordination records; technical planning belongs inside each app's local task folder.
- The root `/task` skill never creates a git branch. Branch creation belongs to `/implement`.
- Cross-app contract comes before local task dispatch.
- Work-items must clearly state dependencies and whether they are sequential or parallelizable.
- Ticket title alone is never enough to plan.
- Do not proceed to local task dispatch without a completed `work-items.md`.
