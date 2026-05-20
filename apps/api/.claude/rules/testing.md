---
paths:
  - "test/**/*.ts"
  - "**/*.spec.ts"
---

# Testing

## Testing Authenticated Endpoints Locally

Use `Bearer` tokens in Swagger UI (http://localhost:3000/docs) or cURL:

```bash
TOKEN="your-access-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/items
```

## Test Commands

```bash
npm run test               # Run unit tests
npm run test:watch         # Watch mode for tests
npm run test:cov           # Generate coverage report
npm run test:smoke         # Run smoke-tagged unit, contract, integration tests, and build
npm run test:integration   # Run integration tests against TEST_DB_URI when available
npm run test:full          # Run the full suite inside Docker with an isolated test DB
npm run test:full -- smoke # Run only smoke-tagged tests inside Docker
npm run test:e2e           # End-to-end tests
npm run typecheck          # TypeScript no-emit check for src and tests
npm run check              # Format, lint with fixes, then typecheck
```

## Jest Tags

Jest does not provide native tags. For smoke coverage, prefix the `describe` or `it` name with `[smoke]`.

```typescript
describe('[smoke] Some contract', () => {
  it('returns the expected response', async () => {
    // assertions
  });
});
```

`npm run test:smoke` selects those tests with `--testNamePattern` across unit tests, contract tests, and integration tests. Integration smoke tests still require `TEST_DB_URI`; without it, that suite is skipped by design.

## Jest Path Aliases

The TypeScript project uses path aliases such as `@shared/*`, `@repositories/*`, `@ports/*`, and `@entrypoints/*`.

When adding or changing Jest config, keep `moduleNameMapper` aligned with `tsconfig.json`; otherwise tests fail before running with errors like `Cannot find module '@shared/...'`.

## Integration Tests

Integration tests live in `test/*.integration-spec.ts` and run with `npm run test:integration`.

They require `TEST_DB_URI`, never `DB_URI`. This is intentional: integration tests may truncate tables and run migrations, so they must never point at development, staging, production, or any shared database.

Safety rules:

- `DB_URI` is ignored by integration tests.
- `TEST_DB_URI` must be a PostgreSQL URL.
- The database name in `TEST_DB_URI` must contain `test`, `testing`, or `integration`.
- When `TEST_DB_URI` is not set, integration suites are skipped intentionally so unit tests and builds can still run in lightweight agent environments.

Example:

```bash
TEST_DB_URI="postgresql://user:pass@localhost:5432/myproject_test" npm run test:integration
```

To run the full suite in a controlled Docker test environment:

```bash
npm run test:full
```

This uses `containers/test/docker-compose.test.yml`, starts PostgreSQL plus a `test-runner` container, runs unit tests, smoke contract tests, integration tests, e2e tests, build, and lint inside the container, then tears the Compose environment down when the script exits.

To run only smoke-tagged tests in the same isolated Docker environment:

```bash
npm run test:full -- smoke
```

## Overriding Guards in E2E / Contract Tests

When testing a controller that uses a route-level guard, replace it with a `ContractGuard` that simulates the guard's behavior without calling external services:

```typescript
class ContractAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) return false;
    req.user = { id: 'test-user-id' };
    return true;
  }
}
```

Register the override in the `TestingModule`:

```typescript
const module = await Test.createTestingModule({ imports: [AppModule] })
  .overrideGuard(MyAuthGuard)
  .useClass(ContractAuthGuard)
  .compile();
```

Use `overrideGuard` for any guard applied with `@UseGuards()`. For the global `APP_GUARD`, use `overrideProvider(APP_GUARD)` instead.

## `jest.mock` Must Come Before Imports in E2E Tests

When an e2e test uses `AppModule` and that module bootstraps a service backed by an external SDK, call `jest.mock(...)` at the top of the file — before any `import` statements that trigger module loading:

```typescript
// CORRECT — jest.mock at the very top, before imports
jest.mock('some-external-sdk', () => ({
  // minimal mock of what AppModule needs to bootstrap
}));

import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
```

If the mock is placed after the imports, the real SDK may initialise during `AppModule` bootstrap and throw before any test runs.

## Migration Regression Tests

Migration-only regression specs may live under `test/migrations/*.migration-spec.ts`. They are intentionally small structural tests and can be run with:

```bash
npx jest --config ./test/jest-integration.json --testRegex '.*migration-spec.ts$' --runInBand
```
