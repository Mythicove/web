import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_ORIGIN, setSessionCookie } from "@/lib/session";

// OAuth 完成：mirror 回调把 accessToken 经 URL fragment 交回浏览器（fragment 不落服务器日志），
// 本端点校验后立即转入 httpOnly cookie，客户端随即清除地址栏痕迹。
export async function POST(req: Request) {
  let accessToken = "";
  try {
    ({ accessToken } = (await req.json()) as { accessToken: string });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const val = await fetch(`${API_ORIGIN}/authserver/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
    cache: "no-store",
  });
  if (!val.ok) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const jar = await cookies();
  setSessionCookie(jar, accessToken);
  // OAuth 流拿不到玩家名（与改造前行为一致），meta 为空壳。
  return NextResponse.json({ clientToken: "" });
}
