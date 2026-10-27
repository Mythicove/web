"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { apiClient, type BrandConfig } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Variant = "light" | "dark";

// 浏览器可达的 API 基址（与 Logo SSR 用的 NEXT_PUBLIC_API_URL 同源），用于预览自定义图。
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// 品牌图标面板：上传/重置明暗两张自定义 logo（mirror 对象存储，全站 SSR 首帧生效）。
export function BrandPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [busy, setBusy] = useState<Variant | null>(null);
  const lightRef = useRef<HTMLInputElement>(null);
  const darkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token === null) return;
    apiClient.admin
      .brand(token)
      .then(setBrand)
      .catch(() => setBrand(null));
  }, [token]);

  const upload = async (variant: Variant) => {
    if (token === null) return;
    const input = variant === "light" ? lightRef.current : darkRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    setBusy(variant);
    try {
      await apiClient.admin.setBrandLogo(token, variant, file);
      toast.success(t("saved"));
      const b = await apiClient.admin.brand(token);
      setBrand(b);
      if (input) input.value = "";
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const reset = async (variant: Variant) => {
    if (token === null) return;
    setBusy(variant);
    try {
      await apiClient.admin.deleteBrandLogo(token, variant);
      toast.success(t("saved"));
      const b = await apiClient.admin.brand(token);
      setBrand(b);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  const row = (variant: Variant, ref: typeof lightRef) => {
    const custom = variant === "light" ? brand?.light : brand?.dark;
    const preview = custom
      ? `${API_BASE}/api/brand/logo/${variant}?v=${brand?.version ?? 0}`
      : `/brand/logo-${variant}.png`;
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={`brand-${variant}`}>
          {variant === "light" ? t("brandLight") : t("brandDark")}
          <span className="text-text-muted ml-2 text-xs">
            {custom ? t("brandCurrent") : t("brandDefault")}
          </span>
        </Label>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- 后台预览管理上传的位图 */}
          <img
            src={preview}
            alt=""
            width={40}
            height={40}
            className="ring-foreground/10 size-10 shrink-0 rounded-[22%] ring-1"
          />
          <Input
            id={`brand-${variant}`}
            ref={ref}
            type="file"
            accept="image/png"
            className="file:text-foreground max-w-40"
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy === variant}
            onClick={() => void upload(variant)}
          >
            {busy === variant && <Loader2Icon className="animate-spin" />}
            {t("brandUpload")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy === variant || !custom}
            onClick={() => void reset(variant)}
          >
            {t("brandReset")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-surface shadow-card max-w-xl">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.brand")}</h2>
        </div>
        <p className="text-text-muted text-xs">{t("brandHint")}</p>
        {row("light", lightRef)}
        {row("dark", darkRef)}
      </CardContent>
    </Card>
  );
}
