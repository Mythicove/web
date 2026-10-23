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
export async function POST(req: Request) {
  let email = "";
  let password = "";
  try {
    ({ email, password } = (await req.json()) as { email: string; password: string });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const res = await fetch(`${API_ORIGIN}/authserver/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: res.status });
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
