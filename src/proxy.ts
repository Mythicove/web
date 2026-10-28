import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { BLOCK_BOTS, routing } from "./i18n/routing";
import { SESSION_COOKIE } from "./lib/session";

const intl = createMiddleware(routing);

// 登录态页面的前置守卫：仅做 UX 级跳转（会话存在性），
// 角色/权限校验仍由后端负责，前端守卫不充当安全边界。
// 注意：/admin 不做前置重定向——它自身有 token/会话门，且手贴 token 是
// "无法登录时的救援通道"，前置重定向会把它一并锁死；爆破防护靠服务端限流。
const PROTECTED = ["/profile"];

// 已知抓取/爬取/AI 训练 bot 的 UA 特征。仅在非索引部署（默认）启用，
// 作为 meta robots 的增强：礼貌 bot 看 meta，不礼貌的靠 403。
const BOT_UA =
  /(scrapy|python-requests|go-http-client|httpclient|curl\/|wget\/|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt-user|oai-searchbot|ccbot|anthropic-ai|claude-web|cohere-ai|perplexitybot|amazonbot|facebookbot|twitterbot|linkedinbot|telegrambot|discordbot|slackbot|applebot|bingbot|googlebot|baiduspider|yandexbot|sogou|webcrawler)/i;

export default function proxy(req: NextRequest) {
  if (BLOCK_BOTS) {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT_UA.test(ua)) {
      return new NextResponse(null, { status: 403 });
    }
  }

  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const locales: readonly string[] = routing.locales;
  const locale = locales.includes(first) ? first : null;
  const rest = locale ? `/${segments.slice(1).join("/")}` : req.nextUrl.pathname;

  // never 模式下旧的前缀链接交给 next-intl 中间件处理（307 + 语言 cookie 同步），不在此手写重定向。

  if (PROTECTED.some((p) => rest === p || rest.startsWith(`${p}/`))) {
    if (!req.cookies.has(SESSION_COOKIE)) {
      const url = req.nextUrl.clone();
      url.pathname = `${locale ? `/${locale}` : ""}/login`;
      url.search = `?next=${encodeURIComponent(rest)}`;
      return NextResponse.redirect(url);
    }
  }

  return intl(req);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
