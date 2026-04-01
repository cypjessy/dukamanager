"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ViewportClass = "mobile" | "tablet" | "desktop";

interface ResponsiveDialogValue {
  vw: number;
  vh: number;
  viewport: ViewportClass;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  keyboardHeight: number;
}

export function useResponsiveDialog(): ResponsiveDialogValue {
  const [vw, setVw] = useState(1024);
  const [vh, setVh] = useState(768);
  const [isTouch, setIsTouch] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setVw(w);
      setVh(h);
    });
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setIsTouch(mql.matches);
    const touchListener = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mql.addEventListener("change", touchListener);

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const kbHeight = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(Math.max(0, kbHeight));
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewport);
    }

    return () => {
      mql.removeEventListener("change", touchListener);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewport);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  const isMobile = vw < 768;
  const isTablet = vw >= 768 && vw < 1024;
  const isDesktop = vw >= 1024;
  const viewport: ViewportClass = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  return {
    vw,
    vh,
    viewport,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    keyboardHeight,
  };
}
