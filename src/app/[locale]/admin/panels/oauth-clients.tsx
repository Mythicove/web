"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { KeyRoundIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { apiClient, type OAuthClient } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";

const GRANT_TYPES = ["authorization_code", "refresh_token", "client_credentials"];
const SCOPES = ["openid", "profile", "email", "offline_access"];

// 客户端密钥只以 sha256 hex 上行（服务端不存明文），与 mirror OAuthClient.secret_hash 契约一致。
async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface FormState {
  id: string;
  name: string;
  secret: string;
  redirectUris: string;
  grantTypes: string[];
  scopes: string[];
  isPublic: boolean;
  firstParty: boolean;
}

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  secret: "",
  redirectUris: "",
  grantTypes: ["authorization_code", "refresh_token"],
  scopes: ["openid", "profile", "email"],
  isPublic: false,
  firstParty: false,
};

// OIDC 客户端管理：注册/删除 relying party（如 Hoard、第三方 IdP 消费方）。
export function OAuthClientsPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<OAuthClient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(
    (tk: string) =>
      apiClient.admin
        .oauthClients(tk)
        .then(setClients)
        .catch(() => setClients([])),
    [],
  );

  useEffect(() => {
    if (token === null) return;
    reload(token);
  }, [token, reload]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const create = async () => {
    if (token === null || busy) return;
    const redirectUris = form.redirectUris
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!form.id.trim() || !form.name.trim() || redirectUris.length === 0) {
      toast.error(t("oauthInvalid"));
      return;
    }
    if (!form.isPublic && !form.secret) {
      toast.error(t("oauthNeedSecret"));
      return;
    }
    setBusy(true);
    try {
      await apiClient.admin.saveOAuthClient(token, {
        id: form.id.trim(),
        name: form.name.trim(),
        secret_hash: form.isPublic ? "" : await sha256hex(form.secret),
        redirect_uris: redirectUris,
        grant_types: form.grantTypes,
        scopes: form.scopes,
        public: form.isPublic,
        first_party: form.firstParty,
      });
      toast.success(t("saved"));
      setForm(EMPTY_FORM);
      await reload(token);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (token === null || !toDelete || deleting) return;
    setDeleting(true);
    try {
      await apiClient.admin.deleteOAuthClient(token, toDelete.id);
      toast.success(t("deleted"));
      setToDelete(null);
      await reload(token);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setDeleting(false);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <Card className="bg-surface shadow-card max-w-2xl">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.oauthClients")}</h2>
        </div>

        {clients.length > 0 && (
          <ul className="border-border space-y-2 rounded-md border p-3">
            {clients.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-xs">{c.id}</span>
                  <span className="text-text-muted truncate text-xs">{c.name}</span>
                  {c.public && <Badge variant="outline">public</Badge>}
                  {c.first_party && <Badge variant="outline">first-party</Badge>}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("delete")}
                  onClick={() => setToDelete(c)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="oc-id">Client ID</Label>
          <Input
            id="oc-id"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="oc-name">{t("oauthName")}</Label>
          <Input
            id="oc-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="oc-secret">{t("oauthSecret")}</Label>
          <Input
            id="oc-secret"
            type="password"
            disabled={form.isPublic}
            value={form.secret}
            onChange={(e) => setForm({ ...form, secret: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="oc-redirects">{t("oauthRedirects")}</Label>
          <textarea
            id="oc-redirects"
            rows={3}
            placeholder={"https://example.com/auth/oidc/callback"}
            className="border-input placeholder:text-text-muted focus-visible:border-ring focus-visible:ring-ring/50 bg-input/15 flex min-h-20 w-full rounded-md border px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:ring-[3px]"
            value={form.redirectUris}
            onChange={(e) => setForm({ ...form, redirectUris: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("oauthGrantTypes")}</Label>
          <div className="flex flex-wrap gap-3">
            {GRANT_TYPES.map((g) => (
              <div key={g} className="flex items-start gap-2">
                <Checkbox
                  id={`oc-g-${g}`}
                  checked={form.grantTypes.includes(g)}
                  onCheckedChange={() =>
                    setForm({ ...form, grantTypes: toggle(form.grantTypes, g) })
                  }
                />
                <Label htmlFor={`oc-g-${g}`} className="font-mono text-xs font-normal">
                  {g}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>{t("oauthScopes")}</Label>
          <div className="flex flex-wrap gap-3">
            {SCOPES.map((s) => (
              <div key={s} className="flex items-start gap-2">
                <Checkbox
                  id={`oc-s-${s}`}
                  checked={form.scopes.includes(s)}
                  onCheckedChange={() => setForm({ ...form, scopes: toggle(form.scopes, s) })}
                />
                <Label htmlFor={`oc-s-${s}`} className="font-mono text-xs font-normal">
                  {s}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-start gap-2">
            <Checkbox
              id="oc-public"
              checked={form.isPublic}
              onCheckedChange={(v) => setForm({ ...form, isPublic: v === true })}
            />
            <Label htmlFor="oc-public" className="font-normal">
              {t("oauthPublic")}
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="oc-firstparty"
              checked={form.firstParty}
              onCheckedChange={(v) => setForm({ ...form, firstParty: v === true })}
            />
            <Label htmlFor="oc-firstparty" className="font-normal">
              {t("oauthFirstParty")}
            </Label>
          </div>
        </div>
        <Button type="button" disabled={busy} onClick={() => void create()}>
          {busy && <Loader2Icon className="animate-spin" />}
          {t("oauthCreate")}
        </Button>
      </CardContent>
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t("oauthDeleteTitle")}
        description={toDelete?.id}
        confirmLabel={t("delete")}
        destructive
        busy={deleting}
        onConfirm={() => void remove()}
      />
    </Card>
  );
}
