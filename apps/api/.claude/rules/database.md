---
paths:
  - "migrations/**/*.ts"
  - "src/repositories/**/*.ts"
---

# Database Conventions

## Table Naming

- Use snake_case: `users`, `user_profiles`, `audit_logs`
- Timestamps: `created_at`, `updated_at` (auto-managed by Knex)
- UUIDs: Use `gen_random_uuid()` for primary keys

## Column Naming in Knex vs TypeScript

- **Database**: `first_name`, `user_id`, `created_at`
- **TypeScript entities**: `firstName`, `userId`, `createdAt`
- **Repository layer converts between conventions**
- **DATE columns**: normalize repository output to API-safe `YYYY-MM-DD` strings when the public contract expects date-only values. PostgreSQL/Knex may return either a string or a `Date` depending on runtime/parser configuration.

Example:
```typescript
async createItem(item: Partial<Item>): Promise<void> {
  await this.knex('items').insert({
    title: item.title,
    description: item.description,
    user_id: item.userId,    // Convert to snake_case
  });
}
```

## Migration Workflow

```bash
# Create new migration
npm run migrate:make add_some_table

# Edit the generated file in migrations/
# Then run it
npm run migrate:latest

# If something goes wrong
npm run migrate:rollback
```

## Migration File Template

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
