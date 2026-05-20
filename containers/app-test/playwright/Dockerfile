FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /tests

# Install only playwright test runner — no workspace needed
RUN npm init -y && npm install --save-dev @playwright/test@1.52.0 --ignore-scripts

COPY apps/web/playwright.config.ts ./
COPY apps/web/e2e ./e2e

CMD ["npx", "playwright", "test", "--reporter=list"]
