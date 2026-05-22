---
name: log-issue
description: Log one or more Web validation issues into the current local task issues folder. Creates individual issue-XXX.md files inside <task-folder>/issues/. Use when validation agents (architecture-validator, security-auditor) report critical or high findings that need to be tracked.
---

# Log Issue

## Purpose

Persist one or more issues as individual files inside the current task's `issues/` folder.

Each issue gets its own `issue-XXX.md` where `XXX` is a zero-padded three-digit number incremented from the highest existing file in that folder. Open issues have the `.md` extension. Resolved issues have the `.done.md` extension.

## Step 1: Locate the Task Folder

Run `git branch --show-current`. Branch name follows `task/TASK-XXX-short-description`. Task folder is `.claude/tasks/TASK-XXX-short-description/` inside `apps/web/`.

If the branch does not follow this pattern, ask the user for the target task folder path before proceeding.

## Step 2: Determine the Next Issue Number

Check for an existing `issues/` directory inside the task folder:

```bash
ls apps/web/.claude/tasks/<task-folder>/issues/ 2>/dev/null
```

- Find all files matching `issue-*.md` and `issue-*.done.md`.
- Extract the numeric parts and find the highest number.
- Next issue number = highest + 1. If no files exist, start at 1.
- Format as zero-padded three digits: `001`, `002`, … , `999`.

## Step 3: Create Each Issue File

For each issue to log, create `apps/web/.claude/tasks/<task-folder>/issues/issue-NNN.md` with this exact format:

```markdown
## ISSUE-NNN [severity — type] — Short title

**Arquivo:** `path/to/file.tsx:line`

**Problema:**
Clear explanation of what is wrong and why it matters.

**Fix esperado:**
Concrete fix or code example.

### Tarefas

- [ ] Task 1
- [ ] Task 2

---
```

Severity labels: `critical`, `high`, `warning`, `suggestion`
Type labels: `arquitetura`, `segurança`, `typescript`, `i18n`, `ui`, `forms`, `testing`

Increment the number for each additional issue in the same batch (NNN, NNN+1, NNN+2…).

## Step 4: Confirm

Report to the user which files were created:

```
Issues registradas em `apps/web/.claude/tasks/<task-folder>/issues/`:
- issue-001.md — [CRITICAL] Short title
- issue-002.md — [HIGH] Short title
```

## Notes

- Never write to a single `issues.md` file. Always create individual files in the `issues/` directory.
- The `issues/` directory is created implicitly when the first file is written — no need to run `mkdir`.
- Resolved issues have the `.done.md` extension (renamed by `/resolve-issues`). Do not create files with that extension here.
