FROM node:24.11.1-bookworm-slim

WORKDIR /workspace

ENV NODE_ENV=test

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api

CMD ["bash", "scripts/test/run-in-container.sh"]
