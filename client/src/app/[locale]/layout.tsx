import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/core/lib/i18n/routing";
import { Providers } from "@/shared/components/providers/Providers";
import { Navbar } from "@/shared/components/layout/Navbar";
import { AnimatedBackground } from "@/shared/components/ui/AnimatedBackground";
import { BottomNav } from "@/shared/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Jala U - GPA Calculator",
  description: "Academic GPA Calculator for Jala University",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <Providers locale={locale}>
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col h-full bg-bg-base/95 dark:bg-transparent">
        <Navbar locale={locale} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        <BottomNav locale={locale} />
      </div>
    </Providers>
  );
}
