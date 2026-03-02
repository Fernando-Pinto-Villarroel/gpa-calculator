"use client";

import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import en from "../../../../messages/en.json";
import es from "../../../../messages/es.json";
import pt from "../../../../messages/pt.json";

const messagesMap = { en, es, pt };

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
}

function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}

function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme);
  const [position, setPosition] = useState<"bottom-right" | "top-center">("bottom-right");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      setPosition(e.matches ? "top-center" : "bottom-right");
    };
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Toaster
      theme={theme}
      position={position}
      richColors
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  );
}

export function Providers({ children, locale }: ProvidersProps) {
  const messages = messagesMap[locale as "en" | "es" | "pt"] ?? en;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <TooltipProvider delayDuration={400}>
        <ThemeInitializer />
        <ThemedToaster />
        {children}
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
