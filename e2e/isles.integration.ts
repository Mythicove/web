import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
  await page.getByLabel("Map tool", { exact: true }).selectOption("bluemap");
  await page
    .getByLabel("Browser map URL", { exact: false })
    .fill("http://127.0.0.1:19186/world-map#saved-camera");
  await page.getByRole("button", { name: "Add link" }).click();
  await page.getByLabel("Link label", { exact: true }).fill("Explore the world");
  await page.getByLabel("Kind (BlueMap, Plan, guide…)").fill("BlueMap");
  await page.getByLabel("Service URL", { exact: true }).fill("https://map.example.org/");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Test community", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Community survival", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Explore this server" })).toBeVisible();
  await expect(page.getByText("Yggdrasil API", { exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("community-home.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto("/servers");
  await expect(page.getByRole("heading", { name: "Community survival" })).toBeVisible();
  await page.getByRole("button", { name: "Server details" }).click();
  await expect(page.getByRole("heading", { name: "Community survival" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the world/ })).toHaveAttribute(
    "href",
    "https://map.example.org/",
  );
  await expect(page.getByText("Connection could not be confirmed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "World map", exact: true }).click();
  await expect(
    page.frameLocator("iframe").getByRole("heading", { name: "Recorded map viewport" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open map in a new tab" })).toHaveAttribute(
    "href",
    "http://127.0.0.1:19186/world-map#saved-camera",
  );
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
          economy: {
            provider: "EssentialsX Economy",
            balance: 123.44999999999999,
            formatted: "$123.44",
            currency: "$",
          },
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
  await expect(page.getByRole("heading", { name: "Game balance" })).toBeVisible();
  await expect(page.getByText("$123.44", { exact: true })).toBeVisible();
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

test("administrator controls Chunky through the durable Bridge boundary and sees observed progress", async ({
  page,
  request,
}, testInfo) => {
  // Recorded from the real Chunky/Purpur scenario. Only the external game
  // provider is replayed; Web, BFF, Isles, authorization and storage stay real.
  const observations = JSON.parse(
    await readFile(join(__dirname, "fixtures", "chunky-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const path = "/api/isles/admin/servers/pregeneration";
  expect(
    (
      await request.put(path, {
        headers,
        data: {
          name: "Generation control",
          edition: "java",
          address: "127.0.0.1:1",
          published: false,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const rotated = await request.post(`${path}/bridge-token`, { headers, data: {} });
  const { token } = await rotated.json();
  const bridgeHeaders = { Authorization: `Bearer ${token}` };
  const bridge = "/api/isles/bridge/pregeneration";
  const heartbeat = async (world: unknown) => {
    expect(
      (
        await request.post(`${bridge}/heartbeat`, {
          headers: bridgeHeaders,
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { Chunky: "1.4.40" },
            groups: [],
            players: [],
            chunky: [world],
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat({ world: "world", state: "idle" });
  const denied = await request.post(`${path}/chunky`, {
    data: { action: "start", world: "world", shape: "square", radius: 32 },
  });
  expect(denied.status()).toBe(401);
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByRole("button", { name: "Generation control", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  const panel = page.getByRole("region", { name: "World pregeneration" });
  await expect(panel.getByText("Generation state: No saved task", { exact: true })).toBeVisible();
  await panel.getByLabel("Radius (blocks)", { exact: true }).fill("1024");
  await panel.getByLabel("Center X (blocks)").fill("10000");
  await panel.getByLabel("Center Z (blocks)").fill("10000");
  await panel.getByRole("button", { name: "Start pregeneration" }).click();
  const finish = async (action: string, observation: unknown) => {
    const pending = await (await request.get(`${bridge}/tasks`, { headers: bridgeHeaders })).json();
    const task = pending.find((t: { chunky?: { action: string } }) => t.chunky?.action === action);
    expect(task).toBeTruthy();
    expect(task.chunky.world).toBe("world");
    expect(
      (
        await request.post(`${bridge}/tasks/${task.id}/claim`, { headers: bridgeHeaders, data: {} })
      ).status(),
    ).toBe(204);
    expect(
      (
        await request.post(`${bridge}/tasks/${task.id}/claim`, { headers: bridgeHeaders, data: {} })
      ).status(),
    ).toBe(409);
    expect(
      (
        await request.post(`${bridge}/tasks/${task.id}`, {
          headers: bridgeHeaders,
          data: { success: true },
        })
      ).status(),
    ).toBe(204);
    await heartbeat(observation);
    return task;
  };
  await expect(page.getByText("Generation operation queued.", { exact: false })).toBeVisible();
  const started = await finish("start", observations.running);
  expect(started.chunky).toMatchObject({
    centerX: 10000,
    centerZ: 10000,
    radius: 1024,
    shape: "square",
  });
  await expect(panel.getByText("Generation state: Generating", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(panel.getByRole("progressbar", { name: "Generation progress" })).toHaveAttribute(
    "value",
    String(observations.running.progress.percent),
  );
  await panel.getByRole("button", { name: "Pause generation" }).click();
  await expect
    .poll(async () =>
      (await (await request.get(`${bridge}/tasks`, { headers: bridgeHeaders })).json()).some(
        (t: { chunky?: { action: string } }) => t.chunky?.action === "pause",
      ),
    )
    .toBe(true);
  await finish("pause", observations.paused);
  await expect(panel.getByText("Generation state: Paused", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.reload();
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByRole("button", { name: "Generation control", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  await expect(panel.getByText("Generation state: Paused", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Resume generation" }).click();
  await expect
    .poll(async () =>
      (await (await request.get(`${bridge}/tasks`, { headers: bridgeHeaders })).json()).some(
        (t: { chunky?: { action: string } }) => t.chunky?.action === "continue",
      ),
    )
    .toBe(true);
  await finish("continue", observations.resumed);
  await expect(panel.getByText("Generation state: Generating", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await panel.getByRole("button", { name: "Cancel generation" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect
    .poll(async () =>
      (await (await request.get(`${bridge}/tasks`, { headers: bridgeHeaders })).json()).some(
        (t: { chunky?: { action: string } }) => t.chunky?.action === "cancel",
      ),
    )
    .toBe(true);
  await finish("cancel", observations.cancelled);
  await expect(panel.getByText("Generation state: Cancelled", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await heartbeat(observations.completed);
  await expect(panel.getByText("Generation state: Completed", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(panel.getByRole("progressbar")).toHaveAttribute("value", "100");
  await expect(panel.getByText("seconds remaining", { exact: false })).toHaveCount(0);
  await heartbeat(observations.terminalAfterRestart);
  await expect(panel.getByText("Generation state: Stopped", { exact: false })).toBeVisible({
    timeout: 15000,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("chunky-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  // Revoking the external provider removes its observation. The polling view
  // must disable controls instead of continuing to act on its previous data.
  expect((await request.post(`${path}/bridge-token`, { headers, data: {} })).ok()).toBe(true);
  await expect(panel.getByRole("button", { name: "Start pregeneration" })).toBeDisabled({
    timeout: 15000,
  });
  await testInfo.attach("chunky-result.json", {
    body: JSON.stringify(
      {
        anonymousWrite: denied.status(),
        claimedOnce: true,
        controls: ["start", "pause", "continue", "cancel"],
        persistedView: "paused",
        completion: "provider-observed",
        restartCheckpoint: "uncertain",
        revokedControls: "disabled",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

test("offline Plan activity stays owner-scoped and aggregate statistics stay administrator-only", async ({
  page,
  request,
}, testInfo) => {
  const plan = JSON.parse(
    await readFile(join(__dirname, "fixtures", "plan-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const server = "/api/isles/admin/servers/analytics";
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "Analytics server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const secret = await (await request.post(`${server}/bridge-token`, { headers, data: {} })).json();
  const bridge = "/api/isles/bridge/analytics";
  const bridgeHeaders = { Authorization: `Bearer ${secret.token}` };
  const paired = await (
    await request.post("/api/isles/players/owned-player/pair", {
      headers: { Cookie: "mythic_session=website-session" },
      data: { server: "analytics" },
    })
  ).json();
  expect(
    (
      await request.post(`${bridge}/link`, {
        headers: bridgeHeaders,
        data: {
          code: paired.code,
          uuid: plan.players[0].uuid,
          name: "IslesTester",
          platform: "java",
        },
      })
    ).status(),
  ).toBe(204);
  const ids = await (await request.get(`${bridge}/identities`, { headers: bridgeHeaders })).json();
  expect(ids).toEqual([plan.players[0].uuid]);
  expect(
    (
      await request.get("/api/isles/bridge/another-server/identities", { headers: bridgeHeaders })
    ).status(),
  ).toBe(401);
  const heartbeat = async (statistics?: unknown) => {
    expect(
      (
        await request.post(`${bridge}/heartbeat`, {
          headers: bridgeHeaders,
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { Plan: "5.9 build 3705" },
            groups: [],
            players: [],
            ...(statistics ? { plan: statistics } : {}),
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat(plan);
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  expect(
    (
      await request.get("/api/isles/players/another-player/links", {
        headers: { Cookie: "mythic_session=website-session" },
      })
    ).status(),
  ).toBe(403);
  const personal = await (
    await request.get("/api/isles/players/owned-player/links", {
      headers: { Cookie: "mythic_session=website-session" },
    })
  ).json();
  const linked = personal.find((item: { server: string }) => item.server === "analytics");
  expect(linked.activity.playtimeMs).toBe(plan.players[0].playtimeMs);
  expect(linked).not.toHaveProperty("player");
  expect(linked).not.toHaveProperty("plan");
  expect(JSON.stringify(personal)).not.toContain("recordedPlayers");
  const publicServers = await (await request.get("/api/isles/servers")).json();
  expect(JSON.stringify(publicServers)).not.toContain("playtimeMs");
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  await expect(page.getByRole("heading", { name: "My Plan activity" })).toBeVisible();
  await expect(page.getByText("0h 0m 18s", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plan server activity" })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("plan-player-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByRole("button", { name: "Analytics server", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  await expect(page.getByRole("heading", { name: "Plan server activity" })).toBeVisible();
  await expect(page.getByText("0h 0m 21s", { exact: true })).toBeVisible();
  await heartbeat();
  await expect(
    page.getByText("Plan is installed but its statistics are unavailable.", { exact: false }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Plan server activity" })).toHaveCount(0);
  await page.goto("/game");
  await expect(page.getByText("IslesTester", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My Plan activity" })).toHaveCount(0);
  await testInfo.attach("plan-result.json", {
    body: JSON.stringify(
      {
        offlineActivity: "owner-only",
        storedPlaytimeMs: linked.activity.playtimeMs,
        serverAggregate: "admin-only",
        bridgeUUIDAllowlist: true,
        providerUnavailable: "no-fabricated-zero",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
