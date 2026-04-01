"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface DiscountSuggestionModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  suggestedPercent: number;
  onApply: (productId: string, percent: number) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function DiscountSuggestionModal({ locale, isOpen, onClose, productName, suggestedPercent, onApply }: DiscountSuggestionModalProps) {
  const [percent, setPercent] = useState(suggestedPercent);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">{t("Suggest Discount", "Pendekeza Punguzo", locale)}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 mb-4">
                <p className="text-sm text-warm-700 dark:text-warm-300">{productName}</p>
                <p className="text-xs text-warm-400 mt-1">{t("AI-suggested discount based on slow sales velocity", "Punguzo linalopendekezwa kulingana na mauzo ya polepole", locale)}</p>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-warm-500 mb-1 block">{t("Discount Percentage", "Asilimia ya Punguzo", locale)}</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="5" max="50" step="5" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="flex-1" />
                  <span className="text-lg font-bold text-amber-600 w-14 text-center">{percent}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">{t("Cancel", "Ghairi", locale)}</button>
                <button onClick={() => { onApply("", percent); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors">{t("Apply Discount", "Tumia Punguzo", locale)}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
