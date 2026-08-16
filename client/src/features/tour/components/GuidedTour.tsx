"use client";

import { useEffect, useState } from "react";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  CallBackProps,
  Step,
} from "react-joyride";
import { useRouter, usePathname } from "next/navigation";
import {
  useRouter as useIntlRouter,
  usePathname as useIntlPathname,
} from "@/core/lib/i18n/navigation";
import { useTourStore } from "../store/useTourStore";
import { useTourSteps } from "../hooks/useTourSteps";
import { TourTooltip } from "./TourTooltip";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { getCareerPalette } from "@/features/career/theme";
import { LOCALE_LABELS } from "@/core/lib/i18n/routing";

interface GuidedTourProps {
  locale: string;
}

const IDLE_STEP: Step = {
  target: "body",
  content: "",
  placement: "center",
  disableBeacon: true,
};

export function GuidedTour({ locale }: GuidedTourProps) {
  const t = useTranslations("tour");
  const { theme } = useThemeStore();
  const { accent700 } = getCareerPalette(useCareerStore((s) => s.selectedCareerId));
  const {
    guidedTourCompleted,
    globalStepIndex,
    isActive,
    resumeTour,
    skipTour,
    completeTour,
    setGlobalStepIndex,
  } = useTourStore();

  const allSteps = useTourSteps();
  const router = useRouter();
  const pathname = usePathname();
  const intlRouter = useIntlRouter();
  const intlPathname = useIntlPathname();

  const [joyrideRun, setJoyrideRun] = useState(false);
  const [joyrideStepIndex, setJoyrideStepIndex] = useState(0);

  const handleLocaleChange = (code: string) => {
    intlRouter.replace(intlPathname, { locale: code });
  };

  const getRouteSuffix = () => {
    const base = `/${locale}`;
    if (pathname === base) return "";
    return pathname.slice(base.length);
  };

  const getPageSteps = (routeSuffix: string): Step[] =>
    allSteps.filter((s) => s.route === routeSuffix);

  const getFirstIndexOnPage = (routeSuffix: string): number =>
    allSteps.findIndex((s) => s.route === routeSuffix);

  const getRouteOrder = (): string[] => {
    const seen = new Set<string>();
    const order: string[] = [];
    allSteps.forEach((s) => {
      if (!seen.has(s.route)) {
        seen.add(s.route);
        order.push(s.route);
      }
    });
    return order;
  };

  const routeOrder = getRouteOrder();
  const currentRouteIdx = routeOrder.indexOf(getRouteSuffix());
  const nextRoute =
    currentRouteIdx !== -1 ? routeOrder[currentRouteIdx + 1] : undefined;

  const handleSkipPage = () => {
    setJoyrideRun(false);
    if (nextRoute === undefined) {
      completeTour();
      return;
    }
    const nextGlobalIndex = getFirstIndexOnPage(nextRoute);
    setGlobalStepIndex(nextGlobalIndex);
    router.push(`/${locale}${nextRoute}`);
  };

  useEffect(() => {
    if (!guidedTourCompleted && !isActive) {
      const timer = setTimeout(resumeTour, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActive) {
      setJoyrideRun(false);
      return;
    }

    const routeSuffix = getRouteSuffix();
    const firstOnPage = getFirstIndexOnPage(routeSuffix);
    const pageStepsForRoute = getPageSteps(routeSuffix);

    const stepIsOnThisPage =
      firstOnPage !== -1 &&
      globalStepIndex >= firstOnPage &&
      globalStepIndex < firstOnPage + pageStepsForRoute.length;

    if (!stepIsOnThisPage) {
      setJoyrideRun(false);
      return;
    }

    const localIndex = globalStepIndex - firstOnPage;
    setJoyrideStepIndex(localIndex);

    const target = pageStepsForRoute[localIndex]?.target;
    const selector =
      typeof target === "string" && target !== "body" ? target : null;

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const startJoyride = () => {
      if (cancelled) return;
      setTimeout(() => {
        if (!cancelled) setJoyrideRun(true);
      }, 100);
    };

    const skipStep = () => {
      if (cancelled) return;
      const newGlobalIndex = globalStepIndex + 1;
      if (newGlobalIndex >= allSteps.length) {
        completeTour();
        return;
      }
      setGlobalStepIndex(newGlobalIndex);
      const nextStep = allSteps[newGlobalIndex];
      if (nextStep && nextStep.route !== routeSuffix) {
        router.push(`/${locale}${nextStep.route}`);
      }
    };

    const tryStart = () => {
      if (cancelled) return;
      if (!selector) {
        startJoyride();
      } else {
        const el = document.querySelector(selector);
        if (el) {
          startJoyride();
        } else {
          pollId = setInterval(() => {
            if (cancelled) {
              clearInterval(pollId!);
              return;
            }
            if (document.querySelector(selector)) {
              clearInterval(pollId!);
              pollId = null;
              startJoyride();
            }
          }, 80);
          setTimeout(() => {
            if (pollId) {
              clearInterval(pollId);
              pollId = null;
            }
            if (cancelled) return;
            if (document.querySelector(selector)) {
              startJoyride();
            } else {
              skipStep();
            }
          }, 1500);
        }
      }
    };

    const timer = setTimeout(tryStart, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, globalStepIndex, pathname]);

  const handleCallback = (data: CallBackProps) => {
    const { action, index, type, status } = data;

    if (status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      skipTour();
      setJoyrideRun(false);

      document.body.style.overflow = "";
      const main = document.querySelector("main");
      if (main) {
        main.style.overflow = "";
      }
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const routeSuffix = getRouteSuffix();
      const firstOnPage = getFirstIndexOnPage(routeSuffix);
      const delta = action === ACTIONS.PREV ? -1 : 1;
      const newGlobalIndex = firstOnPage + index + delta;

      setJoyrideRun(false);

      if (newGlobalIndex < 0) {
        setGlobalStepIndex(0);
        return;
      }

      if (newGlobalIndex >= allSteps.length) {
        completeTour();
        return;
      }

      const nextStep = allSteps[newGlobalIndex];
      setGlobalStepIndex(newGlobalIndex);

      if (nextStep && nextStep.route !== routeSuffix) {
        router.push(`/${locale}${nextStep.route}`);
      }
    }
  };

  const routeSuffix = getRouteSuffix();
  const pageSteps = getPageSteps(routeSuffix);
  const stepsToRender = pageSteps.length > 0 ? pageSteps : [IDLE_STEP];

  const tooltipMaxWidth =
    typeof window !== "undefined" ? Math.min(360, window.innerWidth - 32) : 360;

  const isDark = theme === "dark";
  const primaryColor = accent700;
  const bgColor = isDark ? "#0b1530" : "#f6f8fb";
  const textColor = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const borderColor = isDark ? "#0f2040" : "#e2e8f0";

  return (
    <Joyride
      steps={stepsToRender}
      run={joyrideRun}
      stepIndex={joyrideStepIndex}
      continuous
      showProgress
      showSkipButton
      spotlightClicks={false}
      disableScrolling
      disableScrollParentFix
      scrollOffset={100}
      callback={handleCallback}
      tooltipComponent={(props) => (
        <TourTooltip
          {...props}
          onSkipPage={handleSkipPage}
          hasNextPage={nextRoute !== undefined}
          labels={{
            back: t("back"),
            next: t("next"),
            nextPage: t("next_page"),
            finish: t("finish"),
            skipPage: t("skip_page"),
            skipTour: t("skip"),
          }}
          colors={{
            primary: primaryColor,
            bg: bgColor,
            text: textColor,
            textSecondary,
            border: borderColor,
          }}
          maxWidth={tooltipMaxWidth}
          locales={LOCALE_LABELS}
          currentLocale={locale}
          onLocaleChange={handleLocaleChange}
        />
      )}
      locale={{
        open: t("open"),
      }}
      styles={{
        options: {
          primaryColor,
          backgroundColor: bgColor,
          textColor,
          arrowColor: bgColor,
          zIndex: 10000,
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
        spotlight: {
          borderRadius: "8px",
        },
      }}
    />
  );
}
