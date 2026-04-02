"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { CashierMetrics } from "@/hooks/useSalesData";

interface CashierReportModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  cashier: CashierMetrics | null;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function CashierReportModal({ locale, isOpen, onClose, cashier }: CashierReportModalProps) {
  if (!cashier) return null;

  const dayLabels = ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "Yesterday", "Today"];
  const maxTrend = Math.max(...cashier.sevenDayTrend, 1);

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
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: cashier.cashierAvatar }}
                  >
                    {cashier.cashierName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">{cashier.cashierName}</h3>
                    <p className="text-xs text-warm-400">{t("Detailed Report", "Ripoti Kamili", locale)}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
                  <p className="text-[10px] text-warm-400">{t("Transactions", "Miamala", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{cashier.transactions}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
                  <p className="text-[10px] text-warm-400">{t("Revenue", "Mapato", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {cashier.revenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
                  <p className="text-[10px] text-warm-400">{t("Avg Sale", "Wastani", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {cashier.avgSale.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
                  <p className="text-[10px] text-warm-400">{t("Refunds", "Rejesho", locale)}</p>
                  <p className={`text-lg font-bold ${cashier.refunds > 0 ? "text-red-500" : "text-forest-500"}`}>{cashier.refunds}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-warm-500 mb-2">{t("7-Day Trend", "Mwelekeo wa Siku 7", locale)}</p>
                <div className="flex items-end gap-2 h-24">
                  {cashier.sevenDayTrend.map((val, i) => {
                    const height = Math.max(8, (val / maxTrend) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-warm-400">{val > 0 ? `K${(val / 1000).toFixed(1)}k` : "—"}</span>
                        <div
                          className="w-full rounded-t-sm"
                          style={{ height: `${height}%`, backgroundColor: cashier.cashierAvatar, opacity: 0.4 + (i / 7) * 0.6 }}
                        />
                        <span className="text-[8px] text-warm-400">{dayLabels[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("Voids", "Batili", locale)}</p>
                  <p className={`text-lg font-bold ${cashier.voids > 0 ? "text-amber-500" : "text-forest-500"}`}>{cashier.voids}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("vs Personal Avg", "Dhidi ya Wastani", locale)}</p>
                  <p className={`text-lg font-bold ${cashier.avgSale >= cashier.personalAvg ? "text-forest-500" : "text-red-500"}`}>
                    {cashier.avgSale >= cashier.personalAvg ? "+" : ""}{cashier.avgSale - cashier.personalAvg} KSh
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors"
              >
                {t("Close", "Funga", locale)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
