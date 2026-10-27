import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_ORIGIN, setSessionCookie } from "@/lib/session";

interface AuthenticateResponse {
  accessToken: string;
  clientToken: string;
  selectedProfile?: { id: string; name: string };
  availableProfiles?: { id: string; name: string }[];
}

// 服务端登录：token 只进 httpOnly cookie，响应仅回非敏感 meta。
// 走 mirror 的 web 专用端点 /account/login（login scope 启用时强制验证码；
// 启动器仍走 /authserver/authenticate，两者后端共用同一认证实现与限流桶）。
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
    // 透传 mirror 的（已本地化）错误文案与状态码：验证码失败(400)与凭据错误(403)可区分
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return NextResponse.json(
      { error: body?.error ?? "invalid_credentials" },
      { status: res.status },
    );
  }
  const data = (await res.json()) as AuthenticateResponse;
  const meta = {
    clientToken: data.clientToken,
    playerName: data.selectedProfile?.name ?? data.availableProfiles?.[0]?.name,
    playerId: data.selectedProfile?.id ?? data.availableProfiles?.[0]?.id,
  };

  const jar = await cookies();
  setSessionCookie(jar, data.accessToken);
  return NextResponse.json(meta);
}
