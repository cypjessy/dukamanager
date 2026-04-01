"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface BonusModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  cashierName: string;
  onAward: (cashierId: string, amount: number, reason: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function BonusModal({ locale, isOpen, onClose, cashierName, onAward }: BonusModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [awarding, setAwarding] = useState(false);

  const handleAward = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    setAwarding(true);
    try {
      onAward("", numAmount, reason);
      setAmount("");
      setReason("");
      onClose();
    } finally {
      setAwarding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-2xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">
                  {t("Award Bonus", "Toa Bonasi", locale)} — {cashierName}
                </h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="mb-3">
                <label className="text-xs font-medium text-warm-500 mb-1 block">{t("Amount (KSh)", "Kiasi (KSh)", locale)}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-savanna-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className="px-2.5 py-1 rounded-lg bg-savanna-50 dark:bg-savanna-900/20 text-savanna-600 dark:text-savanna-400 text-xs font-medium hover:bg-savanna-100 dark:hover:bg-savanna-900/30 transition-colors"
                    >
                      KSh {a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-warm-500 mb-1 block">{t("Reason", "Sababu", locale)}</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("e.g. Excellent performance", "mf. Utendaji mzuri", locale)}
                  className="w-full px-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-savanna-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors"
                >
                  {t("Cancel", "Ghairi", locale)}
                </button>
                <button
                  onClick={handleAward}
                  disabled={!amount || Number(amount) <= 0 || awarding}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-savanna-500 text-white text-sm font-medium hover:bg-savanna-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {awarding ? t("Awarding...", "Inatoa...", locale) : t("Award Bonus", "Toa Bonasi", locale)}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
