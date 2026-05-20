---
name: new-module
description: Create a complete NestJS feature module following Clean Architecture — controller, handlers, DTOs, entity, repository, and migration. Use when the user asks to create a new module, feature, or resource in the API.
---

# New Module Skill

This skill guides you through creating a complete feature module following Clean Architecture.

## Workflow: Adding a New Feature Module

When the user asks to create a new module, follow these steps:

### 1. Create Directory Structure

Create the module structure in `entrypoints/{module}/`:

```
entrypoints/{module}/
├── adapters/rest/
│   └── {module}.controller.ts
├── use-cases/
│   ├── {action}/
│   │   └── {action}.handler.ts
├── dto/
│   ├── {action}.request.dto.ts
│   └── {action}.response.dto.ts
└── {module}.module.ts
```

### 2. Create Entity and Repository

In `repositories/{entity}/`:

```
repositories/{entity}/
├── {entity}.entity.ts
└── {entity}.repository.ts
```

Repository must:
- Extend `BaseAbstractRepository`
- Call `super(RepositoryClass)` in constructor
- Use `import type { Knex }` for Knex type

### 3. Create Migration

```bash
npm run migrate:make add_{entity}_table
```

Migration template:
```typescript
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('table_name', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    // ... columns
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('table_name');
}
```

### 4. Define DTOs

Create request and response DTOs with class-validator decorators:

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSomethingDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 5. Implement Handlers

One handler per use case:

```typescript
@Injectable()
export class CreateSomethingHandler {
  constructor(
    private readonly repository: SomeRepository,
  ) {}

  async handle(userId: string, dto: CreateSomethingDto): Promise<Something> {
    // Business logic here
  }
}
```

### 6. Create Controller

Controller delegates to handlers:

```typescript
@Controller('something')
@ApiTags('something')
export class SomethingController {
  constructor(
    private readonly createHandler: CreateSomethingHandler,
  ) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ operationId: 'createSomething', summary: 'Create something' })
  async create(
    @Body() dto: CreateSomethingDto,
    @LoggedUser() user: User,
  ): Promise<Something> {
    return this.createHandler.handle(user.id, dto);
  }
}
```

### 7. Create Module

```typescript
@Module({
  imports: [],
  controllers: [SomethingController],
  providers: [
    SomethingRepository,
    CreateSomethingHandler,
    // ... other handlers
  ],
})
export class SomethingModule {}
```

### 8. Add Module to App

In `app.module.ts`:

```typescript
@Module({
  imports: [
    // ... existing modules
    SomethingModule,
  ],
})
export class AppModule {}
```

### 9. Run Migration

```bash
npm run migrate:latest
```

### 10. Test

- Test endpoint via Swagger (http://localhost:3000/docs)
- Verify authentication with Firebase token
- Check database records

## Checklist

- [ ] Directory structure created
- [ ] Entity and repository created
- [ ] Migration created and run
- [ ] DTOs defined with validation
- [ ] Handlers implemented
- [ ] Controller created
- [ ] Module created and added to AppModule
- [ ] Tests pass
- [ ] Swagger docs updated
