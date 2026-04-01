"use client";

import { useState, useEffect, useCallback } from "react";

interface ViewportInfo {
  availableHeight: number;
  availableWidth: number;
  headerHeight: number;
  padding: number;
}

export function useViewportHeight(offsets?: { header?: number; padding?: number }) {
  const headerH = offsets?.header ?? 140;
  const paddingH = offsets?.padding ?? 32;

  const getViewport = useCallback((): ViewportInfo => {
    if (typeof window === "undefined") {
      return { availableHeight: 600, availableWidth: 1024, headerHeight: headerH, padding: paddingH };
    }
    return {
      availableHeight: window.innerHeight - headerH - paddingH,
      availableWidth: window.innerWidth,
      headerHeight: headerH,
      padding: paddingH,
    };
  }, [headerH, paddingH]);

  const [viewport, setViewport] = useState<ViewportInfo>(getViewport);

  useEffect(() => {
    const handle = () => setViewport(getViewport());
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [getViewport]);

  return viewport;
}
