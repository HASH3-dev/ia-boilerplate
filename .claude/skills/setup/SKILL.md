---
name: setup
description: Create or repair the local .claude/agent.config.yml file required by the root manager layer.
---

You are setting up the local root manager configuration.

## Mission

Ensure `.claude/agent.config.yml` exists and contains every property required by `.claude/rules/agent-config.md`.

This file is local-only and must not be committed.

## Step 1: Read schema

Read:

- `.claude/rules/agent-config.md`
- root `package.json`
- app `package.json` files when present
- workspace/lock/tooling files that reveal package manager or runtime setup, such as lockfiles and `.tool-versions`

## Step 2: Inspect existing config

If `.claude/agent.config.yml` exists:

- parse it as YAML;
- preserve existing values;
- add missing required properties;
- do not rewrite unrelated comments or values unless necessary.

If it does not exist:

- create it with all required properties.

## Step 3: Infer defaults

Do not blindly infer defaults. Discover, test, or ask.

### Discovery rules

- Detect `project.name` from root `package.json`; if absent, use the repo folder name.
- Detect `project.root` from the current repository absolute path.
- Detect app boundaries from root workspace declarations and actual app folders.
- Detect package manager from lockfiles, `packageManager` metadata, and available commands.
- Detect `asdf` only when there is evidence such as `.tool-versions`, and test the loader command before using it.
- Detect scripts from root/app `package.json`; do not invent scripts.

### Runtime command tests

Test commands before writing them:

1. Try the candidate Node version command directly.
2. Try the candidate package manager version command directly.
3. If either fails and `.tool-versions` suggests `asdf`, test `source ~/.asdf/asdf.sh` plus the command.
4. If commands still fail, ask the user for the runtime setup command instead of assuming one.

### Questions required

Ask the user when:

- multiple app folders exist and their roles are unclear;
- app names/labels cannot be inferred from package names or existing `.claude` layers;
- no package manager can be detected;
- more than one script could reasonably satisfy a validation/build/test role;
- a required local app `.claude` layer is missing and no agreed fallback exists.

### Example shape

The final config should follow this shape, but values must come from discovery, tests, existing config, or user answers:

```yaml
project:
  name: <root package.json name or repo folder name>
  root: <current repository absolute path>

runtime:
  node:
    versionCommand: <tested node version command>
    packageManagerVersionCommand: <tested package manager version command>
    asdfLoader: <tested loader command or empty string>
    commandPrefix: <tested command prefix or empty string>

git:
  mainBranch: main
  currentBranchCommand: git branch --show-current
  taskBranchPrefix: task/
  taskBranchPattern: task/TASK-XXX-short-description

rootManager:
  taskDirectory: .claude/tasks
  taskFolderPattern: TASK-XXX-feature-name
  taskPlanFile: task-plan.md
  scopeFile: scope.md
  contractFile: contract.md
  workItemsFile: work-items.md
  coordinationFile: coordination.md
  statusFile: status.md

apps:
  <appKey>:
    label: <display label>
    path: <app path>
    claudePath: <app .claude path>
    localTasksPath: <app local tasks path>
    localImplementSkill: <app local implement skill path>
    localValidateSkill: <app local validate skill path>
    scripts:
      <scriptKey>: <script command that exists in package.json>

contracts:
  packagePath: packages/contracts
  ruleFile: .claude/rules/contracts.md
```

## Step 4: Validate git ignore

Ensure `.gitignore` contains:

```text
.claude/agent.config.yml
```

If it is missing, add it.

## Step 5: Report

Report:

- whether the config was created or updated;
- values discovered from files;
- commands tested successfully;
- values provided by the user;
- any placeholders or values needing user review;
- whether `.claude/agent.config.yml` is ignored by git.

## Rules

- Do not commit `.claude/agent.config.yml`.
- Prefer preserving existing local values.
- Do not ask the user for values that can be inferred from the repo.
- Do not assume OS, package manager, runtime manager, or app names.
- If a value cannot be inferred or tested safely, ask the user.
- If a non-critical placeholder is written, call it out and mark setup incomplete when it blocks root workflows.
