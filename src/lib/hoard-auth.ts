"use client";

import { useCallback, useEffect, useState } from "react";
import { hoardClient, type HoardUser } from "@/lib/api";

// useHoardUser 返回 Hoard 的 SSO 登录态（httpOnly cookie 会话，独立于 mirror 的 Yggdrasil 会话）。
export function useHoardUser() {
  const [user, setUser] = useState<HoardUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    hoardClient
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await hoardClient.logoutHoard();
    setUser(null);
  }, []);

  return { user, loaded, logout, refresh };
}
