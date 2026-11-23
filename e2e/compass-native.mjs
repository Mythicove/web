// Windows native WebView2 smoke. Supply the built executable explicitly; use a
// fresh portable deployment so real user accounts/settings are never touched.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtemp, copyFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

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
    hoardUrl: "http://127.0.0.1:1",
    language: "zh-CN",
    theme: "dark",
    download: { concurrency: 4, mirror: "" },
    defaults: { memoryMb: 2048 },
  }),
);
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
  await writeFile(join(dir, "scenario-result.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ directory: dir, ...manifest }));
} finally {
  await browser?.close();
  processHandle.kill();
}
