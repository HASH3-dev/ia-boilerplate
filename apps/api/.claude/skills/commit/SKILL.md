---
name: commit
description: Complete commit/release workflow with validation, security audit, and semantic commits
---

You are orchestrating a complete commit or release workflow.

## Your Mission

Guide the user through a complete, validated commit or release process using specialized agents.

## Step 1: Determine Workflow Type

First, ask the user what type of operation they want:

**Use AskUserQuestion with these options:**

- **Option 1: "Commit only"** - Validate, audit, and create semantic commits
  - Description: "Run validation and create organized commits without releasing"

- **Option 2: "Commit + Release"** - Full workflow including version bump and changelog
  - Description: "Validate, commit, bump version, and generate release changelog"

## Step 2: Compute Validation Scope

Before running any validation agent, collect the list of changed files in this branch:

```bash
git diff --name-only $(git merge-base HEAD main) HEAD
```

Filter the result to only `.ts` files. This is the **validation scope** — a list of files that are part of this commit context. Pass this list to both `architecture-validator` and `security-auditor` in their prompts under a `Scope:` section, like:

```
Scope — validate only these files (they are the ones changed in this branch):
- src/entrypoints/auth/adapters/rest/auth.controller.ts
- src/entrypoints/auth/use-cases/verify-email-otp/verify-email-otp.handler.ts
- ...
```

If `git merge-base HEAD main` fails (e.g., branch is not based on main), fall back to:
```bash
git diff --name-only HEAD
```

## Step 3: Execute Workflow

Run agents **sequentially**. After each agent, check for issues before proceeding.

### 🔹 Workflow A: Commit Only

Steps in order:
1. **`npm run check`** — Format with Prettier and validate with ESLint (run via Bash tool)
2. **`npm run test:full`** — Run the full test suite after lint (run via Bash tool with summarized output only)
3. **Compute validation scope** — Run `git diff --name-only` as described in Step 2
4. **architecture-validator** — Validate Clean Architecture compliance (scoped to changed files)
5. **security-auditor** — Scan for vulnerabilities (scoped to changed files)
6. **smart-committer** — Create semantic commits (only reached if no blocking issues)

### 🔹 Workflow B: Commit + Release

Steps in order:
1. **`npm run check`** — Format with Prettier and validate with ESLint (run via Bash tool)
2. **`npm run test:full`** — Run the full test suite after lint (run via Bash tool with summarized output only)
3. **Compute validation scope** — Run `git diff --name-only` as described in Step 2
4. **architecture-validator** — Validate Clean Architecture compliance (scoped to changed files)
5. **security-auditor** — Scan for vulnerabilities (scoped to changed files)
6. **smart-committer** — Create semantic commits (only reached if no blocking issues)
7. **knowledge-refiner** — Refine rules with retrospective learnings (see below)
8. **release-manager** — Generate changelog and bump version

## Step 4: Handle Issues — MANDATORY BEHAVIOR

### `npm run check` failures

Run `source ~/.asdf/asdf.sh && npm run check` via Bash. If the command exits with a non-zero code:

- **Stop the workflow immediately.**
- Show the ESLint errors to the user.
- Do NOT proceed to architecture-validator.

If `npm run check` exits 0, the code is formatted and lint-clean — continue to the next step.

### `npm run test:full` failures

Run `source ~/.asdf/asdf.sh && npm run test:full > /tmp/genemunology-test-full.log 2>&1` via Bash immediately after `npm run check` succeeds. Do not paste or summarize the full test log into the conversation.

If the command exits with a non-zero code:

- **Stop the workflow immediately.**
- Tell the user: `Os testes não passaram. Rode \`npm run test:full\` para ver o log completo.`
- Do NOT proceed to architecture-validator.

If `npm run test:full` exits 0:

- Report only that the full test suite passed.
- Continue to architecture-validator.

### Validation agent failures — auto-resolution loop

After each validation agent (architecture-validator and security-auditor), evaluate the results **before** proceeding to the next step.

#### If any Critical or High issues are found:

**Execute this loop automatically — no user interaction required:**

1. **Invoke `/log-issue`**, passing all critical/high findings. The skill creates individual `issue-NNN.md` files in the task issues folder.

2. **Invoke `/resolve-issues`** immediately after logging. The skill reads the open issue files and delegates fixes to the `software-engineer` agent.

3. **Re-run the full validation sequence** from Step 2 (`npm run check` → `npm run test:full` → `architecture-validator` → `security-auditor`).

4. **Repeat** this loop until no Critical or High issues remain.

5. Only after the loop exits clean, proceed to `smart-committer`.

**Do not ask the user for confirmation between loop iterations.** The loop is autonomous and terminates only when validation is clean or when a finding cannot be resolved automatically (e.g., requires external input or an architectural decision beyond the agent's authority). In that case, stop and report the specific blocker to the user.

#### If only Warnings or Suggestions are found:

- Report them briefly to the user.
- **Do NOT invoke `/log-issue`** — warnings are not persisted automatically.
- Continue to the next step.

#### If no issues are found:

- Report success and continue to the next step.

## Severity Classification

Use this to decide whether to stop or continue:

| Result | Action |
|--------|--------|
| Critical (architecture or security) | Stop + invoke `/log-issue` |
| High (security) | Stop + invoke `/log-issue` |
| Warning | Report + continue |
| Suggestion / Info | Report + continue |

## Step 3b: Knowledge refinement (Commit + Release only)

After `smart-committer` succeeds and before `release-manager`, invoke the `knowledge-refiner` agent.

Collect retrospective files to pass to the agent:
1. Local task retrospective: `.claude/tasks/<task-folder>/retrospective.md` (if it exists)
2. Root task retrospective: derive the root task folder from the branch name (`task/TASK-XXX-...` → `.claude/tasks/TASK-XXX-.../retrospective.md` at the repo root); include it if it exists

Pass the paths and contents of all found retrospectives to `knowledge-refiner`. If no retrospective file exists, skip this step silently.

The `knowledge-refiner` agent will read the retrospectives and update `.claude/rules/` files as needed. Wait for it to complete before invoking `release-manager`.

## Important Notes

1. **Run agents sequentially** — Wait for each to complete before starting next
2. **Stop on critical/high issues** — Never proceed to smart-committer with blocking violations
3. **Always invoke `/log-issue` before stopping** — The files are the artifact that proves the workflow ran
4. **Show progress** — Keep user informed at each step
5. **Summarize at end** — Show what was accomplished (or blocked)
6. **Never add AI/model co-author trailers** — Commit messages must not include `Co-Authored-By:` lines naming Claude, ChatGPT, GPT, an AI model, an AI vendor, a bot, or an assistant tool. Verify the exact message before committing and inspect the created commit body afterward.

## Example: Auto-resolution loop

```
### Step 1/5: Format & Lint
Running npm run check...
✅ Prettier formatted 2 files. ESLint: no errors.

### Step 2/5: Full Test Suite
Running npm run test:full...
✅ Full test suite passed.

### Step 3/5: Architecture Validation
Running architecture-validator...
⛔ 2 critical violations found.

[invoking /log-issue → creates issue-001.md, issue-002.md]
[invoking /resolve-issues → software-engineer fixes both issues]

### Loop iteration 2 — re-running full validation
Running npm run check... ✅
Running npm run test:full... ✅
Running architecture-validator... ✅ No violations.
Running security-auditor... ✅ No critical issues.

### Step 5/5: Creating Commits
Running smart-committer...
```

## Example: Successful Workflow

```
### Step 1/5: Format & Lint
Running npm run check...
✅ Prettier formatted 2 files. ESLint: no errors.

### Step 2/5: Full Test Suite
Running npm run test:full...
✅ Full test suite passed.

### Step 3/5: Architecture Validation
Running architecture-validator...
✅ No violations found. 2 suggestions (optional).

### Step 4/5: Security Audit
Running security-auditor...
✅ No critical issues. 1 warning: CORS is permissive.

### Step 5/5: Creating Commits
Running smart-committer...
📦 3 commits created:
- feat(profile): add user profile endpoints
- fix(auth): correct token expiry validation
- chore(eslint): update unused vars rule

✅ Commit workflow complete!
```

## Error Handling

If workflow is interrupted unexpectedly:
- Report what step was reached
- Provide clear error messages
- Do not leave partial state

Start by asking the user which workflow they want to execute.
