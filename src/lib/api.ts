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
export type AuditEntry = mirror["schemas"]["AuditEntry"];
export type Report = mirror["schemas"]["Report"];
export type AdminUser = mirror["schemas"]["AdminUser"];
export type HoardProject = hoard["schemas"]["Project"];
export type HoardVersion = hoard["schemas"]["Version"];
export type HoardFile = hoard["schemas"]["File"];
export type HoardSearchResponse = hoard["schemas"]["SearchResponse"];
export type HoardUser = hoard["schemas"]["User"];
export type HoardUserTeam = hoard["schemas"]["UserTeam"];
export type HoardTeamMember = hoard["schemas"]["TeamMember"];
export type HoardPAT = hoard["schemas"]["PAT"];
export type HoardDependency = hoard["schemas"]["Dependency"];

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
    // 会话凭 httpOnly cookie（mythic_session）携带；开发跨端口为 same-site，生产同源。
    credentials: "include",
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

  publishSkin: (playerName: string, description: string) =>
    api<SkinLibItem>("/skinlib", {
      method: "POST",
      body: JSON.stringify({ playerName, description }),
    }),

  listComments: (id: string) => api<SkinComment[]>(`/skinlib/${id}/comments`),

  applySkin: (id: string, playerName: string) =>
    api<void>(`/skinlib/${id}/apply`, {
      method: "POST",
      body: JSON.stringify({ playerName }),
    }),

  report: (targetType: "skin" | "comment", targetID: string, reason: string) =>
    api<void>("/reports", {
      method: "POST",
      body: JSON.stringify({ targetType, targetID, reason }),
    }),

  skinTextureUrl: (key: string) => `${API_URL}/textures/${key}`,

  likeSkin: (id: string) =>
    api<void>(`/skinlib/${id}/like`, { method: "POST" }),

  commentSkin: (id: string, content: string) =>
    api<void>(`/skinlib/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  uploadSkin: async (name: string, model: string, file: File) => {
    const res = await fetch(`${API_URL}/skin/${name}?model=${model}`, {
      method: "POST",
      credentials: "include",
      body: await file.arrayBuffer(),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  uploadCape: async (name: string, file: File) => {
    const res = await fetch(`${API_URL}/cape/${name}`, {
      method: "POST",
      credentials: "include",
      body: await file.arrayBuffer(),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
  },

  skinUrl: (name: string) => `${API_URL}/skin/${name}`,
  capeUrl: (name: string) => `${API_URL}/cape/${name}`,
  avatarUrl: (uuid: string) => `${API_URL}/avatars/${uuid}`,

  // 管理后台：token 传手动管理令牌；传空字符串则凭 httpOnly 会话 cookie
  // （管理员用户登录态），后端 AdminAuth 两者都接受。
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
    audit: (token: string, offset = 0, limit = 50) =>
      api<{ entries: AuditEntry[]; total: number }>(
        `/api/admin/audit?offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    reports: (token: string, status = "", offset = 0, limit = 50) =>
      api<{ reports: Report[]; total: number }>(
        `/api/admin/reports?status=${encodeURIComponent(status)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    resolveReport: (token: string, id: string, status: "dismissed" | "acted") =>
      api<void>(`/api/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }),
    skins: (token: string, status = "", offset = 0, limit = 50) =>
      api<{ items: SkinLibItem[]; total: number }>(
        `/api/admin/skins?status=${encodeURIComponent(status)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    setSkinStatus: (
      token: string,
      id: string,
      status: "listed" | "unlisted" | "under_review",
    ) =>
      api<void>(`/api/admin/skins/${id}/status`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }),
  },
};

// hoardApi 是 hoard 端点的 fetch 包装：SSO 会话凭 httpOnly cookie（credentials）携带。
async function hoardApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...init });
  if (!res.ok) throw new ApiError(res.status, `API ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

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

  project: (id: string) => hoardApi<HoardProject>(`/v2/project/${id}`),

  dependencies: (id: string) => hoardApi<HoardDependency[]>(`/v2/project/${id}/dependencies`),

  iconUrl: (id: string) => `${API_URL}/api/mods/${id}/icon`,

  // ---- SSO 会话（httpOnly cookie，credentials 携带）----
  loginUrl: () => `${API_URL}/auth/oidc/login`,

  me: () => hoardApi<HoardUser>("/auth/me"),

  logoutHoard: async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  },

  // ---- 团队 ----
  myTeams: () => hoardApi<HoardUserTeam[]>("/api/user/teams"),

  createTeam: (name: string) =>
    hoardApi<{ id: string }>("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),

  teamMembers: (id: string) => hoardApi<HoardTeamMember[]>(`/api/team/${id}/members`),

  addTeamMember: (id: string, sub: string, role: string) =>
    hoardApi<void>(`/api/team/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sub, role }),
    }),

  removeTeamMember: (id: string, sub: string) =>
    hoardApi<void>(`/api/team/${id}/members/${sub}`, { method: "DELETE" }),

  // ---- PAT ----
  listPATs: () => hoardApi<HoardPAT[]>("/api/user/pats"),

  createPAT: (name: string, scopes: string[], expiresInDays: number) =>
    hoardApi<{ id: string; token: string }>("/api/user/pats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes, expires_in_days: expiresInDays }),
    }),

  deletePAT: (id: string) => hoardApi<void>(`/api/user/pats/${id}`, { method: "DELETE" }),

  // ---- 用户级上传（Modrinth 形 multipart）----
  createProject: async (data: Record<string, unknown>, file: File) => {
    const form = new FormData();
    form.set("data", JSON.stringify(data));
    form.set("file", file);
    return hoardApi<HoardProject>("/v2/project", { method: "POST", body: form });
  },

  addVersion: async (data: Record<string, unknown>, file: File) => {
    const form = new FormData();
    form.set("data", JSON.stringify(data));
    form.set("file", file);
    return hoardApi<HoardVersion>("/v2/version", { method: "POST", body: form });
  },

  deleteProject: (id: string) => hoardApi<void>(`/v2/project/${id}`, { method: "DELETE" }),

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
