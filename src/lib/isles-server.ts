import "server-only";
import type { IslesServer } from "./isles";

export async function readServers(): Promise<{ servers: IslesServer[]; available: boolean }> {
  const origin = process.env.ISLES_URL;
  if (!origin) return { servers: [], available: true };
  try {
    const res = await fetch(`${origin.replace(/\/+$/, "")}/api/isles/servers`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { servers: [], available: false };
    return { servers: (await res.json()) as IslesServer[], available: true };
  } catch {
    return { servers: [], available: false };
  }
}
