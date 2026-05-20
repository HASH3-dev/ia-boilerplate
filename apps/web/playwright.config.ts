import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // ----------------------------------------------------------------
    // setup: logs in once and writes .auth/user.json
    // Must run after auth-flow because each OTP login revokes all previous
    // backend sessions for the user (sessionRepository.revokeAllForUser).
    // Running setup last ensures the stored session is always fresh.
    // ----------------------------------------------------------------
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
      dependencies: ["auth-flow"],
    },

    // ----------------------------------------------------------------
    // authenticated: kit feature tests — start with stored session
    // ----------------------------------------------------------------
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      testMatch: /e2e\/kits\/.+\.spec\.ts/,
      dependencies: ["setup"],
    },

    // ----------------------------------------------------------------
    // session: session refresh and redirect tests — stored session
    // ----------------------------------------------------------------
    {
      name: "session",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      testMatch: /e2e\/session\/.+\.spec\.ts/,
      dependencies: ["setup"],
    },

    // ----------------------------------------------------------------
    // auth-flow: OTP login tests — real Firebase, no stored session
    // ----------------------------------------------------------------
    {
      name: "auth-flow",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /e2e\/auth\/.+\.spec\.ts/,
    },
  ],
});
