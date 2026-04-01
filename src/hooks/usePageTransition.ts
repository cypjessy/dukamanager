"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

const MIN_DISPLAY_TIME = 800;
const MAX_TIMEOUT = 10000;

export type LoaderTheme = "shop" | "developer";

interface LoaderState {
  isLoading: boolean;
  progress: number;
  message: string;
  theme: LoaderTheme;
  pathname: string;
}

export function usePageTransition() {
  const pathname = usePathname();
  const [state, setState] = useState<LoaderState>({
    isLoading: false,
    progress: 0,
    message: "",
    theme: "shop",
    pathname,
  });
  const startTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const detectTheme = useCallback((path: string): LoaderTheme => {
    if (path.startsWith("/portal")) return "developer";
    return "shop";
  }, []);

  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const simulateProgress = useCallback(() => {
    let progress = 0;
    let phase: "accelerating" | "paused" | "completing" = "accelerating";

    progressIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      if (phase === "accelerating") {
        progress += Math.random() * 8 + 3;
        if (progress >= 65) {
          phase = "paused";
          progress = Math.min(progress, 68);
        }
      } else if (phase === "paused") {
        progress += Math.random() * 1.5 + 0.5;
        if (progress >= 85) {
          phase = "completing";
        }
      } else {
        progress += Math.random() * 4 + 2;
      }

      if (progress >= 100) {
        progress = 100;
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }

      setState((prev) => ({ ...prev, progress: Math.min(progress, 100) }));
    }, 80);
  }, []);

  const startLoading = useCallback(
    (newPath: string) => {
      clearTimers();
      startTimeRef.current = Date.now();
      const theme = detectTheme(newPath);

      setState({
        isLoading: true,
        progress: 0,
        message: "",
        theme,
        pathname: newPath,
      });

      simulateProgress();

      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            progress: 100,
          }));
        }
      }, MAX_TIMEOUT);
    },
    [clearTimers, detectTheme, simulateProgress]
  );

  const finishLoading = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    clearTimers();

    // Jump to 100%
    setState((prev) => ({ ...prev, progress: 100 }));

    setTimeout(() => {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          progress: 0,
        }));
      }
    }, remaining + 300);
  }, [clearTimers]);

  // Detect route changes via pathname
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  // When pathname changes, finish loading
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (state.isLoading) {
        finishLoading();
      }
    }
  }, [pathname, state.isLoading, finishLoading]);

  // Programmatic navigation trigger using click interception
  const handleNavigationStart = useCallback(
    (url: string) => {
      if (url !== pathname) {
        startLoading(url);
      }
    },
    [pathname, startLoading]
  );

  return {
    ...state,
    startLoading,
    finishLoading,
    handleNavigationStart,
  };
}
