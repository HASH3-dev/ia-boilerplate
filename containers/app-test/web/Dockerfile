FROM node:24-alpine

WORKDIR /workspace

RUN apk add --no-cache curl

# Cache npm install layer — copy all workspace manifests before source
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci

COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

ARG NEXT_PUBLIC_FIREBASE_CONFIG
ENV NEXT_PUBLIC_FIREBASE_CONFIG=$NEXT_PUBLIC_FIREBASE_CONFIG
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
