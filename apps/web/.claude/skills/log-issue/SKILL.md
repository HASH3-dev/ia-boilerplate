---
name: log-issue
description: Log one or more Web validation issues into the current local task issues folder.
---

Persist issues as individual files in `.claude/tasks/<task-folder>/issues/`.

## Steps

1. Resolve the task folder from current branch or user input.
2. Determine the next `issue-NNN.md` number.
3. Create one file per issue.

Format:

```markdown
## ISSUE-NNN [severity — type] — Short title

**Arquivo:** `path/to/file.tsx:line`

**Problema:**

**Fix esperado:**

### Tarefas

- [ ] ...
```

Use types: `arquitetura`, `segurança`, `i18n`, `ui`, `forms`, `typescript`, `testing`.
