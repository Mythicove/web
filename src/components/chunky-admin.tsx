"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { components } from "@/lib/api-schema/isles";

type Operation = components["schemas"]["ChunkyOperation"];
type World = components["schemas"]["ChunkyWorld"];

export function ChunkyAdmin({
  worlds,
  fresh,
  busy,
  pendingWorlds,
  onAction,
}: {
  worlds: World[];
  fresh: boolean;
  busy: boolean;
  pendingWorlds: string[];
  onAction: (operation: Operation) => void;
}) {
  const t = useTranslations("isles");
  const [selected, setSelected] = useState("");
  const [shape, setShape] = useState<"square" | "circle">("square");
  const [centerX, setCenterX] = useState("0");
  const [centerZ, setCenterZ] = useState("0");
  const [radius, setRadius] = useState("512");
  const [cancel, setCancel] = useState(false);
  const world = worlds.find((w) => w.world === selected) ?? worlds[0];
  const disabled = busy || !fresh || !world || pendingWorlds.includes(world.world);
  const canStart = world && ["idle", "completed", "cancelled", "stopped"].includes(world.state);
  const action = (action: Operation["action"]) => {
    if (world) onAction({ world: world.world, action });
  };
  const selectStyle = "bg-surface h-10 min-w-0 rounded-md border px-3";
  return (
    <section className="space-y-4 border-t pt-5" aria-labelledby="chunky-title">
      <h4 id="chunky-title" className="font-semibold">
        {t("chunkyTitle")}
      </h4>
      <p className="text-text-muted text-sm">{t("chunkyIntro")}</p>
      <label className="grid gap-2 text-sm">
        {t("chunkyWorld")}
        <select
          className={selectStyle}
          value={world?.world ?? ""}
          onChange={(e) => setSelected(e.target.value)}
        >
          {worlds.map((w) => (
            <option key={w.world} value={w.world}>
              {w.world}
            </option>
          ))}
        </select>
      </label>
      {world && (
        <>
          <p role="status" className="text-sm">
            {t("chunkyState")}: {t(`chunkyState_${world.state}`)}
          </p>
          {world.selection && (
            <p className="text-text-muted text-sm break-words">
              {world.selection.shape} · X {world.selection.centerX}, Z {world.selection.centerZ} ·{" "}
              {t("chunkyRadius")}: {world.selection.radiusX} / {world.selection.radiusZ}
            </p>
          )}
          {world.progress && (
            <div className="space-y-2 text-sm">
              <progress
                className="h-3 w-full"
                aria-label={t("chunkyProgress")}
                max={100}
                value={world.progress.percent}
              />
              <p>
                {world.progress.percent.toFixed(2)}% · {world.progress.chunks} /{" "}
                {world.progress.total} {t("chunkyChunks")}
              </p>
              {world.state === "running" && world.progress.rate !== undefined && (
                <p>
                  {t("chunkyRate")}: {world.progress.rate.toFixed(1)}
                </p>
              )}
              {world.state === "running" && world.progress.etaSeconds !== undefined && (
                <p>{t("chunkyETA", { seconds: world.progress.etaSeconds })}</p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={disabled || world.state !== "running"}
              onClick={() => action("pause")}
            >
              {t("chunkyPause")}
            </Button>
            <Button
              variant="outline"
              disabled={disabled || world.state !== "paused"}
              onClick={() => action("continue")}
            >
              {t("chunkyContinue")}
            </Button>
            <Button
              variant="outline"
              disabled={disabled || !["running", "paused"].includes(world.state)}
              onClick={() => setCancel(true)}
            >
              {t("chunkyCancel")}
            </Button>
          </div>
          {canStart && (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                onAction({
                  action: "start",
                  world: world.world,
                  shape,
                  centerX: Number(centerX),
                  centerZ: Number(centerZ),
                  radius: Number(radius),
                });
              }}
            >
              <label className="grid gap-2 text-sm">
                {t("chunkyShape")}
                <select
                  className={selectStyle}
                  value={shape}
                  onChange={(e) => setShape(e.target.value as "square" | "circle")}
                >
                  <option value="square">{t("chunkySquare")}</option>
                  <option value="circle">{t("chunkyCircle")}</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                {t("chunkyRadius")}
                <Input
                  type="number"
                  required
                  min={1}
                  max={100000}
                  step="any"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm">
                {t("chunkyCenterX")}
                <Input
                  type="number"
                  required
                  min={-29999983}
                  max={29999983}
                  step="any"
                  value={centerX}
                  onChange={(e) => setCenterX(e.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm">
                {t("chunkyCenterZ")}
                <Input
                  type="number"
                  required
                  min={-29999983}
                  max={29999983}
                  step="any"
                  value={centerZ}
                  onChange={(e) => setCenterZ(e.target.value)}
                />
              </label>
              <Button type="submit" disabled={disabled}>
                {t("chunkyStart")}
              </Button>
            </form>
          )}
        </>
      )}
      <ConfirmDialog
        open={cancel}
        onOpenChange={setCancel}
        description={t("chunkyCancelWarning")}
        onConfirm={() => {
          if (!disabled) action("cancel");
        }}
      />
    </section>
  );
}
