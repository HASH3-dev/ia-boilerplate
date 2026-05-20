---
paths:
  - "src/repositories/**/*.ts"
---

# Repository Pattern

All repositories extend `BaseAbstractRepository` which provides transaction support and common functionality.

## Repository Structure

```typescript
@Injectable()
export class ItemRepository extends BaseAbstractRepository {
  constructor() {
    super(ItemRepository); // REQUIRED for transactioning to work
  }

  async findById(id: string): Promise<Item | null> {
    const record = await this.knex
      .select('*')
      .from('items')
      .where('id', id)
      .first();

    return this.itemFactory(record);  // Use factory to map DB → Entity
  }

  private itemFactory(record: any): Item | null {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      title: record.title,
      description: record.description,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
```

## Using Transactions

Transactions allow multiple database operations to be atomic - either all succeed or all fail.

```typescript
@Injectable()
export class SomeHandler {
  @InjectKnex() private readonly knex: Knex;

  constructor(private readonly itemRepository: ItemRepository) {}

  async handle() {
    await this.knex.transaction(async (trx) => {
      const repoInTrx = this.itemRepository.transactioning(trx);
      await repoInTrx.create(...);
      // All operations use same transaction
    });
  }
}
```

## Entity Factory Pattern

**CRITICAL**: All repositories MUST use an explicit private factory method to convert database records to entity objects. Never return raw database records directly.

### Why Factory Pattern?

- **Type Safety**: Ensures handlers receive proper camelCase entities
- **Explicit Mapping**: Each field is mapped manually, making conversions visible and maintainable
- **Consistency**: Database uses snake_case, TypeScript uses camelCase - factory handles conversion
- **Single Responsibility**: Factory encapsulates all mapping logic in one place

### Factory Method Rules

1. **Must be private** - Factory is an internal implementation detail
2. **Must handle null** - Return `null` if record is `null` or `undefined`
3. **Must map explicitly** - Map each field individually (no automatic mapping)
4. **Must convert naming** - `snake_case` (DB) → `camelCase` (Entity)
5. **Must be positioned last** - Private methods go at the end of the class

### Factory Pattern Example

```typescript
@Injectable()
export class ItemRepository extends BaseAbstractRepository {
  constructor() {
    super(ItemRepository);
  }

  async findById(id: string): Promise<Item | null> {
    const record = await this.knex
      .select('*')
      .from('items')
      .where('id', id)
      .first();

    return this.itemFactory(record);  // ✅ Always use factory
  }

  private itemFactory(record: any): Item | null {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      title: record.title,
      description: record.description,       // snake_case → camelCase when needed
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
```

### For Array Results

When returning multiple records, map each one through the factory:

```typescript
async findAll(): Promise<Item[]> {
  const records = await this.knex.select('*').from('items');

  return records.map(record => this.itemFactory(record)).filter(Boolean) as Item[];
}
```

## Important Rules

- **ALWAYS call `super(RepositoryClass)` in constructor** - Required for transactions
- **ALWAYS use factory methods for read operations** - Never return raw database records
- **Never write Knex queries in handlers** - All queries must be in repository methods
- **Return `null` for not found** - Use `null` instead of throwing exceptions
- **Map explicitly in factory** - Each field must be mapped individually (no automatic mapping)
- **Private methods at the end** - Factory methods must be private and positioned after all public methods
