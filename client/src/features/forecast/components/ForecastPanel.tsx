"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SlidersHorizontal,
  Zap,
  Minus,
  Plus,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { getTermsByCohortId } from "@/features/gpa/data/software-engineering-design-architecture/index";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { ALL_GRADES, LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import { forecast, ForecastScope } from "../services/forecast";
import { cn } from "@/core/lib/utils/cn";

const CAREER_HONOR_PRESETS = [
  { label: "Cum Laude", gpa: 3.2 },
  { label: "Magna Cum Laude", gpa: 3.5 },
  { label: "Summa Cum Laude", gpa: 3.8 },
] as const;

const TERM_HONOR_PRESETS = [
  { label: "Dean's List", gpa: 3.5 },
  { label: "President's List", gpa: 4.0 },
] as const;

const DEFAULT_ALLOWED_GRADES: LetterGrade[] = ["A", "A-", "B+", "B"];

const FORECAST_CONFIG_KEY = "forecast-config";

interface ForecastConfig {
  scope: ForecastScope;
  termId: string;
  targetGpa: string;
  allowedGrades: LetterGrade[];
  maxCombinations: number;
}

function loadForecastConfig(defaultTermId: string): ForecastConfig {
  try {
    const raw = localStorage.getItem(FORECAST_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ForecastConfig>;
      return {
        scope: parsed.scope === "term" || parsed.scope === "cumulative" ? parsed.scope : "cumulative",
        termId: typeof parsed.termId === "string" ? parsed.termId : defaultTermId,
        targetGpa: typeof parsed.targetGpa === "string" ? parsed.targetGpa : "3.5",
        allowedGrades: Array.isArray(parsed.allowedGrades) ? parsed.allowedGrades : DEFAULT_ALLOWED_GRADES,
        maxCombinations: typeof parsed.maxCombinations === "number" ? parsed.maxCombinations : 3,
      };
    }
  } catch {}
  return {
    scope: "cumulative",
    termId: defaultTermId,
    targetGpa: "3.5",
    allowedGrades: DEFAULT_ALLOWED_GRADES,
    maxCombinations: 3,
  };
}

function saveForecastConfig(config: ForecastConfig) {
  try {
    localStorage.setItem(FORECAST_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

export function ForecastPanel() {
  const t = useTranslations("forecast");
  const tConfig = useTranslations("config");
  const { selectedCareerId } = useCareerStore();
  const isEsp = selectedCareerId === "esp";
  const commercialGrades = useGpaStore((s) => s.grades);
  const commercialCohortId = useGpaStore((s) => s.selectedCohortId);
  const commercialSelectedTermId = useGpaStore((s) => s.selectedTermId);
  const espGrades = useEspGpaStore((s) => s.grades);
  const espCohortId = useEspGpaStore((s) => s.selectedCohortId);

  const grades = isEsp ? espGrades : commercialGrades;
  const terms = isEsp
    ? getEspTermsByCohortId(espCohortId)
    : getTermsByCohortId(commercialCohortId);
  const selectedTermId = isEsp
    ? (terms[0]?.id ?? "level-1")
    : commercialSelectedTermId;

  const savedConfig = useMemo(() => loadForecastConfig(selectedTermId), []);

  const [scope, setScope] = useState<ForecastScope>(savedConfig.scope);
  const [termId, setTermId] = useState(savedConfig.termId);
  const [targetGpa, setTargetGpa] = useState(savedConfig.targetGpa);
  const [allowedGrades, setAllowedGrades] = useState<LetterGrade[]>(savedConfig.allowedGrades);
  const [maxCombinations, setMaxCombinations] = useState(savedConfig.maxCombinations);
  const [showConfig, setShowConfig] = useState(false);
  const changeCounterRef = useRef(0);
  const [displayedChange, setDisplayedChange] = useState(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsedTarget = parseFloat(targetGpa);
  const validTarget = !isNaN(parsedTarget) && parsedTarget > 0 && parsedTarget <= 4.0;

  const honorPresets = scope === "term" ? TERM_HONOR_PRESETS : CAREER_HONOR_PRESETS;

  const inputsKey = `${scope}-${termId}-${targetGpa}-${allowedGrades.join(",")}-${maxCombinations}`;
  const prevInputsRef = useRef(inputsKey);
  if (prevInputsRef.current !== inputsKey) {
    prevInputsRef.current = inputsKey;
    changeCounterRef.current += 1;
  }

  const isRefreshing = changeCounterRef.current !== displayedChange;

  const result = useMemo(() => {
    if (!validTarget) return null;
    return forecast(
      grades,
      terms,
      scope,
      scope === "term" ? termId : undefined,
      parsedTarget,
      allowedGrades.length > 0 ? allowedGrades : ["A"],
      maxCombinations,
    );
  }, [grades, terms, scope, termId, parsedTarget, validTarget, allowedGrades, maxCombinations]);

  useEffect(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const target = changeCounterRef.current;
    refreshTimerRef.current = setTimeout(() => setDisplayedChange(target), 350);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [inputsKey]);

  useEffect(() => {
    saveForecastConfig({ scope, termId, targetGpa, allowedGrades, maxCombinations });
  }, [scope, termId, targetGpa, allowedGrades, maxCombinations]);

  const toggleGrade = (grade: LetterGrade) => {
    setAllowedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  };

  const setPreset = (gpa: number) => {
    setTargetGpa(gpa.toFixed(1));
  };

  const incrementMax = () => setMaxCombinations((v) => Math.min(v + 1, 20));
  const decrementMax = () => setMaxCombinations((v) => Math.max(v - 1, 1));

  const selectedTermLabel = terms.find((t) => t.id === termId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div data-tour="forecast-scope" className="flex items-center gap-1 p-0.5 rounded-lg bg-bg-elevated border border-border-base">
              <button
                onClick={() => setScope("term")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                  scope === "term"
                    ? "bg-jala-700 text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t("scope_term")}
              </button>
              <button
                onClick={() => setScope("cumulative")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                  scope === "cumulative"
                    ? "bg-jala-700 text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t("scope_cumulative")}
              </button>
            </div>

            <div data-tour="forecast-target" className="flex items-center gap-2 sm:ml-auto">
              <label className="text-xs text-text-muted font-medium">
                {t("target_gpa")}
              </label>
              <input
                type="number"
                min="0"
                max="4.0"
                step="0.1"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                className={cn(
                  "w-16 px-2 py-1.5 rounded-lg border text-xs font-bold text-center tabular-nums",
                  "bg-bg-surface focus:outline-none focus:border-border-accent",
                  validTarget ? "border-border-base text-text-primary" : "border-danger text-danger",
                )}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {scope === "term" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-jala-500/30 bg-jala-700/5">
                  <Target size={14} className="text-text-accent shrink-0" />
                  <span className="text-xs text-text-secondary font-medium">
                    {t("forecasting_for_term")}
                  </span>
                  <div className="relative ml-auto">
                    <select
                      value={termId}
                      onChange={(e) => setTermId(e.target.value)}
                      className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border-accent bg-bg-surface text-xs font-bold text-text-accent focus:outline-none"
                    >
                      {terms.map((term) => (
                        <option key={term.id} value={term.id}>
                          {tConfig(isEsp ? "level_label" : "term_label", {
                            ordinal: term.ordinal,
                          })}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-accent pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={scope}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap gap-1.5"
            >
              {honorPresets.map(({ label, gpa }) => (
                <button
                  key={label}
                  onClick={() => setPreset(gpa)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors",
                    parsedTarget === gpa
                      ? "border-jala-500/50 bg-jala-700/10 text-text-accent"
                      : "border-border-base text-text-muted hover:text-text-secondary hover:border-border-strong",
                  )}
                >
                  {label} ({gpa.toFixed(1)})
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          data-tour="forecast-config"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors self-start"
        >
          <SlidersHorizontal size={12} />
          {t("combinations_config")}
          <ChevronDown
            size={10}
            className={cn("transition-transform", showConfig && "rotate-180")}
          />
        </button>

        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2.5 pt-2 border-t border-border-base">
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1.5">
                    {t("allowed_grades")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ALL_GRADES.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => toggleGrade(grade)}
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold border transition-colors",
                          allowedGrades.includes(grade)
                            ? letterGradesMap[grade] >= 3.0
                              ? "border-success/40 bg-success/10 text-success"
                              : letterGradesMap[grade] >= 2.0
                                ? "border-warning/40 bg-warning/10 text-warning"
                                : "border-danger/40 bg-danger/10 text-danger"
                            : "border-border-base text-text-muted/50 hover:text-text-muted",
                        )}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                    {t("max_combinations")}
                  </label>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={decrementMax}
                      disabled={maxCombinations <= 1}
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-md border transition-colors",
                        maxCombinations <= 1
                          ? "border-border-base text-text-muted/30 cursor-not-allowed"
                          : "border-border-base text-text-secondary hover:text-text-primary hover:border-border-strong",
                      )}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-text-primary tabular-nums">
                      {maxCombinations}
                    </span>
                    <button
                      onClick={incrementMax}
                      disabled={maxCombinations >= 20}
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-md border transition-colors",
                        maxCombinations >= 20
                          ? "border-border-base text-text-muted/30 cursor-not-allowed"
                          : "border-border-base text-text-secondary hover:text-text-primary hover:border-border-strong",
                      )}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isRefreshing ? (
        <ForecastResultsSkeleton />
      ) : (
        result && (
          <motion.div
            key={`results-${displayedChange}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ForecastResults result={result} t={t} scope={scope} isEsp={isEsp} />
          </motion.div>
        )
      )}
    </div>
  );
}

function ForecastResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 flex-1 p-4 rounded-xl border border-border-base bg-bg-surface/80">
            <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col rounded-xl border border-border-base bg-bg-surface/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-border-base flex flex-col gap-1.5">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-52 rounded" />
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-3 py-2.5 rounded-lg border border-border-base bg-bg-elevated/50">
              <div className="skeleton h-4 w-8 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-5 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-border-base bg-bg-surface/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-border-base flex flex-col gap-1.5">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>
        <div className="p-3 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border-base bg-bg-elevated/50">
              <div className="skeleton h-5 w-12 rounded" />
              <div className="flex gap-1.5 flex-1">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="skeleton h-5 w-14 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ForecastResults({
  result,
  t,
  scope,
  isEsp,
}: {
  result: NonNullable<ReturnType<typeof forecast>>;
  t: ReturnType<typeof useTranslations>;
  scope: ForecastScope;
  isEsp: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex items-center gap-3 flex-1 p-4 rounded-xl border border-border-base bg-bg-surface/80">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl text-text-accent bg-jala-700/10">
            <Target size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted">
              {scope === "term" ? t("term_gpa_label") : t("cumulative_gpa_label")}
            </p>
            <p className="text-xl font-bold text-text-primary tabular-nums">
              {result.currentGpa > 0 ? result.currentGpa.toFixed(3) : "\u2014"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 p-4 rounded-xl border border-border-base bg-bg-surface/80">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl text-warning bg-warning/10">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted">{t("remaining_courses")}</p>
            <p className="text-xl font-bold text-text-primary">
              {result.remainingCourseCount}
              {!isEsp && (
                <span className="text-sm font-normal text-text-muted ml-1.5">
                  ({result.remainingCredits} cr)
                </span>
              )}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-3 flex-1 p-4 rounded-xl border",
            result.alreadyAchieved
              ? "border-success/30 bg-success/5"
              : !result.feasible
                ? "border-danger/30 bg-danger/5"
                : !result.feasibleWithAllowedGrades
                  ? "border-warning/30 bg-warning/5"
                  : "border-jala-500/30 bg-jala-700/5",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              result.alreadyAchieved
                ? "text-success bg-success/15"
                : !result.feasible
                  ? "text-danger bg-danger/15"
                  : !result.feasibleWithAllowedGrades
                    ? "text-warning bg-warning/15"
                    : "text-jala-400 bg-jala-700/15",
            )}
          >
            {result.alreadyAchieved ? (
              <CheckCircle size={18} />
            ) : !result.feasible ? (
              <XCircle size={18} />
            ) : !result.feasibleWithAllowedGrades ? (
              <AlertTriangle size={18} />
            ) : (
              <Zap size={18} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted">{t("feasibility")}</p>
            <p
              className={cn(
                "text-xs font-semibold leading-snug",
                result.alreadyAchieved
                  ? "text-success"
                  : !result.feasible
                    ? "text-danger"
                    : !result.feasibleWithAllowedGrades
                      ? "text-warning"
                      : "text-text-accent",
              )}
            >
              {result.remainingCourseCount === 0
                ? scope === "term"
                  ? t("no_remaining_term")
                  : t("no_remaining")
                : result.alreadyAchieved
                  ? t("already_achieved")
                  : !result.feasible
                    ? t("not_feasible")
                    : !result.feasibleWithAllowedGrades
                      ? t("feasible_not_with_selection")
                      : t("feasible")}
            </p>
          </div>
        </div>
      </motion.div>

      {result.uniformScenarios.length > 0 && (
        <motion.div
          data-tour="forecast-scenarios"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex flex-col rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-base">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("quick_scenarios")}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {t("quick_scenarios_desc", {
                count: result.remainingCourseCount,
                scope: scope === "term" ? t("scope_term") : t("scope_cumulative"),
              })}
            </p>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {result.uniformScenarios.map((scenario) => (
              <div
                key={scenario.grade}
                className={cn(
                  "flex flex-col gap-2 px-3 py-2.5 rounded-lg border transition-colors",
                  scenario.meetsTarget
                    ? "border-success/30 bg-success/5"
                    : "border-border-base bg-bg-elevated/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      letterGradesMap[scenario.grade] >= 3.7
                        ? "text-success"
                        : letterGradesMap[scenario.grade] >= 3.0
                          ? "text-text-accent"
                          : letterGradesMap[scenario.grade] >= 2.0
                            ? "text-warning"
                            : "text-danger",
                    )}
                  >
                    {scenario.grade}
                  </span>
                  {scenario.meetsTarget ? (
                    <CheckCircle size={13} className="text-success shrink-0" />
                  ) : (
                    <XCircle size={13} className="text-text-muted/40 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">
                  {t("quick_scenario_sentence", {
                    grade: scenario.grade,
                    count: result.remainingCourseCount,
                    scope: scope === "term" ? t("scope_term").toLowerCase() : t("scope_cumulative").toLowerCase(),
                  })}
                </p>
                <span className="text-base font-bold tabular-nums text-text-primary">
                  {scenario.projectedGpa.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {result.remainingCourseCount > 0 && result.feasible && !result.alreadyAchieved && (
        <motion.div
          data-tour="forecast-combinations"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="flex flex-col rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-base">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("combinations")}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {t("combinations_desc")}
            </p>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.combinations.length > 0 ? (
              result.combinations.map((combo, i) => (
                <CombinationCard
                  key={i}
                  index={i}
                  combination={combo}
                  isEsp={isEsp}
                />
              ))
            ) : (
              <div className="flex items-center gap-2 px-3 py-4 text-xs text-text-muted">
                <AlertTriangle size={14} className="text-warning shrink-0" />
                {t("impossible_with_selection")}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.24 }}
        className="flex flex-col gap-2 rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm p-4"
      >
        <div className="flex items-center gap-2">
          <Info size={14} className="text-text-muted shrink-0" />
          <h3 className="text-xs font-semibold text-text-secondary">
            {t("disclaimer_title")}
          </h3>
        </div>
        <ul className="flex flex-col gap-1.5 text-[11px] text-text-muted leading-relaxed list-disc pl-5">
          <li>{t(isEsp ? "disclaimer_algorithm_esp" : "disclaimer_algorithm")}</li>
          <li>{t(isEsp ? "disclaimer_credits_esp" : "disclaimer_credits")}</li>
          <li>{t("disclaimer_not_official")}</li>
        </ul>
      </motion.div>
    </div>
  );
}

function CombinationCard({
  index,
  combination,
  isEsp,
}: {
  index: number;
  combination: NonNullable<ReturnType<typeof forecast>>["combinations"][number];
  isEsp: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border-base bg-bg-elevated/50">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-jala-700/10 text-[10px] font-bold text-text-accent">
          {index + 1}
        </span>
        <span className="text-xs font-bold tabular-nums text-text-primary">
          {combination.projectedGpa.toFixed(3)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {combination.allocations.map((alloc) => (
          <div key={alloc.grade} className="flex flex-wrap items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0",
                letterGradesMap[alloc.grade] >= 3.7
                  ? "border-success/30 bg-success/8 text-success"
                  : letterGradesMap[alloc.grade] >= 3.0
                    ? "border-jala-500/30 bg-jala-700/8 text-text-accent"
                    : letterGradesMap[alloc.grade] >= 2.0
                      ? "border-warning/30 bg-warning/8 text-warning"
                      : "border-danger/30 bg-danger/8 text-danger",
              )}
            >
              {alloc.count}&times;{alloc.grade}
            </span>
            {!isEsp &&
              alloc.creditGroups.map((cg) => (
                <span
                  key={cg.credits}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tabular-nums bg-bg-elevated border border-border-base text-text-muted"
                >
                  {cg.count}&times;{cg.credits}cr
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
