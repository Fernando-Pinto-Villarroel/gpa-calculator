"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  Gauge,
  Gift,
  FileUp,
  Info,
  Languages,
  NotebookPen,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { usePathname, useRouter } from "@/core/lib/i18n/navigation";
import { LOCALE_LABELS } from "@/core/lib/i18n/routing";
import { cn } from "@/core/lib/utils/cn";
import { WHATS_NEW_VERSION } from "@/core/config/app";
import { useIsClient } from "@/shared/hooks/useIsClient";

const HIGHLIGHTS: { key: string; icon: LucideIcon }[] = [
  { key: "esp", icon: Languages },
  { key: "playground", icon: NotebookPen },
  { key: "standing", icon: Gauge },
  { key: "offline", icon: WifiOff },
  { key: "import", icon: FileUp },
  { key: "tooltips", icon: Info },
  { key: "speed", icon: Zap },
];

export function WhatsNewDialog() {
  const t = useTranslations("whats_new");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useIsClient();
  const {
    guidedTourCompleted,
    isActive,
    whatsNewSeenVersion,
    whatsNewOpen,
    markWhatsNewSeen,
    startTour,
  } = useTourStore();

  const open =
    isClient &&
    !isActive &&
    (whatsNewOpen ||
      (guidedTourCompleted && whatsNewSeenVersion !== WHATS_NEW_VERSION));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") markWhatsNewSeen();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, markWhatsNewSeen]);

  const switchLocale = (code: string) => {
    if (code !== locale) router.replace(pathname, { locale: code });
  };

  const takeTour = () => {
    markWhatsNewSeen();
    startTour();
    router.push("/");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={markWhatsNewSeen}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-md rounded-2xl border border-border-base bg-bg-surface shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-jala-700/10 text-text-accent shrink-0">
                <Gift size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  id="whats-new-title"
                  className="text-base font-semibold text-text-primary"
                >
                  {t("title", { version: WHATS_NEW_VERSION })}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
              <div
                role="group"
                aria-label={tNav("language_section_label")}
                data-testid="whats-new-locale"
                className="flex shrink-0 self-start rounded-lg border border-border-base overflow-hidden"
              >
                {LOCALE_LABELS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={code === locale}
                    onClick={() => switchLocale(code)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-semibold uppercase transition-colors",
                      code === locale
                        ? "bg-jala-700/15 text-text-accent"
                        : "text-text-muted hover:bg-bg-elevated hover:text-text-primary",
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <ul className="flex flex-col gap-3 px-5 py-4 max-h-[60vh] overflow-y-auto">
              {HIGHLIGHTS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-3">
                  <Icon
                    size={16}
                    className="text-text-accent shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {t(`items.${key}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col-reverse sm:flex-row gap-2 px-5 py-4 border-t border-border-base bg-bg-elevated/40">
              <button
                type="button"
                onClick={markWhatsNewSeen}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border border-border-base text-text-secondary hover:bg-bg-elevated transition-colors"
              >
                {t("later")}
              </button>
              <button
                type="button"
                onClick={takeTour}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-jala-700 text-white hover:bg-jala-600 transition-colors"
              >
                {t("take_tour")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
