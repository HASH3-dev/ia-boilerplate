---
paths:
  - "src/entrypoints/**/*.ts"
---

# Authentication

This project uses NestJS guards for authentication. The concrete guard implementation (Firebase, JWT, OAuth, etc.) is project-specific and not defined here.

## Guards

`JwtAuthGuard` is registered as a global `APP_GUARD` in `AuthModule`. All routes are protected by default.

Use `@Anonymous()` to opt out of the global guard for public endpoints.

## Custom Decorators

- **`@Anonymous()`** — Marks an endpoint as public (bypasses the global guard)
- **`@LoggedUser()`** — Injects the authenticated user from the request

### Usage

```typescript
// Public endpoint — no auth required
@Anonymous()
@Get('health')
async health() { ... }

// Protected endpoint — guard runs automatically
@Get('profile')
async profile(@LoggedUser() user: User) { ... }

// Route-level guard override (bypasses global guard, applies a different one)
@Anonymous()
@UseGuards(SomeOtherGuard)
async myRoute() { ... }
```

## Creating a Custom Guard

```typescript
@Injectable()
export class MyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // validate token, session, etc.
    return true;
  }
}
```

Register as global guard in a module:

```typescript
{
  provide: APP_GUARD,
  useClass: MyAuthGuard,
}
```

## Overriding Guards in Tests

When a controller uses a route-level guard, replace it with a `ContractGuard` that simulates the guard without calling external services:

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

// In TestingModule:
.overrideGuard(MyAuthGuard)
.useClass(ContractAuthGuard)
```

For the global `APP_GUARD`, use `overrideProvider(APP_GUARD)` instead of `overrideGuard`.
