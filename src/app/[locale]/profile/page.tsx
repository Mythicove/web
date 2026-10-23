"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { auth, isAuthenticated } = useAuth();
  const [playerName, setPlayerName] = useState(auth?.playerName ?? "");
  const [model, setModel] = useState("default");
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [capeFile, setCapeFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = auth?.accessToken;

  const uploadSkin = async () => {
    if (!token) return setError(t("notLoggedIn"));
    if (!skinFile) return setError(t("noFile"));
    setError(null);
    setStatus(null);
    try {
      await apiClient.uploadSkin(playerName, model, skinFile, token);
      setStatus(t("uploadOk"));
    } catch (e) {
      setError(String(e));
    }
  };

  const uploadCape = async () => {
    if (!token) return setError(t("notLoggedIn"));
    if (!capeFile) return setError(t("noFile"));
    setError(null);
    setStatus(null);
    try {
      await apiClient.uploadCape(playerName, capeFile, token);
      setStatus(t("uploadOk"));
    } catch (e) {
      setError(String(e));
    }
  };

  const previewUrl = playerName ? apiClient.skinUrl(playerName) : "/skins/steve.png";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <Card className="bg-surface">
            <CardHeader>
              <CardTitle className="font-display">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated && <p className="text-sm text-danger">{t("notLoggedIn")}</p>}
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
                  onChange={(e) => setSkinFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button className="w-full" onClick={uploadSkin}>
                {t("upload")}
              </Button>

              <div className="space-y-1.5">
                <Label>{t("cape")}</Label>
                <Input
                  type="file"
                  accept="image/png"
                  onChange={(e) => setCapeFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button variant="outline" className="w-full" onClick={uploadCape}>
                {t("uploadCape")}
              </Button>

              {error && <p className="text-sm text-danger">{error}</p>}
              {status && <p className="text-sm text-success">{status}</p>}
            </CardContent>
          </Card>

          <Card className="h-fit bg-surface">
            <CardHeader>
              <CardTitle className="font-display">{t("preview")}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SkinPreview skinUrl={previewUrl} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
