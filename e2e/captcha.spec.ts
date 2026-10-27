import { expect, test } from "@playwright/test";

// 这两个 mirror 实例由 e2e 工作流单独拉起（内存存储，不影响主实例）：
// - API：driver=cap 且配置完整，siteverify 指向 e2e/fixtures/fake-cap-siteverify.mjs
// - BROKEN：driver=cap 但缺 secret/实例地址 ⇒ 验证码无法生效
const API = process.env.E2E_CAP_API_URL ?? "http://localhost:18082";
const BROKEN = process.env.E2E_CAP_BROKEN_API_URL ?? "http://localhost:18083";
const GOOD_TOKEN = process.env.E2E_CAP_TOKEN ?? "e2e-cap-token";

const regBody = (suffix: string, extra: Record<string, unknown> = {}) => ({
  email: `cap-${suffix}-${Date.now()}@e2e.local`,
  password: "captcha-pass-123",
  nickname: "CapTester",
  playerName: `Cap${suffix}${Date.now().toString().slice(-5)}`,
  ...extra,
});

test("cap captcha is advertised and enforced on register", async ({ request }) => {
  const req = await request.get(`${API}/api/register-requirements`);
  expect(req.ok()).toBeTruthy();
  const requirements = await req.json();
  expect(requirements.captcha).toBe("cap");
  expect(requirements.captchaSiteKey).not.toBe("");
  expect(requirements.captchaCapUrl).not.toBe("");

  // 没有 token → 拒绝
  const missing = await request.post(`${API}/account/register`, { data: regBody("a") });
  expect(missing.status()).toBe(400);

  // token 错误（siteverify 返回 success:false）→ 拒绝
  const wrong = await request.post(`${API}/account/register`, {
    data: regBody("b", { captchaToken: "not-the-token" }),
  });
  expect(wrong.status()).toBe(400);

  // token 正确 → 放行
  const ok = await request.post(`${API}/account/register`, {
    data: regBody("c", { captchaToken: GOOD_TOKEN }),
  });
  expect(ok.status()).toBe(201);
});

// 回归锁：驱动配了但实例没建成时，既不能谎报"有验证码"，也不能静默放行注册。
test("misconfigured captcha fails closed instead of silently passing", async ({ request }) => {
  const req = await request.get(`${BROKEN}/api/register-requirements`);
  expect(req.ok()).toBeTruthy();
  const requirements = await req.json();
  expect(requirements.captcha).toBe("");
  expect(requirements.captchaSiteKey).toBe("");
  expect(requirements.captchaCapUrl).toBe("");

  const res = await request.post(`${BROKEN}/account/register`, {
    data: regBody("broken", { captchaToken: GOOD_TOKEN }),
  });
  expect(res.status()).toBe(503);
});
