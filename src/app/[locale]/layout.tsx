import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { INDEXABLE, routing } from "@/i18n/routing";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeInitScript } from "@/lib/theme-init";
import { AuthProvider } from "@/lib/auth";
import { SiteConfigProvider } from "@/lib/site-config";
import { readSiteConfig, readBrand, readSite } from "@/lib/site-config-server";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBanner } from "@/components/announcement-banner";
import "../globals.css";

// 字体自托管（next/font/local + fontsource 可变字体），构建期零外网依赖：
// 大陆构建环境 fonts.googleapis.com 不可达，next/font/google 会直接失败。
// CJK 不走网络字体：globals.css 的字体栈已含 PingFang/雅黑/Noto 系统回退。
const inter = localFont({
  src: "../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
});
const spaceGrotesk = localFont({
  src: "../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
});

// locale 维度预渲染；数据页自身仍按请求动态取数
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const site = await readSite();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
    title: {
      default: site.name || t("default"),
      template: site.name ? `%s | ${site.name}` : t("template"),
    },
    description: site.description || t("description"),
    // 小群体自用部署默认拒绝索引；SEO 部署设 NEXT_PUBLIC_INDEXABLE=true
    ...(INDEXABLE
      ? {}
      : {
          robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: { index: false, noimageindex: true, nosnippet: true },
          },
        }),
    openGraph: {
      type: "website",
      siteName: "Mythicove",
      title: t("default"),
      description: t("description"),
      images: [{ url: "/brand/logo-light.png", width: 1024, height: 1024, alt: "Mythicove" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // opt-in 静态渲染：next-intl 的 requestLocale 读 headers 会使路由动态化，
  // 显式声明本次渲染的 locale 后壳页可预渲染。
  setRequestLocale(locale);
  const siteConfig = await readSiteConfig();
  // 品牌图标（管理后台上传）随 SiteConfig 一并下发：Logo 首帧 HTML 即拿到正确 src，不闪。
  const brand = await readBrand();
  const site = await readSite();

  return (
    // ThemeInitScript 会在水合前改写 <html> 的内联 style（FOUC 防护），
    // 与服务器 HTML 必然不同，按 next-themes 惯例抑制该层水合告警。
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript config={siteConfig} />
        {/* 自定义 CSS/JS 为同源文件（mirror /site/custom.*），script-src/style-src 'self' 下可用 */}
        {site.customCssUrl && <link rel="stylesheet" href={site.customCssUrl} />}
        {site.customJsUrl && <script src={site.customJsUrl} defer />}
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <SiteConfigProvider config={{ ...siteConfig, brand, site }}>
            <ThemeProvider>
              <AuthProvider>
                <AnnouncementBanner />
                {children}
                {(site.copyright || site.icp) && (
                  <footer className="text-text-muted flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-4 text-xs">
                    {site.copyright && <span>{site.copyright}</span>}
                    {site.icp && <span>{site.icp}</span>}
                  </footer>
                )}
                <Toaster position="bottom-right" />
              </AuthProvider>
            </ThemeProvider>
          </SiteConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
