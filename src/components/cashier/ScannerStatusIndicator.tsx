"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ScannerStatusProps {
  isActive: boolean;
  isConnected: boolean;
  scanCount: number;
  lastScanCode: string | null;
  onToggle: () => void;
}

export default function ScannerStatusIndicator({
  isActive,
  isConnected,
  scanCount,
  lastScanCode,
  onToggle,
}: ScannerStatusProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Scanner status badge */}
      <button
        onClick={onToggle}
        title={isActive ? "Scanner active - click to pause" : "Scanner paused - click to resume"}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium min-h-[28px] transition-colors ${
          isActive
            ? isConnected
              ? "bg-forest-50 dark:bg-forest-900/15 text-forest-600"
              : "bg-forest-50 dark:bg-forest-900/15 text-forest-600"
            : "bg-warm-100 dark:bg-warm-800 text-warm-400"
        }`}
      >
        {/* Scanner icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" rx="0.5" />
          <rect x="18" y="14" width="3" height="3" rx="0.5" />
          <rect x="14" y="18" width="3" height="3" rx="0.5" />
          <rect x="18" y="18" width="3" height="3" rx="0.5" />
        </svg>

        {/* Status indicator dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive
              ? isConnected
                ? "bg-forest-500 animate-pulse"
                : "bg-forest-400 animate-pulse"
              : "bg-warm-300"
          }`}
        />

        {/* Label */}
        <span className="hidden sm:inline">
          {isActive
            ? isConnected
              ? `Scanner (${scanCount})`
              : `Listening (${scanCount})`
            : "Scanner Off"}
        </span>
        {!isActive && <span className="sm:hidden">Off</span>}
      </button>

      {/* Last scan flash */}
      <AnimatePresence>
        {lastScanCode && isActive && (
          <motion.span
            key={lastScanCode}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="text-[9px] font-mono text-forest-500 hidden md:inline"
          >
            {lastScanCode}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
