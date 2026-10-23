import { test, expect, request } from "@playwright/test";
import path from "node:path";

const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

// Phase 3 验收链路：mirror 注册/验证 → mods 页 SSO（OIDC 授权码流 + consent）→
// 上传 jar（元数据自动填充）→ 详情页 → 团队与 PAT 管理。
test("mods SSO + user upload loop", async ({ page }) => {
  const rand = Date.now().toString(36);
  const email = `sso-${rand}@example.com`;
  const password = "sso-password-123";
  const playerName = `Sso${rand.slice(-8).toUpperCase()}`;

  // 1. mirror 注册 + 邮箱验证
  await page.goto("/en/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "SSO User");
  await page.fill("#playerName", playerName);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Account created")).toBeVisible({ timeout: 15_000 });

  const api = await request.newContext();
  let verifyUrl = "";
  await expect(async () => {
    const res = await api.get(`${MAILPIT}/api/v1/search?query=to:${email}`);
    const body = await res.json();
    expect(body.messages?.length ?? 0).toBeGreaterThan(0);
    const msg = await (await api.get(`${MAILPIT}/api/v1/message/${body.messages[0].ID}`)).json();
    const m = /https?:\/\/\S+\/account\/verify\?token=[a-f0-9]+/.exec(msg.Text ?? "");
    expect(m, "verify link missing").toBeTruthy();
    verifyUrl = m![0];
  }).toPass({ timeout: 30_000 });
  await page.goto(verifyUrl);
  await expect(page.getByText("Email verified")).toBeVisible({ timeout: 15_000 });

  // 2. mods 页 → SSO 登录（mirror OIDC login + consent）
  await page.goto("/en/mods");
  await page.getByRole("button", { name: "Sign in to mod site" }).click();
  await page.waitForURL(/\/oauth2\/login/, { timeout: 15_000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Approve" }).click();
  // callback → hoard 会话 cookie → 302 API 根（单域生产即站点首页）
  await page.waitForURL(/localhost:8090|127\.0\.0\.1:8090/, { timeout: 15_000 });

  // 3. 回到 mods 页显示登录态
  await page.goto("/en/mods");
  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 15_000 });

  // 4. 上传向导：表单留空的字段由 jar 元数据自动填充
  await page.getByRole("button", { name: "Upload mod" }).click();
  await page.waitForURL(/\/mods\/upload/);
  await page.locator("main input[type='text'], main input:not([type])").first().fill("E2E Test Mod");
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(process.cwd(), "e2e", "fixtures", "test-mod.jar"));
  await page.getByRole("button", { name: "Create project" }).click();

  // 5. 详情页：元数据填充可见（license MIT、loader fabric、版本 1.0.0）
  await page.waitForURL(/\/mods\/[^/]+$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "E2E Test Mod" })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("MIT").first()).toBeVisible();
  await expect(page.getByText("fabric").first()).toBeVisible();
  await expect(page.getByText("1.0.0").first()).toBeVisible();
  await expect(page.getByText("1.20.1").first()).toBeVisible();

  // 6. 团队与 PAT：建团队 + 建令牌（明文仅一次）
  await page.goto("/en/mods/settings");
  await page.getByPlaceholder("Team name").fill(`team-${rand}`);
  await page.getByRole("button", { name: "Create team" }).click();
  await expect(page.getByText(`team-${rand}`).first()).toBeVisible({ timeout: 15_000 });

  // PAT 名称输入 = 令牌区第一个文本输入（团队名输入已填过，用 section 定位）
  const patSection = page.locator("section").filter({ hasText: "Personal access tokens" });
  await patSection.locator("input").first().fill("ci-token");
  await page.getByRole("button", { name: "Create token" }).click();
  await expect(page.getByText(/mhp_/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("ci-token").first()).toBeVisible();
});
