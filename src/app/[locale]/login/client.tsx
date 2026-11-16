"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { apiClient, type RegisterRequirements } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ApiError, useErrorText } from "@/lib/errors";
import { useLoginMethods } from "@/lib/use-login-methods";
import { useSiteConfig } from "@/lib/site-config";
import { isValidEmail } from "@/lib/validate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Captcha } from "@/components/captcha";
import { LoadFailed } from "@/components/load-failed";
import { Link, useRouter } from "@/i18n/navigation";

function LoginInner() {
  const t = useTranslations("auth");
  const ta = useTranslations("account");
  const common = useTranslations("common");
  const errText = useErrorText();
  const params = useSearchParams();
  const router = useRouter();
  const { login, completeOAuthLogin, isAuthenticated } = useAuth();
  const { config } = useSiteConfig();
  // 登录落地页后台可配：user=用户中心（默认）、home=首页
  const landing = config.site?.loginLanding === "home" ? "/" : "/user";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    methods,
    loaded: methodsLoaded,
    error: methodsError,
    retry: retryMethods,
  } = useLoginMethods();
  const [req, setReq] = useState<RegisterRequirements | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const emailInvalid = !isValidEmail(form.email);
  const showEmailHint = (emailTouched || submitAttempted) && emailInvalid;

  const resendVerification = async () => {
    if (resendBusy || !form.email) return;
    setResendBusy(true);
    setResendSent(false);
    try {
      await apiClient.resendVerification(form.email);
      setResendSent(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setResendBusy(false);
    }
  };

  useEffect(() => {
    // 兑换失败/IdP 回传错误不再静默：与 submit 同一渲染通道（errors.* 本地化）
    completeOAuthLogin().catch((err) => setError(errText(err)));
    apiClient
      .registerRequirements()
      .then(setReq)
      .catch(() => setReq(null));
  }, [completeOAuthLogin, errText]);

  // 登录态成立立即跳落地页（含"已登录又打开登录页"）：不渲染"登录成功"过渡页
  useEffect(() => {
    if (isAuthenticated) router.replace(landing);
  }, [isAuthenticated, landing, router]);

  // login scope 启用且验证码实际生效时才渲染控件（与后端强制点一致）
  const loginCaptcha =
    !!req?.captcha && !!req.captchaSiteKey && req.captchaScopes.includes("login");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitAttempted(true);
    if (emailInvalid) return;
    setBusy(true);
    setError(null);
    setNotVerified(false);
    setResendSent(false);
    try {
      await login(form.email, form.password, captchaToken || undefined);
      // next 仅接受站内相对路径，防开放重定向；无 next 去后台配置的落地页
      const next = params.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : landing);
    } catch (err) {
      // 稳定码前端本地化；其余展示服务端已本地化的具体文案；最后回退状态码文案
      setError(errText(err));
      setNotVerified(err instanceof ApiError && err.code === "email_not_verified");
      // 验证码 token 一次性：失败后换一道新题，避免重试必败还要整页刷新
      setCaptchaToken("");
      setCaptchaNonce((n) => n + 1);
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
              // 登录态成立即被 effect 跳走：只给跳转中的 spinner，不做"成功"过渡页
              <p className="text-text-muted flex items-center justify-center gap-2 text-sm">
                <Loader2Icon className="animate-spin" />
                {common("loading")}
              </p>
            ) : !methodsLoaded ? (
              <p className="text-text-muted flex items-center justify-center gap-2 text-sm">
                <Loader2Icon className="animate-spin" />
                {common("loading")}
              </p>
            ) : methodsError ? (
              <LoadFailed
                message={methodsError}
                onRetry={retryMethods}
                retryLabel={common("retry")}
              />
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
                        onBlur={() => setEmailTouched(true)}
                        aria-invalid={showEmailHint}
                        placeholder="you@example.com"
                      />
                      {showEmailHint && <p className="text-danger text-xs">{t("invalidEmail")}</p>}
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
                        key={captchaNonce}
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
                ) : oauthMethods.length > 0 ? (
                  // 仅在确实存在第三方登录按钮时才提示"用以下方式"，避免空承诺死路
                  <p className="text-text-muted text-sm">{t("passwordDisabled")}</p>
                ) : (
                  <p className="text-text-muted text-sm">{t("noMethods")}</p>
                )}
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                {notVerified && (
                  <div className="border-border space-y-2 rounded-md border p-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={resendBusy || !form.email}
                      onClick={() => void resendVerification()}
                    >
                      {resendBusy && <Loader2Icon className="animate-spin" />}
                      {t("resendVerify")}
                    </Button>
                    {resendSent && <p className="text-success text-xs">{t("resendVerifySent")}</p>}
                  </div>
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
