// gen-api.mjs — 从 ../api/specs 的 OpenAPI 契约生成 TS 类型（跨平台）。
// 用法：node scripts/gen-api.mjs ；可用 API_SPECS_DIR 覆盖契约目录。
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const here = dirname(fileURLToPath(import.meta.url));
const specsDir = resolve(here, process.env.API_SPECS_DIR || "../../api/specs");
const outDir = resolve(here, "../src/lib/api-schema");

const targets = [
  { spec: "mirror.openapi.yaml", out: "mirror.ts" },
  { spec: "hoard.openapi.yaml", out: "hoard.ts" },
];

await mkdir(outDir, { recursive: true });
for (const { spec, out } of targets) {
  const input = new URL(`file://${resolve(specsDir, spec)}`);
  const ast = await openapiTS(input);
  const header = `// 由 scripts/gen-api.mjs 从 api/specs/${spec} 生成，请勿手改。\n`;
  await writeFile(resolve(outDir, out), header + astToString(ast), "utf8");
  console.log(`generated src/lib/api-schema/${out}`);
}
