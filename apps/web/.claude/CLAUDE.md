# Genemunology Web - Next.js App Router Project

Este projeto é o frontend Next.js do monorepo Genemunology. Ele usa Next.js App Router, React, TypeScript, Firebase Auth, `next-firebase-auth-edge`, `next-intl`, Tailwind CSS v4, shadcn/Radix UI, React Hook Form e Zod.

## Documentação Organizada

Consulte as regras sob demanda:

- **Arquitetura**: `.claude/rules/architecture.md` - estrutura App Router, componentes e route handlers
- **Rotas e Layouts**: `.claude/rules/routing.md` - grupos de rota, locale e navegação
- **Autenticação**: `.claude/rules/authentication.md` - Firebase client, middleware e sessão
- **UI e Design System**: `.claude/rules/ui-design.md` - shadcn/Radix, Tailwind e padrões visuais
- **Forms**: `.claude/rules/forms.md` - React Hook Form + Zod
- **i18n**: `.claude/rules/i18n.md` - `next-intl` e mensagens
- **Route Handlers**: `.claude/rules/route-handlers.md` - API routes internas e `routeWrapper`
- **TypeScript**: `.claude/rules/typescript.md` - aliases e imports
- **Testing**: `.claude/rules/testing.md` - validação, build, lint e Playwright
- **Environment**: `.claude/rules/environment.md` - variáveis exigidas
- **Best Practices**: `.claude/rules/best-practices.md` - armadilhas comuns

Leia apenas o frontmatter das rules primeiro. Carregue o corpo completo só quando os `paths` baterem com os arquivos que serão criados ou alterados.

## Comandos Principais

Execute a partir de `apps/web` quando estiver trabalhando localmente no app:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

No monorepo, os scripts da raiz expõem:

```bash
npm run dev:web
npm run build:web
npm run lint:web
npm run start:web
```

## Workflow Completo de Tarefa

O fluxo local segue a mesma ideia da API:

```text
planner → implementation-planner → test-planner → todo-generator → branch
```

Cada task técnica local fica em:

```text
.claude/tasks/TASK-XXX-short-description/
├── task-plan.md
├── implementation-plan.md
├── test-plan.md
└── todo.md
```

Quando a demanda vier do root manager, use o contexto recebido em `work-items.md` da task raiz, mas produza os planos locais dentro desta pasta `apps/web/.claude/tasks`.

## TDD Obrigatório

Toda feature, bugfix ou alteração de comportamento deve seguir TDD:

1. Escreva ou atualize testes/checagens que expressem o comportamento esperado.
2. Confirme que o comportamento ainda não existe quando aplicável.
3. Implemente o menor código necessário.
4. Rode validação relevante (`lint`, `build`, testes ou Playwright).
5. Refatore apenas depois da validação passar.

## Manutenção da Documentação

Sempre que descobrir um padrão, restrição ou armadilha do frontend, atualize a rule correspondente em `.claude/rules/`.
