"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api-schema/isles";

export function PlanStatistics({
  statistics,
}: {
  statistics: components["schemas"]["PlanSnapshot"] | components["schemas"]["PlanActivity"];
}) {
  const t = useTranslations("isles");
  const aggregate = "recordedPlayers" in statistics;
  const duration = (ms: number) =>
    t("planDuration", {
      hours: Math.floor(ms / 3600000),
      minutes: Math.floor(ms / 60000) % 60,
      seconds: Math.floor(ms / 1000) % 60,
    });
  return (
    <section className="space-y-3 border-t pt-4">
      <h4 className="font-semibold">{t(aggregate ? "planServerTitle" : "planPlayerTitle")}</h4>
      <p className="text-text-muted text-sm">{t("planScope")}</p>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        {aggregate && (
          <div>
            <dt className="text-text-muted">{t("planRecordedPlayers")}</dt>
            <dd>{statistics.recordedPlayers}</dd>
          </div>
        )}
        <div>
          <dt className="text-text-muted">{t("planSessions")}</dt>
          <dd>{statistics.sessions}</dd>
        </div>
        <div>
          <dt className="text-text-muted">{t("planPlaytime")}</dt>
          <dd>{duration(statistics.playtimeMs)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">{t("planAFK")}</dt>
          <dd>{duration(statistics.afkMs)}</dd>
        </div>
        {"firstSeen" in statistics && (
          <>
            <div>
              <dt className="text-text-muted">{t("planFirstSeen")}</dt>
              <dd>{new Date(statistics.firstSeen).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-text-muted">{t("planLastSeen")}</dt>
              <dd>{new Date(statistics.lastSeen).toLocaleString()}</dd>
            </div>
          </>
        )}
      </dl>
      <p className="text-text-muted text-xs">
        {t("checked")}: {new Date(statistics.observedAt).toLocaleString()}
      </p>
    </section>
  );
}
