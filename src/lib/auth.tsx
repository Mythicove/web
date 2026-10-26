"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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
  login: (email: string, password: string) => Promise<void>;
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

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`login failed: ${res.status}`);
    const meta = (await res.json()) as AuthState;
    save(meta);
  }, []);

  const completeOAuthLogin = useCallback(async () => {
    const hash = window.location.hash;
    const match = /accessToken=([^&]+)/.exec(hash);
    if (!match) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: match[1] }),
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
