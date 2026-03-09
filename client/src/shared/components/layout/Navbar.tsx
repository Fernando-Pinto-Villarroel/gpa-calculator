"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, BarChart3, Target, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LocaleSwitcher } from "../ui/LocaleSwitcher";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { cn } from "@/core/lib/utils/cn";

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const tTour = useTranslations("tour");
  const pathname = usePathname();
  const router = useRouter();
  const { startTour } = useTourStore();

  const handleRestartTour = () => {
    startTour();
    router.push(`/${locale}`);
  };

  const navItems = [
    { href: `/${locale}`, label: t("home"), icon: LayoutDashboard },
    { href: `/${locale}/config`, label: t("config"), icon: Settings },
    { href: `/${locale}/statistics`, label: t("statistics"), icon: BarChart3 },
    { href: `/${locale}/forecast`, label: t("forecast"), icon: Target },
    { href: `/${locale}/about`, label: t("about"), icon: Info },
  ];

  return (
    <header className="relative flex items-center justify-between px-4 md:px-6 h-14 border-b border-jala-600/40 bg-jala-700 shrink-0 z-20">
      <Link href={`/${locale}`} data-tour="navbar-brand" className="flex items-center gap-2 min-w-0">
        <Image
          src="/logo.png"
          alt="Jala U - GPA"
          width={35}
          height={35}
          className="rounded-lg shrink-0"
          priority
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white leading-none truncate">
            {t("app_name")}
          </span>
          <span className="hidden sm:block text-[10px] text-white/60 leading-none mt-0.5 truncate">
            {t("app_subtitle")}
          </span>
        </div>
      </Link>

      {/* Desktop nav links — absolutely centered, hidden on mobile (BottomNav handles mobile nav) */}
      <nav data-tour="navbar-links" className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-white bg-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10",
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
        <div data-tour="navbar-language">
          <LocaleSwitcher currentLocale={locale} onColor />
        </div>
        <div data-tour="navbar-theme">
          <ThemeToggle onColor />
        </div>
        <motion.button
          onClick={handleRestartTour}
          whileTap={{ scale: 0.92 }}
          aria-label={tTour("restart_button_label")}
          title={tTour("restart_button_label")}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/50 transition-colors duration-200"
        >
          <Info size={16} />
        </motion.button>
      </div>
    </header>
  );
}
