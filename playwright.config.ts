import { defineConfig } from "@playwright/test";

// E2E 依赖外部起好的全栈（web:3110 + mirror:18080 + mailpit:8025/1025），
// 编排见 .github/workflows/e2e.yml 或 e2e/README.md。
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3110",
    // locale 前缀默认关闭（never），语言经 Accept-Language 决定；固定 en 保证断言稳定
    locale: "en-US",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
