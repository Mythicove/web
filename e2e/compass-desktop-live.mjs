// Real WebView2 -> Tauri IPC -> Mirror -> Minecraft. Invoked while the Isles
// pack scenario owns its real services; no frontend or IPC collaborator is mocked.
import { chromium, expect } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import {
  mkdtemp,
  mkdir,
  cp,
  copyFile,
  readFile,
  writeFile,
  rm,
  access,
  readdir,
} from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
assert.deepEqual(await readdir(join(data, "instances")), []);
await assert.rejects(access(join(data, "cache")), { code: "ENOENT" });
// The independently running server uses the core scenario's Java. The desktop
// receives neither that runtime nor any previously installed instance content.
const sourceInstance = JSON.parse(
  await readFile(join(source, "instances/isles-pack/instance.json"), "utf8"),
);
const gameDriver = join(dirname(fileURLToPath(import.meta.url)), "compass-game-window.ps1");
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
async function openApplication(importPack = false) {
  application = spawn(join(dir, "compass.exe"), importPack ? [join(run, "community.mrpack")] : [], {
    cwd: dir,
    env: {
      ...process.env,
      JAVA_HOME: "",
      PATH: join(process.env.SystemRoot, "System32"),
      LOCALAPPDATA: join(dir, "local-app-data"),
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
  await page
    .getByRole("heading", { name: importPack ? "确认安装整合包" : "开始游戏", exact: true })
    .waitFor();
  // Observe errors from the real invocation without retaining arguments or
  // successful responses (which carry account tokens).
  await page.evaluate(() => {
    const invoke = window.__TAURI_INTERNALS__.invoke;
    window.__compassAuthErrors = [];
    window.__TAURI_INTERNALS__.invoke = function (...args) {
      return invoke.apply(this, args).catch((error) => {
        if (args[0] === "auth_login") {
          window.__compassAuthErrors.push({ code: error?.code, message: error?.message });
        }
        throw error;
      });
    };
  });
}
function captureGame(name) {
  const captured = spawnSync(
    "pwsh",
    [
      "-NoProfile",
      "-File",
      gameDriver,
      "-RootProcessId",
      String(application.pid),
      "-Screenshot",
      join(dir, name),
    ],
    { encoding: "utf8" },
  );
  return captured;
}
try {
  server = spawn(
    sourceInstance.javaPath,
    [
      "-Xms256M",
      "-Xmx1536M",
      "-Dauthlibinjector.side=server",
      `-javaagent:${join(source, "cache/tools/authlib-injector-1.2.8.jar")}=${mirror}`,
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
  await openApplication(true);
  // Read-only native observation establishes which actual deployment is under test.
  const paths = await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("paths_info"));
  assert.equal(paths.root.toLowerCase(), data.toLowerCase());
  const review = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "确认安装整合包", exact: true }) });
  await review.getByLabel("名称", { exact: true }).fill("Isles live");
  await page.screenshot({ path: join(dir, "pack-review.png"), fullPage: true });
  await review.getByRole("button", { name: "安装", exact: true }).click();
  await page.getByText("Isles live", { exact: true }).waitFor({ timeout: 300_000 });
  assert.deepEqual(await readdir(join(data, "instances")), ["isles-live"]);
  const instancePath = join(data, "instances/isles-live/instance.json");
  const installed = JSON.parse(await readFile(instancePath, "utf8"));
  assert.equal(installed.versionId, sourceInstance.versionId);
  assert.equal(installed.javaPath, null);
  const detected = await page.evaluate(() =>
    window.__TAURI_INTERNALS__.invoke("instance_java", { slug: "isles-live" }),
  );
  assert.equal(detected, null, "desktop still sees a matching system Java");
  await assert.rejects(access(join(data, "instances/isles-live/.minecraft/options.txt")), {
    code: "ENOENT",
  });
  const card = page.locator(".card").filter({ has: page.getByText("Isles live", { exact: true }) });
  await card.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByLabel("启动后直连服务器", { exact: true }).check();
  await page.getByLabel("地址", { exact: true }).fill(sourceInstance.server.host);
  await page
    .getByLabel("端口（留空 = 25565）", { exact: true })
    .fill(String(sourceInstance.server.port));
  await page.getByRole("button", { name: "保存设置", exact: true }).click();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await page.getByRole("heading", { name: "开始游戏", exact: true }).waitFor();
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeDisabled();
  await page.getByLabel("界面音效").uncheck();
  await page.getByLabel("玩家名", { exact: true }).fill("中文输入测试Alex");
  assert.equal(await page.getByLabel("玩家名", { exact: true }).inputValue(), "中文输入测试Alex");
  await page.getByLabel("玩家名", { exact: true }).fill(player);
  await page.getByLabel("启动器独立密码", { exact: true }).fill(masterPassword);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("独立密码", { timeout: 60_000 });
  await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeDisabled();
  await expect(page.getByLabel("启动器独立密码", { exact: true })).toHaveValue("");
  await page.getByLabel("启动器独立密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("heading", { name: player, exact: true })).toBeVisible({
    timeout: 90_000,
  });
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
  for (let attempt = 1; attempt <= 2; attempt++) {
    await rm(join(serverWork, "server-player.json"), { force: true });
    await page.getByRole("button", { name: "启动游戏", exact: true }).click();
    await expect(page.getByRole("button", { name: "停止游戏", exact: true })).toBeVisible({
      timeout: 180_000,
    });
    await writeFile(
      join(dir, "native-session.json"),
      JSON.stringify(
        { rootProcessId: application.pid, driver: gameDriver, directory: dir, attempt },
        null,
        2,
      ),
    );
    // Cold Fabric/bootstrap initialization precedes creation of the GLFW window.
    // Keep its readiness deadline separate from the later online-join deadline.
    await waitFor(async () => {
      const capture = captureGame(`game-start-${attempt}.png`);
      if (capture.status !== 0) {
        await writeFile(
          join(dir, "game-driver-error.txt"),
          capture.stderr ?? String(capture.error),
        );
      }
      return capture.status === 0;
    }, 180_000);
    console.log(
      JSON.stringify({
        gameWindowReady: true,
        rootProcessId: application.pid,
        directory: dir,
        attempt,
      }),
    );
    await waitFor(async () => {
      try {
        return !!JSON.parse(await readFile(join(serverWork, "server-player.json"), "utf8"));
      } catch {
        return false;
      }
    }, 300_000);
    const observed = JSON.parse(await readFile(join(serverWork, "server-player.json"), "utf8"));
    assert.equal(observed.onlineMode, true);
    assert.equal(observed.name, player);
    assert.equal(
      observed.uuid.replaceAll("-", ""),
      accounts.accounts[0].playerUuid.replaceAll("-", ""),
    );
    assert.equal(observed.skinModel, "SLIM");
    assert.equal(observed.skinSigned, true);
    await copyFile(
      join(serverWork, "server-player.json"),
      join(dir, `server-player-${attempt}.json`),
    );
    assert.equal(captureGame(`game-joined-${attempt}.png`).status, 0);
    await page.getByRole("button", { name: "停止游戏", exact: true }).click();
    await expect(page.getByRole("button", { name: "启动游戏", exact: true })).toBeEnabled({
      timeout: 30_000,
    });
  }
  await access(join(data, "cache/java/java-runtime-delta/bin/java.exe"));
  assert.equal(JSON.parse(await readFile(instancePath, "utf8")).javaPath, null);
  const operations = await readFile(join(data, "logs/compass.log"), "utf8");
  assert(
    operations.includes(join(data, "cache/java")) && operations.includes("java_version=21"),
    "desktop did not launch using its automatically downloaded Java 21",
  );
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
    installation: "empty-cache-mrpack-review-and-install-button",
    java: "no-matching-system-runtime-automatically-downloaded-java-21",
    chineseInput: "entered",
    sitePassword: "refused-in-ui",
    passwordPersistence: "absent",
    launcherLogin: "real-mirror-through-ui",
    restart: "account-restored",
    skinPreview: "canvas-screenshot-retained",
    launch: "two-button-launches-to-online-server",
    serverUuid: "matches-mirror-player",
    serverSkin: "signed-slim-profile",
    stop: "button-stopped-client",
    logout: "button-invalidated-token",
    scope: "native-empty-directory-install-and-two-online-launches-with-game-window-captures",
  };
  await writeFile(join(run, "desktop-result.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ directory: dir, ...result }));
} catch (error) {
  if (page && browser) {
    await page.screenshot({ path: join(dir, "failure.png"), fullPage: true });
    await writeFile(join(dir, "failure-ui.txt"), await page.locator("body").innerText());
    const errors = JSON.stringify(await page.evaluate(() => window.__compassAuthErrors));
    await writeFile(
      join(dir, "auth-errors.json"),
      errors.replaceAll(password, "[redacted]").replaceAll(masterPassword, "[redacted]"),
    );
  }
  throw error;
} finally {
  await closeApplication();
  if (server?.exitCode === null) {
    server.stdin.write("stop\n");
    await Promise.race([new Promise((done) => server.once("exit", done)), pause(30_000)]);
    if (server.exitCode === null) server.kill();
  }
  await writeFile(join(dir, "desktop-server.log"), serverLogs);
}
