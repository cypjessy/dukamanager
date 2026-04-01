"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePageTransition } from "@/hooks/usePageTransition";
import PageLoader from "./PageLoader";

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export default function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();
  const { isLoading, progress, theme, startLoading, finishLoading } = usePageTransition();
  const prevPathnameRef = useRef(pathname);
  const loadingStartedRef = useRef(false);

  // When pathname changes, finish loading
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (loadingStartedRef.current) {
        finishLoading();
        loadingStartedRef.current = false;
      }
    }
  }, [pathname, finishLoading]);

  // Intercept link clicks to trigger loading (user-initiated navigation only)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        href !== pathname &&
        target.getAttribute("target") !== "_blank" &&
        !href.startsWith("#")
      ) {
        loadingStartedRef.current = true;
        startLoading(href);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startLoading]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      loadingStartedRef.current = true;
      startLoading(window.location.pathname);
      setTimeout(() => {
        if (loadingStartedRef.current) {
          finishLoading();
          loadingStartedRef.current = false;
        }
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [startLoading, finishLoading]);

  return (
    <>
      <PageLoader
        isLoading={isLoading}
        progress={progress}
        theme={theme}
        pathname={pathname}
      />
      {children}
    </>
  );
}
