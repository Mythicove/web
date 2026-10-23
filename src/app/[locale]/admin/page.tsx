"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  apiClient,
  hoardClient,
  ApiError,
  type AdminUser,
  type Announcement,
  type HoardProject,
  type LoginMethod,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteHeader } from "@/components/site-header";

const HOARD_TOKEN_KEY = "hoardAdminToken";
const MIRROR_TOKEN_KEY = "adminToken";

export default function AdminPage() {
  const t = useTranslations("admin");
  const { auth } = useAuth();
  const [manualToken, setManualToken] = useState("");
  const [hoardToken, setHoardToken] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManualToken(localStorage.getItem(MIRROR_TOKEN_KEY) ?? "");
    setHoardToken(localStorage.getItem(HOARD_TOKEN_KEY) ?? "");
  }, []);

  const saveManual = (v: string) => {
    setManualToken(v);
    localStorage.setItem(MIRROR_TOKEN_KEY, v);
  };
  const saveHoard = (v: string) => {
    setHoardToken(v);
    localStorage.setItem(HOARD_TOKEN_KEY, v);
  };

  // Mirror 管理面板：优先用登录会话（后端校验 role=admin），手贴 token 作救援通道。
  const mirrorToken = auth?.accessToken ?? manualToken;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>

          {auth?.accessToken ? (
            <p className="mt-2 text-sm text-success">{t("useSession")}</p>
          ) : (
            <div className="mt-4 flex max-w-xs flex-col gap-1.5">
              <Label>{t("token")}</Label>
              <Input
                value={manualToken}
                onChange={(e) => saveManual(e.target.value)}
                type="password"
              />
            </div>
          )}

          <Tabs defaultValue="users" className="mt-6">
            <TabsList>
              <TabsTrigger value="users">{t("tab.users")}</TabsTrigger>
              <TabsTrigger value="loginMethods">{t("tab.loginMethods")}</TabsTrigger>
              <TabsTrigger value="announcement">{t("tab.announcement")}</TabsTrigger>
              <TabsTrigger value="invites">{t("tab.invites")}</TabsTrigger>
              <TabsTrigger value="mods">{t("tab.mods")}</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UsersPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="loginMethods">
              <LoginMethodsPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="announcement">
              <AnnouncementPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="invites">
              <InvitesPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="mods">
              <ModsPanel token={hoardToken} onToken={saveHoard} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// errText 把错误翻译成用户可读提示；403 特指非管理员。
function useErrText() {
  const t = useTranslations("admin");
  return (e: unknown) =>
    e instanceof ApiError && e.status === 403 ? t("notAdmin") : String(e);
}

function UsersPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const errText = useErrText();
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.admin
      .listUsers(token, "", 0, 100)
      .then((r) => setUsers(r.users))
      .catch((e) => toast.error(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const update = async (
    u: AdminUser,
    role: AdminUser["role"],
    status: AdminUser["status"],
  ) => {
    try {
      await apiClient.admin.updateUser(token, u.id, role, status);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role, status } : x)));
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    }
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("colUser")}</TableHead>
          <TableHead>{t("colPlayers")}</TableHead>
          <TableHead>{t("colRole")}</TableHead>
          <TableHead>{t("colStatus")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-medium">{u.nickname || u.email}</span>
                {!u.verified && <Badge variant="secondary">{t("unverified")}</Badge>}
              </div>
              <div className="text-xs text-text-muted">{u.email}</div>
            </TableCell>
            <TableCell className="text-xs text-text-muted">
              {u.player_names.join(", ")}
            </TableCell>
            <TableCell>
              <select
                value={u.role}
                onChange={(e) => update(u, e.target.value as AdminUser["role"], u.status)}
                className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </TableCell>
            <TableCell>
              <select
                value={u.status}
                onChange={(e) => update(u, u.role, e.target.value as AdminUser["status"])}
                className="rounded-md border border-border bg-bg px-2 py-1 text-xs"
              >
                <option value="active">active</option>
                <option value="banned">banned</option>
                <option value="suspended">suspended</option>
              </select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LoginMethodsPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const errText = useErrText();
  const [methods, setMethods] = useState<LoginMethod[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.admin
      .loginMethods(token)
      .then((r) => setMethods(r.methods))
      .catch((e) => toast.error(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggle = async (id: string) => {
    const next = methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setMethods(next);
    try {
      await apiClient.admin.updateLoginMethods(token, next);
      toast.success(t("saved"));
    } catch (e) {
      setMethods(methods);
      toast.error(errText(e));
    }
  };

  if (!token) return <p className="text-sm text-text-muted">{t("needToken")}</p>;

  return (
    <div className="space-y-2">
      {methods.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
        >
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
  const errText = useErrText();
  const [a, setA] = useState<Announcement>({ title: "", body: "", enabled: false });

  useEffect(() => {
    if (!token) return;
    apiClient.admin
      .announcement(token)
      .then(setA)
      .catch(() => {});
  }, [token]);

  const save = async () => {
    try {
      await apiClient.admin.setAnnouncement(token, a);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    }
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
      </CardContent>
    </Card>
  );
}

function InvitesPanel({ token }: { token: string }) {
  const t = useTranslations("admin");
  const errText = useErrText();
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);

  const generate = async () => {
    try {
      const r = await apiClient.admin.inviteCodes(token, count);
      setCodes(r.codes);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    }
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

function ModsPanel({ token, onToken }: { token: string; onToken: (v: string) => void }) {
  const t = useTranslations("admin");
  const [mods, setMods] = useState<HoardProject[]>([]);

  useEffect(() => {
    if (!token) return;
    hoardClient
      .search("", 0, 100)
      .then((r) => setMods(r.hits))
      .catch((e) => toast.error(String(e)));
  }, [token]);

  const setStatus = async (id: string, status: NonNullable<HoardProject["status"]>) => {
    try {
      await hoardClient.setStatus(id, status, token);
      setMods((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      toast.success(t("saved"));
    } catch (e) {
      toast.error(String(e));
    }
  };

  const del = async (id: string) => {
    try {
      await hoardClient.deleteMod(id, token);
      setMods((prev) => prev.filter((m) => m.id !== id));
      toast.success(t("saved"));
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex max-w-xs flex-col gap-1.5">
        <Label>{t("hoardToken")}</Label>
        <Input value={token} onChange={(e) => onToken(e.target.value)} type="password" />
        <p className="text-xs text-text-muted">{t("hoardTokenHint")}</p>
      </div>
      {!token && <p className="text-sm text-text-muted">{t("needToken")}</p>}
      {token && mods.length === 0 && <p className="text-sm text-text-muted">{t("noMods")}</p>}
      <div className="space-y-2">
        {mods.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
          >
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
                onChange={(e) =>
                  setStatus(m.id, e.target.value as NonNullable<HoardProject["status"]>)
                }
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
    </div>
  );
}
