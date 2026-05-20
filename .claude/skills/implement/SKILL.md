---
name: implement
description: Root implementation dispatcher. Runs app-local /implement workflows in dependency order and updates root coordination state.
---

You are orchestrating implementation from the root manager layer.

## Mission

Dispatch implementation to affected apps according to the root task's `@agentConfig/rootManager/workItemsFile` and `@agentConfig/rootManager/coordinationFile`.

You do not implement app code directly.

Before starting, read `.claude/agent.config.yml` and resolve all `@agentConfig/...` references used by this workflow.

## Step 1: Resolve root task

If called with an argument, resolve it under `@agentConfig/rootManager/taskDirectory`.

If called without an argument:

1. Run `@agentConfig/git/currentBranchCommand`.
2. Derive the root task folder from `@agentConfig/git/taskBranchPattern`.
3. If the current branch already matches the task branch pattern, skip branch creation.
4. If ambiguous, ask the user for the root task folder.

## Step 1b: Create the task branch

Before dispatching any work, create the git branch for this task if it does not already exist.

The branch name is formed by joining `@agentConfig/git/taskBranchPrefix` and the task folder name:

```
branch = taskBranchPrefix + taskFolderName
# example: "task/" + "TASK-001-web-auth-migration" → "task/TASK-001-web-auth-migration"
```

```bash
git checkout -b <branch>
```

If the branch already exists and the current branch matches it, skip creation.

If branch creation fails, stop and report the error to the user before continuing.

## Step 2: Load manager artifacts

Read:

- `@agentConfig/rootManager/taskPlanFile`
- `@agentConfig/rootManager/scopeFile`
- `@agentConfig/rootManager/contractFile` if present
- `@agentConfig/rootManager/workItemsFile`
- `@agentConfig/rootManager/coordinationFile`
- `@agentConfig/rootManager/statusFile`

If `@agentConfig/rootManager/workItemsFile` is missing, stop and instruct the user to run `/task` or `work-item-planner`.

## Step 2b: Seed the root retrospective

Before dispatching, create `retrospective.md` in the root task folder if it does not already exist:

```markdown
# Retrospective — <task-folder-name>

## Waves

<!-- Preenchido após cada wave -->
```

Do not overwrite if the file already exists.

## Step 3: Dispatch

Invoke `implementation-dispatcher`.

The dispatcher must:

- execute local app `/implement` workflows in dependency order;
- supervise each local implementation with a Ralph loop until the work-item is completed, blocked, or explicitly failed;
- stop on missing local `.claude/skills/implement/SKILL.md`;
- update root `@agentConfig/rootManager/statusFile` after each app;
- leave final acceptance and commit to `/validate` and `/commit`.

## Step 3c: Append wave retrospective

After each wave completes (regardless of result), append an entry to the root `retrospective.md`:

```markdown
## Wave <N>: <apps involved>

**Resultado:** completed | blocked | failed
**Surpresas de coordenação:** <divergências do contract.md, dependências inesperadas, ou "Nenhuma">
**Dificuldades:** <o que foi difícil ou inesperado na coordenação, ou "Nenhuma">
**Decisões notáveis:** <decisões de orquestração não óbvias, ou "Nenhuma">
```

If the wave had no surprises or difficulties, write "Nenhuma" in each field — do not omit the entry.

## Ralph loop requirement

While a delegated local implementation subagent is active, the root `/implement` workflow must keep supervising it.

If the subagent returns before the local work-item is complete and the result is not an explicit blocker/failure, send it a short continuation prompt:

```text
Continue. Resume the same local /implement workflow from the current task state. Do not restart from scratch. Update the local todo/status artifacts as you complete work, and report only when the work-item is completed or blocked.
```

Repeat this supervision loop until one of these terminal states is reached:

- local work-item completed;
- local work-item blocked with a concrete reason;
- local workflow failed with a concrete error;
- root manager determines manual user input is required.

Do not advance to the next work-item while the current delegated implementation is paused, incomplete, or ambiguous.

## Step 4: Coordinate

Invoke `delivery-coordinator` after dispatch to refresh root status.

## Done report

Report:

- completed work-items;
- blocked work-items;
- skipped work-items;
- next command: `/validate`.

## Rules

- Do not bypass local app workflows.
- Do not commit from `/implement`.
- Do not mark the root task accepted.
