"use client";

import { useState } from "react";
import { CircleHelp, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const FEEDBACK_URL =
  "https://github.com/Fernando-Pinto-Villarroel/gpa-calculator/issues";

export function FeedbackButton() {
  const t = useTranslations("about.feedback");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-jala-700 text-white shadow-lg hover:bg-jala-600 transition-colors duration-200 md:bottom-8 md:right-8"
        aria-label={t("button_label")}
      >
        <CircleHelp size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto px-4"
            >
              <div className="relative rounded-2xl border border-border-base bg-bg-surface shadow-2xl p-6">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <X size={16} />
                </button>

                <h2 className="text-base font-semibold text-text-primary pr-10 mb-2">
                  {t("modal_title")}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  {t("modal_description")}
                </p>

                <a
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-jala-700 text-white text-sm font-semibold hover:bg-jala-600 transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  <ExternalLink size={14} />
                  {t("modal_cta")}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
