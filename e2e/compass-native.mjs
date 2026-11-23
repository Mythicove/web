// Windows native WebView2 smoke. Supply the built executable explicitly; use a
// fresh portable deployment so real user accounts/settings are never touched.
import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, copyFile, writeFile, mkdir, readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

if (process.platform !== "win32" || !process.env.COMPASS_EXE)
  throw new Error("Set COMPASS_EXE to a built Windows Tauri executable.");
const dir = await mkdtemp(join(tmpdir(), "compass-native-"));
await copyFile(process.env.COMPASS_EXE, join(dir, "compass.exe"));
await writeFile(join(dir, "portable.txt"), "");
await mkdir(join(dir, "data"));
await writeFile(
  join(dir, "data", "compass.json"),
  JSON.stringify({
    apiUrl: "http://127.0.0.1:1",
    hoardUrl: process.env.COMPASS_HOARD_URL ?? "http://127.0.0.1:1",
    language: "zh-CN",
    theme: "dark",
    download: { concurrency: 4, mirror: "" },
    defaults: { memoryMb: 2048 },
  }),
);
const startedAt = performance.now();
const processHandle = spawn(join(dir, "compass.exe"), [], {
  cwd: dir,
  env: {
    ...process.env,
    WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: "--remote-debugging-port=19202",
    WEBVIEW2_USER_DATA_FOLDER: join(dir, "webview"),
  },
});
processHandle.stdout.on("data", (data) => process.stdout.write(data));
processHandle.stderr.on("data", (data) => process.stderr.write(data));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      browser = await chromium.connectOverCDP("http://127.0.0.1:19202");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  assert(
    browser,
    `Native WebView2 CDP did not become available (process exit ${processHandle.exitCode}; directory ${dir})`,
  );
  const page = await (async () => {
    for (let i = 0; i < 100; i++) {
      const p = browser
        .contexts()
        .flatMap((c) => c.pages())
        .find((p) => !p.url().startsWith("devtools:"));
      if (p) return p;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("No WebView page");
  })();
  await page.getByRole("heading", { name: "开始游戏", exact: true }).waitFor();
  const coldReadyMs = Math.round(performance.now() - startedAt);
  const paths = await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("paths_info"));
  assert.equal(
    paths.root.toLowerCase().replaceAll("\\", "/"),
    join(dir, "data").toLowerCase().replaceAll("\\", "/"),
    "Native test requires an isolated portable deployment",
  );
  await page.getByLabel("玩家名", { exact: true }).fill("中文输入测试Alex");
  await page.getByLabel("启动器独立密码", { exact: true }).fill("not-submitted");
  assert.equal(await page.getByLabel("玩家名", { exact: true }).inputValue(), "中文输入测试Alex");
  assert(await page.getByRole("button", { name: "启动游戏", exact: true }).isDisabled());
  await page.getByRole("checkbox", { name: "界面音效", exact: true }).uncheck();
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    userAgent: navigator.userAgent,
  }));
  assert.equal(metrics.overflow, false);
  await page.screenshot({ path: join(dir, "webview2.png"), fullPage: true });
  const manifest = {
    native: "Windows WebView2",
    artifactSha256: createHash("sha256")
      .update(await readFile(join(dir, "compass.exe")))
      .digest("hex"),
    coldReadyMs,
    navigation: await page.evaluate(() => performance.getEntriesByType("navigation")[0]?.toJSON()),
    chineseInput: true,
    accountRequired: true,
    ...metrics,
  };
  const matrix = [];
  let labels = ["首页", "实例", "内容", "日志", "设置"];
  for (const locale of ["zh-CN", "en"]) {
    for (const theme of ["dark", "light"]) {
      await page
        .getByRole("navigation")
        .getByRole("button", { name: labels[4], exact: true })
        .click();
      await page
        .getByRole("combobox", {
          name: labels[4] === "Settings" ? "Language" : "语言",
          exact: true,
        })
        .selectOption(locale);
      await page
        .getByRole("combobox", { name: labels[4] === "Settings" ? "Theme" : "主题", exact: true })
        .selectOption(theme);
      await page
        .getByRole("button", { name: labels[4] === "Settings" ? "Save" : "保存", exact: true })
        .click();
      labels =
        locale === "en"
          ? ["Home", "Instances", "Content", "Logs", "Settings"]
          : ["首页", "实例", "内容", "日志", "设置"];
      await page.waitForFunction(
        (value) => document.documentElement.dataset.theme === value,
        theme,
      );
      for (const width of [1200, 760]) {
        await page.setViewportSize({ width, height: 800 });
        for (const [index, view] of [
          "home",
          "instances",
          "content",
          "logs",
          "settings",
        ].entries()) {
          await page
            .getByRole("navigation")
            .getByRole("button", { name: labels[index], exact: true })
            .click();
          await page.getByRole("heading", { level: 1 }).waitFor();
          // Unsupported glyphs intentionally keep the readable text fallback;
          // bitmap-ready is not a universal component-settled signal.
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
              ),
          );
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
          );
          assert.equal(overflow, false, `${locale}/${theme}/${width}/${view} overflows`);
          await page.screenshot({
            path: join(dir, `${locale}-${theme}-${width}-${view}.png`),
            fullPage: true,
          });
          matrix.push({ locale, theme, width, view, overflow });
        }
      }
    }
  }
  manifest.matrix = matrix;
  // Real filesystem-backed creation and settings cover the controls that an
  // empty-instance matrix cannot reach. Versions come from the normal backend.
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Instances", exact: true })
    .click();
  await page.getByRole("button", { name: "New instance", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("UIAcceptance");
  await page
    .getByRole("combobox", { name: "Game version", exact: true })
    .selectOption("1.21.1", { timeout: 90_000 });
  await page.getByRole("checkbox", { name: "Include snapshots", exact: true }).check();
  await page.getByRole("checkbox", { name: "Include snapshots", exact: true }).uncheck();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByText("UIAcceptance", { exact: true }).waitFor();
  await page.getByRole("main").getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("中文实例验收");
  await page
    .getByLabel("Extra JVM arguments (one per line)", { exact: true })
    .fill("-Dcompass.ui=中文");
  await page.getByRole("checkbox", { name: "Window size on launch", exact: true }).check();
  await page.getByLabel("Width", { exact: true }).fill("854");
  await page.getByLabel("Height", { exact: true }).fill("480");
  await page.getByRole("checkbox", { name: "Join a server on launch", exact: true }).check();
  await page.getByLabel("Address", { exact: true }).fill("127.0.0.1");
  await page.getByRole("checkbox", { name: "Demo mode", exact: true }).check();
  await page.getByRole("checkbox", { name: "Demo mode", exact: true }).uncheck();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(
    () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  await page.screenshot({ path: join(dir, "instance-settings-edited.png"), fullPage: true });
  await page.getByRole("button", { name: "Save settings", exact: true }).click();
  await page.getByText("中文实例验收", { exact: true }).waitFor();
  const savedInstances = await page.evaluate(() =>
    window.__TAURI_INTERNALS__.invoke("instance_list"),
  );
  const savedInstance = savedInstances.find((instance) => instance.name === "中文实例验收");
  assert(savedInstance, "Edited instance was not saved through the UI");
  assert.deepEqual(savedInstance.extraJvmArgs, ["-Dcompass.ui=中文"]);
  assert.deepEqual(savedInstance.resolution, { width: 854, height: 480 });
  assert.equal(savedInstance.server.host, "127.0.0.1");
  assert.equal(savedInstance.demo, false);
  manifest.instanceSettings = {
    chineseName: true,
    unicodeTextarea: true,
    resolution: true,
    server: true,
    demoToggle: true,
    saved: true,
  };
  const fileDialog = fileURLToPath(new URL("./compass-file-dialog.ps1", import.meta.url));
  async function selectNativeFile(button, filePath) {
    await button.click({ noWaitAfter: true });
    const result = spawnSync(
      "pwsh",
      [
        "-NoProfile",
        "-File",
        fileDialog,
        "-RootProcessId",
        String(processHandle.pid),
        "-FilePath",
        filePath,
      ],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
  }
  await page.getByRole("main").getByRole("button", { name: "Content", exact: true }).click();
  const sourceMod = fileURLToPath(new URL("./fixtures/test-mod.jar", import.meta.url));
  await selectNativeFile(page.getByRole("button", { name: "Import", exact: true }), sourceMod);
  const content = await page.evaluate(
    (slug) => window.__TAURI_INTERNALS__.invoke("content_list", { slug, kind: "mods" }),
    savedInstance.slug,
  );
  assert.equal(content.items.length, 1);
  assert(content.items[0].meta?.id);
  const modRow = page.getByRole("row").filter({ hasText: content.items[0].displayName });
  await modRow.getByRole("button", { name: "Disable", exact: true }).click();
  await modRow.getByRole("button", { name: "Enable", exact: true }).click();
  await page.getByRole("button", { name: "Check dependencies & conflicts", exact: true }).click();
  await page.getByRole("heading", { name: "Dependency check", exact: true }).waitFor();
  await page.screenshot({ path: join(dir, "imported-content.png"), fullPage: true });
  page.once("dialog", (dialog) => dialog.accept());
  await modRow.getByRole("button", { name: "Delete", exact: true }).click();
  await modRow.waitFor({ state: "detached" });
  assert.deepEqual(
    (await readdir(content.dir)).filter((name) => name !== "disabled"),
    [],
  );
  assert.deepEqual(await readdir(join(content.dir, "disabled")), []);
  if (process.env.COMPASS_HOARD_URL) {
    await page
      .getByRole("textbox", { name: "Search mods…", exact: true })
      .fill("Compass acceptance mod");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const project = page.locator("section.clickable").filter({ hasText: "Compass acceptance mod" });
    await project.click();
    await project.getByRole("button", { name: "Install", exact: true }).click();
    await page.getByText("Installed test-mod.jar", { exact: true }).waitFor();
    const downloaded = await page.evaluate(
      (slug) => window.__TAURI_INTERNALS__.invoke("content_list", { slug, kind: "mods" }),
      savedInstance.slug,
    );
    assert.equal(downloaded.items.length, 1);
    assert.deepEqual(
      await readFile(join(downloaded.dir, "test-mod.jar")),
      await readFile(sourceMod),
    );
    manifest.hoard = { realServiceSearch: true, installButton: true, downloadedBytesMatch: true };
  }
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Instances", exact: true })
    .click();
  const instanceCard = page
    .locator(".card")
    .filter({ has: page.getByText("中文实例验收", { exact: true }) });
  await instanceCard.getByRole("button", { name: "Duplicate", exact: true }).click();
  await page.getByLabel("Name for the copy", { exact: true }).fill("中文副本验收");
  await instanceCard.getByRole("button", { name: "Duplicate", exact: true }).last().click();
  await page.getByText("中文副本验收", { exact: true }).waitFor();
  const duplicated = await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("instance_list"));
  assert.equal(duplicated.length, 2);
  assert.deepEqual(
    duplicated.find((instance) => instance.name === "中文副本验收").extraJvmArgs,
    savedInstance.extraJvmArgs,
  );
  const copyCard = page
    .locator(".card")
    .filter({ has: page.getByText("中文副本验收", { exact: true }) });
  await copyCard.getByRole("button", { name: "Export", exact: true }).click();
  await copyCard.getByRole("checkbox", { name: "Include worlds", exact: true }).waitFor();
  const archivePath = join(dir, "roundtrip.zip");
  await selectNativeFile(
    copyCard.getByRole("button", { name: "Export", exact: true }).last(),
    archivePath,
  );
  await page.getByText("Exported", { exact: false }).waitFor();
  assert((await readFile(archivePath)).length > 0);
  await selectNativeFile(
    page.getByRole("button", { name: "Import instance", exact: true }),
    archivePath,
  );
  const importReview = page
    .locator(".card")
    .filter({ has: page.getByRole("heading", { name: "Confirm import", exact: true }) });
  await importReview.getByLabel("Name", { exact: true }).fill("导入副本验收");
  assert.equal(
    (await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("instance_list"))).length,
    2,
  );
  await importReview.getByRole("button", { name: "Import", exact: true }).click();
  await page.getByText("导入副本验收", { exact: true }).waitFor();
  const imported = (
    await page.evaluate(() => window.__TAURI_INTERNALS__.invoke("instance_list"))
  ).find((instance) => instance.name === "导入副本验收");
  assert.deepEqual(imported.extraJvmArgs, savedInstance.extraJvmArgs);
  if (process.env.COMPASS_HOARD_URL) {
    const importedContent = await page.evaluate(
      (slug) => window.__TAURI_INTERNALS__.invoke("content_list", { slug, kind: "mods" }),
      imported.slug,
    );
    assert.deepEqual(
      await readFile(join(importedContent.dir, "test-mod.jar")),
      await readFile(sourceMod),
    );
  }
  manifest.business = {
    nativeFileImport: true,
    modMetadata: true,
    enableDisable: true,
    dependencyCheck: true,
    removal: true,
    duplicate: true,
    nativeArchiveExport: true,
    reviewedArchiveImport: true,
  };
  manifest.resources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter(({ name }) => name.includes("/assets/"))
      .map(({ name, duration, transferSize, decodedBodySize }) => ({
        name,
        duration,
        transferSize,
        decodedBodySize,
      })),
  );
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  manifest.rendererMetrics = (await session.send("Performance.getMetrics")).metrics;
  const warmStart = performance.now();
  await page.reload();
  await page.getByRole("heading", { name: "Play Minecraft", exact: true }).waitFor();
  manifest.warmReloadReadyMs = Math.round(performance.now() - warmStart);
  await writeFile(join(dir, "scenario-result.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ directory: dir, ...manifest }));
} catch (error) {
  const page = browser
    ?.contexts()
    .flatMap((context) => context.pages())
    .find((candidate) => !candidate.url().startsWith("devtools:"));
  if (page) {
    await page.screenshot({ path: join(dir, "failure.png"), fullPage: true });
    await writeFile(join(dir, "failure-ui.txt"), await page.locator("body").innerText());
  }
  console.error(`Native artifacts: ${dir}`);
  throw error;
} finally {
  await browser?.close();
  processHandle.kill();
}
