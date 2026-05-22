# Scope — TASK-001

## Classificação

**scope: api**

## Rationale

A alteração é inteiramente dentro de `apps/api/src/entrypoints/health/`. Nenhum arquivo de `apps/web` é tocado. Não há contrato compartilhado entre apps — o endpoint de health é consumido pelo web (ou por um load balancer) mas a mudança é apenas interna ao módulo NestJS. O contrato HTTP externo (`GET /health → 200 { status: 'ok' }`) permanece idêntico.

## Apps afetados

- `api` — refatoração interna do módulo health

## Contract required

**false** — nenhuma fronteira cross-app é modificada.
