# Coordination — TASK-001

## Delivery order

Wave 1 — api (única wave, app único)
  - WI-001-api: refatorar módulo health para padrão use-case

## Dependencies

Nenhuma dependência cross-app. Wave única.

## Checkpoints

- [x] Root task plan criado
- [x] Scope classificado: `api`
- [x] Contract: não necessário
- [x] Work-items definidos
- [x] Planejamento local `api` concluído (`apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/`)
- [x] Branch criada (`task/TASK-001-health-use-case-refactor`)
- [x] Implementação `api` concluída
- [x] Validação local `api` passou (testes 3/3 verdes; dist/ bloqueado por root ownership de Docker anterior — zero erros TypeScript via noEmit)
- [ ] Commit raiz criado

## Local task artifacts

- `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/task-plan.md`
- `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/implementation-plan.md`
- `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/test-plan.md`
- `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/todo.md`
- `apps/api/.claude/tasks/TASK-001-health-use-case-refactor-api/retrospective.md`

## Files created/modified

- `apps/api/src/entrypoints/health/use-cases/check-health/check-health.handler.ts` (new)
- `apps/api/src/entrypoints/health/use-cases/check-health/check-health.handler.spec.ts` (new)
- `apps/api/src/entrypoints/health/adapters/rest/health.controller.ts` (updated — injects CheckHealthHandler)
- `apps/api/src/entrypoints/health/adapters/rest/health.controller.contract.spec.ts` (new)
- `apps/api/src/entrypoints/health/health.module.ts` (updated — providers: [CheckHealthHandler])
