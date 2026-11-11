import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { API_ORIGIN, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

// Fixed destinations and routes: neither an arbitrary URL proxy nor a public
// credential relay. The Isles service token never reaches the browser.
async function proxy(req: Request, context: { params: Promise<{ path: string[] }> }) {
  const origin = process.env.ISLES_URL;
  if (!origin) return Response.json({ error: "Isles is not configured" }, { status: 503 });
  const parts = (await context.params).path;
  if (parts.some((p) => !/^[a-zA-Z0-9_-]+$/.test(p))) return new Response(null, { status: 404 });
  const path = parts.join("/");
  const admin = parts[0] === "admin";
  const player = parts[0] === "players";
  const bridge =
    /^bridge\/[a-z0-9-]+\/(heartbeat|link|identities|tasks(?:\/[a-f0-9]+(?:\/claim)?)?)$/.test(
      path,
    );
  const catalog =
    /^catalog\/(modrinth\/(search|versions\/[a-zA-Z0-9_-]+|hash\/[a-fA-F0-9]{128})|hangar\/(search|versions\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+))$/.test(
      path,
    );
  if (
    !admin &&
    !player &&
    !bridge &&
    !(catalog && req.method === "GET") &&
    (req.method !== "GET" ||
      !/^(servers(?:\/[a-z0-9-]+(?:\/status)?)?|packs\/[a-f0-9]{64})$/.test(path))
  ) {
    return new Response(null, { status: 404 });
  }
  const headers: Record<string, string> = {};
  try {
    if ((admin || player) && req.method !== "GET") {
      const suppliedOrigin = req.headers.get("origin");
      const allowed = [new URL(req.url).origin, process.env.NEXT_PUBLIC_WEB_URL].filter(Boolean);
      if (
        (suppliedOrigin && !allowed.includes(suppliedOrigin)) ||
        !req.headers.get("content-type")?.startsWith("application/json")
      )
        return new Response(null, { status: 403 });
    }
    if (bridge) headers.Authorization = req.headers.get("authorization") ?? "";
    if (player) {
      const session = (await cookies()).get(SESSION_COOKIE)?.value;
      if (!session) return new Response(null, { status: 401 });
      const identityHeaders = { Cookie: `${SESSION_COOKIE}=${session}` };
      const webSession = await fetch(`${API_ORIGIN}/account/me`, {
        headers: identityHeaders,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!webSession.ok) return new Response(null, { status: 401 });
      await webSession.body?.cancel();
      const owned = await fetch(`${API_ORIGIN}/account/players`, {
        headers: identityHeaders,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!owned.ok) return new Response(null, { status: 401 });
      const players = (await owned.json()) as { id: string; name: string }[];
      if (parts.length === 1 && req.method === "GET")
        return Response.json(
          players.map(({ id, name }) => ({ id, name })),
          { headers: { "Cache-Control": "no-store" } },
        );
      if (
        parts.length !== 3 ||
        !["links", "pair"].includes(parts[2]) ||
        !players.some((p) => p.id === parts[1])
      )
        return new Response(null, { status: 403 });
      const serviceToken = process.env.ISLES_ADMIN_TOKEN;
      if (!serviceToken) return new Response(null, { status: 503 });
      headers.Authorization = `Bearer ${serviceToken}`;
      headers["X-Isles-Player"] = parts[1];
    }
    if (admin) {
      const serviceToken = process.env.ISLES_ADMIN_TOKEN;
      if (!serviceToken)
        return Response.json({ error: "Isles management is not configured" }, { status: 503 });
      const manual = req.headers.get("authorization");
      const session = (await cookies()).get(SESSION_COOKIE)?.value;
      if (!manual && !session) return new Response(null, { status: 401 });
      // Mirror is the sole authority for its administrators. Check on every call
      // so banning/demotion immediately removes the proxy's management access.
      const checked = await fetch(`${API_ORIGIN}/api/admin/site`, {
        headers: manual ? { Authorization: manual } : { Cookie: `${SESSION_COOKIE}=${session}` },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!checked.ok) return new Response(null, { status: checked.status === 401 ? 401 : 403 });
      await checked.body?.cancel();
      headers.Authorization = `Bearer ${serviceToken}`;
      // Pseudonymous session identifier, never the raw Mirror credential.
      headers["X-Isles-Actor"] = `mirror:${createHash("sha256")
        .update(manual ?? session!)
        .digest("hex")
        .slice(0, 16)}`;
    }
    let body: Uint8Array | undefined;
    if (req.method !== "GET" && req.body) {
      const reader = req.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 256 * 1024) {
          await reader.cancel();
          return new Response(null, { status: 413 });
        }
        chunks.push(value);
      }
      body = Buffer.concat(chunks);
    }
    headers["Content-Type"] = "application/json";
    const query = catalog ? new URL(req.url).search : "";
    const res = await fetch(`${origin.replace(/\/+$/, "")}/api/isles/${path}${query}`, {
      method: req.method,
      headers,
      body: body as BodyInit | undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(100_000),
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "content-disposition", "retry-after"]) {
      const value = res.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(res.body, { status: res.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: "Integration service is unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
