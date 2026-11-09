"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { islesRequest, type IslesServer } from "@/lib/isles";

interface Linked {
  server: string;
  identity: { uuid: string; name: string; platform: string };
  fresh: boolean;
  player?: { group?: string; values?: Record<string, string> };
}
export function GameProfileClient() {
  const t = useTranslations("isles");
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [servers, setServers] = useState<IslesServer[]>([]);
  const [player, setPlayer] = useState("");
  const [server, setServer] = useState("");
  const [links, setLinks] = useState<Linked[]>([]);
  const [pair, setPair] = useState<{ command: string; expiresAt: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      islesRequest<{ id: string; name: string }[]>("players", { signal: controller.signal }),
      islesRequest<IslesServer[]>("servers", { signal: controller.signal }),
    ])
      .then(([ps, ss]) => {
        setPlayers(ps);
        setServers(ss);
        setPlayer(ps[0]?.id ?? "");
        setServer(ss[0]?.id ?? "");
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(t("signInRequired"));
      });
    return () => controller.abort();
  }, [t]);
  useEffect(() => {
    if (!player) return;
    const controller = new AbortController();
    const load = () => {
      void islesRequest<Linked[]>(`players/${player}/links`, { signal: controller.signal })
        .then(setLinks)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [player]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("gameProfile")}</h1>
          <p className="text-text-muted mt-3">{t("pairIntro")}</p>
        </div>
        {error && (
          <p role="alert" className="text-danger">
            {error}{" "}
            <Link href="/login" className="underline">
              {t("signIn")}
            </Link>
          </p>
        )}
        {players.length > 0 && (
          <form
            className="grid gap-5 rounded-lg border p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              void islesRequest<{ command: string; expiresAt: string }>(`players/${player}/pair`, {
                method: "POST",
                body: JSON.stringify({ server }),
              })
                .then(setPair)
                .catch((e: unknown) => setError(e instanceof Error ? e.message : t("unavailable")))
                .finally(() => setBusy(false));
            }}
          >
            <label className="grid gap-2 text-sm">
              {t("player")}
              <select
                className="bg-surface h-10 rounded-md border px-3"
                value={player}
                onChange={(e) => {
                  setPlayer(e.target.value);
                  setPair(null);
                  setLinks([]);
                }}
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("servers")}
              <select
                className="bg-surface h-10 rounded-md border px-3"
                value={server}
                onChange={(e) => {
                  setServer(e.target.value);
                  setPair(null);
                }}
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={busy || !server || !player}>
              {t(busy ? "working" : "createPair")}
            </Button>
            {pair && (
              <div role="status" className="bg-surface space-y-3 rounded-md border p-4">
                <code className="break-all">{pair.command}</code>
                <p className="text-text-muted text-sm">
                  {t("pairExpires")} {new Date(pair.expiresAt).toLocaleString()}
                </p>
              </div>
            )}
          </form>
        )}
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t("linkedGames")}</h2>
          <div className="grid gap-4">
            {links.map((link) => (
              <article key={link.server} className="space-y-3 rounded-lg border p-5">
                <h3 className="font-semibold">
                  {servers.find((s) => s.id === link.server)?.name ?? link.server}
                </h3>
                <p>
                  {link.identity.name}{" "}
                  <span className="text-text-muted text-xs">{link.identity.platform}</span>
                </p>
                <p className="text-text-muted text-xs break-all">{link.identity.uuid}</p>
                <p className="text-text-muted text-sm">
                  {t(link.fresh ? "bridgeFresh" : "bridgeStale")}
                </p>
                {link.player?.group && (
                  <p>
                    {t("group")}: {link.player.group}
                  </p>
                )}
                {link.player?.values && (
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(link.player.values).map(([name, value]) => (
                      <div key={name}>
                        <dt className="text-text-muted">{name}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
