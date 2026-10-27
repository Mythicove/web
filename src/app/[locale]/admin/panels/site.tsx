"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlobeIcon, Loader2Icon } from "lucide-react";
import { apiClient, type SiteAdmin } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const codeAreaClass =
  "border-input placeholder:text-text-muted focus-visible:border-ring focus-visible:ring-ring/50 bg-input/15 flex min-h-24 w-full rounded-md border px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:ring-[3px]";

const EMPTY: SiteAdmin = {
  info: { name: "", description: "", copyright: "", icp: "" },
  assets: { customCss: "", customJs: "" },
};

// 站点信息/外观面板：身份文本（含备案）与自定义 CSS/JS，存 mirror settings。
export function SitePanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [v, setV] = useState<SiteAdmin>(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token === null) return;
    apiClient.admin
      .site(token)
      .then(setV)
      .catch(() => setV(EMPTY));
  }, [token]);

  const save = async () => {
    if (busy || token === null) return;
    setBusy(true);
    try {
      await apiClient.admin.setSite(token, v);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  const setInfo = (k: keyof SiteAdmin["info"], val: string) =>
    setV({ ...v, info: { ...v.info, [k]: val } });
  const setAssets = (k: keyof SiteAdmin["assets"], val: string) =>
    setV({ ...v, assets: { ...v.assets, [k]: val } });

  return (
    <Card className="bg-surface shadow-card max-w-xl">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <GlobeIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.site")}</h2>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-name">{t("siteName")}</Label>
          <Input
            id="site-name"
            value={v.info.name}
            onChange={(e) => setInfo("name", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-desc">{t("siteDesc")}</Label>
          <Input
            id="site-desc"
            value={v.info.description}
            onChange={(e) => setInfo("description", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-copyright">{t("siteCopyright")}</Label>
          <Input
            id="site-copyright"
            value={v.info.copyright}
            onChange={(e) => setInfo("copyright", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-icp">{t("siteIcp")}</Label>
          <Input
            id="site-icp"
            value={v.info.icp}
            onChange={(e) => setInfo("icp", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-css">{t("siteCustomCss")}</Label>
          <textarea
            id="site-css"
            rows={4}
            className={codeAreaClass}
            value={v.assets.customCss}
            onChange={(e) => setAssets("customCss", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="site-js">{t("siteCustomJs")}</Label>
          <textarea
            id="site-js"
            rows={4}
            className={codeAreaClass}
            value={v.assets.customJs}
            onChange={(e) => setAssets("customJs", e.target.value)}
          />
        </div>
        <Button type="button" disabled={busy} onClick={() => void save()}>
          {busy && <Loader2Icon className="animate-spin" />}
          {t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
