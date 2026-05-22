---
paths:
  - ".claude/skills/commit/**"
  - ".claude/skills/implement/**"
  - ".claude/agents/**"
  - "apps/**"
---

# Commit Gate

No commit may be created — directly or via a delegated agent — without first running the local `/commit` skill of the affected app. The local `/commit` skill is the only authorized path to a commit.

**Never call `git commit` directly.** Always invoke the app-local `/commit` skill, which enforces the full validation pipeline:

1. Lint + build
2. **Tests** — the full test suite for the affected app must pass:
   - **web**: `npm run test:app:full` (raiz) — roda Vitest + Playwright via Docker. **Não existe fallback**: se o Docker não estiver disponível, o commit fica bloqueado até que esteja. `npm run test:web` (Vitest only) NÃO é aceitável como substituto — não roda E2E e qualquer commit feito sem E2E é uma violação desta regra.
   - **api**: `npm run test:api:full` (raiz) — roda unit + integration + e2e + build + lint via Docker.
3. **`architecture-validator`** — validates Clean Architecture compliance for changed files
4. **`security-auditor`** — scans for vulnerabilities in changed files
5. `smart-committer` — creates the commit only if no critical/high findings exist

Architecture and security validation are the most important checks. A commit that bypasses them is not acceptable, regardless of how trivial the change appears.

## Who may call `git commit` directly

**Root skill only, and only for files outside all app directories.**

The root `/commit` skill may call `git commit` directly when the staged files are exclusively outside every `@agentConfig/apps/<appKey>/path` (e.g., root coordination artifacts, `.claude/tasks/`, `releases/`, root config files). In all other cases, the local app `/commit` skill must run first and complete without blocking findings before any commit is created.

## Applies to

- Root `/commit` skill
- Local `/commit` skills in each app (`apps/<appKey>/.claude/skills/commit/SKILL.md`)
- Root `/implement` when delegating to a local `/implement`
- Any agent (`implementation-dispatcher` or otherwise) that stages or creates a git commit

## Delegated agents

When `implementation-dispatcher` dispatches to a local `/implement`, the dispatch prompt must explicitly state:

> Committing is gated on the full local `/commit` skill pipeline (`architecture-validator` + `security-auditor` must pass). Do not call `git commit` directly for app files.

## Running tests during validation

Use `--quiet` mode when invoking `test:app:full` or `test:api:full` from within agent workflows. This redirects verbose Docker output to `/tmp/test-app-full.log` and prints only a one-line summary:

```bash
npm run test:app:full -- --quiet
echo "EXIT: $?"
# Read the log only on failure:
# tail -100 /tmp/test-app-full.log
```

Do not stream full Docker build and test output into the agent context — it consumes tokens without adding signal. Read the log file only when the exit code is non-zero and diagnosis is needed.

## E2E and integration tests

E2E and integration tests are **mandatory**. They cannot be deferred, skipped, or replaced by unit tests. Any failure in the E2E suite blocks the commit regardless of whether unit tests pass.

There is no "validate in CI instead" escape hatch. If `test:app:full` fails locally, fix the code or tests before committing.

## Blocking behavior

Critical or High findings from `architecture-validator` or `security-auditor` must be logged with `/log-issue` and block the commit. The commit workflow stops until issues are resolved via `/resolve-issues`.

## Pre-existing violations during a Release cut

When a Commit + Release flow is triggered, the commit gate runs against every app included in the release scope — not only apps touched by the current task. Pre-existing architecture or security violations in an untouched app surface at this point and must be resolved before the release tag is created. This is expected and correct behavior: the gate does not distinguish between new and pre-existing findings. Do not skip or defer them; run `/resolve-issues` and re-validate before proceeding to the release tag.
