import type { components } from "@/lib/api-schema/isles";

export type IslesServer = components["schemas"]["Server"];
export type IslesConnection = components["schemas"]["Connection"];
export type IslesConfig = components["schemas"]["Config"];
export type IslesStatus = components["schemas"]["GameStatus"];
export type IslesInstance = components["schemas"]["Instance"];
export type IslesRuntime = components["schemas"]["Runtime"];

export async function islesRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/isles/${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${(await res.text()).slice(0, 240)}`);
  }
  if (res.status === 204 || res.status === 202) return undefined as T;
  return (await res.json()) as T;
}
