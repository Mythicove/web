import { expect, request, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:8090";
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

// ADR-0012：启动器登录只认「玩家名 + 该玩家的独立密码」。
// 这条链路锁住四件事：独立密码能在账号页建出来、主密码进不了启动器、
// 邮箱不能当启动器用户名、撤销凭证会立刻销毁它建立的会话（而不是等令牌自然过期）。
test("launcher sign-in uses a per-player credential, not the master password", async ({ page }) => {
  const rand = Date.now().toString(36);
  const email = `launcher-${rand}@example.com`;
  const password = "site-password-123";
  const launcherPassword = "launcher-password-123";
  const playerName = `LCH${rand.slice(-8).toUpperCase()}`;

  // 1. 注册 → 邮箱验证（与 skin-flow 同一条路）
  await page.goto("/register");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#nickname", "Launcher Tester");
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
    expect(m, "verify link not found in mail body").toBeTruthy();
    verifyUrl = m![0];
  }).toPass({ timeout: 30_000 });
  await page.goto(verifyUrl);
  await expect(page.getByText("Email verified")).toBeVisible({ timeout: 15_000 });

  // 2. 登录网站（主密码），在账号页为该玩家建一条独立密码
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("main").getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Signed in.")).toBeVisible({ timeout: 15_000 });

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Launcher sign-in" })).toBeVisible({
    timeout: 15_000,
  });
  // 没有独立密码时必须说清楚后果，而不是留一个静默的坑
  await expect(page.getByText(/no launcher password yet/)).toBeVisible();
  await page.fill("#cred-name", "e2e desktop");
  await page.fill("#cred-password", launcherPassword);
  await page.getByRole("button", { name: "Add launcher password" }).click();
  await expect(page.getByText("e2e desktop")).toBeVisible({ timeout: 15_000 });

  // 3. 启动器侧：玩家名 + 独立密码可以进；主密码与邮箱都不行
  const auth = (username: string, pw: string) =>
    api.post(`${API}/authserver/authenticate`, { data: { username, password: pw } });

  const ok = await auth(playerName, launcherPassword);
  expect(ok.status()).toBe(200);
  const body = await ok.json();
  expect(body.selectedProfile?.name).toBe(playerName);
  // 一条独立密码只证明它所属的那个玩家，同账号下别的玩家不被列出
  expect(body.availableProfiles).toHaveLength(1);
  const gameToken = body.accessToken as string;

  expect((await auth(playerName, password)).status(), "master password at the launcher").toBe(403);
  expect((await auth(email, password)).status(), "email as a launcher username").toBe(403);
  expect((await auth(email, launcherPassword)).status(), "email + launcher password").toBe(403);

  // 4. 撤销 → 该凭证建立的会话立刻失效
  await page.getByRole("button", { name: "Revoke" }).click();
  const dialog = page.locator('[role="alertdialog"], [role="dialog"]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Revoked/)).toBeVisible({ timeout: 15_000 });

  expect((await auth(playerName, launcherPassword)).status(), "revoked credential").toBe(403);
  const invalidated = await api.post(`${API}/authserver/validate`, {
    data: { accessToken: gameToken },
  });
  expect(invalidated.status(), "session created by the revoked credential").toBe(403);

  // 网站会话不受影响：撤销启动器凭证不会把浏览器踢下线
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Launcher sign-in" })).toBeVisible({
    timeout: 15_000,
  });
});
