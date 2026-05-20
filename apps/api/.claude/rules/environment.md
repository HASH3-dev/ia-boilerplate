---
paths:
  - "src/**/*.ts"
  - ".env*"
---

# Environment Variables

## Node.js Runtime

This project uses Node.js through `asdf`. Agent shells may not load the user's interactive shell setup, so `node`, `npm`, or `npx` can be missing from `PATH` even when Node is installed.

Before running Node.js commands, check:

```bash
node --version
npm --version
```

If unavailable, run commands through the `asdf` shell loader:

```bash
source ~/.asdf/asdf.sh && npm run build
source ~/.asdf/asdf.sh && npm run test
source ~/.asdf/asdf.sh && npm install
```

Do not treat `npm: command not found` as a missing project dependency until `~/.asdf/asdf.sh` has been loaded.

## Application Variables

Required variables in `.env`:

```env
# Database
DB_URI="postgresql://user:pass@localhost:5432/myproject_db"
DB_SCHEMA="public"
TEST_DB_URI="postgresql://user:pass@localhost:5432/myproject_test"

# Auth (adapt to your provider — e.g. JWT, OAuth, Firebase, etc.)
# JWT_SECRET="your-secret"
# ACCESS_TOKEN_TTL_SECONDS=600
# REFRESH_TOKEN_TTL_DAYS=30

# Application
NODE_ENV="develop"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000"

# Email (adapt to your provider — e.g. SMTP, Resend, SendGrid, etc.)
# EMAIL_FROM="no-reply@example.com"
# SMTP_HOST="smtp.example.com"
```

## Notes

- **`TEST_DB_URI`** must point to a disposable PostgreSQL database. Its name must contain `test`, `testing`, or `integration`. Integration tests may truncate tables and run migrations — never point at a shared database.
- **`NODE_ENV`** controls Swagger availability (only in `"develop"` mode).
- **`ALLOWED_ORIGINS`** is a comma-separated CORS allowlist.
- The HTTP bootstrap config trusts exactly one reverse proxy (`trust proxy = 1`); adjust if your deployment adds or removes proxy hops.
