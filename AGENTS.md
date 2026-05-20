# AGENTS.md

Este arquivo instrui agentes de IA sobre como trabalhar neste projeto. Leia-o antes de qualquer outra coisa.

---

## 1. Ponto de Entrada: `.claude/CLAUDE.md`

Quando você começar a trabalhar neste repositório, o primeiro arquivo a ler é `.claude/CLAUDE.md`. Ele contém a orientação geral do projeto: comandos, fluxos de trabalho e um índice de onde encontrar cada tipo de documentação.

Não assuma nada sobre o projeto antes de ler esse arquivo.

---

## 1.1. Ambiente Node.js via `asdf`

Este projeto usa Node.js gerenciado por `asdf`. Em alguns ambientes de agente, `node`, `npm` e `npx` podem não aparecer no `PATH` inicial.

Antes de executar comandos Node.js, confira se o runtime está disponível:

```bash
node --version
npm --version
```

Se não estiver, carregue o `asdf` explicitamente no comando:

```bash
source ~/.asdf/asdf.sh && npm run build
source ~/.asdf/asdf.sh && npm test
source ~/.asdf/asdf.sh && npm install
```

Não conclua que o projeto não tem Node/npm instalado sem antes tentar carregar `~/.asdf/asdf.sh`.

---

## 2. Estrutura da Pasta `.claude/`

```
.claude/
├── CLAUDE.md          ← leia primeiro, sempre
├── rules/             ← regras do projeto (arquitetura, banco, auth, etc.)
├── agents/            ← definições de agentes especializados
├── skills/            ← workflows compostos invocáveis como comandos
└── tasks/             ← pastas geradas por tarefa em andamento
```

---

## 3. Como Ler Arquivos de Regras (`rules/`)

Cada arquivo em `.claude/rules/` tem um frontmatter YAML no topo, antes do conteúdo:

```yaml
---
paths:
  - "src/repositories/**/*.ts"
---
```

O campo `paths` descreve para quais arquivos do projeto aquela regra é relevante.

**Protocolo:**

1. Leia apenas o frontmatter YAML (as primeiras linhas, até `---`).
2. Compare os `paths` com os arquivos que você está prestes a criar ou modificar.
3. Só carregue o arquivo completo se o path bater com o que você está fazendo.

Isso mantém o contexto limpo. Carregue só o que for relevante para a tarefa atual.

---

## 4. Como Usar Agentes (`agents/`)

Cada arquivo em `.claude/agents/` define um agente especializado. O frontmatter tem `name` e `description`:

```yaml
---
name: example-agent
description: What this agent does and when to use it.
tools: Read, Write, Bash
model: sonnet
---
```

**Protocolo:**

1. Liste os arquivos em `.claude/agents/`.
2. Leia apenas o frontmatter de cada um.
3. Use o campo `description` para decidir qual agente é adequado para a situação.
4. Sempre que um agente da pasta `.claude/agents/` for invocado por uma skill, workflow ou instrução do projeto, execute-o como um subagent usando o mecanismo de subagentes disponível no ambiente.
5. Não simule manualmente a execução de um agente apenas lendo seu arquivo e fazendo o trabalho no agente principal, salvo quando o ambiente não oferecer suporte a subagents ou a execução como subagent estiver bloqueada.
6. Só leia o corpo completo quando precisar entender exatamente como preparar o prompt, escopo e contexto antes de disparar o subagent.

---

## 5. Como Usar Skills (`skills/`)

Cada skill é uma pasta dentro de `.claude/skills/`, com um arquivo `SKILL.md`:

```
.claude/skills/
└── {skill-name}/
    └── SKILL.md
```

O `SKILL.md` também começa com frontmatter YAML contendo `name` e `description`.

**Protocolo:**

1. Antes de executar qualquer tarefa pedida pelo usuário, liste as skills disponíveis em `.claude/skills/`.
2. Leia inicialmente **somente o frontmatter YAML** do `SKILL.md` de cada skill (`name` e `description`), sem carregar o corpo completo.
3. Compare a descrição de cada skill com o pedido do usuário para decidir se existe uma skill relevante.
4. Se uma skill for adequada para a tarefa, anuncie que ela será usada, leia o corpo completo do `SKILL.md` correspondente e siga suas instruções passo a passo.
5. Se nenhuma skill for adequada, prossiga com o fluxo normal do projeto sem carregar corpos de skills desnecessários.

---

## 6. Pasta de Tarefas (`tasks/`)

Cada tarefa em andamento ganha uma pasta em `.claude/tasks/`. Se você encontrar essa estrutura, significa que um planejamento já foi feito. Leia os arquivos de plano presentes antes de qualquer implementação e siga a lista de tarefas em ordem — nunca pule etapas.

---

## 7. Mantendo a Documentação Atualizada

Sempre que você descobrir algo novo sobre o projeto — um padrão, uma convenção, uma restrição — atualize o arquivo de rules correspondente. Nunca deixe esse conhecimento só no histórico de conversa ou no diff do commit.

Os arquivos em `.claude/rules/` são a memória persistente do projeto para agentes futuros.
