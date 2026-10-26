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
  await page.goto("/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "SSO User");
  await page.fill("#playerName", playerName);
  await page.getByRole("button", { name: "Create account" }).click();
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

  // 2. n 合一共享登录：站点登录后 mods 页静默同步 hoard 会话（first-party 免同意）
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  // 限定 main：页头也有一个同名 "Sign in" 按钮（导航用），不限定会触发 strict mode 冲突
  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();
  await page.goto("/mods");
  await page.waitForURL(/\/mods/, { timeout: 20_000 });
  // 静默 SSO 会瞬时经过 IdP（:8090）再回到 /mods。**不要断言中间态 URL**：
  // 跳转链可能在断言注册前就跑完，浏览器已回到 :3110 → 必然超时。
  // 这里直接等最终结果：hoard 会话建立后页面出现登录态。
  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 20_000 });

  // 3. 回到 mods 页显示登录态
  await page.goto("/mods");
  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 15_000 });

  // 4. 上传向导：表单留空的字段由 jar 元数据自动填充
  await page.getByRole("button", { name: "Upload mod" }).click();
  await page.waitForURL(/\/mods\/upload/);
  await page
    .locator("main input[type='text'], main input:not([type])")
    .first()
    .fill("E2E Test Mod");
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
  await page.goto("/mods/settings");
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
