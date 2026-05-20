---
paths:
  - "src/**/*.ts"
---

# TypeScript Configuration

## Important: isolatedModules and import type

Due to `isolatedModules: true` in tsconfig, you must use `import type` for types that are only used in type positions (decorators, type annotations).

### Wrong
```typescript
import { Knex } from 'knex';
@InjectKnex() protected readonly knex: Knex;
```

### Correct
```typescript
import type { Knex } from 'knex';
@InjectKnex() protected readonly knex: Knex;
```

## When to use import type

- When importing types/interfaces used only in type annotations
- When importing types used in decorator type parameters
- When importing types for function return types or parameter types
- Generally: if the import is erased at runtime, use `import type`

## When NOT to use import type

- When importing classes that are instantiated
- When importing decorators (like `@Injectable`, `@Controller`)
- When importing values or functions used at runtime
