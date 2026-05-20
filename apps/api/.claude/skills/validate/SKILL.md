---
name: validate
description: Full project validation — startup health check plus architecture and security audit of the entire codebase, without scoping to changed files.
---

You are orchestrating a full project validation workflow.

## Your Mission

Run a complete operational, architecture, and security validation across the **entire codebase** (no file scope restriction), report all findings, and log blocking issues to the current task's `issues/` folder using the `/log-issue` skill.

This is different from `/commit`, which scopes validation to changed files only. Use `/validate` when you want a global health check of the project.

Issues are stored as individual files: `<task-folder>/issues/issue-NNN.md` (open) or `issue-NNN.done.md` (resolved).

## Step 1: Operational Startup Check

Before running validation agents, prove that the application starts successfully and that the root health check responds.

Run the skill-owned startup validation script from the repository root:

```bash
.claude/skills/validate/scripts/startup-health-check.sh
```

Expected result:

- `npm run start` must keep the NestJS application running.
- `curl -fsS http://localhost:3000/` must return successfully, unless `PORT` or `HEALTHCHECK_URL` is explicitly overridden for the script.
- If startup fails, the process exits early, the port never responds, or the curl fails after the timeout, stop validation immediately and report the startup/health-check failure to the user.
- Always clean up the background application process before continuing or stopping.

## Step 2: Execute Validation

Run agents **sequentially**.

Steps in order:
1. **architecture-validator** — Full project Clean Architecture audit (no `Scope:` passed — let the agent validate everything)
2. **security-auditor** — Full project security audit (no `Scope:` passed)

Do NOT pass a `Scope:` section to either agent. They will scan the full project.

## Step 3: Handle Issues — MANDATORY BEHAVIOR

After each validation agent, evaluate the results **before** proceeding to the next step.

### If any Critical or High issues are found:

**You MUST:**

1. **Invoke the `/log-issue` skill**, passing all critical/high findings. The skill will locate the task folder from the current branch, determine the next issue number, and create individual `issue-NNN.md` files — one per finding.

2. **Inform the user** with this structure:

   ```
   ## ⚠️ Validação completa — problemas encontrados

   Foram encontrados [N] problema(s) bloqueante(s) [na validação de arquitetura / segurança].

   Issues registradas em `.claude/tasks/<task-folder>/issues/` (issue-NNN.md a issue-MMM.md).

   **Resumo dos problemas:**
   - [CRITICAL/HIGH] File:line — Short description
   - ...
   ```

3. Continue to the next agent (do NOT stop — unlike `/commit`, full validation always runs both agents).

### If only Warnings or Suggestions are found:

- Report them briefly to the user
- Do NOT invoke `/log-issue` — warnings are not persisted automatically
- Continue to the next step

### If no issues are found:

- Report success and continue

## Severity Classification

| Result | Action |
|--------|--------|
| Critical | Invoke `/log-issue` + report |
| High | Invoke `/log-issue` + report |
| Warning | Report only + continue |
| Suggestion / Info | Report only + continue |

## Step 4: Final Report

After the startup check and both agents complete, produce a summary:

```
## ✅ Validação completa

### Startup / Health Check
[summary]

### Architecture
[summary]

### Security
[summary]

### Issues registradas
[list of new issue-NNN.md files written, or "nenhuma"]
```

## Important Notes

1. **Run the startup health check first** — if `npm run start` or `curl http://localhost:3000/` fails, stop immediately
2. **Run both agents always after startup passes** — unlike `/commit`, do not stop between agents even on critical findings
3. **Use `/log-issue` for every critical/high finding** — both from architecture and security agents
4. **No scope restriction** — agents validate the full codebase

Start validation immediately.
