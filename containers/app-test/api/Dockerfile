FROM node:24-alpine

WORKDIR /workspace

RUN apk add --no-cache curl postgresql-client

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
