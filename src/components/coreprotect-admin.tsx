"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { components } from "@/lib/api-schema/isles";

type Query = components["schemas"]["CoreProtectQuery"];
type Task = components["schemas"]["BridgeTask"];

export function CoreProtectAdmin({
  tasks,
  disabled,
  onQuery,
}: {
  tasks: Task[];
  disabled: boolean;
  onQuery: (query: Query) => void;
}) {
  const t = useTranslations("isles");
  const [world, setWorld] = useState("world");
  const [x, setX] = useState("0");
  const [y, setY] = useState("64");
  const [z, setZ] = useState("0");
  const [seconds, setSeconds] = useState("86400");
  const history = tasks.filter((task) => task.kind === "coreprotect");
  const latest = history.at(-1);
  return (
    <section className="space-y-4 border-t pt-5" aria-labelledby="coreprotect-title">
      <h4 id="coreprotect-title" className="font-semibold">
        CoreProtect
      </h4>
      <p className="text-text-muted text-sm">{t("coreprotectIntro")}</p>
      <form
        className="grid gap-3 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          onQuery({
            world,
            x: Number(x),
            y: Number(y),
            z: Number(z),
            seconds: Number(seconds),
            offset: 0,
          });
        }}
      >
        <label className="grid min-w-0 gap-2 text-sm">
          {t("coreprotectWorld")}
          <Input
            required
            maxLength={256}
            value={world}
            onChange={(e) => setWorld(e.target.value)}
          />
        </label>
        {(
          [
            ["X", x, setX],
            ["Y", y, setY],
            ["Z", z, setZ],
          ] as const
        ).map(([label, value, set]) => (
          <label key={label} className="grid min-w-0 gap-2 text-sm">
            {label}
            <Input
              required
              type="number"
              step="1"
              min={label === "Y" ? -2048 : -29999984}
              max={label === "Y" ? 2048 : 29999984}
              value={value}
              onChange={(e) => set(e.target.value)}
            />
          </label>
        ))}
        <label className="grid min-w-0 gap-2 text-sm">
          {t("coreprotectSeconds")}
          <Input
            required
            type="number"
            step="1"
            min={1}
            max={2592000}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={disabled || latest?.status === "pending"}>
          {t("coreprotectQuery")}
        </Button>
      </form>
      {latest && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm">
            {latest.coreprotect?.world} · {latest.coreprotect?.x}, {latest.coreprotect?.y},{" "}
            {latest.coreprotect?.z} · {latest.status}
          </p>
          {latest.error && <p className="text-danger text-sm">{latest.error}</p>}
          {latest.coreprotectResult && (
            <>
              {latest.coreprotectResult.records.length === 0 ? (
                <p>{t("coreprotectEmpty")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th>{t("coreprotectTime")}</th>
                        <th>{t("coreprotectActor")}</th>
                        <th>{t("memberAction")}</th>
                        <th>{t("coreprotectMaterial")}</th>
                        <th>{t("coreprotectRolledBack")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.coreprotectResult.records.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{new Date(row.timestampMs).toLocaleString()}</td>
                          <td>{row.player}</td>
                          <td>{row.action}</td>
                          <td>{row.material ?? "—"}</td>
                          <td>{row.rolledBack ? "✓" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {latest.coreprotectResult.hasMore &&
                latest.coreprotect &&
                latest.coreprotect.offset < 10000 && (
                  <Button
                    variant="outline"
                    disabled={disabled}
                    onClick={() =>
                      onQuery({ ...latest.coreprotect!, offset: latest.coreprotect!.offset + 100 })
                    }
                  >
                    {t("coreprotectNext")}
                  </Button>
                )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
