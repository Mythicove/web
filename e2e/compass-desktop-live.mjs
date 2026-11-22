// Real WebView2 -> Tauri IPC -> Mirror -> Minecraft. Invoked while the Isles
// pack scenario owns its real services; no frontend or IPC collaborator is mocked.
import { chromium, expect } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, mkdir, cp, copyFile, readFile, writeFile, rm, access } from "node:fs/promises";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

assert.equal(process.platform, "win32", "Desktop scenario requires Windows WebView2");
const run = process.env.COMPASS_ISLES_RUN;
const mirror = process.env.COMPASS_MIRROR_ORIGIN;
const player = process.env.COMPASS_MIRROR_PLAYER;
const password = process.env.COMPASS_MIRROR_PASSWORD;
const masterPassword = process.env.COMPASS_MIRROR_MASTER_PASSWORD;
assert(run && mirror && player && password && masterPassword && process.env.COMPASS_EXE);
const dir = await mkdtemp(join(run, "desktop-"));
const data = join(dir, "data");
const source = join(run, "compass-data");
await mkdir(join(data, "instances"), { recursive: true });
await copyFile(process.env.COMPASS_EXE, join(dir, "compass.exe"));
await writeFile(join(dir, "portable.txt"), "");
await cp(join(source, "cache"), join(data, "cache"), { recursive: true });
await cp(join(source, "instances/isles-pack"), join(data, "instances/isles-pack"), {
  recursive: true,
});
const instancePath = join(data, "instances/isles-pack/instance.json");
const instance = JSON.parse(await readFile(instancePath, "utf8"));
const javaRelative = relative(source, instance.javaPath);
assert(!javaRelative.startsWith(".."), "source instance must use its downloaded Java");
instance.javaPath = join(data, javaRelative);
await writeFile(instancePath, JSON.stringify(instance));
await writeFile(
  join(data, "compass.json"),
  JSON.stringify({
    apiUrl: mirror,
    hoardUrl: "http://127.0.0.1:1",
    language: "zh-CN",
    theme: "dark",
    download: { concurrency: 4, mirror: "" },
    defaults: { memoryMb: 2048 },
  }),
);
const serverWork = join(dir, "game-server");
await cp(join(run, "game-server"), serverWork, { recursive: true });
for (const name of ["server-ready.json", "server-player.json"]) await rm(join(serverWork, name));
const portProbe = createServer();
await new Promise((done) => portProbe.listen(0, "127.0.0.1", done));
const cdpPort = portProbe.address().port;
await new Promise((done) => portProbe.close(done));
let application, browser, page, server;
let serverLogs = "";
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function waitFor(check, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await pause(200);
  }
  throw new Error(`Scenario condition timed out; artifacts: ${dir}`);
}
async function closeApplication() {
  await browser?.close();
  browser = undefined;
  if (application?.exitCode === null) {
    // The fresh WebView profile and any launched game belong to this app subtree.
    const result = spawnSync("taskkill", ["/PID", String(application.pid), "/T", "/F"], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, "owned desktop application cleanup failed");
  }
}
async function openApplication() {
  application = spawn(join(dir, "compass.exe"), [], {
    cwd: dir,
    env: {
      ...process.env,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`,
      WEBVIEW2_USER_DATA_FOLDER: join(dir, "webview"),
    },
  });
  // Drain native output without retaining credential-bearing command lines.
  application.stdout.resume();
  application.stderr.resume();
  await waitFor(async () => {
    assert.equal(application.exitCode, null, "desktop application exited at startup");
    try {
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${cdpPort}`);
      return true;
    } catch {
      return false;
    }
  });
  await waitFor(() => {
    page = browser
      .contexts()
      .flatMap((context) => context.pages())
      .find((candidate) => !candidate.url().startsWith("devtools:"));
    return !!page;
  });
  await page.getByRole("heading", { name: "开始游戏", exact: true }).waitFor();
}
try {
  server = spawn(
    instance.javaPath,
    [
      "-Xms256M",
      "-Xmx1536M",
      "-Dauthlibinjector.side=server",
      `-javaagent:${join(data, "cache/tools/authlib-injector-1.2.8.jar")}=${mirror}`,
      "-jar",
      "server.jar",
      "--nogui",
    ],
    { cwd: serverWork },
  );
  for (const stream of [server.stdout, server.stderr])
    stream.on("data", (chunk) => {
      serverLogs += chunk;
    });
  await waitFor(async () => {
    assert.equal(server.exitCode, null, "online server exited at startup");
    try {
      return JSON.parse(await readFile(join(serverWork, "server-ready.json"), "utf8")).onlineMode;
    } catch {
      return false;
    }
  }, 240_000);
  await openApplication();
  // Read-only native observation establishes which actual deployment is under test.
  const paths = await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("paths_info"));
  assert.equal(paths.root.toLowerCase(), data.toLowerCase());
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeDisabled();
  await page.getByLabel("界面音效").uncheck();
  await page.getByLabel("玩家名", { exact: true }).fill("中文输入测试Alex");
  assert.equal(await page.getByLabel("玩家名", { exact: true }).inputValue(), "中文输入测试Alex");
  await page.getByLabel("玩家名", { exact: true }).fill(player);
  await page.getByLabel("启动器独立密码", { exact: true }).fill(masterPassword);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeDisabled();
  await expect(page.getByLabel("启动器独立密码", { exact: true })).toHaveValue("");
  await page.getByLabel("启动器独立密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("heading", { name: player, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeEnabled();
  const accountText = await readFile(join(data, "accounts.json"), "utf8");
  const secretText = await readFile(join(data, "secrets.json"), "utf8");
  assert(
    !accountText.includes(password) && !secretText.includes(password),
    "launcher persisted the submitted password",
  );
  const accounts = JSON.parse(accountText);
  assert.equal(accounts.accounts.length, 1);
  assert.equal(accounts.accounts[0].playerName, player);
  await closeApplication();
  await openApplication();
  await expect(page.getByRole("heading", { name: player, exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeEnabled();
  await page.locator(".start-skin canvas").waitFor();
  await pause(2500);
  await page.screenshot({ path: join(dir, "signed-in-webview2.png"), fullPage: true });
  await page.locator(".start-skin canvas").screenshot({ path: join(dir, "skin-preview.png") });
  await page.getByRole("button", { name: "启动游戏", exact: true }).click();
  await expect(page.getByRole("button", { name: "停止游戏", exact: true })).toBeVisible({
    timeout: 60_000,
  });
  await waitFor(async () => {
    try {
      return !!JSON.parse(await readFile(join(serverWork, "server-player.json"), "utf8"));
    } catch {
      return false;
    }
  }, 180_000);
  const observed = JSON.parse(await readFile(join(serverWork, "server-player.json"), "utf8"));
  assert.equal(observed.onlineMode, true);
  assert.equal(observed.name, player);
  assert.equal(
    observed.uuid.replaceAll("-", ""),
    accounts.accounts[0].playerUuid.replaceAll("-", ""),
  );
  assert.equal(observed.skinModel, "SLIM");
  assert.equal(observed.skinSigned, true);
  await page.getByRole("button", { name: "停止游戏", exact: true }).click();
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeEnabled({
    timeout: 30_000,
  });
  const secrets = JSON.parse(await readFile(join(data, "secrets.json"), "utf8"));
  const token = secrets[accounts.activeId];
  assert(token.accessToken && token.clientToken);
  await page.getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page.getByLabel("玩家名", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeDisabled();
  assert.equal(
    (
      await fetch(mirror + "/authserver/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token),
      })
    ).status,
    403,
  );
  for (const name of ["accounts.json", "secrets.json"]) {
    await assert.rejects(access(join(data, name)), { code: "ENOENT" });
  }
  await page.screenshot({ path: join(dir, "signed-out-webview2.png"), fullPage: true });
  const artifactSha256 = createHash("sha256")
    .update(await readFile(join(dir, "compass.exe")))
    .digest("hex");
  const result = {
    native: "Windows WebView2",
    artifactSha256,
    chineseInput: "entered",
    sitePassword: "refused-in-ui",
    passwordPersistence: "absent",
    launcherLogin: "real-mirror-through-ui",
    restart: "account-restored",
    skinPreview: "canvas-screenshot-retained",
    launch: "button-to-online-server",
    serverUuid: "matches-mirror-player",
    serverSkin: "signed-slim-profile",
    stop: "button-stopped-client",
    logout: "button-invalidated-token",
    scope: "native-launcher-clicks-with-preinstalled-pack-and-game-prompts-accepted",
  };
  await writeFile(join(run, "desktop-result.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ directory: dir, ...result }));
} finally {
  await closeApplication();
  if (server?.exitCode === null) {
    server.stdin.write("stop\n");
    await Promise.race([new Promise((done) => server.once("exit", done)), pause(30_000)]);
    if (server.exitCode === null) server.kill();
  }
  await writeFile(join(dir, "desktop-server.log"), serverLogs);
}
