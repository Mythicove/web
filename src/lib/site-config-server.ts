import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeSiteConfig, type SiteConfig } from "./site-config-types";

let cached: SiteConfig | null = null;

// 服务端读取站点配置（构建/运行期 public 目录），进程内缓存。
export async function readSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;
  try {
    const raw = await readFile(path.join(process.cwd(), "public", "site-config.json"), "utf8");
    cached = normalizeSiteConfig(JSON.parse(raw));
  } catch {
    cached = normalizeSiteConfig(null);
  }
  return cached;
}
