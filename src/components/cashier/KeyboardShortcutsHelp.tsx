"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "F1", label: "Search products", labelSw: "Tafuta bidhaa" },
  { key: "F2", label: "New sale", labelSw: "Mauzo mapya" },
  { key: "F3", label: "Hold sale", labelSw: "Simamisha mauzo" },
  { key: "F4", label: "Print receipt", labelSw: "Chapisha risiti" },
  { key: "F5", label: "M-Pesa payment", labelSw: "Malipo ya M-Pesa" },
  { key: "F6", label: "Cash payment", labelSw: "Malipo ya pesa taslimu" },
  { key: "F7", label: "Park sale", labelSw: "Hifadhi mauzo" },
  { key: "F8", label: "Refund", labelSw: "Rudisha pesa" },
  { key: "Esc", label: "Clear cart", labelSw: "Futa kikapu" },
  { key: "Enter", label: "Complete sale", labelSw: "Kamilisha mauzo" },
  { key: "Ctrl+/", label: "Show shortcuts", labelSw: "Onyesha njia za mkato" },
];

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl border border-warm-200/60 dark:border-warm-700/60 p-6 w-full max-w-[420px] max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Keyboard Shortcuts</h2>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
                {SHORTCUTS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800/50 transition-colors">
                    <span className="text-sm text-warm-700 dark:text-warm-300">{s.label}</span>
                    <kbd className="px-2 py-1 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-xs font-mono font-bold border border-warm-200 dark:border-warm-700 min-w-[32px] text-center">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
