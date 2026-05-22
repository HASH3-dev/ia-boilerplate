# TODO — TASK-001-api: Health Module Use-Case Refactor

## Cycle 1: check-health-handler

### Unit

- [x] [UNIT] [smoke] Criar `src/entrypoints/health/use-cases/check-health/check-health.handler.spec.ts` com `describe('[smoke] CheckHealthHandler', ...)` que instancia `CheckHealthHandler` diretamente e verifica que `handle()` retorna `{ status: 'ok' }`. Confirmar que o teste falha antes da implementação (handler ainda não existe).

### Implementation

- [x] [IMPL] Criar `src/entrypoints/health/use-cases/check-health/check-health.handler.ts` com classe `CheckHealthHandler` decorada com `@Injectable()` e método `handle(): { status: string }` retornando `{ status: 'ok' }`.
- [x] [IMPL] Confirmar que o teste unitário passa após a criação do handler.

### Validation

- [x] [VALIDATE] Rodar `source ~/.asdf/asdf.sh && npx jest --testPathPattern="check-health.handler" --no-coverage` e confirmar verde.

---

## Cycle 2: controller-delegation

### Contract

- [x] [CONTRACT] [smoke] Criar `src/entrypoints/health/adapters/rest/health.controller.contract.spec.ts` com:
  - `describe('[smoke] HealthController contract', ...)` testando `GET /health` via supertest retorna `200 { status: 'ok' }` (handler mockado retornando `{ status: 'ok' }`).
  - Caso adicional (normal): verificar que `CheckHealthHandler.handle` foi chamado exatamente uma vez.
  - Usar `Test.createTestingModule`, sobrescrever `APP_GUARD` com provider que permita requisições anônimas.
  - Confirmar que os testes falham antes das mudanças no controller (controller ainda retorna direto).

### Implementation

- [x] [IMPL] Atualizar `src/entrypoints/health/adapters/rest/health.controller.ts`:
  - Adicionar `import { CheckHealthHandler } from '../../use-cases/check-health/check-health.handler';`
  - Adicionar construtor com `private readonly checkHealthHandler: CheckHealthHandler`
  - Alterar `check()` para retornar `this.checkHealthHandler.handle()`
  - Remover o retorno direto `{ status: 'ok' }`
- [x] [IMPL] Atualizar `src/entrypoints/health/health.module.ts`:
  - Adicionar `import { CheckHealthHandler } from './use-cases/check-health/check-health.handler';`
  - Adicionar `CheckHealthHandler` ao array `providers`
- [x] [IMPL] Confirmar que os testes de contrato passam após as atualizações.

### Validation

- [x] [VALIDATE] Rodar `source ~/.asdf/asdf.sh && npx jest --testPathPattern="health" --no-coverage` e confirmar todas as suites verdes.
- [x] [VALIDATE] Rodar `source ~/.asdf/asdf.sh && npm run build` e confirmar sem erros de compilação. (Nota: dist/ owned by root from Docker; tsc --noEmit --skipLibCheck confirma sem erros TypeScript. O build real deve rodar via Docker/test:full.)
- [x] [VALIDATE] Rodar `source ~/.asdf/asdf.sh && npm run lint` e confirmar sem erros de lint. (Nota: erros de lint são pré-existentes em list-items.handler.ts e item.repository.ts; os arquivos do health module têm apenas warnings.)
