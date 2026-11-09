"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import {
  islesRequest,
  type IslesConfig,
  type IslesConnection,
  type IslesInstance,
  type IslesRuntime,
  type IslesServer,
} from "@/lib/isles";

type Call = <T>(path: string, init?: RequestInit) => Promise<T>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="text-text-muted">{label}</span>
      {children}
    </label>
  );
}
const selectStyle = "border-border bg-surface text-text h-10 rounded-md border px-3 text-sm";
const emptyServer = (): IslesServer => ({
  id: "",
  name: "",
  description: "",
  address: "",
  edition: "java",
  links: [],
  published: false,
});
const emptyConnection = (): IslesConnection => ({
  id: "",
  name: "",
  url: "",
  kind: "mcsm",
  configured: false,
});

export function IntegrationsClient() {
  const t = useTranslations("isles");
  const [credential, setCredential] = useState("");
  const [config, setConfig] = useState<IslesConfig | null>(null);
  const [selected, setSelected] = useState<{ kind: "server" | "connection"; id: string }>({
    kind: "server",
    id: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const call: Call = useCallback(
    (path, init) =>
      islesRequest(`admin/${path}`, {
        ...init,
        headers: credential.trim() ? { Authorization: `Bearer ${credential.trim()}` } : undefined,
      }),
    [credential],
  );
  const load = useCallback(async () => {
    const value = await call<IslesConfig>("config");
    setConfig(value);
  }, [call]);
  const run = async () => {
    setBusy(true);
    setError("");
    try {
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unavailable"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t("adminTitle")}</h1>
            <p className="text-text-muted mt-3 max-w-2xl text-sm">{t("adminIntro")}</p>
          </div>
          <Link href="/admin" className="text-primary text-sm hover:underline">
            {t("back")}
          </Link>
        </div>
        <form
          className="mb-8 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          <div className="w-full max-w-md">
            <Field label={t("credentials")}>
              <Input
                type="password"
                autoComplete="off"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" disabled={busy}>
            {t(busy ? "working" : "connect")}
          </Button>
        </form>
        {error && (
          <div
            role="alert"
            className="border-danger text-danger mb-6 rounded-md border p-4 text-sm"
          >
            <p>{error}</p>
            <p className="mt-2">{t("setup")}</p>
          </div>
        )}
        {config && (
          <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <nav className="border-border space-y-6 rounded-lg border p-4">
              <div>
                <h2 className="mb-3 text-sm font-semibold">{t("servers")}</h2>
                {config.servers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-current={
                      selected.kind === "server" && selected.id === s.id ? "page" : undefined
                    }
                    className="hover:bg-surface-raised aria-[current=page]:bg-surface-raised block w-full truncate rounded-md px-3 py-2 text-left text-sm"
                    onClick={() => setSelected({ kind: "server", id: s.id })}
                  >
                    {s.name}
                  </button>
                ))}
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected({ kind: "server", id: "" })}
                >
                  {t("addServer")}
                </Button>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold">{t("connections")}</h2>
                {config.connections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-current={
                      selected.kind === "connection" && selected.id === c.id ? "page" : undefined
                    }
                    className="hover:bg-surface-raised aria-[current=page]:bg-surface-raised block w-full truncate rounded-md px-3 py-2 text-left text-sm"
                    onClick={() => setSelected({ kind: "connection", id: c.id })}
                  >
                    {c.name}
                  </button>
                ))}
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected({ kind: "connection", id: "" })}
                >
                  {t("addConnection")}
                </Button>
              </div>
              <Link href="/servers" className="text-primary block text-sm hover:underline">
                {t("title")}
              </Link>
            </nav>
            {selected.kind === "server" ? (
              <ServerEditor
                key={`server-${selected.id}`}
                initial={config.servers.find((s) => s.id === selected.id) ?? emptyServer()}
                connections={config.connections}
                call={call}
                saved={load}
              />
            ) : (
              <ConnectionEditor
                key={`connection-${selected.id}`}
                initial={config.connections.find((c) => c.id === selected.id) ?? emptyConnection()}
                call={call}
                saved={load}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ConnectionEditor({
  initial,
  call,
  saved,
}: {
  initial: IslesConnection;
  call: Call;
  saved: () => Promise<void>;
}) {
  const t = useTranslations("isles");
  const [value, setValue] = useState(initial);
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const change = (field: keyof IslesConnection, next: string) =>
    setValue({ ...value, [field]: next });
  const run = async (operation: () => Promise<unknown>, message?: string) => {
    setBusy(true);
    try {
      const data = await operation();
      setResult(data ?? null);
      if (message) toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("unavailable"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="min-w-0 space-y-6">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const next = await call<IslesConnection>(`connections/${value.id}`, {
              method: "PUT",
              body: JSON.stringify({ ...value, ...(secret ? { token: secret } : {}) }),
            });
            setValue(next);
            setSecret("");
            await saved();
          }, t("saved"));
        }}
      >
        <h2 className="font-display text-xl font-semibold">{value.name || t("addConnection")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("id")}>
            <Input
              required
              pattern="[a-z0-9][a-z0-9-]{0,63}"
              value={value.id}
              disabled={!!initial.id}
              onChange={(e) => change("id", e.target.value)}
            />
          </Field>
          <Field label={t("name")}>
            <Input
              required
              maxLength={120}
              value={value.name}
              onChange={(e) => change("name", e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("type")}>
          <select
            className={selectStyle}
            value={value.kind}
            onChange={(e) => change("kind", e.target.value)}
          >
            <option value="mcsm">MCSManager</option>
            <option value="pterodactyl">Pterodactyl</option>
            <option value="prometheus">Prometheus Exporter</option>
          </select>
        </Field>
        <Field label={t("url")}>
          <Input
            required
            type="url"
            value={value.url}
            onChange={(e) => change("url", e.target.value)}
          />
        </Field>
        <Field label={t("token")}>
          <Input
            type="password"
            autoComplete="new-password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </Field>
        <p className="text-text-muted text-sm">
          {value.configured && <span className="text-success mr-2">{t("configured")}</span>}
          {t("tokenHint")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {t(busy ? "working" : "save")}
          </Button>
          {initial.id && (
            <Button variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>
              {t("remove")}
            </Button>
          )}
        </div>
      </form>
      {value.id && value.url && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void run(() =>
              call(
                `connections/${value.id}/${value.kind === "prometheus" ? "metrics" : "instances"}`,
              ),
            )
          }
        >
          {t(value.kind === "prometheus" ? "metrics" : "discover")}
        </Button>
      )}
      {result !== null && (
        <pre className="border-border bg-surface max-h-96 overflow-auto rounded-md border p-4 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        description={t("removeConfirm")}
        onConfirm={() =>
          void run(async () => {
            await call(`connections/${value.id}`, { method: "DELETE" });
            await saved();
            setValue(emptyConnection());
          }, t("saved"))
        }
      />
    </section>
  );
}

function ServerEditor({
  initial,
  connections,
  call,
  saved,
}: {
  initial: IslesServer;
  connections: IslesConnection[];
  call: Call;
  saved: () => Promise<void>;
}) {
  const t = useTranslations("isles");
  const [value, setValue] = useState(initial);
  const [instances, setInstances] = useState<{ connectionId: string; items: IslesInstance[] }>({
    connectionId: "",
    items: [],
  });
  const [runtime, setRuntime] = useState<IslesRuntime | null>(null);
  const [logs, setLogs] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const change = <K extends keyof IslesServer>(field: K, next: IslesServer[K]) =>
    setValue({ ...value, [field]: next });
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
  const operation = (action: string) =>
    run(async () => {
      await call(`servers/${value.id}/actions/${action}`, {
        method: "POST",
        body: JSON.stringify(action === "command" ? { command } : {}),
      });
      toast.success(t("accepted"));
    });
  return (
    <section className="min-w-0 space-y-8">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const next = await call<IslesServer>(`servers/${value.id}`, {
              method: "PUT",
              body: JSON.stringify(value),
            });
            setValue(next);
            await saved();
            toast.success(t("saved"));
          });
        }}
      >
        <h2 className="font-display text-xl font-semibold">{value.name || t("addServer")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("id")}>
            <Input
              required
              pattern="[a-z0-9][a-z0-9-]{0,63}"
              disabled={!!initial.id}
              value={value.id}
              onChange={(e) => change("id", e.target.value)}
            />
          </Field>
          <Field label={t("name")}>
            <Input
              required
              maxLength={120}
              value={value.name}
              onChange={(e) => change("name", e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("description")}>
          <textarea
            className="border-border bg-surface min-h-28 rounded-md border p-3"
            maxLength={4000}
            value={value.description}
            onChange={(e) => change("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("address")}>
            <Input
              required
              placeholder="mc.example.org:25565"
              value={value.address}
              onChange={(e) => change("address", e.target.value)}
            />
          </Field>
          <Field label={t("edition")}>
            <select
              className={selectStyle}
              value={value.edition}
              onChange={(e) => change("edition", e.target.value as IslesServer["edition"])}
            >
              <option value="java">Java Edition</option>
              <option value="bedrock">Bedrock Edition</option>
            </select>
          </Field>
        </div>
        <Field label={t("cover")}>
          <Input
            type="url"
            value={value.coverUrl ?? ""}
            onChange={(e) => change("coverUrl", e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={value.published}
            onChange={(e) => change("published", e.target.checked)}
          />
          {t("published")}
        </label>
        <fieldset className="space-y-4 border-t pt-5">
          <legend className="text-sm font-semibold">{t("connections")}</legend>
          <select
            aria-label={t("connections")}
            className={`${selectStyle} w-full`}
            value={value.connectionId ?? ""}
            onChange={(e) =>
              setValue({ ...value, connectionId: e.target.value, instanceId: "", daemonId: "" })
            }
          >
            <option value="">{t("none")}</option>
            {connections
              .filter((c) => c.kind !== "prometheus")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          {value.connectionId && (
            <>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() =>
                  void run(async () => {
                    const id = value.connectionId!;
                    const items = await call<IslesInstance[]>(`connections/${id}/instances`);
                    setInstances({ connectionId: id, items });
                  })
                }
              >
                {t("discover")}
              </Button>
              <Field label={t("instance")}>
                <select
                  className={selectStyle}
                  required
                  value={`${value.daemonId ?? ""}/${value.instanceId ?? ""}`}
                  onChange={(e) => {
                    const item = instances.items.find(
                      (i) => `${i.daemonId ?? ""}/${i.id}` === e.target.value,
                    );
                    if (item)
                      setValue({ ...value, daemonId: item.daemonId ?? "", instanceId: item.id });
                  }}
                >
                  <option value="/">—</option>
                  {value.instanceId && (
                    <option value={`${value.daemonId ?? ""}/${value.instanceId}`}>
                      {value.instanceId}
                    </option>
                  )}
                  {instances.connectionId === value.connectionId &&
                    instances.items
                      .filter(
                        (i) =>
                          i.id !== value.instanceId ||
                          (i.daemonId ?? "") !== (value.daemonId ?? ""),
                      )
                      .map((i) => (
                        <option key={`${i.daemonId}/${i.id}`} value={`${i.daemonId ?? ""}/${i.id}`}>
                          {i.name}
                        </option>
                      ))}
                </select>
              </Field>
            </>
          )}
        </fieldset>
        <Field label={t("packwiz")}>
          <Input
            type="url"
            value={value.packwizUrl ?? ""}
            onChange={(e) => change("packwizUrl", e.target.value)}
          />
        </Field>
        <fieldset className="space-y-4 border-t pt-5">
          <legend className="text-sm font-semibold">{t("links")}</legend>
          {(value.links ?? []).map((link, index) => (
            <div key={index} className="grid gap-3 rounded-md border p-4">
              <Field label={t("label")}>
                <Input
                  value={link.label}
                  maxLength={100}
                  onChange={(e) =>
                    change(
                      "links",
                      value.links.map((l, i) =>
                        i === index ? { ...l, label: e.target.value } : l,
                      ),
                    )
                  }
                />
              </Field>
              <Field label={t("linkKind")}>
                <Input
                  value={link.kind}
                  onChange={(e) =>
                    change(
                      "links",
                      value.links.map((l, i) => (i === index ? { ...l, kind: e.target.value } : l)),
                    )
                  }
                />
              </Field>
              <Field label={t("url")}>
                <Input
                  required
                  type="url"
                  value={link.url}
                  onChange={(e) =>
                    change(
                      "links",
                      value.links.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)),
                    )
                  }
                />
              </Field>
              <Button
                variant="ghost"
                onClick={() =>
                  change(
                    "links",
                    value.links.filter((_, i) => i !== index),
                  )
                }
              >
                {t("remove")}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            disabled={value.links.length >= 20}
            onClick={() => change("links", [...value.links, { kind: "", label: "", url: "" }])}
          >
            {t("addLink")}
          </Button>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {t(busy ? "working" : "save")}
          </Button>
          {initial.id && (
            <Button variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>
              {t("remove")}
            </Button>
          )}
        </div>
      </form>
      {value.id && (
        <div className="space-y-5 border-t pt-6">
          {value.packwizUrl && (
            <Button
              disabled={busy}
              variant="outline"
              onClick={() =>
                void run(async () => {
                  const release = await call<{ version: string }>(
                    `servers/${value.id}/publish-pack`,
                    { method: "POST" },
                  );
                  change("packVersion", release.version);
                  await saved();
                  toast.success(t("packPublished"));
                })
              }
            >
              {t("publishPack")}
            </Button>
          )}
          {value.packVersion && (
            <p className="text-text-muted text-xs break-all">{value.packVersion}</p>
          )}
          {value.connectionId && value.instanceId && (
            <>
              <h3 className="text-lg font-semibold">{t("runtime")}</h3>
              {runtime && (
                <p role="status" className="text-text-muted text-sm">
                  {runtime.state}
                  {runtime.cpuPercent !== undefined ? ` / CPU ${runtime.cpuPercent}%` : ""}
                  {runtime.memoryBytes !== undefined
                    ? ` / ${Math.round(runtime.memoryBytes / 1024 / 1024)} MiB`
                    : ""}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() =>
                    void run(async () =>
                      setRuntime(await call<IslesRuntime>(`servers/${value.id}/runtime`)),
                    )
                  }
                >
                  {t("refresh")}
                </Button>
                {(["start", "stop", "restart"] as const).map((action) => (
                  <Button
                    key={action}
                    disabled={busy}
                    variant={action === "start" ? "default" : "outline"}
                    onClick={() => void operation(action)}
                  >
                    {t(action)}
                  </Button>
                ))}
              </div>
              <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void operation("command");
                }}
              >
                <div className="min-w-0 flex-1">
                  <Field label={t("command")}>
                    <Input
                      required
                      value={command}
                      maxLength={2000}
                      onChange={(e) => setCommand(e.target.value)}
                    />
                  </Field>
                </div>
                <Button type="submit" disabled={busy}>
                  {t("send")}
                </Button>
              </form>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() =>
                  void run(async () => {
                    const result = await call<{ text: string }>(`servers/${value.id}/logs`);
                    setLogs(result.text);
                  })
                }
              >
                {t("logs")}
              </Button>
              {logs !== null && (
                <pre className="border-border bg-surface max-h-96 overflow-auto rounded-md border p-4 text-xs whitespace-pre-wrap">
                  {logs}
                </pre>
              )}
            </>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        description={t("removeConfirm")}
        onConfirm={() =>
          void run(async () => {
            await call(`servers/${value.id}`, { method: "DELETE" });
            await saved();
            setValue(emptyServer());
          })
        }
      />
    </section>
  );
}
