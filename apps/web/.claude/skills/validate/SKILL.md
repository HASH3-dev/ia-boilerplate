---
name: validate
description: Full Web validation — lint/build plus architecture and security audits.
---

Run a full validation of the Web app.

## Step 1: Static validation

Run from `apps/web`:

```bash
npm run lint
npm run build
```

If either fails, stop and report the failure.

## Step 2: Architecture validation

Invoke `architecture-validator` with no scope for full validation.

## Step 3: Security audit

Invoke `security-auditor` with no scope for full validation.

## Step 4: Issues

For critical/high findings, invoke `/log-issue` and report the created files.

Warnings and suggestions are reported but not persisted automatically.

## Step 5: Report

Summarize lint/build, architecture, security, and issues logged.
