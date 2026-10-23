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
  await page.goto("/en/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "E2E User");
  await page.fill("#playerName", playerName);
  await page.getByRole("button", { name: "Submit" }).click();
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
  await page.goto("/en/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Signed in.")).toBeVisible({ timeout: 15_000 });

  // 5. 上传皮肤
  await page.goto("/en/profile");
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
  await page.goto(`/en/skins?q=${description}`);
  const card = page
    .locator("main a[href*='/skins/']")
    .filter({ hasText: playerName })
    .first();
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
  await expect(
    page.getByRole("button", { name: `Applied to ${playerName}` }),
  ).toBeVisible({ timeout: 15_000 });
});
