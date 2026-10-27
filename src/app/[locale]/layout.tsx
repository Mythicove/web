import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { INDEXABLE, routing } from "@/i18n/routing";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeInitScript } from "@/lib/theme-init";
import { AuthProvider } from "@/lib/auth";
import { SiteConfigProvider } from "@/lib/site-config";
import { readSiteConfig, readBrand } from "@/lib/site-config-server";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBanner } from "@/components/announcement-banner";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
// 默认 locale 为 zh-CN：拉丁字体不含 CJK 字形，必须显式挂中文字体，
// 否则中文全部回落系统字体、font-display 对中文完全无效。
const notoSansSC = Noto_Sans_SC({ variable: "--font-noto-sc" });

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
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
    title: { default: t("default"), template: t("template") },
    description: t("description"),
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

  return (
    // ThemeInitScript 会在水合前改写 <html> 的内联 style（FOUC 防护），
    // 与服务器 HTML 必然不同，按 next-themes 惯例抑制该层水合告警。
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript config={siteConfig} />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <SiteConfigProvider config={{ ...siteConfig, brand }}>
            <ThemeProvider>
              <AuthProvider>
                <AnnouncementBanner />
                {children}
                <Toaster position="bottom-right" />
              </AuthProvider>
            </ThemeProvider>
          </SiteConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
