"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SyncStatus } from "@/types/cashier";

interface SyncBadgeProps {
  pendingItems: number;
  failedItems: number;
  conflicts: number;
  syncStatus: SyncStatus;
  onClick: () => void;
}

export default function SyncBadge({ pendingItems, failedItems, conflicts, syncStatus, onClick }: SyncBadgeProps) {
  const total = pendingItems + failedItems + conflicts;
  if (total === 0 && syncStatus !== "syncing") return null;

  const getStatusColor = () => {
    if (conflicts > 0) return "bg-sunset-500";
    if (failedItems > 0) return "bg-red-500";
    if (syncStatus === "syncing") return "bg-forest-500";
    return "bg-warm-500";
  };

  const getStatusIcon = () => {
    if (syncStatus === "syncing") {
      return <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />;
    }
    if (conflicts > 0) {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    if (failedItems > 0) {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    }
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    );
  };

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-white text-[10px] font-medium min-h-[28px] ${getStatusColor()}`}
        title="Sync Queue Status"
      >
        {getStatusIcon()}
        <span>{syncStatus === "syncing" ? "Syncing..." : `${total} pending`}</span>
      </motion.button>
    </AnimatePresence>
  );
}
