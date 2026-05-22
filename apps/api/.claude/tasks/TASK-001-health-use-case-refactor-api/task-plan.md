# TASK-001-api — Health Module: Refatorar para padrão Use-Case

## Contexto

O módulo `health` em `src/entrypoints/health/` viola a regra arquitetural:
> "Controllers delegate to handlers — No business logic in controllers."

Estado atual:
- `HealthController.check()` retorna `{ status: 'ok' }` diretamente.
- Não existe pasta `use-cases/` dentro do módulo.
- `HealthModule` não provê nenhum handler.

## O que este app precisa fazer

### 1. Criar o handler de use-case

Criar o arquivo:

```
src/entrypoints/health/use-cases/check-health/check-health.handler.ts
```

O handler deve:
- Ser decorado com `@Injectable()`
- Expor um método `handle(): { status: string }` que retorna `{ status: 'ok' }`
- Seguir a convenção de nomenclatura: `CheckHealthHandler`

### 2. Atualizar o controller

Arquivo: `src/entrypoints/health/adapters/rest/health.controller.ts`

- Injetar `CheckHealthHandler` via construtor
- Delegar `check()` para `this.checkHealthHandler.handle()`
- Remover o retorno direto `{ status: 'ok' }`
- Manter `@Anonymous()`, `@Get()` e `@ApiOperation()`

### 3. Atualizar o módulo

Arquivo: `src/entrypoints/health/health.module.ts`

- Adicionar `CheckHealthHandler` no array `providers`

## Estrutura de pastas resultante

```
src/entrypoints/health/
├── adapters/rest/
│   └── health.controller.ts       # delega ao handler
├── use-cases/
│   └── check-health/
│       └── check-health.handler.ts  # retorna { status: 'ok' }
└── health.module.ts               # provê CheckHealthHandler
```

## Critérios de aceite (app)

- `HealthController` injeta `CheckHealthHandler` e chama `handle()` sem nenhuma lógica própria.
- `CheckHealthHandler.handle()` retorna `{ status: 'ok' }`.
- `HealthModule.providers` inclui `CheckHealthHandler`.
- `GET /health` continua respondendo `200 { status: 'ok' }`.
- Testes unitários cobrem `CheckHealthHandler`.
- Teste de contrato cobre a delegação em `HealthController`.
- Build e lint passam.

## Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/entrypoints/health/use-cases/check-health/check-health.handler.ts` | Criar |
| `src/entrypoints/health/adapters/rest/health.controller.ts` | Atualizar |
| `src/entrypoints/health/health.module.ts` | Atualizar |
