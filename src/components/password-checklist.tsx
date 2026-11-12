"use client";

import { useTranslations } from "next-intl";
import { CheckIcon, CircleIcon, XIcon } from "lucide-react";
import type { PasswordPolicy } from "@/lib/api";
import { cn } from "@/lib/utils";

// 与后端 account.PasswordPolicy.Evaluate 同规则的逐条判定：长度/大写/小写/数字/符号。
// 规则在前后端各实现一份但语义一致（后端为唯一裁决方，前端只做实时提示）。
export function passwordChecks(pol: PasswordPolicy, pw: string) {
  const c = {
    length: pw.length >= pol.minLength,
    upper: false,
    lower: false,
    digit: false,
    symbol: false,
  };
  for (const ch of pw) {
    if (ch >= "A" && ch <= "Z") c.upper = true;
    else if (ch >= "a" && ch <= "z") c.lower = true;
    else if (ch >= "0" && ch <= "9") c.digit = true;
    else c.symbol = true;
  }
  return c;
}

// 是否满足**已启用**的全部要求；提交前本地预检，最终以后端裁决为准。
export function passwordMeets(pol: PasswordPolicy, pw: string): boolean {
  const c = passwordChecks(pol, pw);
  return (
    c.length &&
    (!pol.requireUpper || c.upper) &&
    (!pol.requireLower || c.lower) &&
    (!pol.requireDigit || c.digit) &&
    (!pol.requireSymbol || c.symbol)
  );
}

interface PasswordChecklistProps {
  policy: PasswordPolicy;
  value: string;
  className?: string;
}

// 实时复杂度清单：只列启用的要求。三态——待定（尚未输入，中性圆圈+灰）、
// 不满足（叉+红）、满足（勾+绿）；清空输入回到待定。
export function PasswordChecklist({ policy, value, className }: PasswordChecklistProps) {
  const t = useTranslations("auth");
  const c = passwordChecks(policy, value);
  const pending = value === "";
  const items = [
    { on: true, ok: c.length, label: t("pwLen", { n: policy.minLength }) },
    { on: policy.requireUpper, ok: c.upper, label: t("pwUpper") },
    { on: policy.requireLower, ok: c.lower, label: t("pwLower") },
    { on: policy.requireDigit, ok: c.digit, label: t("pwDigit") },
    { on: policy.requireSymbol, ok: c.symbol, label: t("pwSymbol") },
  ].filter((i) => i.on);

  return (
    <ul className={cn("mt-1.5 grid gap-1", className)} aria-live="polite">
      {items.map((i) => {
        const state = pending ? "pending" : i.ok ? "met" : "unmet";
        return (
          <li
            key={i.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              state === "met" && "text-success",
              state === "unmet" && "text-danger",
              state === "pending" && "text-text-muted",
            )}
          >
            {state === "met" ? (
              <CheckIcon className="size-3.5" aria-hidden="true" />
            ) : state === "unmet" ? (
              <XIcon className="size-3.5" aria-hidden="true" />
            ) : (
              <CircleIcon className="size-3.5 opacity-50" aria-hidden="true" />
            )}
            {i.label}
          </li>
        );
      })}
    </ul>
  );
}
