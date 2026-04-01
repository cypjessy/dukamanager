"use client";

import { motion } from "framer-motion";
import type { StockStatus } from "@/data/inventoryData";

interface StockLevelIndicatorProps {
  current: number;
  reorderPoint: number;
  status: StockStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const statusConfig = {
  healthy: { color: "bg-forest-500", track: "bg-forest-100 dark:bg-forest-900/30", text: "text-forest-600 dark:text-forest-400" },
  low: { color: "bg-savanna-500", track: "bg-savanna-100 dark:bg-savanna-900/30", text: "text-savanna-600 dark:text-savanna-400" },
  critical: { color: "bg-sunset-400", track: "bg-sunset-100 dark:bg-sunset-900/30", text: "text-sunset-500 dark:text-sunset-400" },
  out: { color: "bg-red-500", track: "bg-red-100 dark:bg-red-900/30", text: "text-red-500" },
};

export default function StockLevelIndicator({
  current,
  reorderPoint,
  status,
  showLabel = true,
  size = "md",
}: StockLevelIndicatorProps) {
  const config = statusConfig[status];
  const maxDisplay = reorderPoint * 2;
  const percentage = Math.min((current / maxDisplay) * 100, 100);
  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className={`flex-1 ${barHeight} rounded-full ${config.track} overflow-hidden`}>
        <motion.div
          className={`${barHeight} rounded-full ${config.color} ${status === "critical" || status === "out" ? "animate-pulse" : ""}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold tabular-nums ${config.text}`}>
          {current}
        </span>
      )}
    </div>
  );
}
