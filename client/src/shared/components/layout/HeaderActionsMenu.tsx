"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Menu, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/core/lib/i18n/navigation";
import { LOCALE_LABELS } from "@/core/lib/i18n/routing";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { useTourSteps } from "@/features/tour/hooks/useTourSteps";
import { cn } from "@/core/lib/utils/cn";

const LOCALES = LOCALE_LABELS;

const TOUR_TARGETED_ITEMS = [
  '[data-tour="header-language"]',
  '[data-tour="header-theme"]',
];

export function HeaderActionsMenu() {
  const t = useTranslations("nav");
  const tTour = useTranslations("tour");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { startTour } = useTourStore();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isActive: tourActive, globalStepIndex } = useTourStore();
  const tourSteps = useTourSteps();
  const currentTourTarget = tourActive ? tourSteps[globalStepIndex]?.target : undefined;
  const tourWantsMenuOpen =
    typeof currentTourTarget === "string" && TOUR_TARGETED_ITEMS.includes(currentTourTarget);

  useEffect(() => {
    if (!tourActive) return;
    // Syncs local open state to the guided tour's current step, an external
    // store — same pattern used safely in ActionsMenu/PlaygroundActionsMenu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(tourWantsMenuOpen);
  }, [tourActive, tourWantsMenuOpen]);

  useEffect(() => {
    if (tourActive) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tourActive]);

  const switchLocale = (code: string) => {
    setOpen(false);
    router.replace(pathname, { locale: code });
  };

  const handleRestartTour = () => {
    setOpen(false);
    startTour();
    router.push("/");
  };

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors";

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("actions_menu")}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/50 transition-colors duration-200"
      >
        <Menu size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute right-0 top-11 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-56",
            )}
          >
            <div data-tour="header-language">
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {t("language_section_label")}
              </p>
              {LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => switchLocale(loc.code)}
                  className={cn(
                    menuItemClass,
                    loc.code === locale
                      ? "text-text-accent bg-jala-700/10"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-border-base my-1" />

            <div data-tour="header-theme">
              <button
                onClick={() => {
                  setOpen(false);
                  toggleTheme();
                }}
                className={cn(
                  menuItemClass,
                  "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                )}
              >
                {theme === "dark" ? (
                  <Sun size={15} className="shrink-0" />
                ) : (
                  <Moon size={15} className="shrink-0" />
                )}
                {theme === "dark" ? t("theme_light") : t("theme_dark")}
              </button>
            </div>

            <div className="h-px bg-border-base my-1" />

            <button
              onClick={handleRestartTour}
              className={cn(
                menuItemClass,
                "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Info size={15} className="shrink-0" />
              {tTour("restart_button_label")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
