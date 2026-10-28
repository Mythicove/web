import type { MetadataRoute } from "next";
import { INDEXABLE } from "@/i18n/routing";

// 非索引部署（默认）全站 disallow；SEO 部署放开并指向 sitemap。
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const base = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}

export const dynamic = "force-static";
