"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { islesRequest, type IslesStatus } from "@/lib/isles";

export function ServerStatus({ id, address }: { id: string; address: string }) {
  const t = useTranslations("isles");
  const locale = useLocale();
  const [status, setStatus] = useState<IslesStatus | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = () => {
      if (document.hidden) return;
      void islesRequest<IslesStatus>(`servers/${id}/status`, { signal: controller.signal })
        .then((value) => {
          setStatus(value);
          setFailed(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
        });
    };
    load();
    const interval = setInterval(load, 30_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
      controller.abort();
    };
  }, [id]);

  return (
    <div className="space-y-4">
      <p
        aria-live="polite"
        className={status?.reachable && !failed ? "text-success" : "text-text-muted"}
      >
        <span aria-hidden="true" className="mr-2 inline-block size-2 bg-current" />
        {failed
          ? t("unavailable")
          : status
            ? t(status.reachable ? "reachable" : "unreachable")
            : t("checking")}
      </p>
      {status && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {status.players !== undefined && (
            <div>
              <dt className="text-text-muted">{t("players")}</dt>
              <dd>
                {status.players} / {status.maxPlayers ?? "—"}
              </dd>
            </div>
          )}
          {status.version && (
            <div>
              <dt className="text-text-muted">{t("version")}</dt>
              <dd>{status.version}</dd>
            </div>
          )}
          <div>
            <dt className="text-text-muted">{t("checked")}</dt>
            <dd>{new Date(status.checkedAt).toLocaleTimeString(locale)}</dd>
          </div>
          {status.reachable && (
            <div>
              <dt className="text-text-muted">{t("latency")}</dt>
              <dd>{status.latencyMs} ms</dd>
            </div>
          )}
        </dl>
      )}
      {!failed && !!status?.protocolVersions?.length && (
        <div className="space-y-2 text-sm">
          <p className="text-text-muted">{t("publicProtocols")}</p>
          <p className="break-words">{status.protocolVersions.join(", ")}</p>
          <p className="text-text-muted">{t("protocolHint")}</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <code className="text-sm break-all">{address}</code>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard
              .writeText(address)
              .then(() => toast.success(t("copied")))
              .catch(() => toast.error(t("unavailable")));
          }}
        >
          {t("copy")}
        </Button>
      </div>
    </div>
  );
}
