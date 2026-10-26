import type { MetadataRoute } from "next";
import { INDEXABLE, routing } from "@/i18n/routing";

// 仅公开内容页进 sitemap；非索引部署返回空（配合 robots disallow）。
const PATHS = ["", "/skins", "/mods", "/login", "/register"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXABLE) return [];
  const base = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
  const prefixed = process.env.NEXT_PUBLIC_LOCALE_PREFIX === "always";
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const p of PATHS) {
      const prefix = prefixed ? `/${locale}` : "";
      entries.push({
        url: `${base}${prefix}${p}`,
        alternates: prefixed
          ? { languages: Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}${p}`])) }
          : undefined,
      });
    }
  }
  return entries;
}

export const dynamic = "force-static";
