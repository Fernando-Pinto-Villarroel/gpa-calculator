"use client";

import { useRouter, usePathname } from "@/core/lib/i18n/navigation";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/core/lib/utils/cn";

const locales = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "pt", label: "PT" },
];

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (locale: string) => {
    setOpen(false);
    router.replace(pathname, { locale });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-sm font-medium",
          "border border-border-base bg-bg-surface",
          "text-text-secondary hover:text-text-primary hover:border-border-accent",
          "transition-colors duration-200"
        )}
      >
        <Globe size={14} />
        <span>{currentLocale.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-11 w-24 rounded-lg overflow-hidden z-50",
              "border border-border-base bg-bg-surface shadow-lg"
            )}
          >
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={cn(
                  "w-full px-3 py-2 text-sm text-left transition-colors",
                  loc.code === currentLocale
                    ? "text-text-accent bg-jala-700/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                {loc.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
