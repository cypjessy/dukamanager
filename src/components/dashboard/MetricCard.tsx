"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: "terracotta" | "sunset" | "forest" | "savanna";
  urgent?: boolean;
}

const colorMap = {
  terracotta: {
    bg: "bg-terracotta-50 dark:bg-terracotta-900/20",
    icon: "bg-terracotta-100 dark:bg-terracotta-800/40 text-terracotta-600 dark:text-terracotta-400",
    border: "border-terracotta-200/50 dark:border-terracotta-700/30",
  },
  sunset: {
    bg: "bg-sunset-50 dark:bg-sunset-900/20",
    icon: "bg-sunset-100 dark:bg-sunset-800/40 text-sunset-500 dark:text-sunset-400",
    border: "border-sunset-200/50 dark:border-sunset-700/30",
  },
  forest: {
    bg: "bg-forest-50 dark:bg-forest-900/20",
    icon: "bg-forest-100 dark:bg-forest-800/40 text-forest-500 dark:text-forest-400",
    border: "border-forest-200/50 dark:border-forest-700/30",
  },
  savanna: {
    bg: "bg-savanna-50 dark:bg-savanna-900/20",
    icon: "bg-savanna-100 dark:bg-savanna-800/40 text-savanna-600 dark:text-savanna-400",
    border: "border-savanna-200/50 dark:border-savanna-700/30",
  },
};

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  urgent,
}: MetricCardProps) {
  const colors = colorMap[color];
  const isPositive = change && change > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl border p-4 sm:p-5 transition-shadow hover:shadow-md ${
        colors.border
      } ${urgent ? "ring-2 ring-red-300 dark:ring-red-700" : ""}`}
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {urgent && (
        <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider">
          Urgent
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-warm-500 dark:text-warm-400 font-medium mb-1 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  isPositive
                    ? "text-forest-500"
                    : change === 0
                      ? "text-warm-400"
                      : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : change === 0 ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-warm-400 dark:text-warm-500">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
