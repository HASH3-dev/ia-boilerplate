# Implementation Plan — TASK-001-api

## Visão geral

Refatoração pura: nenhum comportamento externo muda. O endpoint `GET /health` continuará respondendo `200 { status: 'ok' }`. A mudança é exclusivamente estrutural — extrair a lógica do controller para um handler de use-case seguindo o padrão arquitetural do projeto.

---

## Passo 1 — Criar `check-health.handler.ts`

**Arquivo:** `src/entrypoints/health/use-cases/check-health/check-health.handler.ts`

**Ação:** Criar novo arquivo.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckHealthHandler {
  handle(): { status: string } {
    return { status: 'ok' };
  }
}
```

**Notas:**
- `@Injectable()` é obrigatório para injeção de dependência pelo NestJS.
- Método `handle()` é síncrono — não há I/O; não precisa de `async`.
- Tipo de retorno explícito `{ status: string }` alinhado com o contrato HTTP existente.
- Sem `import type` necessário (nenhuma importação de tipos puros).

**Test hint:** Instanciar `CheckHealthHandler` sem container NestJS; chamar `handle()` e verificar retorno `{ status: 'ok' }`.

---

## Passo 2 — Atualizar `health.controller.ts`

**Arquivo:** `src/entrypoints/health/adapters/rest/health.controller.ts`

**Ação:** Modificar para injetar e delegar ao handler.

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Anonymous } from '@shared/decorators/anonymous.decorator';
import { CheckHealthHandler } from '../../use-cases/check-health/check-health.handler';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealthHandler: CheckHealthHandler) {}

  @Anonymous()
  @Get()
  @ApiOperation({ operationId: 'health', summary: 'Health check' })
  check(): { status: string } {
    return this.checkHealthHandler.handle();
  }
}
```

**Notas:**
- `import` do handler usa caminho relativo (não alias de path, pois está dentro do mesmo módulo `health`).
- `CheckHealthHandler` é uma classe concreta, não um tipo puro — usar `import` (não `import type`).
- Construtor adicionado com injeção privada do handler.
- Método `check()` agora delega inteiramente; zero lógica própria.
- Todos os decorators existentes (`@Anonymous()`, `@Get()`, `@ApiOperation()`) são mantidos.

**Test hint (contrato):** Usar `Test.createTestingModule` com `CheckHealthHandler` mockado; chamar `GET /health` via `supertest` e verificar `200 { status: 'ok' }`. Verificar que o mock do handler foi chamado exatamente uma vez.

---

## Passo 3 — Atualizar `health.module.ts`

**Arquivo:** `src/entrypoints/health/health.module.ts`

**Ação:** Adicionar `CheckHealthHandler` em `providers`.

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './adapters/rest/health.controller';
import { CheckHealthHandler } from './use-cases/check-health/check-health.handler';

@Module({
  controllers: [HealthController],
  providers: [CheckHealthHandler],
})
export class HealthModule {}
```

**Notas:**
- `CheckHealthHandler` adicionado ao array `providers` para que o NestJS possa injetá-lo.
- Nenhuma exportação necessária — o handler é usado apenas internamente pelo módulo.

**Test hint:** Nenhum teste direto para o módulo; coberto pelos testes de contrato do controller que sobem o módulo real.

---

## Ordem de execução (TDD)

Seguindo a regra do projeto: escrever testes antes da implementação.

```
1. [UNIT]    Escrever spec do CheckHealthHandler (falha — handler não existe)
2. [IMPL]    Criar check-health.handler.ts → spec passa
3. [CONTRACT] Escrever spec de contrato do HealthController (falha — controller ainda retorna direto)
4. [IMPL]    Atualizar health.controller.ts + health.module.ts → spec passa
5. [VALIDATE] Build + lint
```

---

## Convenções aplicadas

- Seguindo `module-structure.md`: handlers em `use-cases/{action}/{action}.handler.ts`.
- Seguindo `architecture.md`: controllers não têm lógica, delegam a handlers.
- Seguindo `best-practices.md`: um handler por use-case, sem lógica no controller.
- Seguindo `typescript.md`: `import type` somente para tipos puros; aqui usamos `import` normal (classes concretas).
- Seguindo `best-practices.md` (class structure): propriedades antes do construtor, construtor antes dos métodos.
