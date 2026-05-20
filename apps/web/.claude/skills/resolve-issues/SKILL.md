---
name: resolve-issues
description: Resolve open issues in a Web task's issues folder.
---

Find open `.claude/tasks/<task-folder>/issues/issue-NNN.md` files, then spawn `software-engineer` with:

- issue file paths;
- task plan files when present;
- instruction to fix one issue at a time;
- instruction to add/update tests or validation checks when behavior changes;
- instruction to run `npm run lint` and `npm run build` or a narrower relevant validation.

Rename resolved files to `issue-NNN.done.md`. Leave unresolved issues open and report why.
