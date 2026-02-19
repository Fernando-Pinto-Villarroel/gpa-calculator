"use client";

import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect } from "react";
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

export function Providers({ children, locale }: ProvidersProps) {
  const messages = messagesMap[locale as "en" | "es" | "pt"] ?? en;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <TooltipProvider delayDuration={400}>
        <ThemeInitializer />
        {children}
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
