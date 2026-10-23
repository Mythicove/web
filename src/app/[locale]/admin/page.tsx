"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  apiClient,
  hoardClient,
  type AdminUser,
  type Announcement,
  type HoardProject,
  type LoginMethod,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

type Tab = "users" | "loginMethods" | "announcement" | "invites" | "mods";

export default function AdminPage() {
  const t = useTranslations("admin");
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("users");

  useEffect(() => {
    // 从 localStorage 恢复管理令牌。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(localStorage.getItem("adminToken") ?? "");
  }, []);

  const saveToken = (v: string) => {
    setToken(v);
    localStorage.setItem("adminToken", v);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          <div className="mt-4 flex max-w-xs flex-col gap-1.5">
            <Label>{t("token")}</Label>
            <Input value={token} onChange={(e) => saveToken(e.target.value)} type="password" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["users", "loginMethods", "announcement", "invites", "mods"] as Tab[]).map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`rounded-md border px-4 py-2 text-sm ${
                  tab === x ? "border-primary bg-primary text-white" : "border-border hover:bg-surface"
                }`}
              >
                {t(`tab.${x}`)}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "users" && <UsersPanel token={token} />}
            {tab === "loginMethods" && <LoginMethodsPanel token={token} />}
            {tab === "announcement" && <AnnouncementPanel token={token} />}
            {tab === "invites" && <InvitesPanel token={token} />}
            {tab === "mods" && <ModsPanel token={token} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function UsersPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    apiClient.admin
      .listUsers("", 0, 100)
      .then((r) => setUsers(r.users))
      .catch((e) => setError(String(e)));
  };
  useEffect(load, [token]);

  const update = async (u: AdminUser, role: string, status: string) => {
    try {
      await apiClient.admin.updateUser(u.id, role, status);
      load();
    } catch (e) {
      setError(String(e));
    }
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{u.nickname || u.email}</span>
              <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
              {u.status !== "active" && <Badge variant="destructive">{u.status}</Badge>}
            </div>
            <div className="text-xs text-text-muted">
              {u.email} · {u.player_names.join(", ")}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={u.role}
              onChange={(e) => update(u, e.target.value, u.status)}
              className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <select
              value={u.status}
              onChange={(e) => update(u, u.role, e.target.value)}
              className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
            >
              <option value="active">active</option>
              <option value="banned">banned</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginMethodsPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const [methods, setMethods] = useState<LoginMethod[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    apiClient.admin
      .loginMethods()
      .then((r) => setMethods(r.methods))
      .catch((e) => setError(String(e)));
  };
  useEffect(load, [token]);

  const toggle = async (id: string) => {
    const next = methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setMethods(next);
    try {
      await apiClient.admin.updateLoginMethods(next);
    } catch (e) {
      setError(String(e));
    }
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  return (
    <div className="space-y-2">
      {methods.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <span className="font-medium">{m.label}</span>
          <Button variant={m.enabled ? "default" : "outline"} onClick={() => toggle(m.id)}>
            {m.enabled ? t("enabled") : t("disabled")}
          </Button>
        </div>
      ))}
    </div>
  );
}

function AnnouncementPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const [a, setA] = useState<Announcement>({ title: "", body: "", enabled: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient.admin
      .announcement()
      .then(setA)
      .catch(() => {});
  }, [token]);

  const save = async () => {
    try {
      await apiClient.admin.setAnnouncement(a);
      setSaved(true);
    } catch {}
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;

  return (
    <Card className="max-w-xl bg-surface">
      <CardContent className="space-y-3 p-5">
        <div className="grid gap-1.5">
          <Label>{t("annTitle")}</Label>
          <Input value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("annBody")}</Label>
          <Input value={a.body} onChange={(e) => setA({ ...a, body: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={a.enabled}
            onChange={(e) => setA({ ...a, enabled: e.target.checked })}
          />
          {t("enabled")}
        </label>
        <Button onClick={save}>{t("save")}</Button>
        {saved && <p className="text-sm text-success">{t("saved")}</p>}
      </CardContent>
    </Card>
  );
}

function InvitesPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);

  const generate = async () => {
    try {
      const r = await apiClient.admin.inviteCodes(count);
      setCodes(r.codes);
    } catch {}
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;

  return (
    <div className="max-w-xl space-y-3">
      <div className="flex items-end gap-3">
        <div className="grid gap-1.5">
          <Label>{t("inviteCount")}</Label>
          <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <Button onClick={generate}>{t("generate")}</Button>
      </div>
      {codes.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          {codes.map((c) => (
            <code key={c} className="block text-sm text-highlight">
              {c}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

function ModsPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const [mods, setMods] = useState<HoardProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    hoardClient
      .search("", 0, 100)
      .then((r) => setMods(r.hits))
      .catch((e) => setError(String(e)));
  };
  useEffect(load, [token]);

  const setStatus = async (id: string, status: string) => {
    try {
      await hoardClient.setStatus(id, status, token);
      load();
    } catch (e) {
      setError(String(e));
    }
  };

  const del = async (id: string) => {
    try {
      await hoardClient.deleteMod(id, token);
      load();
    } catch (e) {
      setError(String(e));
    }
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  return (
    <div className="space-y-2">
      {mods.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{m.title}</span>
              <Badge variant="secondary">{m.status ?? "listed"}</Badge>
            </div>
            <div className="text-xs text-text-muted">{m.project_type}</div>
          </div>
          <div className="flex gap-2">
            <select
              value={m.status ?? "listed"}
              onChange={(e) => setStatus(m.id, e.target.value)}
              className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
            >
              <option value="listed">listed</option>
              <option value="under_review">under_review</option>
              <option value="rejected">rejected</option>
              <option value="archived">archived</option>
            </select>
            <Button variant="outline" onClick={() => del(m.id)}>
              {t("delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
