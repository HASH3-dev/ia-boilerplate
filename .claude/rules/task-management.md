---
paths:
  - "@agentConfig/rootManager/taskDirectory/**"
  - ".claude/skills/**"
  - ".claude/agents/**"
---

# Root Task Management

Root tasks are manager records. They coordinate work-items; they are not technical TODO lists for app implementation.

## Required root artifacts

- `@agentConfig/rootManager/taskPlanFile`: user intent, acceptance criteria, and global scope.
- `@agentConfig/rootManager/scopeFile`: app classification and rationale.
- `@agentConfig/rootManager/contractFile`: required only for cross-app boundaries.
- `@agentConfig/rootManager/workItemsFile`: local app tasks, dependencies, and execution graph.
- `@agentConfig/rootManager/coordinationFile`: ordered delivery checkpoints, including parallel/sequential execution waves.
- `@agentConfig/rootManager/statusFile`: current state, blockers, and validation summary.

## Execution graph

Every root task must state when work can run in parallel.

Use waves:

- `Mode: sequential` when one work-item depends on another's contract, data shape, behavior, validation, or generated artifacts.
- `Mode: parallel` only when listed work-items are independent and can be safely delegated to separate subagents at the same time.

Parallel execution must include a rationale. Different app folders are not enough by themselves; independence must be about behavior and dependencies.

## External tickets

Tickets, issues, or Jira summaries are input, not complete requirements. A title alone is never enough to create a task plan. The root manager must ask follow-up questions when description, acceptance criteria, scope, or test expectations are missing.

## Branch ownership

Git branches are created by `/implement`, not by `/task`.

- Root `/task`: produces coordination and planning artifacts only. No branch.
- Local app task skills (invoked in delegation mode): produce local planning artifacts only. No branch.
- Root `/implement`: creates the task branch before dispatching app implementations.

Local app task skills invoked in **standalone mode** (directly by the developer, not from root) may create a branch for isolated local work.

## Commit ownership

Apps can run local validation. The root owns final acceptance and final commit for the feature.

## Commit message identity policy

Commit messages must never include AI/model attribution trailers. Do not add, suggest, preserve, or allow lines such as `Co-Authored-By: Claude Sonnet`, `Co-Authored-By: ChatGPT`, `Co-Authored-By: GPT`, or any other `Co-Authored-By:` line naming an AI assistant, model, vendor, bot, or tool. This applies to root commits, app-local commits, release commits, squash commits, and amended commits.

Before creating a commit, inspect the exact commit message that will be passed to Git and remove any such trailer. After creating a commit, verify the resulting commit body does not contain prohibited AI/model attribution. If it does, amend the commit immediately before continuing.

## Release ownership

The root owns consolidated monorepo releases when work touches root files, multiple apps, shared contracts, scripts, containers, or cross-app behavior.

Root releases use the root `package.json` version, create annotated tags named `vX.Y.Z`, and write changelogs to `releases/YYYY-MM-DD-vX.Y.Z-changelog.md`.

App-local release managers are for standalone app releases only. They must not substitute for a root release when the root manager owns the release.

Root release ownership does not bypass app-local commit/release checkpoints. When a root commit or release includes files under a configured app path, the root workflow must invoke that app's local commit skill in a subagent before any root release commit or tag is created. If the affected app has a matching local task folder, the root workflow must verify that the local workflow either moved it to `.done` or explicitly reported why it remains open.

Do not create a root release tag while an affected app-local task remains open without a recorded blocker. An open local task after root release preparation is a workflow failure, not a harmless bookkeeping issue.
