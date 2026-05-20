---
name: bug
description: Register a bug report with evidence and expected behavior. Creates a structured bug file in .claude/bugs/.
---

You are registering a bug report for the Genemunology monorepo.

## Mission

Interview the user to collect all information needed for a clear bug report, then create a structured file in `.claude/bugs/`.

## Step 1 — Determine the next bug ID

List files in `.claude/bugs/`. Find the highest existing `BUG-NNN` number and increment by 1. If no files exist, start at `BUG-001`.

## Step 2 — Interview the user

Ask the following questions. You may ask all at once or in a conversational flow — use your judgment based on how much context the user has already provided.

### 2a. Bug description

Ask the user to describe the bug:
- What happened?
- Where in the application did it occur? (which screen, flow, or endpoint)
- Under what conditions does it reproduce? (always, sometimes, specific steps)

### 2b. Evidence

Ask for evidence. Be explicit that images are welcome:

> "Você tem evidências do bug? Pode enviar **capturas de tela**, gravações de tela, logs de console, mensagens de erro, ou descrever o que viu. Se preferir, pode informar o caminho de uma imagem — consigo analisá-la e descrever o que está acontecendo."

**When the user provides an image path** (e.g. `/tmp/screenshot.png`, `~/Desktop/erro.png`):
- Use the Read tool to view the image.
- Analyze it carefully: identify the screen/page shown, the UI state, any visible error messages, and what the bug looks like visually.
- Write a detailed prose description of what you observed. Include: which screen or component is visible, what the UI is displaying, what looks wrong or unexpected, and any visible error text.
- **Do not reference the image file path in the bug report.** The evidence section must contain only your written description — the report must be self-contained without the image.

If the user pastes text logs or error messages, include them verbatim in the report.

### 2c. Expected behavior

Ask:
> "Qual seria o comportamento correto? O que deveria ter acontecido no lugar do que ocorreu?"

### 2d. Regression tests

Ask the user (or infer from the bug description) what automated tests must exist to catch a future regression of this bug. Be specific about:
- **Type:** unit, integration, or E2E (Playwright).
- **What to simulate or set up:** the precondition that triggers the bug (e.g., expired token, missing field, server error).
- **What to assert:** the correct behavior the test must verify.

Frame each test as a short scenario: "given X, when Y, then Z."

If the user doesn't provide this, derive the minimum set yourself based on the bug description and expected behavior. These tests are mandatory — the section must never be left empty or vague.

### 2e. Severity and affected app (optional — infer when possible)

If not obvious from context, ask:
- Which app is affected? (`api`, `web`, or both)
- How severe is this? (critical / high / medium / low)

If the user doesn't know or doesn't care, default to `medium` severity and `unknown` for the app.

## Step 3 — Create the bug file

Create `.claude/bugs/BUG-NNN-short-slug.md` where `short-slug` is a 2–4 word kebab-case summary of the bug.

Use this template:

```markdown
---
id: BUG-NNN
date: YYYY-MM-DD
app: <api | web | cross-app | unknown>
severity: <critical | high | medium | low>
status: open
---

# BUG-NNN — <Short title>

## Description

<What happened, where, and under what conditions>

## Steps to Reproduce

<Numbered list of steps, or "Not yet determined">

## Evidence

<Written description of what was observed — logs, error messages, and/or detailed description
of what was visible in screenshots (screen name, UI state, visible errors, what looks wrong).
Never reference image file paths here; the description must be self-contained.>

## Expected Behavior

<What should have happened instead>

## Regression Tests Required

<Mandatory automated tests that must exist before this bug is closed. For each test, state:
- Type: unit | integration | E2E
- Precondition / setup
- Action
- Assertion

Use the format: "given X, when Y, then Z."
Never leave this section empty — derive the minimum set from the description if the user didn't specify.>

## Notes

<Any additional context, workarounds, or related tasks — or leave empty>
```

## Step 4 — Confirm and report

After creating the file, tell the user:
- The bug ID and file path created
- A one-line summary of what was recorded
- That they can open the file to review or edit it

## Rules

- Never skip the expected behavior question — it is the most important field.
- Never leave the Regression Tests Required section empty or vague — derive the minimum set from the bug description if the user doesn't specify. Each test must name its type (unit/integration/E2E), precondition, action, and assertion.
- Never invent evidence or assume what the user saw.
- If the user provides an image, always use the Read tool to view it, then write a detailed description — never include the file path in the report.
- The bug report must be fully readable without any external files or images.
- Keep the slug short and descriptive, no more than 4 words.
- Do not create tasks or implementation plans — this skill only registers the bug report.
- Do not commit the bug file — that is for the user to decide.
