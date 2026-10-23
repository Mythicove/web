import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_ORIGIN, SESSION_COOKIE, clearSessionCookie } from "@/lib/session";

// 登出：尽力使服务端会话失效（clientToken 传空按 token 删除），然后清 cookie。
export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await fetch(`${API_ORIGIN}/authserver/invalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, clientToken: "" }),
        cache: "no-store",
      });
    } catch {
      // 后端不可达时仍清 cookie（本地登出语义优先）
    }
  }
  clearSessionCookie(jar);
  return new NextResponse(null, { status: 204 });
}
