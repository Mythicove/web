"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { hoardClient, type HoardPAT, type HoardTeamMember, type HoardUserTeam } from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function ModSettingsPage() {
  const t = useTranslations("modSettings");
  const { user, loaded } = useHoardUser();

  const [teams, setTeams] = useState<HoardUserTeam[]>([]);
  const [members, setMembers] = useState<Record<string, HoardTeamMember[]>>({});
  const [teamName, setTeamName] = useState("");
  const [addSub, setAddSub] = useState<Record<string, string>>({});
  const [pats, setPats] = useState<HoardPAT[]>([]);
  const [patForm, setPatForm] = useState({ name: "", days: "90" });
  const [newToken, setNewToken] = useState<string | null>(null);

  const loadTeams = useCallback(() => {
    hoardClient
      .myTeams()
      .then(setTeams)
      .catch(() => {});
  }, []);
  const loadPats = useCallback(() => {
    hoardClient
      .listPATs()
      .then(setPats)
      .catch(() => {});
  }, []);

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
      .catch(() => {});
  };

  const createTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await hoardClient.createTeam(teamName.trim());
      setTeamName("");
      toast.success(t("teamCreated"));
      loadTeams();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const addMember = async (teamId: string) => {
    const sub = (addSub[teamId] ?? "").trim();
    if (!sub) return;
    try {
      await hoardClient.addTeamMember(teamId, sub, "member");
      setAddSub({ ...addSub, [teamId]: "" });
      toast.success(t("memberAdded"));
      loadMembers(teamId);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const removeMember = async (teamId: string, sub: string) => {
    try {
      await hoardClient.removeTeamMember(teamId, sub);
      loadMembers(teamId);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const createPat = async () => {
    if (!patForm.name.trim()) return;
    try {
      const res = await hoardClient.createPAT(patForm.name.trim(), ["UPLOAD"], Number(patForm.days) || 0);
      setNewToken(res.token);
      setPatForm({ name: "", days: "90" });
      loadPats();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const revokePat = async (id: string) => {
    try {
      await hoardClient.deletePAT(id);
      loadPats();
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          {loaded && !user ? (
            <div className="mt-6">
              <p className="text-sm text-text-muted">{t("needLogin")}</p>
              <a href={hoardClient.loginUrl()}>
                <Button className="mt-3">{t("ssoLogin")}</Button>
              </a>
            </div>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">{t("teamsTitle")}</h2>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder={t("newTeamName")}
                    className="max-w-xs"
                  />
                  <Button onClick={createTeam}>{t("createTeam")}</Button>
                </div>
                <div className="mt-4 space-y-3">
                  {teams.map((team) => (
                    <Card key={team.team_id} className="bg-surface">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{team.name || team.team_id}</span>
                          <Badge variant="outline">{team.role}</Badge>
                        </div>
                        <button
                          className="mt-2 text-xs text-highlight hover:underline"
                          onClick={() => loadMembers(team.team_id)}
                        >
                          {t("viewMembers")}
                        </button>
                        {members[team.team_id] && (
                          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                            {members[team.team_id].map((m) => (
                              <div key={m.user_sub} className="flex items-center justify-between">
                                <span>
                                  {m.username || m.user_sub} <Badge variant="secondary">{m.role}</Badge>
                                </span>
                                {m.user_sub !== user?.sub && team.role === "owner" && (
                                  <Button size="sm" variant="outline" onClick={() => removeMember(team.team_id, m.user_sub)}>
                                    {t("remove")}
                                  </Button>
                                )}
                              </div>
                            ))}
                            {team.role === "owner" && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  value={addSub[team.team_id] ?? ""}
                                  onChange={(e) => setAddSub({ ...addSub, [team.team_id]: e.target.value })}
                                  placeholder={t("memberSubPlaceholder")}
                                  className="max-w-xs"
                                />
                                <Button size="sm" onClick={() => addMember(team.team_id)}>
                                  {t("addMember")}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {teams.length === 0 && <p className="text-sm text-text-muted">{t("noTeams")}</p>}
                </div>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-lg font-semibold">{t("patsTitle")}</h2>
                <p className="mt-1 text-xs text-text-muted">{t("patsHint")}</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="grid gap-1.5">
                    <Label>{t("patName")}</Label>
                    <Input
                      value={patForm.name}
                      onChange={(e) => setPatForm({ ...patForm, name: e.target.value })}
                      className="max-w-[12rem]"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>{t("patDays")}</Label>
                    <Input
                      value={patForm.days}
                      onChange={(e) => setPatForm({ ...patForm, days: e.target.value })}
                      className="max-w-[6rem]"
                    />
                  </div>
                  <Button onClick={createPat}>{t("createPat")}</Button>
                </div>
                {newToken && (
                  <div className="mt-3 rounded-lg border border-highlight/40 bg-surface p-3">
                    <p className="text-xs text-text-muted">{t("tokenOnce")}</p>
                    <code className="mt-1 block break-all text-sm text-highlight">{newToken}</code>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {pats.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-sm"
                    >
                      <span>
                        {p.name} <Badge variant="outline">{(p.scopes ?? []).join(", ") || "*"}</Badge>
                        {p.expires_at && (
                          <span className="ml-2 text-xs text-text-muted">
                            {t("expires")}: {new Date(p.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        {p.last_used && (
                          <span className="ml-2 text-xs text-text-muted">
                            {t("lastUsed")}: {new Date(p.last_used).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                      <Button size="sm" variant="destructive" onClick={() => revokePat(p.id)}>
                        {t("revoke")}
                      </Button>
                    </div>
                  ))}
                  {pats.length === 0 && <p className="text-sm text-text-muted">{t("noPats")}</p>}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
