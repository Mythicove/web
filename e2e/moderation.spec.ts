import { expect, test, request } from "@playwright/test";
import path from "node:path";

const API = process.env.E2E_API_URL ?? "http://localhost:8090";
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

// 举报 → 管理后台（会话登录）→ 皮肤审核/举报处理 → 审计日志可见。
test("report and moderation loop", async ({ page }) => {
  const rand = Date.now().toString(36);
  const email = `mod-${rand}@example.com`;
  const password = "mod-password-123";
  const playerName = `MOD${rand.slice(-8).toUpperCase()}`;
  const description = `mod-desc-${rand}`;

  // 注册 + 验证 + 登录
  await page.goto("/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "Mod User");
  await page.fill("#playerName", playerName);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created")).toBeVisible({ timeout: 15_000 });

  const api = await request.newContext();
  let verifyUrl = "";
  await expect(async () => {
    const res = await api.get(`${MAILPIT}/api/v1/search?query=to:${email}`);
    const body = await res.json();
    expect(body.messages?.length ?? 0).toBeGreaterThan(0);
    const id = body.messages[0].ID;
    const msg = await (await api.get(`${MAILPIT}/api/v1/message/${id}`)).json();
    const m = /https?:\/\/\S+\/account\/verify\?token=[a-f0-9]+/.exec(msg.Text ?? "");
    expect(m, "verify link missing").toBeTruthy();
    verifyUrl = m![0];
  }).toPass({ timeout: 30_000 });
  await page.goto(verifyUrl);
  await expect(page.getByText("Email verified")).toBeVisible({ timeout: 15_000 });

  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  // 限定 main：页头也有一个同名 "Sign in" 按钮（导航用），不限定会触发 strict mode 冲突
  await page.getByRole("main").getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/$/);

  // 上传并发布到皮肤库
  await page.goto("/profile");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(process.cwd(), "public", "skins", "steve.png"));
  await page.getByRole("button", { name: /Upload skin/ }).click();
  await expect(page.getByText("Uploaded")).toBeVisible({ timeout: 15_000 });
  await page.fill("#publishDesc", description);
  await page.getByRole("button", { name: /Publish to skin library/ }).click();
  await expect(page.getByText("Published to the skin library.")).toBeVisible({
    timeout: 15_000,
  });

  // 详情页举报自己的皮肤（举报流不限制目标作者）
  await page.goto(`/skins?q=${description}`);
  await page.locator("a[href*='/skins/']").first().click();
  await page.waitForURL(/\/skins\/[^/]+$/);
  await page.getByRole("button", { name: "Report" }).click();
  await page.getByPlaceholder(/Reason/).fill("e2e report reason");
  await page.getByRole("button", { name: /Submit report/ }).click();
  await expect(page.getByText(/Reported, thanks/)).toBeVisible({ timeout: 15_000 });

  // 提升为管理员（管理端 API + 静态 token），随后以会话身份进后台
  const me = await api.get(`${API}/auth/me`).catch(() => null);
  void me;
  const users = await (
    await api.get(`${API}/api/admin/users?limit=100`, {
      headers: { Authorization: "Bearer e2e-admin" },
    })
  ).json();
  const target = users.users.find((u: { email: string }) => u.email === email);
  expect(target).toBeTruthy();
  const promote = await api.patch(`${API}/api/admin/users/${target.id}`, {
    headers: { Authorization: "Bearer e2e-admin" },
    data: { role: "admin", status: "active" },
  });
  expect(promote.status()).toBeLessThan(300);

  // 管理后台：皮肤审核页签处理该条目
  await page.goto("/admin");
  await expect(page.getByText(/Using your signed-in admin session/)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("tab", { name: /Skin moderation/ }).click();
  // 默认过滤为审核中；本部署未开 MIRROR_SKIN_REVIEW，发布即上架 → 切到 listed
  await page.getByRole("button", { name: "listed", exact: true }).click();
  const row = page.locator("tr", { hasText: playerName }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole("button", { name: "Unlist" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 15_000 });

  // 举报页签驳回
  await page.getByRole("tab", { name: "Reports" }).click();
  const repRow = page.locator("tr", { hasText: "e2e report reason" }).first();
  await expect(repRow).toBeVisible({ timeout: 15_000 });
  await repRow.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByText("Saved").first()).toBeVisible({ timeout: 15_000 });

  // 审计日志含本次管理操作
  await page.getByRole("tab", { name: /Audit/ }).click();
  await expect(page.locator("tr", { hasText: "admin.skin.status" }).first()).toBeVisible({
    timeout: 15_000,
  });
});
