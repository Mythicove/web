import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:8090";

// 第三方（非 first-party）客户端必须走前端同意页；first-party 免同意由 mods-sso 覆盖。
test("third-party client requires frontend consent", async ({ page, request }) => {
  const secret = "consent-3p-secret";
  const hash = Buffer.from(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)),
  ).toString("hex");
  const reg = await request.post(`${API}/api/admin/oauth-clients`, {
    headers: { Authorization: "Bearer e2e-admin" },
    data: {
      id: "consent-3p",
      name: "Consent Third Party",
      secret_hash: hash,
      redirect_uris: ["http://localhost:8090/cb"],
      grant_types: ["authorization_code"],
      scopes: ["openid", "profile", "email"],
      public: false,
      first_party: false,
    },
  });
  expect([200, 201]).toContain(reg.status());

  // 注册并登录一个普通用户，使 IdP 有会话
  const email = `consent3p-${Date.now()}@e2e.local`;
  const password = "consent-pass-123";
  const resp = await request.post(`${API}/account/register`, {
    data: { email, password, nickname: "C3P", playerName: "C3P" + Date.now().toString().slice(-5) },
  });
  expect(resp.status()).toBeGreaterThanOrEqual(200);
  expect(resp.status()).toBeLessThan(300);

  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  // 限定 main：页头也有一个同名 "Sign in" 按钮（导航用），不限定会触发 strict mode 冲突
  await page.getByRole("main").getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/$/);

  // 直接发起第三方授权：应落到前端同意页（而非直接发码）
  await page.goto(
    `${API}/oauth2/auth?client_id=consent-3p&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2Fcb&response_type=code&scope=openid+profile+email&state=xyz&nonce=n1`,
  );
  await page.waitForURL(/\/oauth\/consent/);
  await expect(page.getByText("Consent Third Party")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();

  // 拒绝 → 授权端点经 RP redirect_uri 回传 access_denied
  await page.getByRole("button", { name: "Deny" }).click();
  await page.waitForURL((u) => u.href.includes("access_denied"), { timeout: 15_000 });
});
