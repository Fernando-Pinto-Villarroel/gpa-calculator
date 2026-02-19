"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/features/theme/store/useThemeStore";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(ratio, ratio);
    };

    resize();
    window.addEventListener("resize", resize);

    const w = window.innerWidth;
    const h = window.innerHeight;

    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.4 + 0.2,
      opacity: Math.random() * 0.7 + 0.15,
      twinkleSpeed: Math.random() * 0.018 + 0.004,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    nebulasRef.current = [
      { x: w * 0.15, y: h * 0.25, radius: w * 0.22, color: "#1a3aff", opacity: 0.06 },
      { x: w * 0.8, y: h * 0.65, radius: w * 0.2, color: "#7c3aed", opacity: 0.05 },
      { x: w * 0.5, y: h * 0.85, radius: w * 0.18, color: "#0ea5e9", opacity: 0.04 },
    ];

    let frame = 0;

    function draw() {
      if (!ctx || !canvas) return;
      const cw = canvas.width / ratio;
      const ch = canvas.height / ratio;

      ctx.clearRect(0, 0, cw, ch);

      nebulasRef.current.forEach((neb) => {
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        grad.addColorStop(0, `${neb.color}${Math.round(neb.opacity * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      });

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase) * 0.35 + 0.65;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();

        if (star.radius > 1.0) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.12})`;
          ctx.fill();
        }
      });

      frame++;
      animRef.current = requestAnimationFrame(draw);
    }

    if (isDark) {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [isDark]);

  if (!isDark) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
}
