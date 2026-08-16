"use client";

import type { CSSProperties } from "react";
import type { TooltipRenderProps } from "react-joyride";

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

interface TourTooltipProps extends TooltipRenderProps {
  onSkipPage: () => void;
  hasNextPage: boolean;
  labels: TourTooltipLabels;
  colors: TourTooltipColors;
  maxWidth: number;
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
}: TourTooltipProps) {
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
      {step.title && (
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
          {step.title}
        </div>
      )}
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
