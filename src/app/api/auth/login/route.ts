import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_ORIGIN, setSessionCookie } from "@/lib/session";

interface LoginSession {
  accessToken: string;
  clientToken: string;
}

// 服务端登录：token 只进 httpOnly cookie，响应仅回非敏感 meta。
// 走 mirror 的 web 专用端点 /account/login（邮箱 + 主密码；login scope 启用时强制验证码）。
// 启动器不走这里：它用 /authserver/authenticate（玩家名 + 该玩家的独立密码），
// 所以站点可以在第三方登录可用后关掉主密码登录而不影响进服。
// 网站会话不代表任何玩家，故 meta 不含玩家字段——显示哪个玩家由前端从玩家列表里选。
export async function POST(req: Request) {
  let email = "";
  let password = "";
  let captchaToken: string | undefined;
  try {
    ({ email, password, captchaToken } = (await req.json()) as {
      email: string;
      password: string;
      captchaToken?: string;
    });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const res = await fetch(`${API_ORIGIN}/account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, captchaToken }),
    cache: "no-store",
  });
  if (!res.ok) {
    // 透传 mirror 的错误文案/错误码与状态码：验证码失败(400)、凭据错误(403)、
    // 主密码登录已关闭(403 + password_login_disabled) 由此可区分
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return NextResponse.json(
      { error: body?.error ?? "invalid_credentials" },
      { status: res.status },
    );
  }
  const data = (await res.json()) as LoginSession;

  const jar = await cookies();
  setSessionCookie(jar, data.accessToken);
  return NextResponse.json({ clientToken: data.clientToken });
}
