import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_ORIGIN, setSessionCookie } from "@/lib/session";

// 第三方登录回跳：mirror 只交一次性换取码（oauth_code，60s、单次消费），
// 会话令牌在这里服务端兑换并直接落 httpOnly cookie —— 令牌全程不进浏览器 URL，
// 也就不会留在浏览历史/书签里（旧实现用 #accessToken= 传令牌）。
export async function POST(req: Request) {
  let code = "";
  try {
    ({ code } = (await req.json()) as { code: string });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const res = await fetch(`${API_ORIGIN}/account/exchange-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 透传客户端 IP（mirror 在受信代理链下自行解析），用于限流/审计
      "x-forwarded-for": req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const data = (await res.json()) as { accessToken: string };
  const jar = await cookies();
  setSessionCookie(jar, data.accessToken);
  // 网站会话不代表任何玩家，故 meta 不含玩家字段（显示哪个玩家由前端从玩家列表里选）
  return NextResponse.json({ clientToken: "" });
}
