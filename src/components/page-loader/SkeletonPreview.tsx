"use client";

import { motion } from "framer-motion";

interface SkeletonPreviewProps {
  theme: "shop" | "developer";
  progress: number;
}

export default function SkeletonPreview({ theme, progress }: SkeletonPreviewProps) {
  const isDark = theme === "developer";
  const visible = progress >= 85;

  if (!visible) return null;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 0.5 }}
      aria-hidden="true"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className={`h-8 w-48 rounded-lg ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
        <div className="flex gap-3">
          <div className={`h-8 w-8 rounded-lg ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
          <div className={`h-8 w-8 rounded-lg ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
          <div className={`h-8 w-24 rounded-lg ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-24 rounded-2xl ${isDark ? "bg-white/[0.03]" : "bg-warm-100/60"}`}
          />
        ))}
      </div>

      {/* Main content area skeleton */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className={`col-span-2 rounded-2xl ${isDark ? "bg-white/[0.02]" : "bg-warm-100/40"}`}>
          {/* Chart placeholder */}
          <div className="p-6 flex flex-col gap-3">
            <div className={`h-4 w-32 rounded ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
            <div className="flex-1 flex items-end gap-2 pt-4">
              {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-lg ${isDark ? "bg-white/[0.04]" : "bg-warm-200/40"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={`rounded-2xl ${isDark ? "bg-white/[0.02]" : "bg-warm-100/40"}`}>
          {/* List placeholder */}
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
                <div className="flex-1 space-y-1">
                  <div className={`h-3 w-3/4 rounded ${isDark ? "bg-white/5" : "bg-warm-200/50"}`} />
                  <div className={`h-2 w-1/2 rounded ${isDark ? "bg-white/3" : "bg-warm-200/30"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
