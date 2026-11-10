import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "compass-ui.integration.ts",
  timeout: 60_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://localhost:19192", locale: "en-US", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm dev --host localhost --port 19192",
    cwd: "../../compass",
    url: "http://localhost:19192",
    timeout: 60_000,
  },
});
