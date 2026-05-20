---
paths:
  - "src/entrypoints/**/*.ts"
---

# Module Structure Pattern

When creating new modules, follow this structure:

```
entrypoints/{module}/
├── adapters/rest/
│   └── {module}.controller.ts       # HTTP endpoints
├── use-cases/
│   ├── {action}/
│   │   └── {action}.handler.ts      # Business logic
├── dto/
│   ├── {action}.request.dto.ts      # Input validation
│   └── {action}.response.dto.ts     # Output shape
├── guards/                           # Optional: custom guards
└── {module}.module.ts                # Module definition
```

## Handler Pattern

Handlers contain the business logic for a single use case. One handler per action.

```typescript
@Injectable()
export class CreateSomethingHandler {
  constructor(
    private readonly repository: SomeRepository,
  ) {}

  async handle(userId: string, dto: CreateSomethingDto): Promise<Something> {
    // 1. Validate business rules
    // 2. Call repository methods
    // 3. Return result
    const existing = await this.repository.findByUserId(userId);
    if (existing) throw new ConflictException();

    await this.repository.create(dto);
    return await this.repository.findById(dto.id);
  }
}
```

## Controller Pattern

Controllers are thin adapters that delegate to handlers. No business logic in controllers.

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

## Custom Decorators

- **`@Anonymous()`** - Marks endpoint as public (bypasses JwtAuthGuard)
- **`@LoggedUser()`** - Injects authenticated user from request
- **`@Trim()`** - Removes whitespace from string fields in DTOs
