import { redirect } from "@/i18n/navigation";

// 旧地址保留为重定向：用户中心已迁至 /user（子页 skin/security/bindings）
export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/user/skin", locale });
}
