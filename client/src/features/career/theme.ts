import type { CareerId } from "@/core/domain/types/career";

export interface CareerPalette {
  accent400: string;
  accent500: string;
  accent600: string;
  accent700: string;
}

/**
 * JS-side mirror of the CSS custom properties in globals.css
 * ([data-career="..."] blocks). Most of the app re-themes automatically
 * through those CSS variables via Tailwind's jala-400/500/600/700,
 * text-accent, and border-accent classes. This table exists only for the
 * handful of places that need a raw hex value in JS instead of a class
 * (recharts props, react-joyride styling).
 *
 * To add a new career's palette: add an entry here AND a matching
 * [data-career="<careerId>"] block in globals.css with the same hex
 * values.
 */
export const CAREER_PALETTES: Record<CareerId, CareerPalette> = {
  software_engineering_design_architecture: {
    accent400: "#60a5fa",
    accent500: "#3b82f6",
    accent600: "#2563eb",
    accent700: "#0d49a9",
  },
  esp: {
    accent400: "#fb923c",
    accent500: "#f97316",
    accent600: "#ea580c",
    accent700: "#c2410c",
  },
};

export function getCareerPalette(careerId: CareerId): CareerPalette {
  return (
    CAREER_PALETTES[careerId] ??
    CAREER_PALETTES.software_engineering_design_architecture
  );
}

/** Converts a "#rrggbb" hex color to an "rgba(r, g, b, alpha)" string. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
