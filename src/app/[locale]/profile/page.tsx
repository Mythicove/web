"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [playerName, setPlayerName] = useState("");
  const [model, setModel] = useState("default");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError(t("notLoggedIn"));
      return;
    }
    if (!file) {
      setError(t("noFile"));
      return;
    }
    setError(null);
    setStatus(null);
    try {
      await apiClient.uploadSkin(playerName, model, file, token);
      setStatus(t("uploadOk"));
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 justify-center px-6 py-16">
        <Card className="w-full max-w-md bg-surface">
          <CardHeader>
            <CardTitle className="font-display">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("playerName")}</Label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Steve"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("model")}</Label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
              >
                <option value="default">Steve (default)</option>
                <option value="slim">Alex (slim)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("file")}</Label>
              <Input
                type="file"
                accept="image/png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            {status && <p className="text-sm text-success">{status}</p>}
            <Button className="w-full" onClick={submit}>
              {t("upload")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
