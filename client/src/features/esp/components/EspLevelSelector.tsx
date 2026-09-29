"use client";

import { useTranslations } from "next-intl";
import { ListChecks, Sparkles } from "lucide-react";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { toast } from "sonner";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import {
  EspPlacementLevel,
  getGradedOffLevelCourses,
} from "@/features/esp/lib/placement";
import { cn } from "@/core/lib/utils/cn";

const LEVELS: EspPlacementLevel[] = ["1", "2"];

interface EspLevelSelectorProps {
  resolvedLevel: EspPlacementLevel;
  isInferred: boolean;
}

export function EspLevelSelector({ resolvedLevel, isInferred }: EspLevelSelectorProps) {
  const t = useTranslations("config");
  const setPlacementLevel = useEspGpaStore((s) => s.setPlacementLevel);
  const grades = useEspGpaStore((s) => s.grades);
  const selectedCohortId = useEspGpaStore((s) => s.selectedCohortId);

  const selectLevel = (level: EspPlacementLevel) => {
    setPlacementLevel(level);
    if (level === resolvedLevel) return;
    const conflicting = getGradedOffLevelCourses(
      grades,
      getEspTermsByCohortId(selectedCohortId),
      level,
    );
    if (conflicting.length > 0) {
      toast.warning(t("placement_level_conflict_title"), {
        description: t("placement_level_conflict_text", {
          count: conflicting.length,
          level: level === "1" ? "2" : "1",
        }),
      });
    }
  };

  return (
    <div
      data-tour="esp-level-selector"
      role="group"
      aria-label={t("placement_level_group_label")}
      title={t(isInferred ? "placement_level_hint_inferred" : "placement_level_hint")}
      className={cn(
        "flex items-center gap-1 p-0.5 rounded-lg border bg-bg-surface shrink-0",
        isInferred ? "border-jala-500/40" : "border-border-base",
      )}
    >
      {isInferred ? (
        <Sparkles size={14} className="text-text-accent ml-1.5 shrink-0" />
      ) : (
        <ListChecks size={14} className="text-text-muted ml-1.5 shrink-0" />
      )}
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          aria-pressed={resolvedLevel === level}
          onClick={() => selectLevel(level)}
          className={cn(
            "px-2 sm:px-2.5 h-8 rounded-md text-xs font-semibold whitespace-nowrap transition-colors",
            resolvedLevel === level
              ? isInferred
                ? "bg-jala-700/50 text-white"
                : "bg-jala-700 text-white"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {t("placement_level_option", { level })}
        </button>
      ))}
    </div>
  );
}
