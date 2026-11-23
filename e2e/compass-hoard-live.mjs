// Isolated production Hoard server -> public search/version/download API ->
// native Compass controls. The published input is the repository's actual JAR.
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

assert(process.env.COMPASS_EXE, "Supply COMPASS_EXE for native acceptance.");
const root = fileURLToPath(new URL("../..", import.meta.url));
const directory = await mkdtemp(join(tmpdir(), "compass-hoard-"));
const probe = createServer();
await new Promise((done) => probe.listen(0, "127.0.0.1", done));
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const origin = `http://127.0.0.1:${port}`;
const executable = join(directory, "hoard.exe");
assert.equal(
  spawnSync("go", ["build", "-o", executable, "./cmd/server"], {
    cwd: join(root, "mythic-hoard"),
    env: { ...process.env, GOWORK: "off" },
    stdio: "inherit",
  }).status,
  0,
);
const token = randomBytes(24).toString("hex");
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("HOARD_")),
);
const server = spawn(executable, [], {
  env: {
    ...cleanEnv,
    HOARD_LISTEN_ADDR: `127.0.0.1:${port}`,
    HOARD_BASE_URL: origin,
    HOARD_DATA_DIR: join(directory, "files"),
    HOARD_ADMIN_TOKEN: token,
  },
});
let logs = "";
for (const stream of [server.stdout, server.stderr])
  stream.on("data", (data) => {
    logs += data;
  });
try {
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      if ((await fetch(origin + "/healthz")).ok) break;
    } catch {
      /* startup */
    }
    assert(Date.now() < deadline && server.exitCode === null, "Hoard startup failed");
    await new Promise((done) => setTimeout(done, 100));
  }
  const form = new FormData();
  for (const [key, value] of Object.entries({
    title: "Compass acceptance mod",
    description: "Native launcher acceptance",
    project_type: "mod",
    version_number: "1.0.0",
    loaders: "fabric",
    game_versions: "1.21.1",
  }))
    form.set(key, value);
  form.set(
    "file",
    new Blob([await readFile(new URL("./fixtures/test-mod.jar", import.meta.url))]),
    "test-mod.jar",
  );
  const response = await fetch(origin + "/api/mods", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  assert.equal(response.status, 201, await response.text());
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL("./compass-native.mjs", import.meta.url))],
    { env: { ...process.env, COMPASS_HOARD_URL: origin }, stdio: ["ignore", "pipe", "inherit"] },
  );
  let output = "";
  child.stdout.on("data", (data) => {
    output += data;
    process.stdout.write(data);
  });
  const exit = await new Promise((done, reject) => {
    child.on("error", reject);
    child.on("exit", done);
  });
  await writeFile(join(directory, "native-result.log"), output);
  assert.equal(exit, 0, "Native Hoard scenario failed");
  console.log(
    JSON.stringify({ directory, hoard: "production-memory-store-upload-search-version-download" }),
  );
} finally {
  server.kill();
  await writeFile(join(directory, "hoard.log"), logs.replaceAll(token, "[redacted]"));
}
