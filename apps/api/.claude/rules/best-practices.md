# Common Pitfalls

Things to avoid when developing:

## Authentication

1. **Don't forget `@Anonymous()`** - Public endpoints need this decorator to bypass the global auth guard

## Database

2. **Don't query database in handlers** - Always use repository methods
3. **Don't skip migrations** - Always create migrations for schema changes
4. **Constructor in repositories** - Must call `super(RepositoryClass)` for transactions

## TypeScript

5. **Don't use `import { Type }` in decorators** - Use `import type { Type }`

## Dependencies

6. **Load `asdf` before Node commands when needed** - If `node`, `npm`, or `npx` are missing, use `source ~/.asdf/asdf.sh && <command>` before assuming Node is not installed

## Code Organization

7. **Don't put business logic in controllers** - Controllers delegate to handlers
8. **Don't create multiple handlers for one use case** - One handler per action
9. **Don't return raw DB records** - Always use factory methods to map to entities
10. **Don't put business rules in DTO response mappers** - DTO helpers should shape output only. Compute use-case rules in handlers, or in `@shared/utils` when multiple handlers need the same rule, then pass the computed value into the mapper.

## Class Structure

All classes must follow this member ordering convention:

```typescript
class ClassName {
  // 1. Static properties
  static staticProperty: string;

  // 2. Instance properties (visibility order: public → protected → private)
  public publicProperty: string;
  protected protectedProperty: string;
  private privateProperty: string;

  // 3. Constructor
  constructor() {}

  // 4. Static methods
  static staticMethod(): void {}

  // 5. Public methods
  public publicMethod(): void {}

  // 6. Protected methods
  protected protectedMethod(): void {}

  // 7. Private methods (including factories)
  private privateMethod(): void {}
}
```

**Key Points:**
- Static members always come first
- Properties before methods
- Within each group, order by visibility: public → protected → private
- Constructor after properties, before methods
- Factory methods are private and go at the end

## Best Practices

- Always validate input with DTOs and class-validator
- DTO fields must define explicit lower and upper bounds. Strings need minimum and maximum length decorators, and numeric fields need minimum and maximum value decorators, so the API cannot accept absurdly large values for database inserts. **Exception:** when a `@Matches(regex)` decorator already constrains the string to an exact fixed length (e.g. a date format regex like `/^\d{4}-\d{2}-\d{2}$/`), explicit `@MinLength`/`@MaxLength` are redundant and not required.
- DTO string fields must trim incoming values, using the project `@Trim()` decorator or an equivalent established transformer, to avoid leading or trailing whitespace issues.
- Use transactions for multi-step database operations
- Use explicit factory methods to convert DB records to entities (never return raw records)
- Map each field individually in factory methods (no automatic mapping)
- Follow class member ordering convention (see Class Structure section)
- Follow the path alias conventions: `@repositories/*`, `@shared/*`, `@ports/*`, `@entrypoints/*`
- Use the project nullability aliases from `@shared/types/maybe.type`: `Maybe<T>` for `T | null`, `Optional<T>` for return values that intentionally produce `T | undefined`, and `Nullish<T>` for rare boundaries that intentionally accept or normalize both `null` and `undefined`.
- Do not use nullability aliases from `@shared/types/maybe.type` in response DTO classes or response DTO mapper signatures. Use explicit TypeScript unions such as `string | null` so the Nest Swagger plugin can emit nullable primitive/object schemas instead of generic object schemas.
- Do not use `Optional<T>` on optional properties or parameters. Prefer TypeScript's native `property?: T` and `parameter?: T` syntax there.
- Use descriptive names for handlers: `CreateItemHandler`, `ListItemsHandler`
- Keep handlers focused on a single responsibility
