"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SaveState } from "@/types/cashier";

interface AutoSaveIndicatorProps {
  saveState: SaveState;
  onManualSave: () => void;
  hasItems: boolean;
}

export default function AutoSaveIndicator({ saveState, onManualSave, hasItems }: AutoSaveIndicatorProps) {
  const { isSaving, lastSaved, error } = saveState;

  const getSavedText = () => {
    if (!lastSaved) return null;
    const saved = new Date(lastSaved);
    const seconds = Math.floor((Date.now() - saved.getTime()) / 1000);
    if (seconds < 10) return "Saved just now";
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Saved ${minutes}m ago`;
    return `Saved ${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Auto-save status */}
      <AnimatePresence mode="wait">
        {isSaving && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-savanna-50 dark:bg-savanna-900/15"
          >
            <div className="w-3 h-3 rounded-full border-2 border-savanna-500 border-t-transparent animate-spin" />
            <span className="text-[9px] font-medium text-savanna-600">Saving...</span>
          </motion.div>
        )}
        {!isSaving && lastSaved && !error && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-forest-50 dark:bg-forest-900/15"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-forest-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[9px] font-medium text-forest-600">{getSavedText()}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/15"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-[9px] font-medium text-red-500">Save failed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual save button (Hifadhi Muda) */}
      {hasItems && (
        <button
          onClick={onManualSave}
          disabled={isSaving}
          title="Hifadhi Muda - Save Progress"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors min-h-[28px] disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span className="text-[9px] font-medium">Save</span>
        </button>
      )}
    </div>
  );
}
