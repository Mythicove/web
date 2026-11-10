"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api-schema/isles";

type Town = components["schemas"]["TownyTown"];
type Resident = components["schemas"]["TownyResident"];
type Snapshot = components["schemas"]["TownySnapshot"];

function TownDetails({ town }: { town: Town }) {
  const t = useTranslations("isles");
  return (
    <div className="space-y-2 text-sm break-words">
      <p className="font-semibold">{town.name}</p>
      {town.nation && (
        <p>
          {t("townyNation")}: {town.nation.name}
        </p>
      )}
      <p>
        {t("townyResidents")}: {town.residents} · {t("townyClaims")}: {town.claimedTownBlocks}
      </p>
      <p>
        {t("townyOpen")}: {t(town.open ? "townyYes" : "townyNo")} · {t("townyPublic")}:{" "}
        {t(town.public ? "townyYes" : "townyNo")}
      </p>
    </div>
  );
}

export function TownyMembership({ resident }: { resident: Resident }) {
  const t = useTranslations("isles");
  return (
    <section className="space-y-3 border-t pt-4">
      <h4 className="font-semibold">{t("townyMine")}</h4>
      {resident.town ? (
        <>
          <TownDetails town={resident.town} />
          <p className="text-sm">
            {t("townyRole")}:{" "}
            {[
              t("townyResident"),
              ...(resident.mayor ? [t("townyMayor")] : []),
              ...(resident.king ? [t("townyKing")] : []),
            ].join(" / ")}
          </p>
          {resident.townRanks.length > 0 && (
            <p className="text-sm break-words">
              {t("townyTownRanks")}: {resident.townRanks.join(", ")}
            </p>
          )}
          {resident.nationRanks.length > 0 && (
            <p className="text-sm break-words">
              {t("townyNationRanks")}: {resident.nationRanks.join(", ")}
            </p>
          )}
        </>
      ) : (
        <p className="text-text-muted text-sm">{t("townyTownless")}</p>
      )}
      <p className="text-text-muted text-xs">
        {t("checked")}: {new Date(resident.observedAt).toLocaleString()}
      </p>
    </section>
  );
}

export function TownyOverview({ snapshot }: { snapshot: Snapshot }) {
  const t = useTranslations("isles");
  return (
    <section className="space-y-4 border-t pt-4" aria-labelledby="towny-overview">
      <h4 id="towny-overview" className="font-semibold">
        {t("townyOverview")}
      </h4>
      <p className="text-text-muted text-sm">{t("townyScope")}</p>
      <p className="text-sm">
        {t("townyCounts", { towns: snapshot.townCount, nations: snapshot.nationCount })}
      </p>
      {(snapshot.townCount > snapshot.towns.length ||
        snapshot.nationCount > snapshot.nations.length) && (
        <p className="text-text-muted text-sm">
          {t("townyTruncated", { towns: snapshot.towns.length, nations: snapshot.nations.length })}
        </p>
      )}
      <h5 className="text-sm font-semibold">{t("townyTowns")}</h5>
      <ul className="grid gap-3 sm:grid-cols-2">
        {snapshot.towns.map((town) => (
          <li key={town.id} className="min-w-0 rounded-md border p-3">
            <TownDetails town={town} />
          </li>
        ))}
      </ul>
      <h5 className="text-sm font-semibold">{t("townyNations")}</h5>
      <ul className="grid gap-3 sm:grid-cols-2">
        {snapshot.nations.map((nation) => (
          <li
            key={nation.id}
            className="min-w-0 space-y-2 rounded-md border p-3 text-sm break-words"
          >
            <p className="font-semibold">{nation.name}</p>
            <p>
              {t("townyCounts", { towns: nation.towns, nations: 1 })} · {t("townyResidents")}:{" "}
              {nation.residents}
            </p>
            <p>
              {t("townyOpen")}: {t(nation.open ? "townyYes" : "townyNo")} · {t("townyPublic")}:{" "}
              {t(nation.public ? "townyYes" : "townyNo")}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-text-muted text-xs">
        {t("checked")}: {new Date(snapshot.observedAt).toLocaleString()}
      </p>
    </section>
  );
}
