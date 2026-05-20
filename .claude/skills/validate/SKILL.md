---
name: validate
description: Root validation workflow. Validates affected apps, contracts, cross-app behavior, and final acceptance criteria.
---

You are orchestrating root-level validation.

## Mission

Validate the feature as a whole. Local app validation is necessary but not sufficient for root acceptance.

Before starting, read `.claude/agent.config.yml` and resolve all `@agentConfig/...` references used by this workflow.

## Step 1: Resolve root task

Resolve the root task folder from the argument or current branch.

Read:

- `@agentConfig/rootManager/taskPlanFile`
- `@agentConfig/rootManager/scopeFile`
- `@agentConfig/rootManager/contractFile` if present
- `@agentConfig/rootManager/workItemsFile`
- `@agentConfig/rootManager/coordinationFile`
- `@agentConfig/rootManager/statusFile`

## Step 2: Validate local work-items

For each required app in `@agentConfig/rootManager/workItemsFile`:

1. Read the app's local `.claude/CLAUDE.md`.
2. Prefer the app's local validation workflow if present.
3. Otherwise run the configured fallback validation script for that app:
   - Prefer `@agentConfig/apps/<appKey>/scripts/validate` when present.
   - Otherwise use the most appropriate configured script from `@agentConfig/apps/<appKey>/scripts`.
4. Record results in root `@agentConfig/rootManager/statusFile`.

Do not run formatters or lint commands that rewrite files unless the local validation workflow explicitly requires it and the user intended validation to mutate files.

## Step 3: Validate contract

If `@agentConfig/rootManager/contractFile` exists:

- verify all affected app work-items reference or satisfy the contract;
- if `@agentConfig/contracts/packagePath` is required, verify changed files include or use it;
- block acceptance if contract status is unclear.

## Step 4: Validate acceptance

Invoke `acceptance-validator`.

It must update `@agentConfig/rootManager/statusFile` with passed, blocked, or failed acceptance.

## Step 5: Coordinate

Invoke `delivery-coordinator` to update final validation state.

## Done report

Report:

- local validation results;
- contract validation result;
- acceptance result;
- blockers;
- next command if successful: `/commit`.
