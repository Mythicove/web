import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 安全头：与后端一致地在边缘兜底（反代直出的 404/5xx 亦带）。
// CSP 需放行：内联主题脚本（FOUC 防护）、Next 运行时内联脚本/样式、
// API 域的图与请求、验证码 SDK（turnstile/hcaptcha/recaptcha）、
// cap 自托管验证码（CAPTCHA_CAP_URL 实例 + WASM/Worker，见下）。
function csp() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  // cap 实例地址（driver=cap 的部署必配，需与 mirror MIRROR_CAPTCHA_CAP_URL 一致）：
  // 控件从实例取 challenge/资产（connect-src），PoW 在 blob worker 里编译 WASM
  // （worker-src blob: + 'wasm-unsafe-eval'），instrumentation 用 blob iframe。
  const cap = process.env.CAPTCHA_CAP_URL ?? "";
  const capSrc = cap ? ` ${cap.replace(/\/+$/, "")}` : "";
  // dev 工具链（webpack eval-source-map / react-dev-overlay）需要 unsafe-eval。
  // 生产默认不含；但 cap 的 instrumentation 探针在 sandboxed srcdoc iframe 里
  // 执行 new Function/eval 探测自动化环境（iframe 继承本页 CSP，无法单独放行），
  // 不放行则探针全部抛错 → 恒 "Instrumentation timeout"，真人也过不了验证码。
  // 仅配置了 cap 实例时追加（影响面=启用 cap 的部署）。
  const evalSrc = process.env.NODE_ENV !== "production" || cap ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `connect-src 'self' ${api}${capSrc}`,
    `img-src 'self' ${api} data:`,
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${evalSrc} https://challenges.cloudflare.com https://js.hcaptcha.com https://www.google.com https://www.gstatic.com`,
    "worker-src 'self' blob:",
    `frame-src 'self' https://challenges.cloudflare.com https://www.hcaptcha.com https://www.google.com${cap ? " blob:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const security = [
      { key: "Content-Security-Policy", value: csp() },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (process.env.NODE_ENV === "production") {
      security.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers: security }];
  },
};

export default withNextIntl(nextConfig);
