import { expect, test } from "@playwright/test";

// UI 杂项：主题切换持久化、移动端导航、法务页。
test("theme switch persists across reload", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: /Light|浅色/ }).click();
  await page.waitForTimeout(500);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(248, 250, 252)");
  await page.reload();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(bg);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    "light",
  );
});

test("mobile nav opens and navigates", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: /Open menu|打开菜单/ }).click();
  await page.getByRole("menuitem", { name: /Skins|皮肤库/ }).click();
  await page.waitForURL(/\/skins/);
  await expect(page.locator("h1")).toBeVisible();
  // 无横向溢出
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await ctx.close();
});

test("legal pages render with cross nav", async ({ page }) => {
  await page.goto("/legal/terms");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page
    .getByRole("link", { name: /Privacy|隐私/ })
    .first()
    .click();
  await page.waitForURL(/\/legal\/privacy/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
