import { test, expect } from "@playwright/test";

// Placeholder auth-flow spec — implement once auth pages are wired up.
test("public landing page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).not.toBeNull();
});
