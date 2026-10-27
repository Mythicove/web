"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ApiError } from "@/lib/errors";

const META_KEY = "mythicove-auth";
const AUTH_STORE_EVENT = "mythicove-auth-store";

// 会话元数据（非敏感）。accessToken 存于 httpOnly cookie（mythic_session），
// 由 /api/auth/* route handler 设置，JS 不可读；API 调用凭 credentials 携带。
export interface AuthState {
  clientToken: string;
  playerName?: string;
  playerId?: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  completeOAuthLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parse(raw: string | null): AuthState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function save(auth: AuthState | null) {
  if (auth) localStorage.setItem(META_KEY, JSON.stringify(auth));
  else localStorage.removeItem(META_KEY);
  window.dispatchEvent(new Event(AUTH_STORE_EVENT));
}

// localStorage 作为外部 store：水合期用服务端快照（null=未登录）避免水合告警，
// 水合后同步到已保存会话；同标签页写入经自定义事件通知订阅者。
const authStore = {
  subscribe(onChange: () => void) {
    window.addEventListener(AUTH_STORE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(AUTH_STORE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  },
  getSnapshot: () => localStorage.getItem(META_KEY),
  getServerSnapshot: () => null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
  const auth = useMemo(() => parse(raw), [raw]);

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken }),
    });
    if (!res.ok) {
      // BFF 透传 mirror 的本地化错误文案（如"验证码校验失败"）；调用方可直接展示 message
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new ApiError(res.status, body?.error ?? "");
    }
    const meta = (await res.json()) as AuthState;
    save(meta);
  }, []);

  // 第三方登录回跳：mirror 把一次性换取码放在 ?oauth_code=（不再是 #accessToken=）。
  // 先把码从地址栏抹掉再兑换，避免它留在浏览历史里被重放。
  const completeOAuthLogin = useCallback(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("oauth_code");
    const failed = url.searchParams.get("oauth") === "error";
    if (!code && !failed) return;
    url.searchParams.delete("oauth_code");
    url.searchParams.delete("oauth");
    const qs = url.searchParams.toString();
    window.history.replaceState(null, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
    if (!code) return;
    const res = await fetch("/api/auth/oauth-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return;
    const meta = (await res.json()) as AuthState;
    save(meta);
  }, []);

  const logout = useCallback(async () => {
    save(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // cookie 清除失败不阻塞本地登出
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isAuthenticated: !!auth, login, completeOAuthLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
