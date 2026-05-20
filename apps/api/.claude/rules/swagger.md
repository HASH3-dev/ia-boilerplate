---
paths:
  - "src/entrypoints/**/*.controller.ts"
---

# Swagger Configuration

Swagger/OpenAPI documentation is auto-generated from DTOs and decorators.

## Access

- **Available only in development** (NODE_ENV=develop)
- **URL**: http://localhost:3000/docs

## Required Decorators

### On Controllers
```typescript
@Controller('something')
@ApiTags('something')
export class SomethingController {
  // ...
}
```

### On Endpoints
```typescript
@Post()
@ApiBearerAuth()                          // For protected endpoints
@HttpCode(HttpStatus.CREATED)
@ApiOperation({
  operationId: 'createSomething',         // Unique ID for the operation
  summary: 'Create something'             // Short description
})
async create(...) {
  // ...
}
```

Every endpoint in the application must have Swagger documentation with a specific description of what that endpoint does. Avoid generic summaries; document the endpoint contract clearly enough for frontend integration.

## Auto-Documentation

DTOs are automatically documented via `@nestjs/swagger` plugin in `nest-cli.json`. The plugin reads class-validator decorators and generates OpenAPI schemas.

No need to use `@ApiProperty()` - the plugin handles it automatically!
