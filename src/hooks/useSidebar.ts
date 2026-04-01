"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseSidebarReturn {
  expanded: boolean;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  hovered: boolean;
  setExpanded: (val: boolean) => void;
  toggleExpanded: () => void;
  setMobileMenuOpen: (val: boolean) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  collapseProgress: number;
}

export function useSidebar(): UseSidebarReturn {
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapseProgress, setCollapseProgress] = useState(0);

  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 912);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    if (collapseProgressTimer.current) {
      clearInterval(collapseProgressTimer.current);
      collapseProgressTimer.current = null;
    }
    setCollapseProgress(0);
    setHovered(true);
    if (!expanded) {
      expandTimer.current = setTimeout(() => {
        setExpanded(true);
      }, 150);
    }
  }, [isMobile, expanded]);

  const onMouseLeave = useCallback(() => {
    if (isMobile) return;
    setHovered(false);
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = null;
    }
    if (expanded) {
      setCollapseProgress(0);
      const startTime = Date.now();
      const duration = 800;
      collapseProgressTimer.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setCollapseProgress(progress);
        if (progress >= 100) {
          if (collapseProgressTimer.current) clearInterval(collapseProgressTimer.current);
        }
      }, 20);
      collapseTimer.current = setTimeout(() => {
        setExpanded(false);
        setCollapseProgress(0);
      }, 800);
    }
  }, [isMobile, expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (expandTimer.current) clearTimeout(expandTimer.current);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      if (collapseProgressTimer.current) clearInterval(collapseProgressTimer.current);
    };
  }, []);

  return {
    expanded,
    isMobile,
    mobileMenuOpen,
    hovered,
    setExpanded,
    toggleExpanded,
    setMobileMenuOpen,
    onMouseEnter,
    onMouseLeave,
    collapseProgress,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
