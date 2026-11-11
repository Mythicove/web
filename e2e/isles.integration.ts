import { test, expect } from "@playwright/test";
import { readFile, mkdtemp, open, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

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

test("Towny membership follows the verified offline resident and admin lists respect visibility boundaries", async ({
  page,
  request,
}, testInfo) => {
  const observations = JSON.parse(
    await readFile(join(__dirname, "fixtures", "towny-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const server = "/api/isles/admin/servers/towny";
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "Towny server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const { token } = await (
    await request.post(`${server}/bridge-token`, { headers, data: {} })
  ).json();
  const bridge = "/api/isles/bridge/towny";
  const bridgeHeaders = { Authorization: `Bearer ${token}` };
  const pair = await (
    await request.post("/api/isles/players/owned-player/pair", {
      headers: { Cookie: "mythic_session=website-session" },
      data: { server: "towny" },
    })
  ).json();
  expect(
    (
      await request.post(`${bridge}/link`, {
        headers: bridgeHeaders,
        data: {
          code: pair.code,
          uuid: observations.townless.uuid,
          name: "TownyTester",
          platform: "java",
        },
      })
    ).status(),
  ).toBe(204);
  const heartbeat = async (towny?: unknown) => {
    expect(
      (
        await request.post(`${bridge}/heartbeat`, {
          headers: bridgeHeaders,
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { Towny: "0.103.2.0" },
            groups: [],
            players: [],
            ...(towny ? { towny } : {}),
          },
        })
      ).status(),
    ).toBe(204);
  };
  const memberState = (resident: unknown) =>
    heartbeat({ ...observations.aggregate, residents: [resident] });
  await memberState(observations.king);
  const own = await (
    await request.get("/api/isles/players/owned-player/links", {
      headers: { Cookie: "mythic_session=website-session" },
    })
  ).json();
  const linked = own.find((link: { server: string }) => link.server === "towny");
  expect(linked.towny.king).toBe(true);
  expect(linked).not.toHaveProperty("player");
  expect(linked.towny).not.toHaveProperty("towns");
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  expect(
    (
      await request.get("/api/isles/players/someone-else/links", {
        headers: { Cookie: "mythic_session=website-session" },
      })
    ).status(),
  ).toBe(403);
  expect(JSON.stringify(await (await request.get("/api/isles/servers")).json())).not.toContain(
    "IslesHarbor",
  );
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  await expect(page.getByRole("heading", { name: "My Towny membership" })).toBeVisible();
  await expect(page.getByText("Role: Resident / Mayor / King", { exact: true })).toBeVisible();
  await expect(page.getByText("Nation: IslesUnion", { exact: true })).toBeVisible();
  await heartbeat(observations.aggregate);
  await page.reload();
  await expect(page.getByText("Town ranks: assistant", { exact: true })).toBeVisible();
  await expect(page.getByText("Role: Resident", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("towny-membership-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await memberState(observations.removed);
  await page.reload();
  await expect(
    page.getByText("Towny knows this resident, who currently has no town.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Town ranks: assistant", { exact: true })).toHaveCount(0);
  await heartbeat({ ...observations.aggregate, townCount: 101 });
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByRole("button", { name: "Towny server", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  const overview = page.getByRole("region", { name: "Towny towns and nations" });
  await expect(overview.getByText("101 towns / 1 nation", { exact: true })).toBeVisible();
  await expect(
    overview.getByText("Showing 1 town and 1 nation in UUID order", { exact: false }),
  ).toBeVisible();
  await expect(overview.getByText("IslesHarbor", { exact: true })).toBeVisible();
  await expect(overview.getByText("IslesUnion", { exact: true })).toBeVisible();
  await heartbeat();
  await expect(
    page.getByText("Towny is installed but its observations are unavailable.", { exact: false }),
  ).toBeVisible({ timeout: 15000 });
  await page.goto("/game");
  await expect(page.getByText("TownyTester", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My Towny membership" })).toHaveCount(0);
  await testInfo.attach("towny-result.json", {
    body: JSON.stringify(
      {
        offlineMembership: "owner-only",
        roles: ["mayor", "king", "assistant"],
        removal: "townless",
        unavailable: "not-townless",
        overview: "admin-only",
        truncation: "explicit",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

test("legacy Java clients retain their observed protocol and configured blocks update the admin range", async ({
  page,
  request,
}, testInfo) => {
  const fixture = JSON.parse(
    await readFile(join(__dirname, "fixtures", "legacy-protocol-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const ownerHeaders = { Cookie: "mythic_session=website-session" };
  const server = "/api/isles/admin/servers/legacy";
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "Legacy Java server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const { token } = await (
    await request.post(`${server}/bridge-token`, { headers, data: {} })
  ).json();
  const { code } = await (
    await request.post("/api/isles/players/owned-player/pair", {
      headers: ownerHeaders,
      data: { server: "legacy" },
    })
  ).json();
  const oldClient = fixture.clients.find(
    (client: { requestedVersion: string }) => client.requestedVersion === "1.8.8",
  );
  expect(
    (
      await request.post("/api/isles/bridge/legacy/link", {
        headers: { Authorization: `Bearer ${token}` },
        data: { code, uuid: oldClient.uuid, name: oldClient.name, platform: "java" },
      })
    ).status(),
  ).toBe(204);
  const heartbeat = async (protocolVersions: string[], online: boolean) => {
    expect(
      (
        await request.post("/api/isles/bridge/legacy/heartbeat", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: fixture.providers,
            groups: [],
            protocolVersions,
            players: online
              ? [
                  {
                    uuid: oldClient.uuid,
                    name: oldClient.name,
                    clientVersion: oldClient.clientVersion,
                  },
                ]
              : [],
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat(fixture.allowed, true);
  const own = await (
    await request.get("/api/isles/players/owned-player/links", { headers: ownerHeaders })
  ).json();
  const linked = own.find((link: { server: string }) => link.server === "legacy");
  expect(linked.player.clientVersion).toBe("1.8.x");
  expect(linked).not.toHaveProperty("protocolVersions");
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  const publicData = JSON.stringify(await (await request.get("/api/isles/servers")).json());
  expect(publicData).not.toContain("ViaRewind");
  expect(publicData).not.toContain(oldClient.uuid);
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  const profile = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Legacy Java server", exact: true }) });
  await expect(profile.getByText("Observed client version: 1.8.x", { exact: true })).toBeVisible();
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration", exact: true }).click();
  await page.getByRole("button", { name: "Legacy Java server", exact: true }).click();
  const refresh = () => page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  await refresh();
  await expect(page.getByText("ViaBackwards 5.12.2", { exact: true })).toBeVisible();
  await expect(page.getByText("ViaRewind 4.2.0", { exact: true })).toBeVisible();
  await page.getByText("Supported connection protocols", { exact: true }).click();
  const range = page
    .locator("details")
    .filter({ has: page.getByText("Supported connection protocols", { exact: true }) });
  await expect(range).toContainText("1.8.x");
  await expect(range).toContainText("1.12.2");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("legacy-protocol-range-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await heartbeat(fixture.blocked, false);
  await refresh();
  await expect(range).not.toContainText("1.8.x");
  await expect(range).toContainText("1.12.2");
  await page.goto("/game");
  await expect(profile.getByText(oldClient.uuid, { exact: true })).toBeVisible();
  await expect(profile.getByText("Observed client version: 1.8.x", { exact: true })).toHaveCount(0);
  await testInfo.attach("legacy-protocol-result.json", {
    body: JSON.stringify({
      requestedClient: oldClient.requestedVersion,
      observedClient: oldClient.clientVersion,
      blockedProtocol: fixture.blockedProtocol,
      rangeRemoved: "1.8.x",
      offlineVersionRemoved: true,
      publicProviderExposure: false,
      scope: fixture.scope,
    }),
    contentType: "application/json",
  });
});

test("spark GC counters stay admin-only and preserve zero, unknown and reset observations", async ({
  page,
  request,
}, testInfo) => {
  const fixture = JSON.parse(
    await readFile(join(__dirname, "fixtures", "gc-observations.json"), "utf8"),
  );
  const server = "/api/isles/admin/servers/gc";
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "GC server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const { token } = await (
    await request.post(`${server}/bridge-token`, { headers, data: {} })
  ).json();
  const heartbeat = async (garbageCollectors?: unknown) => {
    expect(
      (
        await request.post("/api/isles/bridge/gc/heartbeat", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { spark: "server-service" },
            groups: [],
            players: [],
            garbageCollectors,
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat(fixture.before);
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  expect(JSON.stringify(await (await request.get("/api/isles/servers")).json())).not.toContain(
    "garbageCollectors",
  );
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration", exact: true }).click();
  await page.getByRole("button", { name: "GC server", exact: true }).click();
  const refresh = () => page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  await refresh();
  const gc = page.getByRole("region", { name: "Garbage collection (spark)", exact: true });
  const old = gc
    .locator(":scope > div")
    .filter({ has: page.getByRole("heading", { name: "G1 Old Generation", exact: true }) });
  await expect(old.locator("dd")).toHaveText(["0", "0"]);
  await heartbeat(fixture.after);
  await refresh();
  await expect(old.locator("dd")).toHaveText(["1", "102"]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("spark-gc-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await heartbeat({ "Unknown collector": {} });
  await refresh();
  await expect(gc.locator("dd")).toHaveText(["Not reported", "Not reported"]);
  await heartbeat(fixture.before);
  await refresh();
  await expect(old.locator("dd")).toHaveText(["0", "0"]);
  await heartbeat();
  await refresh();
  await expect(gc).toHaveCount(0);
  await expect(
    page.getByText("spark garbage-collector statistics are unavailable.", { exact: true }),
  ).toBeVisible();
  await heartbeat(fixture.after);
  await page.goto("/zh-CN/admin/integrations");
  await page.getByLabel("Mirror 救援令牌", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "加载配置", exact: true }).click();
  await page.getByRole("button", { name: "GC server", exact: true }).click();
  await page.getByRole("button", { name: "刷新", exact: true }).last().click();
  await expect(page.getByRole("region", { name: "垃圾回收（spark）", exact: true })).toBeVisible();
  await expect(page.getByText("累计耗时（毫秒）", { exact: true })).toHaveCount(3);
  await testInfo.attach("spark-gc-result.json", {
    body: JSON.stringify({
      source: fixture.provider,
      oldGenerationBefore: fixture.before["G1 Old Generation"],
      oldGenerationAfter: fixture.after["G1 Old Generation"],
      unknownPreserved: true,
      resetReplaced: true,
      unavailableRemoved: true,
      publicExposure: false,
    }),
    contentType: "application/json",
  });
});

test("local files are identified by browser digest without uploading bytes or names", async ({
  page,
  request,
}, testInfo) => {
  const bytes = Buffer.from("local file contents");
  const hash = createHash("sha512").update(bytes).digest("hex");
  await page.goto("/catalog");
  const file = page.getByLabel("Local file", { exact: true });
  await file.setInputFiles({
    name: "renamed-private-file.jar",
    mimeType: "application/java-archive",
    buffer: bytes,
  });
  const outgoing = page.waitForRequest((req) =>
    req.url().includes(`/catalog/modrinth/hash/${hash}`),
  );
  await page.getByRole("button", { name: "Identify with Modrinth", exact: true }).click();
  const sent = await outgoing;
  expect(sent.method()).toBe("GET");
  expect(sent.postData()).toBeNull();
  expect(sent.url()).not.toContain("renamed-private-file");
  const result = page.getByRole("status");
  await expect(
    result.getByText("Exact file digest found in Modrinth", { exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole("heading", { name: "Known exact-file release", exact: true }),
  ).toBeVisible();
  await expect(
    result.getByText("Publisher filename: publisher.jar", { exact: true }),
  ).toBeVisible();
  await expect(result.getByRole("link", { name: "Original project", exact: true })).toHaveAttribute(
    "href",
    "https://modrinth.com/project/known-project/version/known-release",
  );
  await result.getByText("Locally computed SHA-512", { exact: true }).click();
  await expect(result.getByText(hash, { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("file-identification-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await file.setInputFiles({
    name: "same-name.jar",
    mimeType: "application/java-archive",
    buffer: Buffer.concat([bytes, Buffer.from("modified")]),
  });
  await expect(result).toHaveCount(0);
  await page.getByRole("button", { name: "Identify with Modrinth", exact: true }).click();
  await expect(result.getByText(/This file digest is not indexed by Modrinth/)).toBeVisible();
  await expect(result.getByRole("heading")).toHaveCount(0);
  await file.setInputFiles({
    name: "unavailable.jar",
    mimeType: "application/java-archive",
    buffer: Buffer.from("unavailable file"),
  });
  await page.getByRole("button", { name: "Identify with Modrinth", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Identify a local file", exact: true }).getByRole("alert"),
  ).toContainText("502");
  await expect(result).toHaveCount(0);
  expect(
    (await request.get(`/api/isles/catalog/modrinth/hash/${hash}?algorithm=sha1`)).status(),
  ).toBe(400);
  expect(
    (await request.post(`/api/isles/catalog/modrinth/hash/${hash}`, { data: {} })).status(),
  ).toBe(404);
  const dir = await mkdtemp(join(tmpdir(), "isles-local-file-"));
  try {
    const path = join(dir, "too-large.jar");
    const handle = await open(path, "w");
    await handle.truncate(128 * 1024 * 1024 + 1);
    await handle.close();
    await file.setInputFiles(path);
    await page.getByRole("button", { name: "Identify with Modrinth", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Identify a local file", exact: true }).getByRole("alert"),
    ).toHaveText("Choose a file no larger than 128 MiB.");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  await page.goto("/zh-CN/catalog");
  await page
    .getByLabel("本地文件", { exact: true })
    .setInputFiles({ name: "中文改名.jar", mimeType: "application/java-archive", buffer: bytes });
  await page.getByRole("button", { name: "通过 Modrinth 识别", exact: true }).click();
  await expect(page.getByText("已在 Modrinth 找到精确文件哈希", { exact: true })).toBeVisible();
  await testInfo.attach("file-identification-result.json", {
    body: JSON.stringify({
      algorithm: "sha512",
      filenameIndependent: true,
      fileContentsUploaded: false,
      exactVersion: "known-release",
      modifiedFile: "not-indexed",
      oversizeFile: "rejected-locally",
      bilingual: true,
    }),
    contentType: "application/json",
  });
});

test("voice status follows provider observations, stays private and disappears offline", async ({
  page,
  request,
}, testInfo) => {
  const fixture = JSON.parse(
    await readFile(join(__dirname, "fixtures", "voicechat-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const server = "/api/isles/admin/servers/voice";
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "Voice server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const { token } = await (
    await request.post(`${server}/bridge-token`, { headers, data: {} })
  ).json();
  const bridge = "/api/isles/bridge/voice";
  const bridgeHeaders = { Authorization: `Bearer ${token}` };
  const ownerHeaders = { Cookie: "mythic_session=website-session" };
  const { code } = await (
    await request.post("/api/isles/players/owned-player/pair", {
      headers: ownerHeaders,
      data: { server: "voice" },
    })
  ).json();
  const player = { uuid: "7c0f77ad-4895-3c9a-a5be-05ce3d65be75", name: "IslesTester" };
  expect(
    (
      await request.post(`${bridge}/link`, {
        headers: bridgeHeaders,
        data: { ...player, code, platform: "java" },
      })
    ).status(),
  ).toBe(204);
  const heartbeat = async (players: unknown[]) => {
    expect(
      (
        await request.post(`${bridge}/heartbeat`, {
          headers: bridgeHeaders,
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { voicechat: "2.6.25" },
            groups: [],
            players,
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat([{ ...player, voicechat: fixture.noClient }]);
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  const section = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Simple Voice Chat", exact: true }) })
    .last();
  await expect(
    section.getByText("No compatible voice client detected", { exact: true }),
  ).toBeVisible();
  for (const [state, connected, sound] of [
    ["connected", "Voice connection: connected", "Voice sound: enabled"],
    ["disabled", "Voice connection: connected", "Voice sound: disabled"],
    ["disconnected", "Voice connection: disconnected", "Voice sound: enabled"],
  ]) {
    await heartbeat([{ ...player, voicechat: fixture[state] }]);
    await page.reload();
    await expect(
      section.getByText("Compatible voice client detected", { exact: true }),
    ).toBeVisible();
    await expect(section.getByText(connected, { exact: true })).toBeVisible();
    await expect(section.getByText(sound, { exact: true })).toBeVisible();
  }
  expect(
    (
      await request.get("/api/isles/players/someone-else/links", { headers: ownerHeaders })
    ).status(),
  ).toBe(403);
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  expect(JSON.stringify(await (await request.get("/api/isles/servers")).json())).not.toContain(
    "voicechat",
  );
  const own = await (
    await request.get("/api/isles/players/owned-player/links", { headers: ownerHeaders })
  ).json();
  expect(own.find((link: { server: string }) => link.server === "voice").player.voicechat).toEqual(
    fixture.disconnected,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("voice-profile-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.goto("/zh-CN/game");
  await expect(page.getByText("已检测到兼容语音客户端", { exact: true })).toBeVisible();
  await expect(page.getByText("语音连接：未连接", { exact: true })).toBeVisible();
  await expect(page.getByText("语音声音：已启用", { exact: true })).toBeVisible();
  await page.goto("/en/game");
  // Provider unavailable while the player is still online is also omitted.
  await heartbeat([player]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Simple Voice Chat", exact: true })).toHaveCount(
    0,
  );
  await heartbeat([{ ...player, voicechat: fixture.connected }]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Simple Voice Chat", exact: true })).toBeVisible();
  await heartbeat([]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Simple Voice Chat", exact: true })).toHaveCount(
    0,
  );
  await expect(
    page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "Voice server", exact: true }) })
      .getByText(player.uuid, { exact: true }),
  ).toBeVisible();
  await testInfo.attach("voicechat-result.json", {
    body: JSON.stringify({
      transitions: ["noClient", "connected", "disabled", "disconnected"],
      providerUnavailableOmitted: true,
      offlineObservationRemoved: true,
      privateOwnershipEnforced: true,
      scope: fixture.scope,
    }),
    contentType: "application/json",
  });
});

test("Bedrock binding retains Bukkit identity and separates client and translated protocol observations", async ({
  page,
  request,
}, testInfo) => {
  const fixture = JSON.parse(
    await readFile(join(__dirname, "fixtures", "crossplay-observations.json"), "utf8"),
  );
  const headers = { Authorization: "Bearer scenario-mirror-admin" };
  const server = "/api/isles/admin/servers/crossplay";
  expect(
    (
      await request.put(server, {
        headers,
        data: {
          name: "Crossplay server",
          edition: "java",
          address: "127.0.0.1:1",
          published: true,
          links: [],
        },
      })
    ).ok(),
  ).toBe(true);
  const { token } = await (
    await request.post(`${server}/bridge-token`, { headers, data: {} })
  ).json();
  const bridge = "/api/isles/bridge/crossplay";
  const bridgeHeaders = { Authorization: `Bearer ${token}` };
  const pair = await (
    await request.post("/api/isles/players/owned-player/pair", {
      headers: { Cookie: "mythic_session=website-session" },
      data: { server: "crossplay" },
    })
  ).json();
  expect(
    (
      await request.post(`${bridge}/link`, {
        headers: bridgeHeaders,
        data: {
          code: pair.code,
          uuid: fixture.bedrock.uuid,
          name: fixture.bedrock.name,
          platform: "bedrock",
        },
      })
    ).status(),
  ).toBe(204);
  const heartbeat = async (players: unknown[]) => {
    expect(
      (
        await request.post(`${bridge}/heartbeat`, {
          headers: bridgeHeaders,
          data: {
            platform: "Purpur",
            minecraft: "1.21.1",
            plugins: { "Geyser-Spigot": "2.8.3 b941", floodgate: "2.2.5 b141" },
            groups: [],
            players,
            crossplay: fixture.versions,
          },
        })
      ).status(),
    ).toBe(204);
  };
  await heartbeat([fixture.javaPlayer, fixture.bedrock]);
  const own = await (
    await request.get("/api/isles/players/owned-player/links", {
      headers: { Cookie: "mythic_session=website-session" },
    })
  ).json();
  const linked = own.find((link: { server: string }) => link.server === "crossplay");
  expect(linked.identity.platform).toBe("bedrock");
  expect(linked.player.uuid).toBe(fixture.bedrock.uuid);
  expect(linked).not.toHaveProperty("crossplay");
  expect(JSON.stringify(linked)).not.toContain("xuid");
  expect((await request.get(`${server}/bridge`)).status()).toBe(401);
  expect(
    (
      await request.get("/api/isles/players/someone-else/links", {
        headers: { Cookie: "mythic_session=website-session" },
      })
    ).status(),
  ).toBe(403);
  expect(JSON.stringify(await (await request.get("/api/isles/servers")).json())).not.toContain(
    "linkedJavaAccount",
  );
  await page
    .context()
    .addCookies([
      { name: "mythic_session", value: "website-session", url: "http://localhost:19185" },
    ]);
  await page.goto("/game");
  await expect(page.getByRole("heading", { name: "Observed Bedrock connection" })).toBeVisible();
  await expect(page.getByText("Bedrock client version: 1.21.100", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Translated Java connection version: 1.21.7-1.21.8", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Connection provider: Floodgate", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Provider-side Java account link: Not linked", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach("bedrock-profile-mobile.png", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.goto("/admin/integrations");
  await page.getByLabel("Mirror rescue token", { exact: false }).fill("scenario-mirror-admin");
  await page.getByRole("button", { name: "Load configuration" }).click();
  await page.getByRole("button", { name: "Crossplay server", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).last().click();
  await expect(page.getByRole("heading", { name: "Geyser supported versions" })).toBeVisible();
  await expect(
    page.getByText("Geyser Java translation target: 1.21.8", { exact: true }),
  ).toBeVisible();
  const action = await (
    await request.post(`${server}/tasks`, {
      headers,
      data: { player: "owned-player", kind: "whitelist", grant: true },
    })
  ).json();
  expect(action.uuid).toBe(fixture.bedrock.uuid);
  await heartbeat([fixture.javaPlayer]);
  await page.goto("/game");
  await expect(page.getByText(".BedrockTester", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observed Bedrock connection" })).toHaveCount(0);
  const persisted = await (
    await request.get("/api/isles/players/owned-player/links", {
      headers: { Cookie: "mythic_session=website-session" },
    })
  ).json();
  expect(
    persisted.find((link: { server: string }) => link.server === "crossplay").identity.platform,
  ).toBe("bedrock");
  await testInfo.attach("crossplay-result.json", {
    body: JSON.stringify(
      {
        bindingPlatform: "bedrock",
        membershipUUID: action.uuid,
        clientVersion: "1.21.100",
        translatedProtocol: "1.21.7-1.21.8",
        offlineObservationRemoved: true,
        xboxAuthentication: "outside-fixture-scope",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
