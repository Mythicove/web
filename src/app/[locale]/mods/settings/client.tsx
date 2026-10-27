"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  InboxIcon,
  KeyRoundIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import {
  hoardClient,
  type HoardPAT,
  type HoardTeamInvite,
  type HoardTeamMember,
  type HoardUserInvite,
  type HoardUserTeam,
} from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";

// 与 hoard 服务端 scope 校验对齐（requireUploadScope）；后端新增 scope 时同步扩展。
const PAT_SCOPES = ["UPLOAD"];

interface PendingRemove {
  teamId: string;
  sub: string;
}

interface PendingRole {
  teamId: string;
  sub: string;
  name: string;
  role: "owner" | "member";
}

export function ModSettingsPageClient() {
  const t = useTranslations("modSettings");
  const errText = useErrorText();
  const { user, loaded } = useHoardUser();

  const [teams, setTeams] = useState<HoardUserTeam[]>([]);
  const [members, setMembers] = useState<Record<string, HoardTeamMember[]>>({});
  const [invites, setInvites] = useState<Record<string, HoardTeamInvite[]>>({});
  const [myInvites, setMyInvites] = useState<HoardUserInvite[]>([]);
  const [teamName, setTeamName] = useState("");
  const [addSub, setAddSub] = useState<Record<string, string>>({});
  const [pats, setPats] = useState<HoardPAT[]>([]);
  const [patForm, setPatForm] = useState({ name: "", days: "90" });
  // 与 hoard requireUploadScope 对齐；后端新增 scope 时在此同步扩展
  const [patScopes, setPatScopes] = useState<string[]>(["UPLOAD"]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null);
  const [pendingRole, setPendingRole] = useState<PendingRole | null>(null);
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
  const loadMyInvites = useCallback(() => {
    hoardClient
      .myInvites()
      .then(setMyInvites)
      .catch((e) => toast.error(errText(e)));
  }, [errText]);

  useEffect(() => {
    if (user) {
      loadTeams();
      loadPats();
      loadMyInvites();
    }
  }, [user, loadTeams, loadPats, loadMyInvites]);

  const loadMembers = (teamId: string) => {
    hoardClient
      .teamMembers(teamId)
      .then((m) => setMembers((prev) => ({ ...prev, [teamId]: m })))
      .catch((e) => toast.error(errText(e)));
  };

  const loadInvites = (teamId: string) => {
    hoardClient
      .teamInvites(teamId)
      .then((list) => setInvites((prev) => ({ ...prev, [teamId]: list })))
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

  // 加入团队需被邀请人同意：这里只发出邀请，不直接写成员。
  const inviteMember = async (teamId: string) => {
    const sub = (addSub[teamId] ?? "").trim();
    if (!sub || busy) return;
    setBusy(`add-${teamId}`);
    try {
      await hoardClient.inviteMember(teamId, sub, "member");
      setAddSub({ ...addSub, [teamId]: "" });
      toast.success(t("memberInvited"));
      loadInvites(teamId);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const revokeInvite = async (teamId: string, sub: string) => {
    if (busy) return;
    setBusy(`revoke-invite-${sub}`);
    try {
      await hoardClient.revokeInvite(teamId, sub);
      toast.success(t("inviteRevoked"));
      loadInvites(teamId);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(null);
    }
  };

  const answerInvite = async (teamId: string, accept: boolean) => {
    if (busy) return;
    setBusy(accept ? `accept-${teamId}` : `reject-${teamId}`);
    try {
      if (accept) {
        await hoardClient.acceptInvite(teamId);
        toast.success(t("inviteAccepted"));
        loadTeams();
      } else {
        await hoardClient.rejectInvite(teamId);
        toast.success(t("inviteRejected"));
      }
      loadMyInvites();
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

  // 角色变更 = 移交所有权（升为 owner）或降级。后端会拒绝"降级唯一 owner"（409），
  // 该错误经 toast 呈现，故这里不需要预判团队里还剩几个 owner。
  const changeRole = async () => {
    if (!pendingRole) return;
    const { teamId, sub, role } = pendingRole;
    setBusy("change-role");
    try {
      await hoardClient.setTeamMemberRole(teamId, sub, role);
      toast.success(t("roleChanged"));
      setPendingRole(null);
      loadMembers(teamId);
      loadTeams();
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
                          onClick={() => {
                            loadMembers(team.team_id);
                            if (team.role === "owner") loadInvites(team.team_id);
                          }}
                        >
                          {t("viewMembers")}
                        </button>
                        {members[team.team_id] && (
                          <div className="border-border mt-3 space-y-1 border-t pt-3 text-sm">
                            {members[team.team_id].map((m) => (
                              <div
                                key={m.user_sub}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="flex items-center gap-2">
                                  {m.username || m.user_sub}
                                  {team.role === "owner" && m.user_sub !== user?.sub ? (
                                    // owner 可改他人角色（含移交所有权）；改自己会失去管理权，故不提供
                                    <Select
                                      value={m.role}
                                      disabled={busy !== null}
                                      onValueChange={(v) =>
                                        setPendingRole({
                                          teamId: team.team_id,
                                          sub: m.user_sub,
                                          name: m.username || m.user_sub,
                                          role: v === "owner" ? "owner" : "member",
                                        })
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-28 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="owner">{t("roleOwner")}</SelectItem>
                                        <SelectItem value="member">{t("roleMember")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge variant="secondary">
                                      {m.role === "owner" ? t("roleOwner") : t("roleMember")}
                                    </Badge>
                                  )}
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
                                  onClick={() => void inviteMember(team.team_id)}
                                >
                                  {busy === `add-${team.team_id}` ? (
                                    <Loader2Icon className="animate-spin" />
                                  ) : (
                                    <UserPlusIcon />
                                  )}
                                  {t("inviteMember")}
                                </Button>
                              </div>
                            )}
                            {team.role === "owner" && (invites[team.team_id] ?? []).length > 0 && (
                              <div className="border-border mt-3 border-t pt-3">
                                <p className="text-text-muted text-xs">{t("pendingInvites")}</p>
                                <div className="mt-1 space-y-1">
                                  {(invites[team.team_id] ?? []).map((inv) => (
                                    <div
                                      key={inv.user_sub}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>
                                        {inv.username || inv.user_sub}{" "}
                                        <Badge variant="outline">
                                          {inv.role === "owner" ? t("roleOwner") : t("roleMember")}
                                        </Badge>{" "}
                                        <span className="text-text-muted text-xs">
                                          {t("inviteExpires", {
                                            date: new Date(inv.expires_at).toLocaleDateString(),
                                          })}
                                        </span>
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={busy !== null}
                                        onClick={() =>
                                          void revokeInvite(team.team_id, inv.user_sub)
                                        }
                                      >
                                        <Trash2Icon />
                                        {t("revokeInvite")}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
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

              {myInvites.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                    <InboxIcon className="text-text-muted size-4" />
                    {t("myInvites")}
                  </h2>
                  <p className="text-text-muted mt-1 text-xs">{t("myInvitesHint")}</p>
                  <div className="mt-3 space-y-2">
                    {myInvites.map((inv) => (
                      <div
                        key={inv.team_id}
                        className="border-border bg-surface flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm"
                      >
                        <span>
                          {inv.team_name || inv.team_id}{" "}
                          <Badge variant="outline">
                            {inv.role === "owner" ? t("roleOwner") : t("roleMember")}
                          </Badge>{" "}
                          <span className="text-text-muted text-xs">
                            {t("inviteExpires", {
                              date: new Date(inv.expires_at).toLocaleDateString(),
                            })}
                          </span>
                        </span>
                        <span className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy !== null}
                            onClick={() => void answerInvite(inv.team_id, true)}
                          >
                            {busy === `accept-${inv.team_id}` && (
                              <Loader2Icon className="animate-spin" />
                            )}
                            {t("accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy !== null}
                            onClick={() => void answerInvite(inv.team_id, false)}
                          >
                            {t("reject")}
                          </Button>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

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
        open={pendingRole !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null);
        }}
        title={t("roleChangeTitle")}
        description={
          pendingRole
            ? pendingRole.role === "owner"
              ? t("roleTransferHint", { name: pendingRole.name })
              : t("roleDemoteHint", { name: pendingRole.name })
            : undefined
        }
        confirmLabel={pendingRole?.role === "owner" ? t("roleOwner") : t("roleMember")}
        destructive={pendingRole?.role === "member"}
        busy={busy === "change-role"}
        onConfirm={() => void changeRole()}
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
