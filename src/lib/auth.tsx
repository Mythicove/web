"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient, type AuthenticateResponse } from "@/lib/api";

const STORAGE_KEY = "mythicove-auth";

export interface AuthState {
  accessToken: string;
  clientToken: string;
  playerName?: string;
  playerId?: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeOAuthLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function load(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function save(auth: AuthState | null) {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
}

function fromResponse(res: AuthenticateResponse): AuthState {
  return {
    accessToken: res.accessToken,
    clientToken: res.clientToken,
    playerName: res.selectedProfile?.name ?? res.availableProfiles[0]?.name,
    playerId: res.selectedProfile?.id ?? res.availableProfiles[0]?.id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    // 从 localStorage 恢复会话（外部系统同步）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuth(load());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.authenticate(email, password);
    const next = fromResponse(res);
    save(next);
    setAuth(next);
  }, []);

  const completeOAuthLogin = useCallback(() => {
    const hash = window.location.hash;
    const match = /accessToken=([^&]+)/.exec(hash);
    if (!match) return;
    const next: AuthState = { accessToken: match[1], clientToken: "" };
    save(next);
    setAuth(next);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const logout = useCallback(() => {
    save(null);
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isAuthenticated: !!auth?.accessToken, login, completeOAuthLogin, logout }}
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
