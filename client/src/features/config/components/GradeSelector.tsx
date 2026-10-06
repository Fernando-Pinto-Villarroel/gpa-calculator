"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  LetterGrade,
  ALL_GRADES,
  letterGradesMap,
  isFailingGrade,
} from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";

const MENU_MAX_HEIGHT = 192;
const MENU_MIN_HEIGHT = 96;
const MENU_WIDTH = 96;
const MENU_GAP = 4;
const VIEWPORT_MARGIN = 8;

interface MenuPosition {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
  openUp: boolean;
}

function computeMenuPosition(trigger: HTMLElement): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const nav = document.querySelector('[data-tour="bottom-nav"]');
  const navRect = nav?.getBoundingClientRect();
  const bottomEdge =
    navRect && navRect.height > 0
      ? Math.min(window.innerHeight, navRect.top)
      : window.innerHeight;

  const spaceBelow = bottomEdge - VIEWPORT_MARGIN - rect.bottom - MENU_GAP;
  const spaceAbove = rect.top - VIEWPORT_MARGIN - MENU_GAP;
  const openUp = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
  const space = openUp ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(MENU_MIN_HEIGHT, Math.min(MENU_MAX_HEIGHT, space));
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(rect.left, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN),
  );

  return openUp
    ? {
        left,
        bottom: window.innerHeight - rect.top + MENU_GAP,
        maxHeight,
        openUp,
      }
    : { left, top: rect.bottom + MENU_GAP, maxHeight, openUp };
}

interface GradeSelectorProps {
  courseCode: string;
  grade: LetterGrade | null;
  onChange: (courseCode: string, grade: LetterGrade | null) => void;
  noGradeLabel: string;
}

function gradeColor(grade: LetterGrade | null): string {
  if (!grade) return "text-text-muted";
  const pts = letterGradesMap[grade];
  const isExcellent = pts >= 3.7;
  const isGood = pts >= 3.0 && !isExcellent;
  const isFailing = isFailingGrade(grade);

  if (isExcellent) return "text-success";
  if (isGood) return "text-text-accent";
  if (isFailing) return "text-danger";
  return "text-warning";
}

export function GradeSelector({
  courseCode,
  grade,
  onChange,
  noGradeLabel,
}: GradeSelectorProps) {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = position !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPosition(null);
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      close();
    }
    function handleScroll(e: Event) {
      if (menuRef.current?.contains(e.target as Node)) return;
      close();
    }
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setPosition(null);
    } else if (triggerRef.current) {
      setPosition(computeMenuPosition(triggerRef.current));
    }
  };

  const select = (g: LetterGrade | null) => {
    onChange(courseCode, g);
    setPosition(null);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggle}
        className={cn(
          "flex items-center justify-between gap-1 w-full px-2.5 py-1.5 rounded-md text-xs font-semibold",
          "border border-border-base bg-bg-elevated hover:border-border-accent",
          "transition-colors duration-150",
          gradeColor(grade),
        )}
      >
        <span>{grade ?? noGradeLabel}</span>
        <ChevronDown
          size={12}
          className={cn(
            "text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {position &&
        createPortal(
          <motion.div
            ref={menuRef}
            data-testid="grade-menu"
            initial={{
              opacity: 0,
              y: position.openUp ? 4 : -4,
              scale: 0.97,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
              width: MENU_WIDTH,
            }}
            className="rounded-lg border border-border-base bg-bg-surface shadow-xl z-50 overflow-y-auto"
          >
            <button
              onClick={() => select(null)}
              className={cn(
                "w-full px-3 py-1.5 text-xs text-left font-medium transition-colors",
                !grade
                  ? "bg-border-base text-text-muted"
                  : "text-text-muted hover:bg-bg-elevated",
              )}
            >
              {noGradeLabel}
            </button>
            {ALL_GRADES.map((g) => (
              <button
                key={g}
                onClick={() => select(g)}
                className={cn(
                  "w-full px-3 py-1.5 text-xs text-left font-semibold transition-colors",
                  grade === g ? "bg-jala-700/20" : "hover:bg-bg-elevated",
                  gradeColor(g),
                )}
              >
                {g}
              </button>
            ))}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
