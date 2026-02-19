"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LocaleSwitcher } from "../ui/LocaleSwitcher";
import { cn } from "@/core/lib/utils/cn";

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: t("home"), icon: LayoutDashboard },
    { href: `/${locale}/config`, label: t("config"), icon: Settings },
    { href: `/${locale}/statistics`, label: t("statistics"), icon: BarChart3 },
  ];

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border-base bg-bg-surface/80 backdrop-blur-md shrink-0 z-20">
      <Link href={`/${locale}`} className="flex items-center gap-2.5 min-w-0">
        <Image
          src="/logo192.png"
          alt="Jala GPA"
          width={32}
          height={32}
          className="rounded-lg shrink-0"
          priority
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary leading-none truncate">{t("app_name")}</span>
          <span className="hidden sm:block text-[10px] text-text-muted leading-none mt-0.5 truncate">{t("app_subtitle")}</span>
        </div>
      </Link>

      {/* Desktop nav links — hidden on mobile (BottomNav handles mobile nav) */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "relative flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-white bg-jala-700"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                <Icon size={14} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <LocaleSwitcher currentLocale={locale} />
        <ThemeToggle />
      </div>
    </header>
  );
}
