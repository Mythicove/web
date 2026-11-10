import { test, expect } from "@playwright/test";

test("grasscn launch workflow handles missing account, failure, retry, stop and Chinese labels", async ({
  page,
}, testInfo) => {
  // The native transport is the external boundary. The React application,
  // components, event consumers and visual assets are production code.
  await page.addInitScript(() => {
    const callbacks = new Map<number, (event: unknown) => void>();
    const listeners = new Map<string, number[]>();
    let next = 1;
    let running: string | null = null;
    let attempts = 0;
    const commands: string[] = [];
    Object.assign(window, { __compassCommands: commands });
    const account = {
      playerName: "Alex",
      playerUuid: "95db2f2560a54c75adfba69de4db748e",
      apiUrl: "https://community.example.org",
      signedInAt: 1,
      kind: "yggdrasil",
    };
    let loggedIn = false;
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        transformCallback(callback: (event: unknown) => void) {
          const id = next++;
          callbacks.set(id, callback);
          return id;
        },
        unregisterCallback(id: number) {
          callbacks.delete(id);
        },
        async invoke(command: string, args: Record<string, unknown> = {}) {
          commands.push(command);
          switch (command) {
            case "get_config":
              return {
                apiUrl: account.apiUrl,
                hoardUrl: account.apiUrl,
                language: "zh-CN",
                theme: "dark",
                download: { concurrency: 4, mirror: "" },
                defaults: { memoryMb: 2048 },
              };
            case "auth_check":
              return { account: null, expired: false };
            case "auth_login":
              loggedIn = true;
              return account;
            case "accounts_list":
              return {
                accounts: loggedIn ? [{ ...account, id: "alex", lastUsedAt: 1 }] : [],
                activeId: loggedIn ? "alex" : null,
                store: { kind: "file", encrypted: false, path: "fixture" },
              };
            case "instance_list":
              return [
                {
                  slug: "survival",
                  name: "朋友一起玩的长期生存服务器实例",
                  versionId: "1.21.1",
                  settings: {},
                },
              ];
            case "game_running":
              return running;
            case "mirror_skin_data_url":
              return null;
            case "instance_launch":
              attempts++;
              for (const handler of listeners.get("compass://progress") ?? [])
                callbacks.get(handler)?.({
                  event: "compass://progress",
                  id: handler,
                  payload: {
                    url: "https://piston-data.mojang.com/fixture",
                    doneBytes: 5,
                    totalBytes: 10,
                  },
                });
              await new Promise((r) => setTimeout(r, 200));
              if (attempts === 1)
                throw { code: "not_found", message: "Fixture game version not installed" };
              running = "survival";
              return { instance: running, versionId: "1.21.1", java: "java", javaVersion: 21 };
            case "instance_stop":
              running = null;
              return true;
            case "plugin:event|listen": {
              const event = String(args.event);
              const handler = Number(args.handler);
              listeners.set(event, [...(listeners.get(event) ?? []), handler]);
              return handler;
            }
            case "plugin:event|unlisten":
              return;
            case "cli_intent":
              return { unknown: [], launch: false, instance: null, importModpack: null };
            default:
              return null;
          }
        },
      },
      __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener() {} },
    });
  });
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const launch = page.getByRole("button", { name: "启动游戏", exact: true });
  await expect(launch).toBeDisabled();
  await page.getByLabel("玩家名", { exact: true }).fill("Alex");
  await page.getByLabel("启动器独立密码", { exact: true }).fill("independent-password");
  await expect(page.getByLabel("玩家名", { exact: true })).toHaveCSS("border-radius", "0px");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(launch).toBeEnabled();
  await launch.click();
  await expect(page.locator(".start-error")).toBeVisible();
  await expect(launch).toBeEnabled();
  await launch.click();
  await expect(page.getByRole("button", { name: "停止游戏", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "停止游戏", exact: true }).click();
  await expect(launch).toBeEnabled();
  await page.getByLabel("界面音效").uncheck();
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 960, height: 640 });
    await page.evaluate((value) => {
      document.documentElement.style.zoom = String(value);
    }, zoom);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await testInfo.attach(`compass-${zoom}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
  const commands = await page.evaluate(
    () => (window as unknown as { __compassCommands: string[] }).__compassCommands,
  );
  expect(commands.filter((c) => c === "instance_launch")).toHaveLength(2);
  expect(commands).toContain("instance_stop");
  await testInfo.attach("compass-result.json", {
    body: JSON.stringify(
      {
        accountRequired: true,
        launchAttempts: 2,
        retry: "succeeded",
        stop: true,
        chineseLabels: true,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
