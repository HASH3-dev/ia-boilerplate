# Work Items — TASK-001

## Execução

**Wave única — apenas `api`** (escopo single-app, sem dependências cross-app)

```
Wave 1 (sequential, single app):
  └── api: refatorar health para padrão use-case
```

## Work Item

### WI-001-api — Refatorar módulo health (API)

- **App:** api
- **Local task folder:** `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/`
- **Arquivos afetados:**
  - `apps/api/src/entrypoints/health/adapters/rest/health.controller.ts` (update)
  - `apps/api/src/entrypoints/health/health.module.ts` (update)
  - `apps/api/src/entrypoints/health/use-cases/check-health/check-health.handler.ts` (create)
- **Dependências:** nenhuma
- **Pode parallelizar:** N/A (único work item)

## Contexto de delegação

A skill local `/task` da api deve criar:
- `task-plan.md` com detalhamento técnico da refatoração
- `implementation-plan.md` com passos de implementação (TDD)
- `test-plan.md` com casos de teste do handler e do controller
- `todo.md` com ciclos TDD ordenados
