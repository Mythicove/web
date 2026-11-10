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
  await page.getByLabel("玩家名", { exact: true }).fill("中文输入测试Alex");
  await page.getByLabel("启动器独立密码", { exact: true }).fill("not-submitted");
  assert.equal(await page.getByLabel("玩家名", { exact: true }).inputValue(), "中文输入测试Alex");
  assert(await page.getByRole("button", { name: "启动游戏", exact: true }).isDisabled());
  await page.getByLabel("界面音效").uncheck();
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
  await writeFile(join(dir, "scenario-result.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ directory: dir, ...manifest }));
} finally {
  await browser?.close();
  processHandle.kill();
}
