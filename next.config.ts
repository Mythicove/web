import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 安全头：与后端一致地在边缘兜底（反代直出的 404/5xx 亦带）。
// CSP 需放行：内联主题脚本（FOUC 防护）、Next 运行时内联脚本/样式、
// API 域的图与请求、验证码 SDK（turnstile/hcaptcha/recaptcha）。
function csp() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  // dev 工具链（webpack eval-source-map / react-dev-overlay）需要 unsafe-eval；生产不含
  const evalSrc = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  return [
    "default-src 'self'",
    `connect-src 'self' ${api}`,
    `img-src 'self' ${api} data:`,
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline'${evalSrc} https://challenges.cloudflare.com https://js.hcaptcha.com https://www.google.com https://www.gstatic.com`,
    "frame-src https://challenges.cloudflare.com https://www.hcaptcha.com https://www.google.com",
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
