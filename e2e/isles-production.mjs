// Match the production Docker image: standalone server plus public/static assets.
import { cp } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

await cp("public", ".next/standalone/public", { recursive: true, force: true });
await cp(".next/static", ".next/standalone/.next/static", { recursive: true, force: true });
const server = spawn(process.execPath, [resolve(".next/standalone/server.js")], {
  env: { ...process.env, HOSTNAME: "localhost", PORT: "19185" },
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
