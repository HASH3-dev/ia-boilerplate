---
paths:
  - "package.json"
  - "@agentConfig/apps/*/path/package.json"
  - ".claude/**"
---

# Monorepo Management

The root `.claude` layer is a delivery manager. It owns task intake, scope, coordination, global validation, and final commit decisions.

It must not replace app-specific expertise. For technical implementation details, delegate to the affected app's `.claude` layer.

## Scope model

- `<appKey>`: changes only under `@agentConfig/apps/<appKey>/path` or that app's local behavior.
- `cross-app`: changes that require more than one configured app, or a shared contract between them.

Every demand starts as a root task, even if only one app is affected.

## Delegation

Root agents may create and coordinate local work-items, but they must not rewrite local `.claude` rules, skills, or agents unless the user explicitly asks for framework maintenance in that app.

If an app has no local `.claude`, record the missing local layer in `@agentConfig/rootManager/workItemsFile` and use an explicit fallback only after calling it out.

When a root workflow delegates to an app-local skill or agent, the delegated subagent's primary working context must be the app directory from `@agentConfig/apps/<appKey>/path`, not the repository root. The delegated subagent must read and follow that app's local `.claude/CLAUDE.md` and skill files as its authoritative instructions.

The delegated subagent may use `@agentConfig/project/root` only for repository-wide Git commands or root artifacts explicitly required by the delegated task, such as staging, committing, tagging, reading root task context, or updating a root-owned coordination file. App implementation, planning, validation, commit, and release decisions must stay anchored in the app directory.
