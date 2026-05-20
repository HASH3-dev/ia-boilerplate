---
paths:
  - "src/**/*.ts"
---

# Architecture Overview

This project follows **Clean Architecture** principles.

## Layer Structure

```
src/
├── entrypoints/        # Controllers and REST adapters
│   └── {module}/
│       ├── adapters/rest/{module}.controller.ts
│       ├── use-cases/{action}/{action}.handler.ts
│       ├── dto/*.dto.ts
│       └── {module}.module.ts
├── repositories/       # Data access layer (Knex)
│   └── {entity}/
│       ├── {entity}.entity.ts
│       └── {entity}.repository.ts
├── ports/              # External service integrations
│   └── firebase/       # Firebase Admin SDK
└── shared/             # Cross-cutting concerns
    ├── decorators/
    ├── types/
    └── utils/
```

## Critical Architectural Rules

1. **All database queries MUST be in repositories** - Never write inline Knex table queries (`.select`, `.insert`, `.update`, etc.) directly in handlers. Exception: handlers MAY inject `@InjectKnex()` and call `this.knex.transaction(async (trx) => { ... })` to manage transaction boundaries across multiple repository calls — this is the Unit of Work pattern and is the handler's responsibility, not the repository's. All actual queries inside the transaction must still go through repository methods via `repository.transactioning(trx)`.
2. **Handlers contain business logic** - Not services; one handler per use case
3. **Controllers delegate to handlers** - No business logic in controllers
4. **Use TypeScript path aliases** - `@repositories/*`, `@shared/*`, `@ports/*`, `@entrypoints/*`
