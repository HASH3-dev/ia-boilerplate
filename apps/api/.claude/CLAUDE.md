# Genemunology API - Clean Architecture Project

Este projeto segue Clean Architecture com NestJS, PostgreSQL e Firebase Auth.

## 📚 Documentação Organizada

A documentação foi separada em arquivos focados. **Consulte sob demanda** usando a ferramenta Read:

- **Arquitetura**: `.claude/rules/architecture.md` - Layer structure, Clean Architecture rules
- **Autenticação**: `.claude/rules/authentication.md` - Firebase Auth flow, decorators
- **Padrões de Código**: `.claude/rules/module-structure.md` e `.claude/rules/repository-pattern.md`
- **Database**: `.claude/rules/database.md` - Naming conventions, migrations
- **TypeScript**: `.claude/rules/typescript.md` - isolatedModules, import type
- **Testing**: `.claude/rules/testing.md` - Test commands, Firebase tokens
- **Swagger**: `.claude/rules/swagger.md` - API documentation setup
- **Environment**: `.claude/rules/environment.md` - Required .env variables
- **Best Practices**: `.claude/rules/best-practices.md` - Common pitfalls, class structure

**INSTRUÇÃO**: Só carregue estes arquivos quando precisar consultar regras específicas do projeto.

## 🚀 Comandos Principais

### Ambiente Node.js

O Node.js deste projeto é gerenciado por `asdf`. Se `node`, `npm` ou `npx` não estiverem no `PATH` do agente, carregue o `asdf` antes do comando:

```bash
source ~/.asdf/asdf.sh && npm run build
source ~/.asdf/asdf.sh && npm run test
source ~/.asdf/asdf.sh && npm install
```

Sempre tente carregar `~/.asdf/asdf.sh` antes de concluir que o runtime Node.js não está instalado.

### Comandos

```bash
# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode with breakpoints
npm run build              # Compile TypeScript to dist/

# Database
npm run migrate:latest     # Run all pending migrations
npm run migrate:rollback   # Rollback last migration
npm run migrate:make name  # Create new migration file

# Testing
npm run test               # Run unit tests
npm run test:watch         # Watch mode for tests
npm run test:cov           # Generate coverage report
npm run test:e2e           # End-to-end tests

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Format with Prettier
```

## 🔧 Workflows

### Regra Obrigatória: TDD

Toda feature, bugfix ou alteração de comportamento deve seguir TDD:

1. Escreva ou atualize testes que expressem o contrato esperado antes da implementação.
2. Rode os testes e confirme que falham pelo motivo esperado quando o comportamento ainda não existe.
3. Implemente o menor código necessário para passar.
4. Rode os testes novamente e só então refatore.
5. Para tasks planejadas em `.claude/tasks/`, siga a ordem do `todo.md`: contract tests → unit tests → implementação → integração/e2e → validação.

Não pule diretamente para a implementação quando a tarefa tiver critérios testáveis, salvo se o usuário pedir explicitamente para fazer um spike ou protótipo sem testes.

### Workflow Completo de Tarefa

O workflow de task é dividido em duas fases separadas: **planejamento** e **implementação**.

#### Fase 1 — Planejamento

```bash
/task
```

Entrevista o usuário, gera os arquivos de plano e cria a branch. Pare aqui para revisar os planos antes de implementar.

Cada task ganha sua própria pasta em `.claude/tasks/TASK-XXX-short-description/`:

```
.claude/tasks/
└── TASK-XXX-short-description/
    ├── task-plan.md            ← o quê e por quê  (planner)
    ├── implementation-plan.md  ← como construir   (implementation-planner)
    ├── test-plan.md            ← como verificar   (test-planner)
    └── todo.md                 ← itens TDD ordenados (todo-generator)
```

**Etapas do `/task`:**
1. `planner` entrevista o usuário → `task-plan.md`
2. `implementation-planner` → `implementation-plan.md`
3. `test-planner` → `test-plan.md`
4. `todo-generator` → `todo.md`
5. Branch criada como `task/TASK-XXX-short-description`

#### Fase 2 — Implementação

```bash
/implement
```

Lê `todo.md`, executa os ciclos TDD via agente `software-engineer`, valida e commita.

**Etapas do `/implement`:**
1. Para cada ciclo do `todo.md`: spawna `software-engineer` com o contexto do ciclo
2. Após cada ciclo: invoca `/commit` (commit only)
   - Se bloqueado por issues: `/resolve-issues` → `/commit` novamente
3. Ao final: `/commit` com release

Detalhes: `.claude/skills/task/SKILL.md` · `.claude/skills/implement/SKILL.md`
Agentes: `.claude/agents/planner.md`, `.claude/agents/implementation-planner.md`, `.claude/agents/software-engineer.md`

---

### Criar Novo Módulo

Para criar um módulo NestJS completo (controller, handler, dto, repository, migration):

```bash
/new-module
```

### Commit & Release Workflow

Para validar, auditar e commitar mudanças (com ou sem release):

```bash
/commit
```

**O que faz:**
1. Pergunta se é commit isolado ou release
2. Valida arquitetura (architecture-validator)
3. Audita segurança (security-auditor)
4. Cria commits semânticos (smart-committer)
5. [Se release] Gera changelog e bump de versão (release-manager)

**Use quando:**
- Tiver mudanças prontas para commit
- Quiser validar antes de criar PR
- Estiver preparando uma release

## 📝 Manutenção da Documentação

**IMPORTANTE**: Sempre que você aprender algo novo sobre o projeto (padrões, convenções, decisões arquiteturais, configurações, problemas comuns), você DEVE adicionar essa informação em um dos arquivos de regras apropriados:

- Novos padrões de arquitetura → `.claude/rules/architecture.md`
- Mudanças em autenticação → `.claude/rules/authentication.md`
- Padrões de repositórios → `.claude/rules/repository-pattern.md`
- Convenções de módulos → `.claude/rules/module-structure.md`
- Regras de banco de dados → `.claude/rules/database.md`
- Configurações TypeScript → `.claude/rules/typescript.md`
- Práticas de teste → `.claude/rules/testing.md`
- Configurações Swagger → `.claude/rules/swagger.md`
- Variáveis de ambiente → `.claude/rules/environment.md`
- Armadilhas e best practices → `.claude/rules/best-practices.md`

Mantenha a documentação sempre atualizada e sincronizada com o código real do projeto.
