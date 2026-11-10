"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api-schema/isles";

export function BedrockConnection({
  connection,
}: {
  connection: components["schemas"]["GameConnection"];
}) {
  const t = useTranslations("isles");
  return (
    <section className="space-y-2 border-t pt-4 text-sm">
      <h4 className="font-semibold">{t("bedrockConnection")}</h4>
      <p>
        {t("bedrockClientVersion")}: {connection.version}
      </p>
      <p>
        {t("connectionProvider")}: {connection.provider === "floodgate" ? "Floodgate" : "Geyser"}
      </p>
      <p>
        {t("providerJavaLink")}:{" "}
        {t(connection.linkedJavaAccount ? "providerLinked" : "providerNotLinked")}
      </p>
      <p className="text-text-muted text-xs">{t("crossplayIdentityHint")}</p>
    </section>
  );
}

export function CrossplayVersions({
  versions,
}: {
  versions: components["schemas"]["CrossplaySnapshot"];
}) {
  const t = useTranslations("isles");
  return (
    <section className="space-y-3 border-t pt-4 text-sm">
      <h4 className="font-semibold">{t("crossplayVersions")}</h4>
      <p>
        {t("geyserJavaVersion")}: {versions.javaVersion}
      </p>
      <p className="break-words">
        {t("geyserBedrockVersions")}: {versions.bedrockVersions.join(", ")}
      </p>
      <p className="text-text-muted text-xs">{t("crossplayVersionsHint")}</p>
    </section>
  );
}
