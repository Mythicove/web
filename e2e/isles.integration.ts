import { test, expect } from "@playwright/test";

test("administrator publishes a server; anonymous players see public information only", async ({
  page,
  request,
}, testInfo) => {
  const denied = await request.get("/api/isles/admin/config");
  expect(denied.status()).toBe(401);
  const forged = await request.put("/api/isles/admin/servers/test", {
    headers: { Authorization: "Bearer scenario-mirror-admin", Origin: "https://another.example" },
    data: { name: "Forged" },
  });
  expect(forged.status()).toBe(403);

  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByLabel("ID", { exact: true }).fill("community");
  await page.getByLabel("Name", { exact: true }).fill("Community survival");
  await page.getByLabel("Description", { exact: true }).fill("A shared world for our players.");
  await page.getByLabel("Player connection address", { exact: false }).fill("127.0.0.1:1");
  await page.getByLabel("Visible to players").check();
  await page.getByRole("button", { name: "Add link" }).click();
  await page.getByLabel("Link label", { exact: true }).fill("Explore the world");
  await page.getByLabel("Kind (BlueMap, Plan, guide…)").fill("BlueMap");
  await page.getByLabel("Service URL", { exact: true }).fill("https://map.example.org/");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  await page.goto("/servers");
  await expect(page.getByRole("heading", { name: "Community survival" })).toBeVisible();
  await page.getByRole("button", { name: "Server details" }).click();
  await expect(page.getByRole("heading", { name: "Community survival" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the world/ })).toHaveAttribute(
    "href",
    "https://map.example.org/",
  );
  await expect(page.getByText("Connection could not be confirmed", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("server-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  const publicData = await (await request.get("/api/isles/servers")).json();
  expect(publicData[0]).not.toHaveProperty("connectionId");
  expect(publicData[0]).not.toHaveProperty("packwizUrl");
  await testInfo.attach("scenario-result.json", {
    body: JSON.stringify(
      {
        anonymousAdmin: denied.status(),
        foreignOriginWrite: forged.status(),
        publishedName: publicData[0].name,
        link: "BlueMap",
        privateBindingsExposed: false,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
