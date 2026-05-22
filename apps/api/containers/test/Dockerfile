FROM node:24-alpine

WORKDIR /workspace

ENV NODE_ENV=test

RUN apk add --no-cache postgresql-client bash

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api

CMD ["bash", "scripts/test/run-in-container.sh"]
