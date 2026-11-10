"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { IslesBridgeSnapshot } from "@/lib/isles";

interface BridgeState {
  fresh: boolean;
  snapshot: IslesBridgeSnapshot;
}
interface Identity {
  player: string;
  identity: { name: string; uuid: string };
}
interface Task {
  id: string;
  kind: string;
  uuid: string;
  group?: string;
  grant: boolean;
  status: string;
  error?: string;
}
type Call = <T>(path: string, init?: RequestInit) => Promise<T>;

export function BridgeAdmin({ id, call }: { id: string; call: Call }) {
  const t = useTranslations("isles");
  const [token, setToken] = useState("");
  const [state, setState] = useState<BridgeState | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [player, setPlayer] = useState("");
  const [kind, setKind] = useState("whitelist");
  const [group, setGroup] = useState("");
  const [grant, setGrant] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    try {
      await operation();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("unavailable"));
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    const [snapshot, linked, pending] = await Promise.all([
      call<BridgeState>(`servers/${id}/bridge`),
      call<Identity[]>(`servers/${id}/identities`),
      call<Task[]>(`servers/${id}/tasks`),
    ]);
    setState(snapshot);
    setIdentities(linked);
    setTasks(pending);
    setPlayer((p) => p || linked[0]?.player || "");
    setGroup((g) => g || snapshot.snapshot.groups?.[0] || "");
  };
  return (
    <section className="space-y-5 border-t pt-6">
      <h3 className="text-lg font-semibold">{t("bridge")}</h3>
      <p className="text-text-muted text-sm">{t("bridgeIntro")}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy} onClick={() => setConfirm(true)}>
          {t("rotateBridge")}
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void run(refresh)}>
          {t("refresh")}
        </Button>
      </div>
      {token && (
        <div role="status" className="bg-surface space-y-3 rounded-md border p-4">
          <p className="text-sm">{t("tokenOnce")}</p>
          <code className="block text-xs break-all">{token}</code>
        </div>
      )}
      {state && (
        <>
          <p className="text-text-muted text-sm">
            {state.snapshot.platform} / {state.snapshot.minecraft} /{" "}
            {t(state.fresh ? "bridgeFresh" : "bridgeStale")}
          </p>
          <dl className="flex flex-wrap gap-6 text-sm">
            {state.snapshot.tps !== undefined && (
              <div>
                <dt>TPS</dt>
                <dd>{state.snapshot.tps.toFixed(2)}</dd>
              </div>
            )}
            {state.snapshot.mspt !== undefined && (
              <div>
                <dt>MSPT</dt>
                <dd>{state.snapshot.mspt.toFixed(2)}</dd>
              </div>
            )}
            {state.snapshot.cpu !== undefined && (
              <div>
                <dt>CPU</dt>
                <dd>{(state.snapshot.cpu * 100).toFixed(1)}%</dd>
              </div>
            )}
          </dl>
          {(state.snapshot.protocolVersions?.length ?? 0) > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer">{t("protocolVersions")}</summary>
              <p className="text-text-muted mt-3 break-words">
                {state.snapshot.protocolVersions!.join(", ")}
              </p>
              <p className="text-text-muted mt-2 text-xs">{t("protocolHint")}</p>
            </details>
          )}
          <ul className="text-text-muted text-xs">
            {Object.entries(state.snapshot.plugins).map(([name, version]) => (
              <li key={name}>
                {name} {version}
              </li>
            ))}
          </ul>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await call(`servers/${id}/tasks`, {
                  method: "POST",
                  body: JSON.stringify({ player, kind, group, grant }),
                });
                await refresh();
                toast.success(t("accepted"));
              });
            }}
          >
            <label className="grid gap-2 text-sm">
              {t("linkedGames")}
              <select
                className="bg-surface h-10 rounded-md border px-3"
                value={player}
                required
                onChange={(e) => setPlayer(e.target.value)}
              >
                <option value="">—</option>
                {identities.map((i) => (
                  <option key={i.player} value={i.player}>
                    {i.identity.name} ({i.identity.uuid})
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("memberAction")}
              <select
                className="bg-surface h-10 rounded-md border px-3"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="whitelist">{t("whitelist")}</option>
                {state.snapshot.plugins.LuckPerms && <option value="member">LuckPerms</option>}
              </select>
            </label>
            {kind === "member" && (
              <label className="grid gap-2 text-sm">
                {t("group")}
                <select
                  className="bg-surface h-10 rounded-md border px-3"
                  value={group}
                  required
                  onChange={(e) => setGroup(e.target.value)}
                >
                  {state.snapshot.groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={grant} onChange={(e) => setGrant(e.target.checked)} />
              {t("grant")}
            </label>
            <Button type="submit" disabled={busy || !state.fresh || !player}>
              {t("queueAction")}
            </Button>
          </form>
          {tasks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">{t("memberAction")}</th>
                    <th>{t("group")}</th>
                    <th>{t("taskState")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b">
                      <td className="py-3">
                        {task.kind} / {task.grant ? "+" : "−"}
                      </td>
                      <td>{task.group || task.uuid}</td>
                      <td>
                        {task.status}
                        {task.error && <p className="text-danger text-xs">{task.error}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        description={t("rotateWarning")}
        onConfirm={() =>
          void run(async () => {
            const result = await call<{ token: string }>(`servers/${id}/bridge-token`, {
              method: "POST",
            });
            setToken(result.token);
            setState(null);
          })
        }
      />
    </section>
  );
}
