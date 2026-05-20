FROM node:24.11.1-bookworm-slim

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Cache npm install layer — copy all workspace manifests before source
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx knex migrate:latest --knexfile knexfile.ts && node dist/main.js"]
