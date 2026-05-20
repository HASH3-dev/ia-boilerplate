# Genemunology Monorepo — Root Manager

Esta pasta `.claude` da raiz é a camada manager do monorepo. Toda demanda começa aqui, mas a implementação técnica pertence às camadas locais de cada app.

## Instrução inicial obrigatória

Antes de executar qualquer skill, agente ou workflow da raiz:

1. Leia `.claude/rules/agent-config.md`.
2. Verifique se `.claude/agent.config.yml` existe.
3. Verifique se `.claude/agent.config.yml` contém todas as propriedades obrigatórias definidas em `.claude/rules/agent-config.md`.
4. Se o arquivo não existir ou estiver incompleto, execute `/setup` antes de continuar.
5. Depois disso, carregue `.claude/agent.config.yml`.

Use esse arquivo como fonte de verdade para detalhes operacionais, caminhos do projeto, comandos de ambiente, nomes de apps, scripts e padrões de branch/task.

Quando um documento usar uma referência como `@agentConfig/rootManager/taskDirectory`, substitua mentalmente pelo valor correspondente em `.claude/agent.config.yml`. Não hardcode esses detalhes em novos arquivos da raiz; aponte para `@agentConfig/...`.

## Responsabilidade da raiz

A raiz coordena:

- entendimento da demanda e critérios de aceite globais;
- classificação de escopo (`api`, `web` ou `cross-app`);
- contratos entre apps;
- work-items locais;
- ordem de implementação;
- validação integrada;
- commit final da feature.

A raiz não implementa regras específicas de NestJS, Next.js, banco, auth local ou UI. Para isso, delegue para o `.claude` do app afetado.

## Apps configurados

Os apps são definidos em `@agentConfig/apps`. Não assuma nomes como `api` ou `web`; use as chaves e paths carregados do config.

Para cada app configurado:

- path: `@agentConfig/apps/<appKey>/path`
- camada local: `@agentConfig/apps/<appKey>/claudePath`
- tasks locais: `@agentConfig/apps/<appKey>/localTasksPath`

## Estrutura de task manager

Toda demanda cria uma task na raiz:

```text
@agentConfig/rootManager/taskDirectory/@agentConfig/rootManager/taskFolderPattern/
├── @agentConfig/rootManager/taskPlanFile
├── @agentConfig/rootManager/scopeFile
├── @agentConfig/rootManager/contractFile        # quando houver fronteira entre apps
├── @agentConfig/rootManager/workItemsFile
├── @agentConfig/rootManager/coordinationFile
└── @agentConfig/rootManager/statusFile
```

Work-items técnicos ficam dentro dos apps:

```text
@agentConfig/apps/<appKey>/localTasksPath/TASK-XXX-feature-<appKey>/
```

Pastas `.done` antigas na raiz podem seguir o formato anterior específico da API. Elas são histórico legado; novas tasks devem seguir o formato manager acima.

## Skills raiz

- `/setup`: cria ou completa o `.claude/agent.config.yml` local obrigatório.
- `/task`: entrevista o usuário, cria a task manager, detecta escopo, cria contrato quando necessário, registra work-items locais e **delega o planejamento técnico para a skill `/task` local de cada app afetado** (via `local-task-dispatcher`). **Não cria branch.**
- `/implement`: cria a branch da task e despacha a implementação para os apps afetados na ordem definida.
- `/validate`: valida apps afetados, contratos e aceite global.
- `/commit`: entry point obrigatório para qualquer pedido de commit ou release neste monorepo. Nunca execute git manualmente; sempre use esta skill. Se o diff atingir arquivos dentro de um app (`@agentConfig/apps/<appKey>/path`), a skill delega o commit desse app para a skill local antes de criar o commit raiz. Para `Commit + Release`, a skill invoca o `release-manager` raiz depois dos commits.

Skills coordenam fluxo. Agents fazem entrevista, decisão e produção de artefatos.

## Fluxo completo de uma demanda

```text
/task  →  /implement  →  /validate  →  /commit
```

- `/task`: planejamento (raiz + locais). **Sem branch.**
- `/implement`: cria branch + executa implementação local por app.
- `/validate`: valida critérios de aceite globais.
- `/commit`: commit raiz da feature.

## Agentes raiz

- `root-manager`: entrevista e cria `@agentConfig/rootManager/taskPlanFile`.
- `scope-router`: classifica escopo e escreve `@agentConfig/rootManager/scopeFile`.
- `contract-planner`: define `@agentConfig/rootManager/contractFile` para fronteiras entre apps.
- `work-item-planner`: registra work-items e contexto de delegação em `@agentConfig/rootManager/workItemsFile`.
- `local-task-dispatcher`: invoca a skill `/task` local de cada app afetado em modo delegação, passando o contexto da task raiz. Cada app cria seus próprios artefatos de planejamento técnico (`task-plan.md`, `implementation-plan.md`, `test-plan.md`, `todo.md`).
- `implementation-dispatcher`: invoca `/implement` local por app conforme dependências.
- `delivery-coordinator`: atualiza `@agentConfig/rootManager/coordinationFile` e `@agentConfig/rootManager/statusFile`.
- `acceptance-validator`: valida a feature inteira.
- `commit-manager`: valida e commita no nível da raiz.
- `release-manager`: prepara release consolidada do monorepo com bump SemVer raiz, changelog em `releases/` e tag anotada `vX.Y.Z`.

## Regras centrais

1. Toda demanda entra pela raiz.
2. Apps executam ciclos técnicos; a raiz coordena delivery.
3. Contrato cross-app vem antes das implementações locais.
4. `@agentConfig/contracts/packagePath` só entra quando o contrato precisa ser importável por mais de um app.
5. Validação técnica pode ser local; aceite e commit final são da raiz.
6. Ticket externo sem descrição suficiente não é requisito completo. Pergunte antes de criar plano.
7. Nenhum agente raiz altera a lógica interna dos `.claude` locais sem tarefa explícita para isso.
8. **Branch é criada pelo `/implement`, nunca pelo `/task`.** A skill `/task` (raiz e local) produz apenas artefatos de planejamento.
9. **Commit gate obrigatório — veja `.claude/rules/commit-gate.md`.** Qualquer arquivo dentro de `@agentConfig/apps/<appKey>/path` só pode ser commitado após a skill local `/commit` do app ter rodado e passado em sua totalidade (lint, build, `architecture-validator`, `security-auditor`). A skill raiz pode chamar `git commit` diretamente apenas para arquivos que estejam fora de todos os diretórios de app.

## Estrutura de scripts e containers

O critério de onde colocar scripts e containers é **escopo**, não conveniência:

- **Raiz** (`/scripts`, `/containers`): apenas o que envolve dois ou mais apps simultaneamente — testes de integração cross-app, Playwright e2e, docker-compose que orquestra web + api juntos.
- **Dentro do app** (`apps/<appKey>/scripts`, `apps/<appKey>/containers`): tudo que o app consegue executar de forma autônoma, sem depender de outro app.

Regra derivada: se um script ou container pode ser movido para dentro de um único app sem perder função, ele pertence ao app.

## Ambiente Node.js

O monorepo usa Node.js via `@agentConfig/runtime/node/asdfLoader`. Antes de comandos Node.js:

```bash
@agentConfig/runtime/node/versionCommand
@agentConfig/runtime/node/packageManagerVersionCommand
```

Se não estiverem disponíveis:

```bash
@agentConfig/runtime/node/commandPrefix npm run <script>
```

Use os scripts da raiz definidos em `@agentConfig/apps/*/scripts` quando possível.

## Leitura de regras

Leia inicialmente só o frontmatter dos arquivos em `.claude/rules/`. Resolva referências `@agentConfig/...` nos globs de `paths` antes de comparar. Carregue o corpo completo apenas quando o `paths` resolvido bater com a tarefa atual.

Para regras técnicas de um app, leia o `.claude/CLAUDE.md` local do app e siga o protocolo local.
