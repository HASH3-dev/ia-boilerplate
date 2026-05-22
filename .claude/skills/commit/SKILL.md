---
name: commit
description: >
  Use this skill whenever the user wants to commit or release anything in this monorepo — regardless
  of phrasing ("quero comitar", "commit what we did", "save the changes", "quero gerar uma release",
  "criar release", "preparar release", "release", "bump version", "gerar changelog", etc.) and
  regardless of whether a formal task exists. Handles both ad-hoc commits (no task plan), formal
  feature-level commits (with task, work-items, and acceptance criteria), and Commit + Release flows.
  When the diff includes files inside an app directory (e.g. apps/api/, apps/web/), the local commit
  skill for that app MUST run its full validation loop before the root creates any commit. Never run
  git commands manually when this skill applies.
---

You are orchestrating the monorepo commit workflow from the root.

## Mission

Create commits from the repository root. Handle two modes automatically:

- **Ad-hoc commit**: no formal task exists. Inspect staged/unstaged changes, confirm what to include, and commit with a semantic message.
- **Feature commit**: a formal task exists. Validate work-items, contract state, and acceptance before committing.
- **Commit + Release**: commit first, then prepare a consolidated monorepo release through the root `release-manager`.

Before starting, read `.claude/agent.config.yml` and resolve all `@agentConfig/...` references used by this workflow.

---

## CRITICAL RULE: app-local changes must go through the local commit skill

**This rule has no exceptions — not even when validation has already been run, the task is `accepted`, or the caller is another workflow.**

For every configured app (`@agentConfig/apps/<appKey>`):

1. Run `git diff main --name-only` (or staged diff if no formal task exists).
2. If **any** changed file lives under `@agentConfig/apps/<appKey>/path`, that app's changes **must** go through the app's local commit skill at `@agentConfig/apps/<appKey>/localCommitSkill` (or the equivalent path in that app's `.claude/skills/commit/SKILL.md`).
3. The root commit skill **must not** stage, commit, or validate those files itself. It delegates entirely to the local skill.
4. The root creates its own commit **only after** every affected app's local commit skill has completed successfully — and only for files that are **not** under any configured app path (coordination artifacts, root config, shared packages, scripts, containers, etc.).

**Bypassing the local commit skill — for any reason, including "already validated" or "accepted state" — is a workflow failure.**

---

## Step 1: Resolve root task

Resolve the root task from argument or current branch.

Read:

- `@agentConfig/rootManager/taskPlanFile`
- `@agentConfig/rootManager/scopeFile`
- `@agentConfig/rootManager/contractFile` if present
- `@agentConfig/rootManager/workItemsFile`
- `@agentConfig/rootManager/coordinationFile`
- `@agentConfig/rootManager/statusFile`

If no formal task exists, note this and proceed as ad-hoc commit mode.

---

## Step 2: Determine workflow type

Ask whether this is:

- `Commit only`
- `Commit + Release`

If the user asked only to generate, create, prepare, publish, or bump a release, treat the requested workflow type as `Commit + Release`.

Default to `Commit only` when the caller is another workflow and no release was requested.

---

## Step 3: Partition changed files by owner

Run `git diff main --name-only` (for feature commits) or inspect staged/unstaged changes (for ad-hoc commits).

Partition every changed file into exactly one bucket:

- **App bucket `<appKey>`**: file path starts with `@agentConfig/apps/<appKey>/path`
- **Root bucket**: everything else (`.claude/`, `scripts/`, `containers/`, `packages/`, root config files, etc.)

There is no overlap. A file belongs to exactly one bucket.

---

## Step 4: Run the local commit skill for each affected app

**This step is mandatory whenever any app bucket is non-empty.**

For each affected app (in dependency order when multiple apps are affected):

### 4a — Invoke the local commit skill in a subagent

The subagent's working context must be the app directory (`@agentConfig/apps/<appKey>/path`).

Pass:
- workflow type (Commit only / Commit + Release)
- the list of changed files in that app's bucket
- the root task context if a formal task exists

The local commit skill will:
1. Run its static validation (`lint`, `build`)
2. Invoke `architecture-validator` and `security-auditor` on the changed files
3. Log blocking findings with `/log-issue`
4. Invoke `smart-committer` to create the app-local semantic commit — **only if no blocking findings exist**

### 4b — Issue resolution loop (if the local commit skill reports blocking issues)

If the local commit skill exits with blocking findings:

1. Invoke the app's local `/resolve-issues` skill (or `issue-resolver` agent) in a subagent.
2. After resolution, re-invoke the local commit skill (step 4a) for the same app.
3. Repeat until the local commit skill completes without blocking findings.

**Do not advance to the next app or to step 5 while the current app's commit loop is unresolved.**

### 4c — Confirm local commit success

Record the commit hash and validation summary returned by the local commit skill.

Only mark an app as done when its local commit skill explicitly reports success (no blocking findings, commit created).

---

## Step 5: Create the root commit for root-bucket files

Only after **all** affected apps have completed step 4 successfully:

Invoke `commit-manager` to:
- inspect the root-bucket files
- verify contract state (if a formal task exists)
- verify `acceptance-validator` has passed (if a formal task exists)
- create a semantic commit for root-bucket files only

If the root bucket is empty (all changes are in app directories), skip this step. No root commit is needed.

---

## Step 5b: Knowledge refinement (Commit + Release only)

After the root commit succeeds and before invoking `release-manager`, invoke the root `knowledge-refiner` agent.

Collect retrospective files:
1. Root task retrospective: `@agentConfig/rootManager/taskDirectory/<task-folder>/retrospective.md` (if it exists)
2. All local app retrospectives: for each affected app, `@agentConfig/apps/<appKey>/localTasksPath/<task-folder>-<appKey>/retrospective.md` (include those that exist)

Pass all found retrospective paths and contents to `knowledge-refiner`. If no retrospective file exists anywhere, skip this step silently.

The root `knowledge-refiner` focuses on cross-app and coordination learnings — things relevant to `.claude/rules/` at the root level (contract patterns, scoping decisions, commit-gate edge cases, monorepo coordination). It does not update app-local rules.

Wait for `knowledge-refiner` to complete before continuing.

### 5b-i — Commit knowledge-refiner changes

After `knowledge-refiner` completes, run `git diff --name-only` to check whether it modified any files (typically `.claude/rules/*.md`).

If changes exist:
1. Stage only the files modified by `knowledge-refiner` (files under `.claude/rules/` and any other root-level rules or config updated by the refiner).
2. Create a commit with the message: `chore(rules): apply retrospective learnings from <task-id>` (replace `<task-id>` with the current task identifier, e.g. `TASK-001`).
3. Record this commit hash in the done report.

**Do not skip this commit.** Changes produced by `knowledge-refiner` are root-bucket files and must be included in the release history. Skipping this step causes `.claude/rules/` to diverge from the committed state and leaves unstaged changes that will contaminate the next commit.

If `knowledge-refiner` made no changes, skip this sub-step silently.

---

## Step 6: Release

If workflow type is `Commit + Release`, invoke the root `release-manager` only after all app commits and the root commit succeed.

The root `release-manager` owns consolidated monorepo releases. Do not fall back to an app-local `release-manager` for root or cross-app release ownership.

Before invoking the root `release-manager`, verify that each affected app-local task folder has been closed or that the app-local subagent reported an explicit blocker. Stop if any affected app has an open local task folder with no blocker.

---

## Done report

Report:

- per-app: commit hash, validation summary, issues found and resolved (if any)
- root commit hash (if root-bucket was non-empty)
- release version, changelog path, and tag (if requested)
- root task status

---

## Absolute rules

- **No shortcut for "already validated"**: prior `/validate` runs do not exempt any app from the local commit skill's own validation. The local commit skill always re-runs lint, build, architecture-validator, and security-auditor.
- **No root commit before all local commits**: the root commit-manager runs only after every app's local commit skill has exited cleanly.
- **No release before all commits**: the root release-manager runs only after all local and root commits succeed.
- **No skipping the issue-resolution loop**: if a local commit skill finds blocking issues, the loop (resolve → retry commit) must run to completion. Do not commit with known blocking findings.
- **No AI/model co-author trailers**: commit messages must never include `Co-Authored-By:` lines naming Claude, ChatGPT, GPT, an AI model, an AI vendor, a bot, or an assistant tool. Inspect the exact commit message before committing and verify the created commit body afterward; amend immediately if a prohibited trailer appears.
- **Do not commit if root-level acceptance is blocked or pending** (formal task mode only).
- **Do not treat local app success as global acceptance for cross-app tasks**.
- **Do not create a root release tag if any affected app-local commit workflow was skipped**.
