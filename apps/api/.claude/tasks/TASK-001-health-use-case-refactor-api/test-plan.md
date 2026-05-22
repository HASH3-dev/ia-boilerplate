# Test Plan — TASK-001-api

## Escopo de testes

Esta refatoração não altera comportamento externo. Os testes devem verificar:

1. Que `CheckHealthHandler` funciona isoladamente.
2. Que `HealthController` delega ao handler (não contém lógica própria).
3. Que o contrato HTTP `GET /health → 200 { status: 'ok' }` permanece íntegro.

Não há integração com banco de dados, autenticação ou serviços externos. Não são necessários testes de integração ou e2e adicionais.

---

## Suite 1 — Unit: CheckHealthHandler

**Arquivo:** `src/entrypoints/health/use-cases/check-health/check-health.handler.spec.ts`

**Escopo:** Testar o handler em isolamento total, sem container NestJS.

### Caso 1.1 — [smoke] handle() retorna { status: 'ok' }

```
describe('[smoke] CheckHealthHandler', () => {
  it('handle() returns { status: "ok" }', () => {
    const handler = new CheckHealthHandler();
    expect(handler.handle()).toEqual({ status: 'ok' });
  });
});
```

**Classificação:** smoke — É a única asserção do handler e verifica diretamente o contrato de resposta da feature de saúde do sistema.

**Motivação smoke:** O health endpoint é usado por load balancers e health probes de infraestrutura. Uma regressão aqui derruba o serviço inteiro da perspectiva do orquestrador. Este teste é determinístico, zero I/O e é o sinal mais rápido possível de quebra.

---

## Suite 2 — Contract: HealthController

**Arquivo:** `src/entrypoints/health/adapters/rest/health.controller.contract-spec.ts`

**Escopo:** Verificar que o controller delega ao handler e que o contrato HTTP está correto. Usar `Test.createTestingModule` com o handler mockado.

**Nota sobre guards:** `HealthController` usa `@Anonymous()` — a rota é pública. O guard global (`APP_GUARD`) deve ser sobrescrito com `overrideProvider(APP_GUARD)` para não depender do `AuthModule` no setup de contrato.

### Caso 2.1 — [smoke] GET /health retorna 200 { status: 'ok' }

```
describe('[smoke] HealthController contract', () => {
  it('GET /health returns 200 { status: "ok" }', async () => {
    // Arrange: mock CheckHealthHandler.handle → { status: 'ok' }
    // Act: GET /health via supertest
    // Assert: status 200, body { status: 'ok' }
  });
});
```

**Classificação:** smoke — Cobre a fronteira HTTP da feature. Verifica que o módulo NestJS está montado corretamente com o handler provido e que o endpoint responde conforme o contrato.

### Caso 2.2 — controller chama handle() exatamente uma vez

```
it('delegates to CheckHealthHandler.handle() once', async () => {
  // Assert: mock.handle was called exactly 1 time
});
```

**Classificação:** normal — Verifica a delegação estrutural. Importante para garantir que o controller não contém lógica própria, mas não é um sinal de falha de deployment — apenas de conformidade arquitetural.

---

## Resumo de cobertura

| Componente | Suite | Casos | Smoke |
|-----------|-------|-------|-------|
| `CheckHealthHandler` | Unit | 1 | 1 |
| `HealthController` | Contract | 2 | 1 |

Total: 2 suites, 3 casos de teste, 2 smoke.

---

## Não testar

- `HealthModule` diretamente (coberto indiretamente pelos testes de contrato).
- Integração com banco de dados (nenhuma dependência de banco).
- E2E adicional (o comportamento externo não muda; o contrato HTTP já é verificado no nível de contrato com supertest).

---

## Comandos de validação

```bash
# Rodar apenas os testes deste módulo
source ~/.asdf/asdf.sh && npx jest --testPathPattern="health" --no-coverage

# Rodar smoke tags
source ~/.asdf/asdf.sh && npm run test:smoke

# Build
source ~/.asdf/asdf.sh && npm run build

# Lint
source ~/.asdf/asdf.sh && npm run lint
```
