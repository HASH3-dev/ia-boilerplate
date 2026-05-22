# Retrospective — TASK-001-health-use-case-refactor

## Waves

## Wave 1: api

**Resultado:** completed
**Surpresas de coordenação:** Nenhuma — escopo single-app sem dependências cross-app como esperado.
**Dificuldades:** Build de `dist/` bloqueado por root ownership de run Docker anterior (problema de ambiente, não de código). Contornado com `tsc --noEmit` que confirma zero erros TypeScript.
**Decisões notáveis:** Nome do arquivo de contrato do controller ficou `health.controller.contract.spec.ts` (com pontos) em vez de hífen — necessário para o regex do Jest reconhecer `.spec.ts`.
