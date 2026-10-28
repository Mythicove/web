"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { apiClient, type LoginMethod, type RegisterRequirements } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ApiError, useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Captcha } from "@/components/captcha";
import { Link, useRouter } from "@/i18n/navigation";

function LoginInner() {
  const t = useTranslations("auth");
  const ta = useTranslations("account");
  const common = useTranslations("common");
  const errText = useErrorText();
  const params = useSearchParams();
  const router = useRouter();
  const { login, completeOAuthLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [methods, setMethods] = useState<LoginMethod[]>([]);
  const [methodsLoaded, setMethodsLoaded] = useState(false);
  const [req, setReq] = useState<RegisterRequirements | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);

  useEffect(() => {
    // 兑换失败/IdP 回传错误不再静默：与 submit 同一渲染通道（errors.* 本地化）
    completeOAuthLogin().catch((err) => setError(errText(err)));
    apiClient
      .listLoginMethods()
      .then((r) => setMethods(r.methods.filter((m) => m.enabled)))
      .catch(() => setMethods([]))
      .finally(() => setMethodsLoaded(true));
    apiClient
      .registerRequirements()
      .then(setReq)
      .catch(() => setReq(null));
  }, [completeOAuthLogin, errText]);

  // login scope 启用且验证码实际生效时才渲染控件（与后端强制点一致）
  const loginCaptcha =
    !!req?.captcha && !!req.captchaSiteKey && req.captchaScopes.includes("login");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(form.email, form.password, captchaToken || undefined);
      // next 仅接受站内相对路径，防开放重定向
      const next = params.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      // 稳定错误码（如 password_login_disabled）走前端本地化；
      // 其余用后端已本地化的文案（如"验证码校验失败"），最后回退状态码文案
      if (err instanceof ApiError && err.code) setError(errText(err));
      else setError(err instanceof ApiError && err.message ? err.message : errText(err));
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async () => {
    if (forgotBusy) return;
    setForgotBusy(true);
    setError(null);
    setForgotSent(false);
    try {
      await apiClient.forgotPassword(form.email);
      setForgotSent(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setForgotBusy(false);
    }
  };

  const oauth = (provider: string) => {
    const redirect = window.location.origin + "/login";
    window.location.assign(apiClient.oauthUrl(provider, redirect));
  };

  const oauthMethods = methods.filter((m) => m.type === "oauth");
  // 管理员关掉「密码登录」后不再渲染密码表单：后端同样会拒绝，这里只是不给用户一条死路。
  const passwordEnabled = methods.some((m) => m.type === "password");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="bg-surface shadow-card w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-display">{t("loginTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <p className="text-success text-sm">{t("loginOk")}</p>
            ) : !methodsLoaded ? (
              <p className="text-text-muted flex items-center justify-center gap-2 text-sm">
                <Loader2Icon className="animate-spin" />
                {common("loading")}
              </p>
            ) : (
              <>
                {passwordEnabled ? (
                  <form onSubmit={(e) => void submit(e)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">{t("email")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">{t("password")}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="text-text-muted text-xs underline-offset-2 hover:underline"
                        onClick={() => {
                          setForgot(!forgot);
                          setForgotSent(false);
                          setError(null);
                        }}
                      >
                        {ta("forgot")}
                      </button>
                    </div>
                    {forgot && (
                      <div className="border-border space-y-2 rounded-md border p-3">
                        <p className="text-text-muted text-xs">{ta("forgotHint")}</p>
                        {forgotSent ? (
                          <p className="text-success text-sm">{ta("forgotSent")}</p>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={forgotBusy || !form.email}
                            onClick={() => void submitForgot()}
                          >
                            {forgotBusy && <Loader2Icon className="animate-spin" />}
                            {ta("forgotSend")}
                          </Button>
                        )}
                      </div>
                    )}
                    {loginCaptcha && req && (
                      <Captcha
                        driver={req.captcha}
                        siteKey={req.captchaSiteKey}
                        capUrl={req.captchaCapUrl}
                        onToken={setCaptchaToken}
                      />
                    )}
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2Icon className="animate-spin" />}
                      {t("loginSubmit")}
                    </Button>
                  </form>
                ) : (
                  <p className="text-text-muted text-sm">{t("passwordDisabled")}</p>
                )}
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}

                {oauthMethods.length > 0 && (
                  <>
                    {passwordEnabled && (
                      <div className="flex items-center gap-3">
                        <div className="bg-border h-px flex-1" />
                        <span className="text-text-muted text-xs">{t("or")}</span>
                        <div className="bg-border h-px flex-1" />
                      </div>
                    )}
                    <div className="space-y-2">
                      {oauthMethods.map((m) => (
                        <Button
                          key={m.id}
                          type="button"
                          variant={passwordEnabled ? "outline" : "default"}
                          className="w-full"
                          onClick={() => oauth(m.id)}
                        >
                          {t("oauthWith", { provider: m.label })}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            <p className="text-text-muted text-center text-xs">
              <Link href="/register" className="hover:text-text hover:underline">
                {t("toRegister")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
