import { test, expect, request } from "@playwright/test";
import path from "node:path";

const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

// 全链路：注册 → 邮箱验证 → 登录 → 上传皮肤 → 发布到皮肤库 → 搜索(SSR) → 详情点赞/评论/应用。
test("skin station full loop", async ({ page }) => {
  const rand = Date.now().toString(36);
  const email = `e2e-${rand}@example.com`;
  const password = "e2e-password-123";
  const playerName = `E2E${rand.slice(-8).toUpperCase()}`;
  const description = `e2e-desc-${rand}`;

  // 1. 注册
  await page.goto("/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "E2E User");
  await page.fill("#playerName", playerName);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created")).toBeVisible({ timeout: 15_000 });

  // 2. 从 mailpit 取验证邮件里的链接（轮询直到到达）
  const api = await request.newContext();
  let verifyUrl = "";
  await expect(async () => {
    const res = await api.get(`${MAILPIT}/api/v1/search?query=to:${email}`);
    const body = await res.json();
    expect(body.messages?.length ?? 0).toBeGreaterThan(0);
    const id = body.messages[0].ID;
    const msg = await (await api.get(`${MAILPIT}/api/v1/message/${id}`)).json();
    const m = /https?:\/\/\S+\/account\/verify\?token=[a-f0-9]+/.exec(msg.Text ?? "");
    expect(m, "verify link not found in mail body").toBeTruthy();
    verifyUrl = m![0];
  }).toPass({ timeout: 30_000 });

  // 3. 点开验证链接（指向 web 前端）
  await page.goto(verifyUrl);
  await expect(page.getByText("Email verified")).toBeVisible({ timeout: 15_000 });

  // 4. 登录
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  // 限定 main：页头也有一个同名 "Sign in" 按钮（导航用），不限定会触发 strict mode 冲突
  await page.getByRole("main").getByRole("button", { name: "Sign in", exact: true }).click();
  // 等登录真正落地（跳回首页）："Signed in." 只是跳转前的一帧，断言它会与导航赛跑
  await page.waitForURL(/\/$/, { timeout: 15_000 });

  // 4b. 会话加固：token 不落 localStorage；httpOnly cookie 对 JS 不可读
  //（后续上传/发布步骤凭 cookie 认证成功，即证明 cookie 随请求携带）
  const raw = await page.evaluate(() => localStorage.getItem("mythicove-auth"));
  expect(raw).toBeTruthy();
  expect(raw).not.toContain("accessToken");
  const visibleCookies = await page.evaluate(() => document.cookie);
  expect(visibleCookies).not.toContain("mythic_session");
  // 玩家名不再随登录响应下发（网站会话不代表任何玩家，ADR-0012）：
  // 登录后由前端从 /account/players 补齐，故这里轮询等待而不是紧接着断言。
  await expect
    .poll(
      async () => {
        const stored = await page.evaluate(() => localStorage.getItem("mythicove-auth"));
        return stored ? ((JSON.parse(stored) as { playerName?: string }).playerName ?? "") : "";
      },
      { timeout: 15_000 },
    )
    .toBe(playerName);

  // 5. 上传皮肤
  await page.goto("/profile");
  await page
    .locator('input[type="file"]')
    .nth(0)
    .setInputFiles(path.join(process.cwd(), "public", "skins", "steve.png"));
  await page.getByRole("button", { name: "Upload skin" }).click();
  await expect(page.getByText("Uploaded")).toBeVisible({ timeout: 15_000 });

  // 6. 发布到皮肤库
  await page.fill('[placeholder="Describe this skin…"]', description);
  await page.getByRole("button", { name: "Publish to skin library" }).click();
  await expect(page.getByText("Published to the skin library.")).toBeVisible({ timeout: 15_000 });

  // 7. 皮肤库按描述搜索命中（SSR 渲染）
  await page.goto(`/skins?q=${description}`);
  const card = page.locator("main a[href*='/skins/']").filter({ hasText: playerName }).first();
  await expect(card).toBeVisible({ timeout: 15_000 });

  // 8. 详情页：点赞 → 评论 → 应用
  await card.click();
  await expect(page.getByRole("button", { name: /^Like/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /^Like/ }).click();
  await expect(page.getByRole("button", { name: /Liked \(1\)/ })).toBeVisible({ timeout: 15_000 });

  await page.fill('[placeholder="Add a comment"]', "e2e comment");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("e2e comment")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("E2E User").first()).toBeVisible();

  await page.getByRole("button", { name: "Apply to my skin" }).click();
  await expect(page.getByRole("button", { name: `Applied to ${playerName}` })).toBeVisible({
    timeout: 15_000,
  });
});
