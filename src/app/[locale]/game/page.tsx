import { setRequestLocale } from "next-intl/server";
import { GameProfileClient } from "./client";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <GameProfileClient />;
}
