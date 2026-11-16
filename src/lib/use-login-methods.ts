import { useCallback, useEffect, useState } from "react";
import { apiClient, type LoginMethod } from "@/lib/api";
import { useErrorText } from "@/lib/errors";

export interface LoginMethodsState {
  methods: LoginMethod[];
  loaded: boolean;
  error: string | null;
  retry: () => void;
}

// 登录方式加载的三态：loading / ok / error。
// 「请求失败」与「服务端确实关闭了某种登录方式」是两回事：后者只能由成功响应判定。
// 若把 catch 当成空列表，后端不可用时就会误报成"已改用第三方登录"这类没有出路的文案。
export function useLoginMethods(): LoginMethodsState {
  const errText = useErrorText();
  const [methods, setMethods] = useState<LoginMethod[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .listLoginMethods()
      .then((r) => {
        if (cancelled) return;
        setMethods(r.methods.filter((m) => m.enabled));
        setError(null);
        setLoaded(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setMethods([]);
        setError(errText(e));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce, errText]);

  // 重置放在事件回调而非 effect 体（react-hooks/set-state-in-effect）。
  const retry = useCallback(() => {
    setError(null);
    setLoaded(false);
    setNonce((n) => n + 1);
  }, []);
  return { methods, loaded, error, retry };
}
