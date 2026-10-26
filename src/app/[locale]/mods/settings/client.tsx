"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  KeyRoundIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react";
import { hoardClient, type HoardPAT, type HoardTeamMember, type HoardUserTeam } from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";

// 与 hoard 服务端 scope 校验对齐（requireUploadScope）；后端新增 scope 时同步扩展。
const PAT_SCOPES = ["UPLOAD"];

interface PendingRemove {
  teamId: string;
  sub: string;
}

export function ModSettingsPageClient() {
  const t = useTranslations("modSettings");
  const errText = useErrorText();
  const { user, loaded } = useHoardUser();

  const [teams, setTeams] = useState<HoardUserTeam[]>([]);
  const [members, setMembers] = useState<Record<string, HoardTeamMember[]>>({});
  const [teamName, setTeamName] = useState("");
  const [addSub, setAddSub] = useState<Record<string, string>>({});
  const [pats, setPats] = useState<HoardPAT[]>([]);
  const [patForm, setPatForm] = useState({ name: "", days: "90" });
  // 与 hoard requireUploadScope 对齐；后端新增 scope 时在此同步扩展
  const [patScopes, setPatScopes] = useState<string[]>(["UPLOAD"]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);

  const loadTeams = useCallback(() => {
    hoardClient
      .myTeams()
      .then(setTeams)
      .catch((e) => toast.error(errText(e)));
  }, [errText]);
  const loadPats = useCallback(() => {
    hoardClient
      .listPATs()
      .then(setPats)
      .catch((e) => toast.error(errText(e)));
  }, [errText]);

  useEffect(() => {
    if (user) {
      loadTeams();
      loadPats();
    }
  }, [user, loadTeams, loadPats]);

  const loadMembers = (teamId: string) => {
    hoardClient
      .teamMembers(teamId)
      .then((m) => setMembers((prev) => ({ ...prev, [teamId]: m })))
      .catch((e) => toast.error(errText(e)));
  };

  const createTeam = async () => {
    if (!teamName.trim() || busy) return;
    setBusy("team");
    try {
      await hoardClient.createTeam(teamName.trim());
      setTeamName("");
      toast.success(t("teamCreated"));
      loadTeams();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const addMember = async (teamId: string) => {
    const sub = (addSub[teamId] ?? "").trim();
    if (!sub || busy) return;
    setBusy(`add-${teamId}`);
    try {
      await hoardClient.addTeamMember(teamId, sub, "member");
      setAddSub({ ...addSub, [teamId]: "" });
      toast.success(t("memberAdded"));
      loadMembers(teamId);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const removeMember = async () => {
    if (!pendingRemove) return;
    setBusy("remove-member");
    try {
      await hoardClient.removeTeamMember(pendingRemove.teamId, pendingRemove.sub);
      loadMembers(pendingRemove.teamId);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const createPat = async () => {
    if (!patForm.name.trim() || busy || patScopes.length === 0) return;
    setBusy("pat");
    try {
      const res = await hoardClient.createPAT(
        patForm.name.trim(),
        patScopes,
        Number(patForm.days) || 0,
      );
      setNewToken(res.token);
      setPatForm({ name: "", days: "90" });
      loadPats();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const revokePat = async () => {
    if (!pendingRevoke) return;
    setBusy("revoke");
    try {
      await hoardClient.deletePAT(pendingRevoke);
      loadPats();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          {!loaded ? (
            <div className="mt-8 grid gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !user ? (
            <div className="mt-6">
              <p className="text-text-muted text-sm">{t("needLogin")}</p>
            </div>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                  <UsersIcon className="text-text-muted size-4" />
                  {t("teamsTitle")}
                </h2>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder={t("newTeamName")}
                    aria-label={t("newTeamName")}
                    className="max-w-xs"
                  />
                  <Button onClick={() => void createTeam()} disabled={busy !== null}>
                    {busy === "team" ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                    {t("createTeam")}
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {teams.map((team) => (
                    <Card key={team.team_id} className="bg-surface shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{team.name || team.team_id}</span>
                          <Badge variant="outline">{team.role}</Badge>
                        </div>
                        <button
                          type="button"
                          className="text-primary mt-2 text-xs hover:underline"
                          onClick={() => loadMembers(team.team_id)}
                        >
                          {t("viewMembers")}
                        </button>
                        {members[team.team_id] && (
                          <div className="border-border mt-3 space-y-1 border-t pt-3 text-sm">
                            {members[team.team_id].map((m) => (
                              <div key={m.user_sub} className="flex items-center justify-between">
                                <span>
                                  {m.username || m.user_sub}{" "}
                                  <Badge variant="secondary">{m.role}</Badge>
                                </span>
                                {m.user_sub !== user?.sub && team.role === "owner" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setPendingRemove({ teamId: team.team_id, sub: m.user_sub })
                                    }
                                  >
                                    <UserMinusIcon />
                                    {t("remove")}
                                  </Button>
                                )}
                              </div>
                            ))}
                            {team.role === "owner" && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  value={addSub[team.team_id] ?? ""}
                                  onChange={(e) =>
                                    setAddSub({ ...addSub, [team.team_id]: e.target.value })
                                  }
                                  placeholder={t("memberSubPlaceholder")}
                                  aria-label={t("memberSubPlaceholder")}
                                  className="max-w-xs"
                                />
                                <Button
                                  size="sm"
                                  disabled={busy !== null}
                                  onClick={() => void addMember(team.team_id)}
                                >
                                  {busy === `add-${team.team_id}` && (
                                    <Loader2Icon className="animate-spin" />
                                  )}
                                  {t("addMember")}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {teams.length === 0 && <EmptyState icon={UsersIcon} title={t("noTeams")} />}
                </div>
              </section>

              <section className="mt-10">
                <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                  <KeyRoundIcon className="text-text-muted size-4" />
                  {t("patsTitle")}
                </h2>
                <p className="text-text-muted mt-1 text-xs">{t("patsHint")}</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="pat-name">{t("patName")}</Label>
                    <Input
                      id="pat-name"
                      value={patForm.name}
                      onChange={(e) => setPatForm({ ...patForm, name: e.target.value })}
                      className="max-w-[12rem]"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="pat-days">{t("patDays")}</Label>
                    <Input
                      id="pat-days"
                      type="number"
                      min={1}
                      value={patForm.days}
                      onChange={(e) => setPatForm({ ...patForm, days: e.target.value })}
                      className="max-w-[6rem]"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>{t("patScopes")}</Label>
                    <div className="flex h-8 items-center gap-3">
                      {PAT_SCOPES.map((sc) => (
                        <label key={sc} className="flex items-center gap-1.5 text-sm">
                          <Checkbox
                            checked={patScopes.includes(sc)}
                            onCheckedChange={(v) =>
                              setPatScopes((prev) =>
                                v === true
                                  ? [...new Set([...prev, sc])]
                                  : prev.filter((x) => x !== sc),
                              )
                            }
                          />
                          {sc}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => void createPat()} disabled={busy !== null}>
                    {busy === "pat" ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                    {t("createPat")}
                  </Button>
                </div>
                {newToken && (
                  <div className="border-highlight/40 bg-surface mt-3 rounded-lg border p-3">
                    <p className="text-text-muted text-xs">{t("tokenOnce")}</p>
                    <code className="text-highlight mt-1 block text-sm break-all">{newToken}</code>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {pats.map((p) => (
                    <div
                      key={p.id}
                      className="border-border bg-surface flex items-center justify-between rounded-lg border px-4 py-2 text-sm"
                    >
                      <span>
                        {p.name}{" "}
                        <Badge variant="outline">{(p.scopes ?? []).join(", ") || "*"}</Badge>
                        {p.expires_at && (
                          <span className="text-text-muted ml-2 text-xs">
                            {t("expires")}: {new Date(p.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        {p.last_used && (
                          <span className="text-text-muted ml-2 text-xs">
                            {t("lastUsed")}: {new Date(p.last_used).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setPendingRevoke(p.id)}
                      >
                        <Trash2Icon />
                        {t("revoke")}
                      </Button>
                    </div>
                  ))}
                  {pats.length === 0 && <EmptyState icon={KeyRoundIcon} title={t("noPats")} />}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
        title={t("remove")}
        busy={busy === "remove-member"}
        onConfirm={() => void removeMember()}
      />
      <ConfirmDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        title={t("revoke")}
        busy={busy === "revoke"}
        onConfirm={() => void revokePat()}
      />
    </div>
  );
}
