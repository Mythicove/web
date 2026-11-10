"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api-schema/isles";

export function VoicechatDetails({ voice }: { voice: components["schemas"]["GameVoicechat"] }) {
  const t = useTranslations("isles");
  return (
    <section className="space-y-2 border-t pt-4 text-sm">
      <h4 className="font-semibold">Simple Voice Chat</h4>
      <p>{t(voice.installed ? "voiceCompatible" : "voiceNoClient")}</p>
      <p>{t(voice.connected ? "voiceConnected" : "voiceDisconnected")}</p>
      {voice.installed && <p>{t(voice.disabled ? "voiceDisabled" : "voiceEnabled")}</p>}
      <p className="text-text-muted text-xs">{t("voiceObservationHint")}</p>
    </section>
  );
}
