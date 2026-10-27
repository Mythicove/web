import { useCallback } from "react";
import { useTranslations } from "next-intl";

// ApiError 是全站唯一的请求失败类型：status 来自 HTTP，code 用于表达
// 与状态码正交的语义（如 contract = 前后端契约漂移）。
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// STABLE_ERROR_CODES 是后端用于表达"前端需要采取动作"的稳定错误码（而非本地化文案）。
// 命中时 errorKey 映射到 messages 的 errors.* 键，由前端本地化；
// 未命中的 error 字段视为服务端已本地化的文案，可直接展示。
export const STABLE_ERROR_CODES = new Set(["binding_required", "password_login_disabled"]);

// errorKey 把任意失败映射到 messages 的 errors.* 键。
// 组件不得再把 Error.message 直接渲染给用户。
export function errorKey(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.code === "contract") return "contract";
    if (e.code === "network") return "network";
    if (e.code === "binding_required") return "bindingRequired";
    if (e.code === "password_login_disabled") return "passwordLoginDisabled";
    switch (e.status) {
      case 400:
        return "badRequest";
      case 401:
        return "unauthorized";
      case 403:
        return "forbidden";
      case 404:
        return "notFound";
      case 409:
        return "conflict";
      case 413:
        return "tooLarge";
      case 429:
        return "rateLimited";
    }
    if (e.status >= 500) return "server";
    return "unknown";
  }
  if (e instanceof TypeError) return "network";
  return "unknown";
}

// useErrorText 返回 (e) => 本地化文案。仅在客户端组件使用。
// 回调必须稳定（useCallback）：各面板把它放进 useCallback/useEffect 依赖，
// 若每次渲染换新闭包会触发无限重取。
export function useErrorText() {
  const t = useTranslations("errors");
  return useCallback((e: unknown) => t(errorKey(e)), [t]);
}
