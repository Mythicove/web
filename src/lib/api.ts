const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const HOARD_BASE = process.env.NEXT_PUBLIC_HOARD_API_URL ?? "http://localhost:8081";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface RegisterBody {
  email: string;
  password: string;
  nickname: string;
  playerName: string;
  captchaToken?: string;
  inviteCode?: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface AuthenticateResponse {
  accessToken: string;
  clientToken: string;
  availableProfiles: Player[];
  selectedProfile?: Player;
}

export interface SkinLibItem {
  id: string;
  owner_user_id: string;
  player_name: string;
  texture_key: string;
  description: string;
  model: string;
  likes: number;
}

export interface HoardProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  project_type: string;
  loaders?: string[];
  game_versions?: string[];
  downloads: number;
  published: string;
}

export const apiClient = {
  register: (body: RegisterBody) =>
    api<{ id: string }>("/account/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  authenticate: (email: string, password: string) =>
    api<AuthenticateResponse>("/authserver/authenticate", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    }),

  listSkinLib: (offset = 0, limit = 20) =>
    api<SkinLibItem[]>(`/skinlib?offset=${offset}&limit=${limit}`),

  uploadSkin: async (name: string, model: string, file: File, token: string) => {
    const res = await fetch(`${BASE}/skin/${name}?model=${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: await file.arrayBuffer(),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  skinUrl: (name: string) => `${BASE}/skin/${name}`,
};

export const hoardClient = {
  listMods: async (): Promise<HoardProject[]> => {
    const res = await fetch(`${HOARD_BASE}/api/mods`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },

  uploadMod: async (form: FormData, adminToken: string) => {
    const res = await fetch(`${HOARD_BASE}/api/mods`, {
      method: "POST",
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      body: form,
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  downloadUrl: (id: string) => `${HOARD_BASE}/api/mods/${id}/download`,
  mrpackUrl: (id: string, vid: string) => `${HOARD_BASE}/v2/project/${id}/version/${vid}/mrpack`,
};
