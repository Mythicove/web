// 单 API 域名：mirror 与 hoard 的路由不冲突，经同一反代按路径分流。
// 类型来自 api/specs 生成的 schema（pnpm gen:api），不要手写重复定义。
import type { components as mirror } from "@/lib/api-schema/mirror";
import type { components as hoard } from "@/lib/api-schema/hoard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
// SSR/RSC 服务端取数走内部地址（容器内 localhost 不是 API），未配置时退回公共地址。
const SERVER_API_URL = process.env.API_URL_INTERNAL ?? API_URL;

export const apiBase = API_URL;

export type RegisterBody = mirror["schemas"]["RegisterRequest"];
export type Player = mirror["schemas"]["Player"];
export type AuthenticateResponse = mirror["schemas"]["AuthenticateResponse"];
export type LoginMethod = mirror["schemas"]["LoginMethod"];
export type Announcement = mirror["schemas"]["Announcement"];
export type SkinLibItem = mirror["schemas"]["SkinLibItem"];
export type SkinLibPage = mirror["schemas"]["SkinLibPage"];
export type SkinComment = mirror["schemas"]["SkinComment"];
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

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window === "undefined" ? SERVER_API_URL : API_URL;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new ApiError(res.status, `API ${res.status}: ${await res.text()}`);
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

  listSkinLib: (opts: { q?: string; sort?: "newest" | "likes"; offset?: number; limit?: number } = {}) => {
    const p = new URLSearchParams();
    if (opts.q) p.set("q", opts.q);
    if (opts.sort) p.set("sort", opts.sort);
    p.set("offset", String(opts.offset ?? 0));
    p.set("limit", String(opts.limit ?? 20));
    return api<SkinLibPage>(`/skinlib?${p.toString()}`);
  },

  getSkinLib: (id: string) => api<SkinLibItem>(`/skinlib/${id}`),

  publishSkin: (playerName: string, description: string, token: string) =>
    api<SkinLibItem>("/skinlib", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ playerName, description }),
    }),

  listComments: (id: string) => api<SkinComment[]>(`/skinlib/${id}/comments`),

  applySkin: (id: string, playerName: string, token: string) =>
    api<void>(`/skinlib/${id}/apply`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ playerName }),
    }),

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

  // 管理后台：token 由调用方显式传入（登录会话 accessToken 或手动管理令牌），
  // 后端 AdminAuth 两者都接受。
  admin: {
    listUsers: (token: string, q = "", offset = 0, limit = 20) =>
      api<{ users: AdminUser[]; total: number }>(
        `/api/admin/users?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    updateUser: (token: string, id: string, role: string, status: string) =>
      api<void>(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role, status }),
      }),
    loginMethods: (token: string) =>
      api<{ methods: LoginMethod[] }>("/api/admin/login-methods", {
        headers: authHeaders(token),
      }),
    updateLoginMethods: (token: string, methods: LoginMethod[]) =>
      api<void>("/api/admin/login-methods", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ methods }),
      }),
    announcement: (token: string) =>
      api<Announcement>("/api/admin/announcement", {
        headers: authHeaders(token),
      }),
    setAnnouncement: (token: string, a: Announcement) =>
      api<void>("/api/admin/announcement", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(a),
      }),
    inviteCodes: (token: string, count: number) =>
      api<{ codes: string[] }>("/api/admin/invite-codes", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ count }),
      }),
    deleteSkinLib: (token: string, id: string) =>
      api<void>(`/api/admin/skinlib/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    deleteComment: (token: string, cid: string) =>
      api<void>(`/api/admin/comments/${cid}`, {
        method: "DELETE",
        headers: authHeaders(token),
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
