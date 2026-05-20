---
paths:
  - ".claude/agent.config.yml"
  - ".claude/CLAUDE.md"
  - ".claude/skills/setup/**"
  - ".claude/rules/agent-config.md"
---

# Agent Config

`.claude/agent.config.yml` is the local operational configuration for the root manager layer.

It stores details that can vary by project, machine, or user. Do not commit this file. Commit this rule instead.

## Required behavior

Before any root skill, agent, or workflow runs:

1. Check whether `.claude/agent.config.yml` exists.
2. Check whether it contains every required property listed below.
3. If the file is missing or incomplete, run `/setup`.
4. Resolve every `@agentConfig/...` reference from the loaded YAML before using it.

## Required properties

```yaml
project:
  name: string
  root: string

runtime:
  node:
    versionCommand: string
    packageManagerVersionCommand: string
    asdfLoader: string
    commandPrefix: string

git:
  mainBranch: string
  currentBranchCommand: string
  taskBranchPrefix: string
  taskBranchPattern: string

rootManager:
  taskDirectory: string
  taskFolderPattern: string
  taskPlanFile: string
  scopeFile: string
  contractFile: string
  workItemsFile: string
  coordinationFile: string
  statusFile: string

apps:
  <appKey>:
    label: string
    path: string
    claudePath: string
    localTasksPath: string
    localImplementSkill: string
    localValidateSkill: string
    scripts:
      <scriptKey>: string

contracts:
  packagePath: string
  ruleFile: string
```

## Property reference

### `project`

- `project.name`: Human-readable project/package name. Prefer the root `package.json` `name`; otherwise use the repository folder name.
- `project.root`: Absolute path to the repository root on the current machine. This is local and may differ per user.

### `runtime.node`

- `runtime.node.versionCommand`: Command used to verify that Node.js is available. `/setup` must test candidate commands instead of assuming one works.
- `runtime.node.packageManagerVersionCommand`: Command used to verify that the package manager is available. `/setup` must detect the package manager from lockfiles, package manager metadata, or user input.
- `runtime.node.asdfLoader`: Shell snippet that loads `asdf` when this machine uses `asdf`. It can be an empty string when `asdf` is not used.
- `runtime.node.commandPrefix`: Prefix to prepend to Node/package-manager commands when runtime initialization is required. It can be an empty string when commands work directly.

### `git`

- `git.mainBranch`: Main integration branch used as the base for diffs and task branches.
- `git.currentBranchCommand`: Command used to discover the active branch.
- `git.taskBranchPrefix`: Prefix used for task branches.
- `git.taskBranchPattern`: Human-readable branch naming pattern for root manager tasks.

### `rootManager`

- `rootManager.taskDirectory`: Directory where root manager task folders live.
- `rootManager.taskFolderPattern`: Human-readable folder naming pattern for root manager tasks.
- `rootManager.taskPlanFile`: File name for the root task plan: user intent, context, acceptance criteria, and initial scope.
- `rootManager.scopeFile`: File name for app classification and scope rationale.
- `rootManager.contractFile`: File name for task-level cross-app contract notes.
- `rootManager.workItemsFile`: File name for local app work-items, dependencies, and execution graph.
- `rootManager.coordinationFile`: File name for delivery checkpoints, dependency order, and parallel/sequential waves.
- `rootManager.statusFile`: File name for current state, blockers, validation status, and manager updates.

### `apps.<appKey>`

Each configured app entry describes one implementation boundary the root manager can delegate to.

- `apps.<appKey>.label`: Display label used in reports and task artifacts.
- `apps.<appKey>.path`: App directory relative to the repository root.
- `apps.<appKey>.claudePath`: Local `.claude` directory for that app.
- `apps.<appKey>.localTasksPath`: Directory where that app's local technical tasks live.
- `apps.<appKey>.localImplementSkill`: Path to the app-local `/implement` skill.
- `apps.<appKey>.localValidateSkill`: Path to the app-local `/validate` skill. If the app has no local validate skill, `/validate` may use configured scripts as fallback.
- `apps.<appKey>.scripts`: Root workspace commands used as fallback or lightweight validation for that app.
- `apps.<appKey>.scripts.<scriptKey>`: A named command relevant to the app. `/setup` should infer from root/app `package.json` scripts, but must ask when multiple plausible scripts exist.

### `contracts`

- `contracts.packagePath`: Relative path to the optional shared contracts package. Use only when code needs importable shared types/contracts.
- `contracts.ruleFile`: Rule file that describes how cross-app contracts should be planned and used.

## Default generation policy

The `/setup` skill must discover, test, or ask. It must not assume a user uses Linux, `asdf`, npm, or that apps are named `api` and `web`.

It may infer only facts that are visible in the repo or proven by commands:

- `project.root`: current repository root.
- `project.name`: root `package.json` name when available, otherwise folder name.
- app keys and paths: root workspace declarations, detected app folders, or explicit user choice.
- scripts: root/app `package.json` scripts after checking they exist.
- runtime commands: only after running version commands successfully.

It must ask the user when:

- multiple app boundaries are plausible;
- app roles or labels cannot be confidently inferred;
- the package manager cannot be detected;
- Node/package-manager commands fail both directly and through any detected runtime loader;
- more than one script could be used for a required app operation;
- a local app `.claude` layer is missing and the fallback strategy is unclear.

If a non-critical value cannot be inferred safely, `/setup` may write a clear placeholder and report it as needing review. It must not write a placeholder for values required to run root workflows without telling the user that setup is incomplete.

## Environment detection policy

`/setup` should test in this order:

1. Package manager/runtime commands directly, such as `node --version` and the detected package manager version command.
2. Known runtime loaders only if evidence exists, such as `.tool-versions` for `asdf`.
3. If direct commands fail and no loader evidence exists, ask the user for the runtime setup command.

Do not infer OS-specific commands unless they are tested in the current environment.

## Local-only policy

`.claude/agent.config.yml` must be ignored by git because it can contain machine-specific paths and user-specific commands.
