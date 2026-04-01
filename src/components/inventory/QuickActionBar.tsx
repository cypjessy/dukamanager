"use client";

import { motion, AnimatePresence } from "framer-motion";

interface QuickActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
}

export default function QuickActionBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
}: QuickActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-lg"
        >
          <div
            className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 px-4 py-3 flex items-center justify-between gap-3 shadow-xl"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={onClearSelection}
                className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
                aria-label="Clear selection"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50">
                {selectedCount} <span className="font-normal text-warm-500">selected</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBulkExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900/30 active:scale-95 transition-all min-h-[36px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export
              </button>
              <button
                onClick={onBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all min-h-[36px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
