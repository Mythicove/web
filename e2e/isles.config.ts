import { defineConfig } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const token = "isles-test-service-token-32-characters";
const base = "http://localhost:19185";
export default defineConfig({
  testDir: ".",
  testMatch: "isles.integration.ts",
  timeout: 120_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: base, locale: "en-US", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node e2e/isles-upstream.mjs",
      cwd: "..",
      url: "http://127.0.0.1:19186/healthz",
      timeout: 30_000,
    },
    {
      command: "go run ./cmd/isles",
      cwd: "../../mythic-isles",
      url: "http://127.0.0.1:19187/healthz",
      timeout: 60_000,
      env: {
        GOWORK: "off",
        ISLES_LISTEN: "127.0.0.1:19187",
        ISLES_ADMIN_TOKEN: token,
        ISLES_SECRET_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        ISLES_DATA_DIR: mkdtempSync(join(tmpdir(), "isles-e2e-")),
      },
    },
    {
      command: "pnpm dev --hostname localhost --port 19185",
      cwd: "..",
      url: `${base}/api/isles/servers`,
      timeout: 180_000,
      stdout: "pipe",
      env: {
        ISLES_URL: "http://127.0.0.1:19187",
        ISLES_ADMIN_TOKEN: token,
        API_URL_INTERNAL: "http://127.0.0.1:19186",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:19186",
        NEXT_PUBLIC_WEB_URL: base,
        BLOCK_BOTS: "false",
      },
    },
  ],
});
