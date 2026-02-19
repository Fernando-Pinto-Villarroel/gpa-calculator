"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/core/lib/utils/cn";

interface BottomNavProps {
  locale: string;
}

export function BottomNav({ locale }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: t("home"), icon: LayoutDashboard },
    { href: `/${locale}/config`, label: t("config"), icon: Settings },
    { href: `/${locale}/statistics`, label: t("statistics"), icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden flex items-center justify-around border-t border-border-base bg-bg-surface/90 backdrop-blur-md h-16 shrink-0 safe-b z-20">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== `/${locale}` && pathname.startsWith(href));

        return (
          <Link key={href} href={href} className="flex-1">
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center justify-center gap-1 h-full py-2"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
                  isActive ? "bg-jala-700/20" : ""
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-text-accent" : "text-text-muted"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200 truncate max-w-16 text-center",
                  isActive ? "text-text-accent" : "text-text-muted"
                )}
              >
                {label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
