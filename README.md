# ia-boilerplate

Monorepo boilerplate com camada agêntica completa para Claude Code.

## Stack de referência

- **API**: NestJS + Clean Architecture + PostgreSQL (Knex)
- **Web**: Next.js App Router + BFF (routeWrapper) + shadcn/ui
- **Infra**: Docker Compose para dev e testes
- **Agentes**: Claude Code com skills, agents e rules por app

## Como usar

### 1. Configurar o agente

```bash
/setup
```

Cria o `.claude/agent.config.yml` local com os caminhos, scripts e apps do projeto.

### 2. Planejar uma demanda

```bash
/task
```

Entrevista, classifica escopo, cria contratos cross-app se necessário e delega planejamento técnico para cada app.

### 3. Implementar

```bash
/implement
```

Cria a branch e executa a implementação local por app na ordem de dependência.

### 4. Validar

```bash
/validate
```

Valida critérios de aceite globais e contratos entre apps.

### 5. Commitar

```bash
/commit
```

Roda lint + build + architecture-validator + security-auditor em cada app antes de criar o commit raiz.

## Estrutura

```
.
├── apps/
│   ├── api/          # NestJS API (Clean Architecture)
│   │   └── .claude/  # camada agêntica local da API
│   └── web/          # Next.js Web (App Router + BFF)
│       └── .claude/  # camada agêntica local do Web
├── containers/       # Docker Compose (dev + testes)
├── scripts/          # Scripts de teste E2E
├── .claude/          # camada manager raiz (agents, skills, rules)
└── AGENTS.md         # instruções para agentes de IA
```

## Exemplo incluso

O boilerplate inclui um CRUD simples de `items` (título + descrição) demonstrando:

- API: Clean Architecture completa (entrypoints → use-cases → handlers → repositories)
- Web: fluxo BFF completo (página → `bff-fetch` → route handler com `routeWrapper` → `callApi` → API)

Substitua `items` pelo primeiro recurso do seu projeto.

## Adaptando para outro stack

As rules em `apps/api/.claude/rules/` e `apps/web/.claude/rules/` descrevem os padrões do NestJS + Next.js. Para outro stack:

1. Substitua as rules de arquitetura, database e testing pelo equivalente da sua stack.
2. Atualize os scripts em `agent.config.yml` (gerado pelo `/setup`).
3. Mantenha os agents e skills — eles são agnósticos ao stack.
