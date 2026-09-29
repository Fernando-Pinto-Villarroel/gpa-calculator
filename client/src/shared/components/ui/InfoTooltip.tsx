"use client";

import { useRef, useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cn } from "@/core/lib/utils/cn";

const TOGGLE_GUARD_MS = 600;

interface InfoTooltipProps {
  text: string;
  detail?: string;
  label?: string;
  className?: string;
  iconSize?: number;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({
  text,
  detail,
  label,
  className,
  iconSize = 13,
  side = "top",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closedByTapAtRef = useRef(0);
  const pointerTypeRef = useRef<string | null>(null);
  const skipNextClickRef = useRef(false);

  const handleOpenChange = (next: boolean) => {
    if (next && Date.now() - closedByTapAtRef.current < TOGGLE_GUARD_MS) return;
    setOpen(next);
  };

  const toggle = () => {
    if (open) closedByTapAtRef.current = Date.now();
    setOpen(!open);
  };

  const handlePointerUp = (pointerType: string) => {
    if (pointerType === "mouse") return;
    skipNextClickRef.current = true;
    toggle();
  };

  const handleClick = () => {
    const pointerType = pointerTypeRef.current;
    pointerTypeRef.current = null;
    if (skipNextClickRef.current) {
      skipNextClickRef.current = false;
      return;
    }
    if (pointerType === "mouse") {
      setOpen(true);
      return;
    }
    toggle();
  };

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange} delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={label ?? text}
          onPointerDown={(e) => {
            e.preventDefault();
            pointerTypeRef.current = e.pointerType;
          }}
          onPointerUp={(e) => handlePointerUp(e.pointerType)}
          onFocus={(e) => {
            if (!e.currentTarget.matches(":focus-visible")) e.preventDefault();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClick();
          }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-text-muted",
            "opacity-50 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-accent",
            "data-[state=delayed-open]:opacity-100 data-[state=instant-open]:opacity-100",
            className,
          )}
        >
          <Info size={iconSize} />
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          side={side}
          sideOffset={6}
          collisionPadding={12}
          onPointerDownOutside={(e) => {
            if (triggerRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className={cn(
            "info-tooltip-content z-50 max-w-64 rounded-lg border border-border-base bg-bg-surface",
            "px-3 py-2 text-xs leading-relaxed text-text-secondary shadow-xl",
          )}
        >
          <p>{text}</p>
          {detail && (
            <p className="mt-1.5 pt-1.5 border-t border-border-base text-text-primary font-medium">
              {detail}
            </p>
          )}
          <TooltipArrow className="fill-bg-surface" width={10} height={5} />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}
