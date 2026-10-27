// 单 API 域名：mirror 与 hoard 的路由不冲突，经同一反代按路径分流。
// 类型来自 api/specs 生成的 schema（pnpm gen:api），不要手写重复定义。
import { ApiError, STABLE_ERROR_CODES } from "@/lib/errors";
import type { components as mirror } from "@/lib/api-schema/mirror";
import type { components as hoard } from "@/lib/api-schema/hoard";

export { ApiError };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
// SSR/RSC 服务端取数走内部地址（容器内 localhost 不是 API），未配置时退回公共地址。
const SERVER_API_URL = process.env.API_URL_INTERNAL ?? API_URL;

export const apiBase = API_URL;

export type RegisterBody = mirror["schemas"]["RegisterRequest"];
export type RegisterRequirements = mirror["schemas"]["RegisterRequirements"];
export type Player = mirror["schemas"]["Player"];
export type AuthenticateResponse = mirror["schemas"]["AuthenticateResponse"];
export type LoginMethod = mirror["schemas"]["LoginMethod"];
export type PlayerCredential = mirror["schemas"]["PlayerCredential"];
export type BindingState = mirror["schemas"]["BindingState"];
export type AuthPolicy = mirror["schemas"]["AuthPolicy"];
export type AuthPolicyView = mirror["schemas"]["AuthPolicyView"];
export type Announcement = mirror["schemas"]["Announcement"];
export type BrandConfig = mirror["schemas"]["BrandConfig"];
export type SitePublic = mirror["schemas"]["SitePublic"];
export type SiteAdmin = mirror["schemas"]["SiteAdmin"];
export type RegistrationPolicy = mirror["schemas"]["RegistrationPolicy"];
export type OAuthClient = mirror["schemas"]["OAuthClient"];
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
export type HoardFacetOptions = hoard["schemas"]["FacetOptions"];
export type HoardTeamInvite = hoard["schemas"]["TeamInvite"];
export type HoardUserInvite = hoard["schemas"]["UserInvite"];

export interface UploadProgress {
  loaded: number;
  total: number;
}

// request 是全站唯一的 fetch 收口：凭据、no-store、错误归一化都在这一处。
// 会话凭 httpOnly cookie（mythic_session / hoard_session）携带；开发跨端口为 same-site，生产同源。
async function request<T>(
  path: string,
  init?: RequestInit,
  // 公开端点不带凭据：开发期跨端口下后端可能回退 ACAO:*，带凭据会被浏览器拒绝；
  // 会话端点保持 include。生产同源两者等价。
  credentials: RequestCredentials = "include",
): Promise<T> {
  const base = typeof window === "undefined" ? SERVER_API_URL : API_URL;
  const isForm = init?.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      cache: "no-store",
      ...init,
      credentials,
      headers: isForm
        ? init?.headers
        : {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
    });
  } catch {
    throw new ApiError(0, `network: ${path}`, "network");
  }
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    let code: string | undefined;
    try {
      const parsed = JSON.parse(text) as { error?: string; message?: string };
      detail = parsed.error ?? parsed.message ?? text;
      // mirror 对"需要前端采取动作"的拒绝返回稳定错误码（不是给人看的文案），
      // 其余 error 字段是服务端已本地化的文案，直接展示。
      if (parsed.error && STABLE_ERROR_CODES.has(parsed.error)) code = parsed.error;
    } catch {
      // 非 JSON body（网关/反代错误页）保留截断原文，仅供日志
    }
    throw new ApiError(res.status, `${res.status} ${detail.slice(0, 200)}`, code);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// upload 走 XHR：fetch 无法上报上传进度，而 mod jar 可达数百 MB。
function upload<T>(
  path: string,
  body: XMLHttpRequestBodyInit,
  opts: { headers?: Record<string, string>; onProgress?: (p: UploadProgress) => void } = {},
): Promise<T> {
  const base = typeof window === "undefined" ? SERVER_API_URL : API_URL;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}${path}`);
    xhr.withCredentials = true;
    for (const [k, v] of Object.entries(opts.headers ?? {})) xhr.setRequestHeader(k, v);
    if (opts.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) opts.onProgress?.({ loaded: e.loaded, total: e.total });
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.status === 204 || !xhr.responseText) return resolve(undefined as T);
        try {
          return resolve(JSON.parse(xhr.responseText) as T);
        } catch {
          return resolve(undefined as T);
        }
      }
      reject(new ApiError(xhr.status, `${xhr.status} ${xhr.responseText.slice(0, 200)}`));
    };
    xhr.onerror = () => reject(new ApiError(0, `network: ${path}`, "network"));
    xhr.send(body);
  });
}

const authHeaders = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : undefined);

// asSkinLibPage 是 /skinlib 的形状收口：契约（OpenAPI + 生成类型）规定分页对象；
// 旧版实例返回裸数组时归一化兼容（滚动升级窗口），并告警契约漂移；
// 其余不可识别形状抛 contract 错误，避免渲染期 TypeError。
function asSkinLibPage(data: unknown, offset: number, limit: number): SkinLibPage {
  if (Array.isArray(data)) {
    console.warn("[api] /skinlib 返回旧版数组形状，已归一化；请升级 mirror 实例");
    return { items: data as SkinLibItem[], total: data.length, offset, limit };
  }
  if (data && typeof data === "object" && Array.isArray((data as SkinLibPage).items)) {
    return data as SkinLibPage;
  }
  throw new ApiError(502, "contract: /skinlib shape", "contract");
}

export const apiClient = {
  register: (body: RegisterBody) =>
    request<{ id: string }>("/account/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  registerRequirements: () =>
    request<RegisterRequirements>("/api/register-requirements", undefined, "same-origin"),

  listPlayers: () => request<Player[]>("/account/players"),

  addPlayer: (name: string) =>
    request<Player>("/account/players", { method: "POST", body: JSON.stringify({ name }) }),

  // 改名会换 uuid 并使该玩家的游戏会话失效（后端语义，见 spec renamePlayer）
  renamePlayer: (oldName: string, name: string) =>
    request<Player>(`/account/players/${encodeURIComponent(oldName)}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deletePlayer: (name: string) =>
    request<void>(`/account/players/${encodeURIComponent(name)}`, { method: "DELETE" }),

  // 启动器独立密码（ADR-0012）：启动器登录只认「玩家名 + 独立密码」，主密码不参与。
  listPlayerCredentials: (name: string) =>
    request<{ credentials: PlayerCredential[] }>(
      `/account/players/${encodeURIComponent(name)}/credentials`,
    ),

  createPlayerCredential: (name: string, label: string, password: string) =>
    request<PlayerCredential>(`/account/players/${encodeURIComponent(name)}/credentials`, {
      method: "POST",
      body: JSON.stringify({ name: label, password }),
    }),

  // 撤销后由该凭证建立的启动器会话立刻失效
  deletePlayerCredential: (name: string, credentialId: string) =>
    request<void>(
      `/account/players/${encodeURIComponent(name)}/credentials/${encodeURIComponent(credentialId)}`,
      { method: "DELETE" },
    ),

  // 第三方绑定 + 站点是否强制绑定（required && 空列表 = 功能受限，需引导绑定）
  identities: () => request<BindingState>("/account/identities"),

  // 解除微软正版绑定（幂等）；解绑后该玩家可本地改名
  unbindPremium: (name: string) =>
    request<void>(`/account/players/${encodeURIComponent(name)}/premium`, { method: "DELETE" }),

  avatarByNameUrl: (name: string, size = 64) =>
    `${API_URL}/avatars/by-name/${encodeURIComponent(name)}?size=${size}`,

  mojangBindUrl: () => `${API_URL}/mojang/oauth/auth`,

  verifyEmail: (token: string) =>
    request<void>("/account/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) =>
    request<void>("/account/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<void>("/account/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  oauthUrl: (provider: string, redirectUrl: string) =>
    `${API_URL}/oauth/${provider}/auth?state=${encodeURIComponent(redirectUrl)}`,

  // ---- OIDC（Mirror 为 IdP）：登录/同意 UI 在前端，后端只给 JSON + 重定向凭证 ----
  // challenge 即流程凭证，故这些调用无需携带凭据（开发跨端口亦不被 CORS 凭据规则拦截）。
  oauthLoginAccept: (challenge: string, email: string, password: string) =>
    request<{ redirectTo: string }>(
      "/oauth2/login/accept",
      { method: "POST", body: JSON.stringify({ challenge, email, password }) },
      "same-origin",
    ),

  oauthConsentInfo: (challenge: string) =>
    request<{ client_id: string; client_name: string; scopes: string[] }>(
      `/oauth2/consent?challenge=${encodeURIComponent(challenge)}`,
      undefined,
      "same-origin",
    ),

  oauthConsentAccept: (challenge: string) =>
    request<{ redirectTo: string }>(
      "/oauth2/consent/accept",
      { method: "POST", body: JSON.stringify({ challenge }) },
      "same-origin",
    ),

  oauthConsentReject: (challenge: string) =>
    request<{ redirectTo: string }>(
      "/oauth2/consent/reject",
      { method: "POST", body: JSON.stringify({ challenge }) },
      "same-origin",
    ),

  listLoginMethods: () =>
    request<{ methods: LoginMethod[] }>("/api/login-methods", undefined, "same-origin"),

  announcement: () => request<Announcement>("/api/announcement", undefined, "same-origin"),

  listSkinLib: async (
    opts: {
      q?: string;
      sort?: "newest" | "likes";
      offset?: number;
      limit?: number;
    } = {},
  ) => {
    const p = new URLSearchParams();
    if (opts.q) p.set("q", opts.q);
    if (opts.sort) p.set("sort", opts.sort);
    p.set("offset", String(opts.offset ?? 0));
    p.set("limit", String(opts.limit ?? 20));
    const data = await request<unknown>(`/skinlib?${p.toString()}`, undefined, "same-origin");
    return asSkinLibPage(data, opts.offset ?? 0, opts.limit ?? 20);
  },

  getSkinLib: (id: string) => request<SkinLibItem>(`/skinlib/${id}`, undefined, "same-origin"),

  publishSkin: (playerName: string, description: string) =>
    request<SkinLibItem>("/skinlib", {
      method: "POST",
      body: JSON.stringify({ playerName, description }),
    }),

  listComments: (id: string) =>
    request<SkinComment[]>(`/skinlib/${id}/comments`, undefined, "same-origin"),

  applySkin: (id: string, playerName: string) =>
    request<void>(`/skinlib/${id}/apply`, {
      method: "POST",
      body: JSON.stringify({ playerName }),
    }),

  report: (targetType: "skin" | "comment", targetID: string, reason: string) =>
    request<void>("/reports", {
      method: "POST",
      body: JSON.stringify({ targetType, targetID, reason }),
    }),

  skinTextureUrl: (key: string) => `${API_URL}/textures/${key}`,

  likeSkin: (id: string) => request<void>(`/skinlib/${id}/like`, { method: "POST" }),

  commentSkin: (id: string, content: string) =>
    request<void>(`/skinlib/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  uploadSkin: (name: string, model: string, file: File, onProgress?: (p: UploadProgress) => void) =>
    upload<void>(`/skin/${name}?model=${model}`, file, { onProgress }),

  uploadCape: (name: string, file: File, onProgress?: (p: UploadProgress) => void) =>
    upload<void>(`/cape/${name}`, file, { onProgress }),

  skinUrl: (name: string) => `${API_URL}/skin/${name}`,

  // 管理后台：token 传手动管理令牌；传空字符串则凭 httpOnly 会话 cookie
  // （管理员用户登录态），后端 AdminAuth 两者都接受。
  admin: {
    listUsers: (token: string, q = "", offset = 0, limit = 20) =>
      request<{ users: AdminUser[]; total: number }>(
        `/api/admin/users?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    updateUser: (token: string, id: string, role: string, status: string) =>
      request<void>(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role, status }),
      }),
    loginMethods: (token: string) =>
      request<{ methods: LoginMethod[] }>("/api/admin/login-methods", {
        headers: authHeaders(token),
      }),
    updateLoginMethods: (token: string, methods: LoginMethod[]) =>
      request<void>("/api/admin/login-methods", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ methods }),
      }),
    // 认证策略（强制绑定第三方 / 玩家数上限）+ 纯密码账号计数。
    // 主密码开关不在这儿：它归 login-methods，一个开关只留一个入口。
    authPolicy: (token: string) =>
      request<AuthPolicyView>("/api/admin/auth-policy", { headers: authHeaders(token) }),
    updateAuthPolicy: (token: string, policy: AuthPolicy) =>
      request<void>("/api/admin/auth-policy", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(policy),
      }),
    announcement: (token: string) =>
      request<Announcement>("/api/admin/announcement", {
        headers: authHeaders(token),
      }),
    setAnnouncement: (token: string, a: Announcement) =>
      request<void>("/api/admin/announcement", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(a),
      }),
    brand: (token: string) =>
      request<BrandConfig>("/api/admin/brand", { headers: authHeaders(token) }),
    // 品牌图标上传为原始 PNG 字节（非 JSON）：request 的 header 展开允许覆盖 Content-Type。
    setBrandLogo: (token: string, variant: "light" | "dark", png: Blob) =>
      request<void>(`/api/admin/brand/logo/${variant}`, {
        method: "PUT",
        headers: { ...authHeaders(token), "Content-Type": "image/png" },
        body: png,
      }),
    deleteBrandLogo: (token: string, variant: "light" | "dark") =>
      request<void>(`/api/admin/brand/logo/${variant}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    site: (token: string) => request<SiteAdmin>("/api/admin/site", { headers: authHeaders(token) }),
    setSite: (token: string, v: SiteAdmin) =>
      request<void>("/api/admin/site", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(v),
      }),
    registration: (token: string) =>
      request<RegistrationPolicy>("/api/admin/registration", { headers: authHeaders(token) }),
    setRegistration: (token: string, p: RegistrationPolicy) =>
      request<void>("/api/admin/registration", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(p),
      }),
    oauthClients: (token: string) =>
      request<OAuthClient[]>("/api/admin/oauth-clients", { headers: authHeaders(token) }),
    saveOAuthClient: (token: string, c: OAuthClient) =>
      request<OAuthClient>("/api/admin/oauth-clients", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(c),
      }),
    deleteOAuthClient: (token: string, id: string) =>
      request<void>(`/api/admin/oauth-clients/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    inviteCodes: (token: string, count: number) =>
      request<{ codes: string[] }>("/api/admin/invite-codes", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ count }),
      }),
    deleteSkinLib: (token: string, id: string) =>
      request<void>(`/api/admin/skinlib/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    deleteComment: (token: string, cid: string) =>
      request<void>(`/api/admin/comments/${cid}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    audit: (token: string, q = "", offset = 0, limit = 50) =>
      request<{ entries: AuditEntry[]; total: number }>(
        `/api/admin/audit?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    reports: (token: string, status = "", offset = 0, limit = 50) =>
      request<{ reports: Report[]; total: number }>(
        `/api/admin/reports?status=${encodeURIComponent(status)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    resolveReport: (token: string, id: string, status: "dismissed" | "acted") =>
      request<void>(`/api/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }),
    skins: (token: string, status = "", offset = 0, limit = 50) =>
      request<{ items: SkinLibItem[]; total: number }>(
        `/api/admin/skins?status=${encodeURIComponent(status)}&offset=${offset}&limit=${limit}`,
        { headers: authHeaders(token) },
      ),
    setSkinStatus: (token: string, id: string, status: "listed" | "unlisted" | "under_review") =>
      request<void>(`/api/admin/skins/${id}/status`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      }),
  },
};

// hoardClient 是 hoard 端点的收口：SSO 会话凭 httpOnly cookie（credentials）携带。
export const hoardClient = {
  search: (q = "", offset = 0, limit = 20, facets?: string) =>
    request<HoardSearchResponse>(
      `/api/mods?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}${
        facets ? `&facets=${encodeURIComponent(facets)}` : ""
      }`,
      undefined,
      "same-origin",
    ),

  facets: () => request<HoardFacetOptions>("/api/mods/facets", undefined, "same-origin"),

  versions: (projectId: string) =>
    request<HoardVersion[]>(`/v2/project/${projectId}/version`, undefined, "same-origin"),

  project: (id: string) => request<HoardProject>(`/v2/project/${id}`, undefined, "same-origin"),

  dependencies: (id: string) =>
    request<HoardDependency[]>(`/v2/project/${id}/dependencies`, undefined, "same-origin"),

  // ---- SSO 会话（httpOnly cookie，credentials 携带）----
  // next 为登录完成后的站内回跳绝对地址（静默 SSO 回到发起页）；
  // hoard 侧以 CORS 白名单校验 origin，防开放重定向。
  loginUrl: (path?: string) =>
    `${API_URL}/auth/oidc/login${
      path
        ? `?next=${encodeURIComponent((typeof window === "undefined" ? "" : window.location.origin) + path)}`
        : ""
    }`,

  me: () => request<HoardUser>("/auth/me"),

  logoutHoard: async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  },

  // ---- 团队 ----
  myTeams: () => request<HoardUserTeam[]>("/api/user/teams"),

  createTeam: (name: string) =>
    request<{ id: string }>("/api/team", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  teamMembers: (id: string) => request<HoardTeamMember[]>(`/api/team/${id}/members`),

  // 变更已有成员角色 / 移交所有权走 POST /api/team/{id}/members（见 spec addTeamMember）；
  // 暂无 UI，故不在此保留无调用者的包装函数。

  removeTeamMember: (id: string, sub: string) =>
    request<void>(`/api/team/${id}/members/${sub}`, { method: "DELETE" }),

  // ---- 团队邀请（加入需被邀请人同意）----
  teamInvites: (id: string) => request<HoardTeamInvite[]>(`/api/team/${id}/invites`),

  inviteMember: (id: string, sub: string, role: "owner" | "member" = "member") =>
    request<void>(`/api/team/${id}/invites`, {
      method: "POST",
      body: JSON.stringify({ sub, role }),
    }),

  revokeInvite: (id: string, sub: string) =>
    request<void>(`/api/team/${id}/invites/${encodeURIComponent(sub)}`, { method: "DELETE" }),

  // 变更已有成员角色 / 移交所有权（新增成员请用 inviteMember；后端对非成员返回 409，
  // 对"降级唯一 owner"也返回 409）
  setTeamMemberRole: (id: string, sub: string, role: "owner" | "member") =>
    request<void>(`/api/team/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ sub, role }),
    }),

  myInvites: () => request<HoardUserInvite[]>("/api/user/invites"),

  acceptInvite: (teamId: string) =>
    request<void>(`/api/user/invites/${teamId}/accept`, { method: "POST" }),

  rejectInvite: (teamId: string) =>
    request<void>(`/api/user/invites/${teamId}`, { method: "DELETE" }),

  // ---- PAT ----
  listPATs: () => request<HoardPAT[]>("/api/user/pats"),

  createPAT: (name: string, scopes: string[], expiresInDays: number) =>
    request<{ id: string; token: string }>("/api/user/pats", {
      method: "POST",
      body: JSON.stringify({ name, scopes, expires_in_days: expiresInDays }),
    }),

  deletePAT: (id: string) => request<void>(`/api/user/pats/${id}`, { method: "DELETE" }),

  // ---- 用户级上传（Modrinth 形 multipart）----
  createProject: (
    data: Record<string, unknown>,
    file: File,
    onProgress?: (p: UploadProgress) => void,
  ) => {
    const form = new FormData();
    form.set("data", JSON.stringify(data));
    form.set("file", file);
    return upload<HoardProject>("/v2/project", form, { onProgress });
  },

  addVersion: (
    data: Record<string, unknown>,
    file: File,
    onProgress?: (p: UploadProgress) => void,
  ) => {
    const form = new FormData();
    form.set("data", JSON.stringify(data));
    form.set("file", file);
    return upload<HoardVersion>("/v2/version", form, { onProgress });
  },

  deleteProject: (id: string) => request<void>(`/v2/project/${id}`, { method: "DELETE" }),

  // 管理端点：adminToken 传空串则凭 hoard 会话 cookie（后端认 role=admin），
  // 非空则用静态管理令牌（bootstrap/救援通道）。
  setStatus: (id: string, status: string, adminToken: string) =>
    request<void>(`/api/mods/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(adminToken),
      body: JSON.stringify({ status }),
    }),

  deleteMod: (id: string, adminToken: string) =>
    request<void>(`/api/mods/${id}`, {
      method: "DELETE",
      headers: authHeaders(adminToken),
    }),

  mrpackUrl: (id: string, vid: string) => `${API_URL}/v2/project/${id}/version/${vid}/mrpack`,
};
