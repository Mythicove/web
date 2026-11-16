"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2Icon } from "lucide-react";
import { apiClient, type RegisterRequirements } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { useLoginMethods } from "@/lib/use-login-methods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Captcha } from "@/components/captcha";
import { LoadFailed } from "@/components/load-failed";
import { PasswordChecklist } from "@/components/password-checklist";
import { isValidEmail, isValidPlayerName } from "@/lib/validate";
import { Link, useRouter } from "@/i18n/navigation";

export function RegisterPageClient() {
  const t = useTranslations("auth");
  const ta = useTranslations("account");
  const common = useTranslations("common");
  const errText = useErrorText();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    nickname: "",
    playerName: "",
  });
  const [inviteCode, setInviteCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [req, setReq] = useState<RegisterRequirements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  // 管理员关掉主密码登录时，账号密码注册也一并关闭（后端同一条策略）：
  // 否则新号一出生就登不进来。首次第三方登录会自动建号，故引导去登录页。
  // 请求失败不等于"关闭"：失败显示加载失败+重试，不伪装成业务状态。
  const {
    methods,
    loaded: methodsLoaded,
    error: methodsError,
    retry: retryMethods,
  } = useLoginMethods();
  const passwordSignup = methods.some((m) => m.type === "password");

  useEffect(() => {
    apiClient
      .registerRequirements()
      .then(setReq)
      .catch(() => setReq(null));
  }, []);

  // 行内提示只在"碰过该字段"或"提交过一次"后出现，避免一进来就满屏红
  const show = (f: string) => touched[f] === true || submitAttempted;
  const touch = (f: string) => () => setTouched((s) => ({ ...s, [f]: true }));
  const emailInvalid = !isValidEmail(form.email);
  const playerInvalid = !isValidPlayerName(form.playerName);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitAttempted(true);
    // 明显非法的输入就地提示，不送到服务端才报错
    if (!isValidEmail(form.email) || !isValidPlayerName(form.playerName)) {
      return;
    }
    if (form.password !== form.confirm) {
      setError(ta("passwordMismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiClient.register({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        playerName: form.playerName,
        inviteCode: inviteCode || undefined,
        captchaToken: captchaToken || undefined,
      });
      // 注册成功不留在表单上显示一句话：去专门的待验证页讲清"查收邮件→激活→没收到怎么办"
      router.push(`/account/pending?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(errText(err));
      // 验证码 token 一次性：失败后必须换一道新题，否则重试必败还得整页刷新丢表单
      setCaptchaToken("");
      setCaptchaNonce((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="bg-surface shadow-card w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-display">{t("registerTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {req?.registrationDisabled ? (
              <p className="text-text-muted text-sm">{t("registerDisabled")}</p>
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
            ) : !passwordSignup ? (
              <p className="text-text-muted text-sm">
                {t("passwordSignupDisabled")}{" "}
                <Link href="/login" className="hover:text-text underline underline-offset-2">
                  {t("toLogin")}
                </Link>
              </p>
            ) : (
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
                    onBlur={touch("email")}
                    aria-invalid={show("email") && emailInvalid}
                    placeholder="you@example.com"
                  />
                  {show("email") && emailInvalid && (
                    <p className="text-danger text-xs">{t("invalidEmail")}</p>
                  )}
                  {req?.emailDomains.length ? (
                    <p className="text-text-muted text-xs">
                      {t("emailDomains", { domains: req.emailDomains.join(", ") })}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={req?.passwordPolicy.minLength ?? 8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  {req && <PasswordChecklist policy={req.passwordPolicy} value={form.password} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">{t("confirmPassword")}</Label>
                  <Input
                    id="confirm"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={req?.passwordPolicy.minLength ?? 8}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  />
                  {form.confirm !== "" && form.confirm !== form.password && (
                    <p className="text-danger text-xs">{ta("passwordMismatch")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nickname">{t("nickname")}</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    autoComplete="nickname"
                    required
                    maxLength={32}
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="playerName">{t("playerName")}</Label>
                  <Input
                    id="playerName"
                    name="playerName"
                    autoComplete="username"
                    required
                    maxLength={16}
                    value={form.playerName}
                    onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                    onBlur={touch("playerName")}
                    aria-invalid={show("playerName") && playerInvalid}
                    placeholder="Steve"
                  />
                  {show("playerName") && playerInvalid && (
                    <p className="text-danger text-xs">{t("invalidPlayerName")}</p>
                  )}
                </div>
                {req?.inviteOnly && (
                  <div className="space-y-1.5">
                    <Label htmlFor="inviteCode">{t("inviteCode")}</Label>
                    <Input
                      id="inviteCode"
                      name="inviteCode"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </div>
                )}
                {req?.captcha && req.captchaSiteKey && req.captchaScopes.includes("register") && (
                  <Captcha
                    key={captchaNonce}
                    driver={req.captcha}
                    siteKey={req.captchaSiteKey}
                    capUrl={req.captchaCapUrl}
                    onToken={setCaptchaToken}
                  />
                )}
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2Icon className="animate-spin" />}
                  {t("registerSubmit")}
                </Button>
              </form>
            )}
            <p className="text-text-muted text-center text-xs">
              <Link href="/login" className="hover:text-text hover:underline">
                {t("toLogin")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
