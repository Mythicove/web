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
  const otherPlayer = await request.post("/api/isles/players/someone-else/pair", {
    headers: { Cookie: "mythic_session=website-session" },
    data: { server: "community" },
  });
  expect(otherPlayer.status()).toBe(403);
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  await page.getByRole("button", { name: "Generate linking code" }).click();
  await expect(page.getByRole("status").filter({ hasText: "/mythic link" })).toBeVisible();
  const pairText = await page.getByRole("status").filter({ hasText: "/mythic link" }).innerText();
  const code = /\/mythic link ([A-F0-9]{12})/.exec(pairText)![1];
  const generated = await request.post("/api/isles/admin/servers/community/bridge-token", {
    headers: { Authorization: "Bearer scenario-mirror-admin", "Content-Type": "application/json" },
  });
  expect(generated.ok()).toBe(true);
  const { token: bridgeToken } = await generated.json();
  const uuid = "95db2f25-60a5-4c75-adfb-a69de4db748e";
  const linked = await request.post("/api/isles/bridge/community/link", {
    headers: { Authorization: `Bearer ${bridgeToken}` },
    data: { code, uuid, name: "AliceInGame", platform: "java" },
  });
  expect(linked.status()).toBe(204);
  const observed = await request.post("/api/isles/bridge/community/heartbeat", {
    headers: { Authorization: `Bearer ${bridgeToken}` },
    data: {
      platform: "Paper",
      minecraft: "1.21.1",
      plugins: { WorldGuard: "7.0.12", ViaVersion: "5.12.2" },
      groups: [],
      protocolVersions: ["1.21.1"],
      players: [
        {
          uuid,
          name: "AliceInGame",
          clientVersion: "1.21.1",
          regions: [
            { id: "my-home", world: "world", role: "owner", centerX: 5, centerY: 70, centerZ: 5 },
          ],
        },
      ],
    },
  });
  expect(observed.status()).toBe(204);
  await page.reload();
  await expect(page.getByText("AliceInGame", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My WorldGuard regions" })).toBeVisible();
  await expect(page.getByText("my-home", { exact: false })).toBeVisible();
  await expect(page.getByText("Observed client version: 1.21.1")).toBeVisible();
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

test("catalog searches retain source, filters, versions and download provenance", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("/catalog");
  await page.getByLabel("Project name", { exact: true }).fill("Fabric");
  await page.getByLabel("Loader or platform").selectOption("fabric");
  await page.getByLabel("Game version", { exact: true }).fill("1.21.1");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fabric API" })).toBeVisible();
  await page.getByRole("button", { name: "Choose a version" }).click();
  await expect(page.getByRole("heading", { name: "Fabric 1.21.1 release" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download from publisher" })).toHaveAttribute(
    "href",
    "https://cdn.modrinth.com/test/fabric.jar",
  );
  await page.getByText("Upstream file hashes", { exact: true }).click();
  await expect(page.getByText("abcdef0123456789", { exact: true })).toBeVisible();
  await page.getByLabel("Source", { exact: true }).selectOption("hangar");
  await page.getByLabel("Project name", { exact: true }).fill("ViaVersion");
  await page.getByLabel("Loader or platform").selectOption("PAPER");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ViaVersion" })).toBeVisible();
  await page.getByRole("button", { name: "Choose a version" }).click();
  await expect(page.getByRole("link", { name: "Download from publisher" })).toHaveAttribute(
    "href",
    "https://hangarcdn.papermc.io/test/ViaVersion.jar",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const invalid = await request.get(
    "/api/isles/catalog/modrinth/search?q=Fabric&url=https://example.org",
  );
  expect(invalid.status()).toBe(400);
  await testInfo.attach("catalog-result.json", {
    body: JSON.stringify(
      {
        modrinthVersion: "fabric-release",
        hangarVersion: "5.0",
        downloadOrigin: "publisher",
        arbitraryTarget: invalid.status(),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
