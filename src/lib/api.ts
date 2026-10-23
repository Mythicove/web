// 单 API 域名：mirror 与 hoard 的路由不冲突，经同一反代按路径分流。
// 类型来自 api/specs 生成的 schema（pnpm gen:api），不要手写重复定义。
import type { components as mirror } from "@/lib/api-schema/mirror";
import type { components as hoard } from "@/lib/api-schema/hoard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiBase = API_URL;

export type RegisterBody = mirror["schemas"]["RegisterRequest"];
export type Player = mirror["schemas"]["Player"];
export type AuthenticateResponse = mirror["schemas"]["AuthenticateResponse"];
export type LoginMethod = mirror["schemas"]["LoginMethod"];
export type Announcement = mirror["schemas"]["Announcement"];
export type SkinLibItem = mirror["schemas"]["SkinLibItem"];
export type AdminUser = mirror["schemas"]["AdminUser"];
export type HoardProject = hoard["schemas"]["Project"];
export type HoardVersion = hoard["schemas"]["Version"];
export type HoardFile = hoard["schemas"]["File"];
export type HoardSearchResponse = hoard["schemas"]["SearchResponse"];

export interface SearchResult<T> {
  hits: T[];
  offset: number;
  limit: number;
  total_hits: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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

const authHeaders = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

export const apiClient = {
  register: (body: RegisterBody) =>
    api<{ id: string }>("/account/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyEmail: (token: string) =>
    api<void>("/account/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) =>
    api<void>("/account/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    api<void>("/account/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  authenticate: (email: string, password: string) =>
    api<AuthenticateResponse>("/authserver/authenticate", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    }),

  oauthUrl: (provider: string, redirectUrl: string) =>
    `${API_URL}/oauth/${provider}/auth?state=${encodeURIComponent(redirectUrl)}`,

  listLoginMethods: () =>
    api<{ methods: LoginMethod[] }>("/api/login-methods"),

  announcement: () => api<Announcement>("/api/announcement"),

  listSkinLib: (offset = 0, limit = 20) =>
    api<SkinLibItem[]>(`/skinlib?offset=${offset}&limit=${limit}`),

  skinTextureUrl: (key: string) => `${API_URL}/textures/${key}`,

  likeSkin: (id: string) =>
    api<void>(`/skinlib/${id}/like`, { method: "POST" }),

  commentSkin: (id: string, content: string, token: string) =>
    api<void>(`/skinlib/${id}/comment`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ content }),
    }),

  uploadSkin: async (name: string, model: string, file: File, token: string) => {
    const res = await fetch(`${API_URL}/skin/${name}?model=${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: await file.arrayBuffer(),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  uploadCape: async (name: string, file: File, token: string) => {
    const res = await fetch(`${API_URL}/cape/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: await file.arrayBuffer(),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  skinUrl: (name: string) => `${API_URL}/skin/${name}`,
  capeUrl: (name: string) => `${API_URL}/cape/${name}`,
  avatarUrl: (uuid: string) => `${API_URL}/avatars/${uuid}`,

  // 管理后台
  admin: {
    listUsers: (q = "", offset = 0, limit = 20) =>
      api<{ users: AdminUser[]; total: number }>(
        `/api/admin/users?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(localStorage.getItem("adminToken") ?? undefined) },
      ),
    updateUser: (id: string, role: string, status: string) =>
      api<void>(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
        body: JSON.stringify({ role, status }),
      }),
    loginMethods: () =>
      api<{ methods: LoginMethod[] }>("/api/admin/login-methods", {
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
      }),
    updateLoginMethods: (methods: LoginMethod[]) =>
      api<void>("/api/admin/login-methods", {
        method: "PUT",
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
        body: JSON.stringify({ methods }),
      }),
    announcement: () =>
      api<Announcement>("/api/admin/announcement", {
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
      }),
    setAnnouncement: (a: Announcement) =>
      api<void>("/api/admin/announcement", {
        method: "PUT",
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
        body: JSON.stringify(a),
      }),
    inviteCodes: (count: number) =>
      api<{ codes: string[] }>("/api/admin/invite-codes", {
        method: "POST",
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
        body: JSON.stringify({ count }),
      }),
    deleteSkinLib: (id: string) =>
      api<void>(`/api/admin/skinlib/${id}`, {
        method: "DELETE",
        headers: authHeaders(localStorage.getItem("adminToken") ?? undefined),
      }),
  },
};

export const hoardClient = {
  search: async (q = "", offset = 0, limit = 20) => {
    const res = await fetch(
      `${API_URL}/api/mods?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as HoardSearchResponse;
  },

  versions: async (projectId: string) => {
    const res = await fetch(`${API_URL}/v2/project/${projectId}/version`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as HoardVersion[];
  },

  uploadMod: async (form: FormData, adminToken?: string) => {
    const res = await fetch(`${API_URL}/api/mods`, {
      method: "POST",
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      body: form,
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  setStatus: async (id: string, status: string, adminToken: string) => {
    const res = await fetch(`${API_URL}/api/mods/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`update ${res.status}`);
  },

  deleteMod: async (id: string, adminToken: string) => {
    const res = await fetch(`${API_URL}/api/mods/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`delete ${res.status}`);
  },

  downloadUrl: (id: string) => `${API_URL}/api/mods/${id}/download`,
  mrpackUrl: (id: string, vid: string) =>
    `${API_URL}/v2/project/${id}/version/${vid}/mrpack`,
};
