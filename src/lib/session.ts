import type { cookies } from "next/headers";

// 会话 cookie：httpOnly + SameSite=Lax。
// CSRF 模型：Lax 阻止跨站请求携带 cookie；且 mirror 所有变更端点仅接受 JSON body
// （跨站表单无法伪造 Content-Type），双层阻断。启动器/游戏客户端不走 cookie，继续用 Bearer 头。
export const SESSION_COOKIE = "mythic_session";

// 与 mirror sessions 表 TTL 对齐（7 天）。
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type CookieJar = Awaited<ReturnType<typeof cookies>>;

export function setSessionCookie(jar: CookieJar, token: string) {
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(jar: CookieJar) {
  jar.delete(SESSION_COOKIE);
}

// 后端 API 地址：服务端取数走内部地址（容器内 localhost 不是 API）。
export const API_ORIGIN =
  process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
