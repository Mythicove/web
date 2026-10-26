import { defineRouting } from "next-intl/routing";

// 部署级开关（构建期注入）：
// - NEXT_PUBLIC_LOCALE_PREFIX=always：每语言独立 URL（/zh-CN/…、/en/…），利于 SEO 与 hreflang；
// - 默认 never：所有语言同路径，语言由 cookie + Accept-Language 决定（小群体自用、分享链接语言中立）。
export const routing = defineRouting({
  locales: ["zh-CN", "en"],
  defaultLocale: "zh-CN",
  localePrefix: process.env.NEXT_PUBLIC_LOCALE_PREFIX === "always" ? "always" : "never",
});

// 非索引部署默认屏蔽抓取：meta robots 由 layout 输出，UA 黑名单在 proxy.ts 中间件执行。
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";
export const BLOCK_BOTS = process.env.BLOCK_BOTS !== "false" && !INDEXABLE;
