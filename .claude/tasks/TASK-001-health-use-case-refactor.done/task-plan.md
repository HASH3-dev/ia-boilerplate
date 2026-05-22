# TASK-001 — Health Endpoint: Refatorar para padrão Use-Case

## Contexto

O endpoint `GET /health` existe em `apps/api/src/entrypoints/health/` mas não segue o padrão arquitetural do projeto.

**Estado atual:**
- `HealthController.check()` retorna `{ status: 'ok' }` diretamente, sem delegar a um handler.
- `HealthModule` não possui pasta `use-cases/` nem handler algum.

**Violação identificada:**
> "Controllers delegate to handlers — No business logic in controllers."
> (`.claude/rules/architecture.md` + `.claude/rules/module-structure.md`)

## Demanda

Refatorar o módulo `health` para seguir o padrão use-case da arquitetura:

1. Criar `CheckHealthHandler` em `use-cases/check-health/check-health.handler.ts`.
2. Mover a lógica de resposta para o handler.
3. Atualizar o controller para injetar e delegar ao handler.
4. Atualizar o `HealthModule` para prover o handler.

## Critérios de aceite

- [ ] `HealthController` não contém lógica de negócio; apenas injeta e chama `CheckHealthHandler.handle()`.
- [ ] `CheckHealthHandler` retorna o objeto `{ status: 'ok' }` (ou tipo equivalente).
- [ ] `HealthModule` declara e provê `CheckHealthHandler`.
- [ ] A estrutura de pastas segue o padrão `use-cases/{action}/{action}.handler.ts`.
- [ ] `GET /health` continua respondendo `200 { status: 'ok' }` após a refatoração.
- [ ] Testes unitários cobrem `CheckHealthHandler`.
- [ ] Testes de contrato (controller) cobrem a delegação.
- [ ] Build e lint passam sem erros.

## Escopo

- App afetado: `api`
- Tipo: refatoração técnica (sem mudança de comportamento externo)
- Fronteira cross-app: nenhuma

## Motivação

Consistência arquitetural. Todos os outros módulos (`items`) já seguem o padrão use-case. O `health` deve ser o mesmo para não criar exceção não documentada no codebase.
