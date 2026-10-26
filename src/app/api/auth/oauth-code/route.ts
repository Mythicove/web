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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const data = (await res.json()) as {
    accessToken: string;
    playerName?: string;
    playerId?: string;
  };
  const jar = await cookies();
  setSessionCookie(jar, data.accessToken);
  // 回给浏览器的只有非敏感元数据
  return NextResponse.json({
    clientToken: "",
    playerName: data.playerName ?? "",
    playerId: data.playerId ?? "",
  });
}
