---
paths:
  - "@agentConfig/contracts/packagePath/**"
  - "@agentConfig/rootManager/taskDirectory/**/@agentConfig/rootManager/contractFile"
---

# Cross-App Contracts

Use `@agentConfig/rootManager/contractFile` for task-level agreement between apps. It should be created before local implementation when a feature crosses app boundaries.

Use `@agentConfig/contracts/packagePath` only when the contract must be imported by code as a shared source of truth.

## Default shape

Start type-only unless runtime validation is explicitly useful.

Prefer shared TypeScript interfaces, enums, and public request/response shapes. Keep app-local validation in the app unless the task requires runtime contract validation.

## Contract contents

A cross-app contract should define:

- affected flows and endpoints;
- request and response shapes;
- status/error behavior relevant to the frontend;
- auth/session expectations;
- source of truth for shared types;
- compatibility or migration notes.
