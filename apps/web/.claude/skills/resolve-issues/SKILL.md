---
name: resolve-issues
description: Resolve open issues in a Web task's issues folder. TRIGGER on any of these: "fix issues", "resolve issues", "temos issues na task", "novas issues na task", "issues da task", "issues abertas", "corrija as issues", any message mentioning a task name alongside "issue(s)". Looks in `apps/web/.claude/tasks/<task>/issues/` for `issue-NNN.md` files (open) vs `issue-NNN.done.md` (resolved). Delegates fixing to the software-engineer agent, then renames resolved issue files.
---

# Resolve Issues

## Workflow

Use this skill when the user mentions issues to fix, even informally — e.g., "temos novas issues na task 001", "corrija as issues", "resolve the issues from validation".

### 1. Locate the task folder.

Accept either a full path, a folder name such as `TASK-001-items-page`, or an unambiguous partial task name like "task 001" or "001".

Resolve it under `apps/web/.claude/tasks/` unless the user supplied another path.

Look for both `TASK-XXX-short-description/` and `TASK-XXX-short-description.done/` variants.

If no task is mentioned by the user, use `git branch --show-current` to derive the current task folder.

### 2. Find open issues.

List the `issues/` directory inside the task folder:

```bash
ls apps/web/.claude/tasks/<task-folder>/issues/
```

- **Open**: files matching `issue-NNN.md` (without `.done`)
- **Resolved**: files matching `issue-NNN.done.md` — skip these entirely

If the `issues/` directory does not exist or contains no open `.md` files, stop and report that the task has no open issues.

Sort open files numerically. Prefer critical/high severity issues first (read only the severity label line of each file — do not load the full content into this context).

### 3. Invoke the `software-engineer` agent.

Spawn `software-engineer` and pass in the prompt:

- The task folder path
- The **paths** to each open issue file (e.g. `apps/web/.claude/tasks/TASK-XXX/issues/issue-001.md`) — the agent reads them directly; do not copy the content here
- The **paths** to plan files if they exist (`task-plan.md`, `implementation-plan.md`) — the agent reads them if it needs design context
- Explicit instructions for how to act:
  - Read each issue file from the provided paths
  - Resolve one issue at a time, in order of severity (critical → high → warning)
  - For behavioral issues (wrong output, broken UI, missing validation): add or update a focused failing test before implementing the fix
  - For structural issues where runtime behavior is unchanged (architecture violation, wrong import, dead code): validate with `npm run lint:web` and `npm run build:web` from the monorepo root
  - Keep edits scoped to the issue — do not batch unrelated refactors
  - For each resolved issue: run the relevant tests or static validation to confirm the fix
  - Return a list of which issue paths were resolved and which remain open (with reason)

Wait for the agent to finish.

### 4. Mark resolved issues as done.

Based on the agent's report of resolved issues, rename each resolved file:

```bash
mv apps/web/.claude/tasks/<task-folder>/issues/issue-NNN.md \
   apps/web/.claude/tasks/<task-folder>/issues/issue-NNN.done.md
```

Do NOT edit the content of the file when renaming — it is the historical record.

Leave still-failing or deferred issues as `.md`.

### 5. Final response.

- List which issue files were resolved (renamed to `.done.md`)
- List any issues left open and why
- Mention the tests or validations run (as reported by the agent)
