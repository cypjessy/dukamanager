"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface ViewportContextValue {
  vh: number;
  vw: number;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isTouch: boolean;
  compactMode: boolean;
  toggleCompactMode: () => void;
  zoom: number;
  setZoom: (z: number) => void;
}

const ViewportContext = createContext<ViewportContextValue>({
  vh: 0,
  vw: 0,
  isDesktop: true,
  isTablet: false,
  isMobile: false,
  isTouch: false,
  compactMode: false,
  toggleCompactMode: () => {},
  zoom: 1,
  setZoom: () => {},
});

export function useViewport() {
  return useContext(ViewportContext);
}

export function ViewportProvider({ children }: { children: React.ReactNode }) {
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 900);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  const [isTouch, setIsTouch] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const rafRef = useRef<number | null>(null);

  const updateViewport = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      setVh(h);
      setVw(w);

      const html = document.documentElement;

      if (w >= 1024) {
        html.classList.add("is-desktop");
        html.classList.remove("is-mobile", "is-tablet");
        html.style.setProperty("--content-h", `calc(${h}px - 64px)`);
        html.style.setProperty("--sidebar-w", "64px");
        html.style.setProperty("--mobile-bottom-h", "0px");
      } else if (w >= 768) {
        html.classList.add("is-tablet");
        html.classList.remove("is-desktop", "is-mobile");
        html.style.setProperty("--content-h", "auto");
        html.style.setProperty("--sidebar-w", "0px");
        html.style.setProperty("--mobile-bottom-h", "0px");
      } else {
        html.classList.add("is-mobile");
        html.classList.remove("is-desktop", "is-tablet");
        html.style.setProperty("--content-h", "auto");
        html.style.setProperty("--sidebar-w", "0px");
        html.style.setProperty("--mobile-bottom-h", "80px");
      }
    });
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setIsTouch(mql.matches);
    const touchListener = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mql.addEventListener("change", touchListener);

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      mql.removeEventListener("change", touchListener);
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateViewport]);

  const toggleCompactMode = useCallback(() => {
    setCompactMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("compact-mode", next);
      return next;
    });
  }, []);

  const handleSetZoom = useCallback((z: number) => {
    const clamped = Math.max(0.75, Math.min(1.5, z));
    setZoom(clamped);
    document.documentElement.style.setProperty("--app-zoom", `${clamped}`);
  }, []);

  const isDesktop = vw >= 1024;
  const isTablet = vw >= 768 && vw < 1024;
  const isMobile = vw < 768;

  return (
    <ViewportContext.Provider value={{ vh, vw, isDesktop, isTablet, isMobile, isTouch, compactMode, toggleCompactMode, zoom, setZoom: handleSetZoom }}>
      {children}
    </ViewportContext.Provider>
  );
}
