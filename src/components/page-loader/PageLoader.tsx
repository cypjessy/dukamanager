"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LogoAnimation from "./LogoAnimation";
import ProgressRing from "./ProgressRing";
import LoadingMessages from "./LoadingMessages";
import ParticleBackground from "./ParticleBackground";
import SkeletonPreview from "./SkeletonPreview";

interface PageLoaderProps {
  isLoading: boolean;
  progress: number;
  theme: "shop" | "developer";
  pathname: string;
}

export default function PageLoader({ isLoading, progress, theme }: PageLoaderProps) {
  const isDark = theme === "developer";
  const announcerRef = useRef<HTMLDivElement>(null);

  // Announce loading state to screen readers
  useEffect(() => {
    if (isLoading && announcerRef.current) {
      announcerRef.current.textContent = `Loading page, ${Math.floor(progress)} percent complete`;
    } else if (announcerRef.current) {
      announcerRef.current.textContent = "Page loaded";
    }
  }, [isLoading, progress]);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(progress)}
          aria-label="Page loading"
          tabIndex={-1}
        >
          {/* Screen reader announcer */}
          <div
            ref={announcerRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          />

          {/* Background */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-[#0D0D12]/95"
                : "bg-warm-50/80"
            }`}
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          />

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
            aria-hidden="true"
          />

          {/* Particle background */}
          {!prefersReducedMotion && (
            <ParticleBackground theme={theme} />
          )}

          {/* Skeleton preview */}
          <SkeletonPreview theme={theme} progress={progress} />

          {/* Main loader content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo with progress ring */}
            <div className="relative">
              <ProgressRing progress={progress} theme={theme} size={140} strokeWidth={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <LogoAnimation theme={theme} progress={progress} />
              </div>
            </div>

            {/* DukaManager text */}
            <div className="text-center">
              <h2
                className={`font-heading font-extrabold text-xl ${
                  isDark ? "text-white" : "text-warm-900"
                }`}
              >
                Duka<span className={isDark ? "text-[#4E9AF1]" : "text-terracotta-500"}>Manager</span>
              </h2>
            </div>

            {/* Rotating messages */}
            <LoadingMessages theme={theme} progress={progress} />
          </div>

          {/* Focus trap - prevent interaction during load */}
          <div className="absolute inset-0" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
