"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { TooltipRenderProps } from "react-joyride";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface TourTooltipColors {
  primary: string;
  bg: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface TourTooltipLabels {
  back: string;
  next: string;
  nextPage: string;
  finish: string;
  skipPage: string;
  skipTour: string;
}

export interface TourTooltipLocaleOption {
  code: string;
  label: string;
}

interface TourTooltipProps extends TooltipRenderProps {
  onSkipPage: () => void;
  hasNextPage: boolean;
  labels: TourTooltipLabels;
  colors: TourTooltipColors;
  maxWidth: number;
  locales: TourTooltipLocaleOption[];
  currentLocale: string;
  onLocaleChange: (code: string) => void;
}

export function TourTooltip({
  backProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
  onSkipPage,
  hasNextPage,
  labels,
  colors,
  maxWidth,
  locales,
  currentLocale,
  onLocaleChange,
}: TourTooltipProps) {
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const localeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localeMenuOpen) return;
    function handler(e: MouseEvent) {
      if (localeMenuRef.current && !localeMenuRef.current.contains(e.target as Node)) {
        setLocaleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [localeMenuOpen]);

  const currentLocaleLabel =
    locales.find((l) => l.code === currentLocale)?.label ?? currentLocale;

  const linkButtonStyle: CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 11,
    fontWeight: 500,
    color: colors.textSecondary,
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  };

  return (
    <div
      {...tooltipProps}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        maxWidth,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, flex: 1, minWidth: 0 }}>
          {step.title}
        </div>
        <div ref={localeMenuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            data-testid="tour-locale-select"
            aria-label="Language"
            onClick={() => setLocaleMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 6px 4px 8px",
              cursor: "pointer",
            }}
          >
            {currentLocaleLabel}
            <ChevronDown
              size={12}
              style={{
                transform: localeMenuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
            />
          </button>

          <AnimatePresence>
            {localeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 4px)",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  overflow: "hidden",
                  minWidth: 110,
                  zIndex: 1,
                }}
              >
                {locales.map(({ code, label }) => {
                  const active = code === currentLocale;
                  return (
                    <button
                      key={code}
                      type="button"
                      data-testid={`tour-locale-option-${code}`}
                      onClick={() => {
                        setLocaleMenuOpen(false);
                        if (!active) onLocaleChange(code);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: active ? `${colors.primary}1a` : "transparent",
                        border: "none",
                        color: active ? colors.primary : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: active ? 600 : 500,
                        padding: "8px 12px",
                        cursor: active ? "default" : "pointer",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>
        {step.content}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {hasNextPage && (
            <button
              type="button"
              data-testid="tour-skip-page-button"
              onClick={onSkipPage}
              style={linkButtonStyle}
            >
              {labels.skipPage}
            </button>
          )}
          <button
            type="button"
            data-testid="tour-skip-tour-button"
            {...skipProps}
            style={{ ...linkButtonStyle, opacity: 0.65 }}
          >
            {labels.skipTour}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {index > 0 && (
            <button
              type="button"
              data-testid="tour-back-button"
              {...backProps}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 12,
                fontWeight: 500,
                color: colors.textSecondary,
                cursor: "pointer",
              }}
            >
              {labels.back}
            </button>
          )}
          <button
            type="button"
            data-testid="tour-next-button"
            {...primaryProps}
            style={{
              background: colors.primary,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            {isLastStep
              ? hasNextPage
                ? labels.nextPage
                : labels.finish
              : continuous
                ? `${labels.next} (${index + 1}/${size})`
                : labels.next}
          </button>
        </div>
      </div>
    </div>
  );
}
