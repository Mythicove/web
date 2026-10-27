"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useHoardUser } from "@/lib/hoard-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { UsersPanel } from "./panels/users";
import { LoginMethodsPanel } from "./panels/login-methods";
import { AnnouncementPanel } from "./panels/announcement";
import { InvitesPanel } from "./panels/invites";
import { ModsPanel } from "./panels/mods";
import { ReportsPanel } from "./panels/reports";
import { ModerationPanel } from "./panels/moderation";
import { AuditPanel } from "./panels/audit";
import { BrandPanel } from "./panels/brand";
import { SitePanel } from "./panels/site";

const MIRROR_TOKEN_KEY = "mythicove:admin-token";
const HOARD_TOKEN_KEY = "mythicove:hoard-admin-token";

// 救援通道令牌只存 sessionStorage：关闭标签页即失效，避免 localStorage 的持久化 XSS 面。
const readSession = (key: string) =>
  typeof window === "undefined" ? "" : (sessionStorage.getItem(key) ?? "");

export function AdminPageClient() {
  const t = useTranslations("admin");
  const { isAuthenticated } = useAuth();
  const { user: hoardUser } = useHoardUser();
  const [manualToken, setManualToken] = useState(() => readSession(MIRROR_TOKEN_KEY));
  const [hoardToken, setHoardToken] = useState(() => readSession(HOARD_TOKEN_KEY));

  const saveManual = (v: string) => {
    setManualToken(v);
    sessionStorage.setItem(MIRROR_TOKEN_KEY, v);
  };
  const saveHoard = (v: string) => {
    setHoardToken(v);
    sessionStorage.setItem(HOARD_TOKEN_KEY, v);
  };

  // Mirror 管理面板凭据：null=无凭据（提示输入 token）；""=用 httpOnly 会话 cookie
  // （后端校验 role=admin）；非空=手贴 token 救援通道。空串是合法凭据，故不能用真值判断。
  const mirrorToken: string | null = isAuthenticated ? "" : manualToken.trim() || null;

  // Hoard 是独立的 SSO 会话（role 由 HOARD_ADMIN_SUBJECTS 映射），故单独判定；
  // 凭据语义与 mirror 一致，登录态管理员不再需要手贴 HOARD_ADMIN_TOKEN。
  const hoardSessionAdmin = hoardUser?.role === "admin";
  const hoardCreds: string | null = hoardSessionAdmin ? "" : hoardToken.trim() || null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="font-display flex items-center gap-2 text-2xl font-semibold">
            <ShieldCheckIcon className="text-highlight size-6" />
            {t("title")}
          </h1>

          {isAuthenticated ? (
            <p className="text-success mt-2 text-sm">{t("useSession")}</p>
          ) : (
            <div className="mt-4 flex max-w-xs flex-col gap-1.5">
              <Label htmlFor="admin-token">{t("token")}</Label>
              <Input
                id="admin-token"
                value={manualToken}
                onChange={(e) => saveManual(e.target.value)}
                type="password"
                autoComplete="off"
              />
            </div>
          )}

          <Tabs defaultValue="users" className="mt-6">
            <TabsList>
              <TabsTrigger value="users">{t("tab.users")}</TabsTrigger>
              <TabsTrigger value="loginMethods">{t("tab.loginMethods")}</TabsTrigger>
              <TabsTrigger value="announcement">{t("tab.announcement")}</TabsTrigger>
              <TabsTrigger value="invites">{t("tab.invites")}</TabsTrigger>
              <TabsTrigger value="mods">{t("tab.mods")}</TabsTrigger>
              <TabsTrigger value="reports">{t("tab.reports")}</TabsTrigger>
              <TabsTrigger value="moderation">{t("tab.moderation")}</TabsTrigger>
              <TabsTrigger value="audit">{t("tab.audit")}</TabsTrigger>
              <TabsTrigger value="brand">{t("tab.brand")}</TabsTrigger>
              <TabsTrigger value="site">{t("tab.site")}</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UsersPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="loginMethods">
              <LoginMethodsPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="announcement">
              <AnnouncementPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="invites">
              <InvitesPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="mods">
              <ModsPanel token={hoardCreds} onToken={saveHoard} sessionAdmin={hoardSessionAdmin} />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="moderation">
              <ModerationPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="audit">
              <AuditPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="brand">
              <BrandPanel token={mirrorToken} />
            </TabsContent>
            <TabsContent value="site">
              <SitePanel token={mirrorToken} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
