"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/core/lib/utils/cn";

interface InfoTooltipProps {
  text: string;
  className?: string;
  iconSize?: number;
}

export function InfoTooltip({ text, className, iconSize = 13 }: InfoTooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const open = hovered || pinned;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPinned(false);
        setHovered(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPinned(false);
        setHovered(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPinned((v) => !v);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={text}
        className="shrink-0 text-text-muted hover:text-text-accent transition-colors"
      >
        <Info size={iconSize} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute left-0 bottom-full mb-2 z-50 w-64 p-3 rounded-lg border border-border-base",
              "bg-bg-surface shadow-xl text-xs leading-relaxed text-text-secondary",
            )}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
