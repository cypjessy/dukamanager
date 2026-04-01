"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-7 w-28 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-3 w-16 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-warm-200 dark:bg-warm-700 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="h-5 w-32 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
        <div className="h-8 w-36 rounded-xl bg-warm-200 dark:bg-warm-700 animate-pulse" />
      </div>
      <div className="h-64 rounded-xl bg-warm-200 dark:bg-warm-700 animate-pulse" />
    </div>
  );
}

export function SkeletonTable({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60">
        <div className="h-5 w-40 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-warm-100/60 dark:border-warm-800/60 last:border-0"
        >
          <div className="h-4 w-24 rounded bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-4 w-12 rounded bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-4 w-20 rounded bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-6 w-16 rounded-lg bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-4 w-14 rounded bg-warm-200 dark:bg-warm-700 animate-pulse" />
          <div className="h-4 w-10 rounded bg-warm-200 dark:bg-warm-700 animate-pulse ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4 text-warm-400">
        {icon}
      </div>
      <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-warm-500 dark:text-warm-400 max-w-xs mb-4">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
