import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeSiteConfig, type SiteBrand, type SiteConfig } from "./site-config-types";

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

// 服务端读取品牌图标配置（mirror 存储、管理后台维护），ISR 缓存 60s。
// 返回浏览器可达的绝对 URL；mirror 不可达或未自定义时返回 {}（回落内置默认图）。
export async function readBrand(): Promise<SiteBrand> {
  const internal =
    process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const publicBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${internal}/api/brand`, { next: { revalidate: 60 } });
    if (!res.ok) return {};
    const c = (await res.json()) as { light?: boolean; dark?: boolean; version?: number };
    const v = c.version ?? 0;
    const brand: SiteBrand = {};
    if (c.light) brand.light = `${publicBase}/api/brand/logo/light?v=${v}`;
    if (c.dark) brand.dark = `${publicBase}/api/brand/logo/dark?v=${v}`;
    return brand;
  } catch {
    return {};
  }
}
