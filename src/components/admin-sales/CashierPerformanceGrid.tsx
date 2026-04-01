"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { CashierMetrics } from "@/hooks/useSalesData";

interface CashierPerformanceGridProps {
  locale: Locale;
  cashiers: CashierMetrics[];
  onMessage?: (cashierId: string, cashierName: string) => void;
  onViewReport?: (cashierId: string) => void;
  onBonus?: (cashierId: string, cashierName: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function CashierPerformanceGrid({ locale, cashiers, onMessage, onViewReport, onBonus }: CashierPerformanceGridProps) {
  const [expandedCashier, setExpandedCashier] = useState<string | null>(null);

  const formatTime = (iso?: string) => {
    if (!iso) return "--";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {t("Cashier Leaderboard", "Ubao wa Mhasibu", locale)}
          </h3>
          <p className="text-xs text-warm-400 mt-0.5">
            {t("Performance ranked by revenue", "Utendaji uliopangwa kwa mapato", locale)}
          </p>
        </div>
        <span className="text-xs text-warm-400">{cashiers.length} {t("cashiers", "mhasibu", locale)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {cashiers.map((cashier, idx) => (
          <motion.div
            key={cashier.cashierId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-warm-200/40 dark:border-warm-700/40 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.5)" }}
          >
            <div
              className="p-3 cursor-pointer hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors"
              onClick={() => setExpandedCashier(expandedCashier === cashier.cashierId ? null : cashier.cashierId)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: cashier.cashierAvatar }}
                  >
                    {cashier.cashierName.charAt(0)}
                  </div>
                  {cashier.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-forest-500 border-2 border-white dark:border-warm-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">
                      {idx === 0 ? "🥇 " : idx === 1 ? "🥈 " : idx === 2 ? "🥉 " : ""}{cashier.cashierName}
                    </p>
                    {!cashier.isOnline && (
                      <span className="text-[10px] text-warm-400">{t("Offline", "Nje", locale)}</span>
                    )}
                  </div>

                  {cashier.shiftStart && (
                    <p className="text-[10px] text-warm-400">
                      {t("Shift start", "Mwanzo wa shift", locale)}: {formatTime(cashier.shiftStart)}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-[10px] text-warm-400">{t("Txns", "Miamala", locale)}</p>
                      <p className="text-sm font-bold text-warm-900 dark:text-warm-50">{cashier.transactions}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-warm-400">{t("Revenue", "Mapato", locale)}</p>
                      <p className="text-sm font-bold text-warm-900 dark:text-warm-50">KSh {cashier.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-warm-400">{t("Avg", "Wastani", locale)}</p>
                      <p className="text-sm font-bold text-warm-900 dark:text-warm-50">KSh {cashier.avgSale.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-warm-400 mb-1">
                      <span>{t("7-day trend", "Mwelekeo wa siku 7", locale)}</span>
                      <span className={cashier.avgSale >= cashier.personalAvg ? "text-forest-500" : "text-red-500"}>
                        {cashier.avgSale >= cashier.personalAvg ? "↑" : "↓"} {cashier.personalAvg > 0 ? Math.round(((cashier.avgSale - cashier.personalAvg) / cashier.personalAvg) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8">
                      {cashier.sevenDayTrend.map((val, i) => {
                        const max = Math.max(...cashier.sevenDayTrend, 1);
                        const height = Math.max(4, (val / max) * 100);
                        return (
                          <div key={i} className="flex-1 rounded-sm" style={{ height: `${height}%`, backgroundColor: cashier.cashierAvatar, opacity: 0.3 + (i / 7) * 0.7 }} />
                        );
                      })}
                    </div>
                  </div>

                  {(cashier.refunds > 0 || cashier.voids > 0) && (
                    <div className="flex items-center gap-2 mt-2 text-[10px]">
                      {cashier.refunds > 0 && (
                        <span className="text-red-500">{cashier.refunds} {t("refunds", "marejesho", locale)}</span>
                      )}
                      {cashier.voids > 0 && (
                        <span className="text-amber-500">{cashier.voids} {t("voids", "batili", locale)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedCashier === cashier.cashierId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-warm-200/40 dark:border-warm-700/40"
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-warm-500">{t("Performance vs average", "Utendaji dhidi ya wastani", locale)}</span>
                      <span className={`text-xs font-bold ${cashier.avgSale >= cashier.personalAvg ? "text-forest-500" : "text-red-500"}`}>
                        {cashier.avgSale >= cashier.personalAvg ? "+" : ""}{cashier.avgSale - cashier.personalAvg} KSh
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onMessage?.(cashier.cashierId, cashier.cashierName); }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 transition-colors"
                      >
                        {t("Message", "Ujumbe", locale)}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewReport?.(cashier.cashierId); }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 text-xs font-medium hover:bg-forest-100 dark:hover:bg-forest-900/30 transition-colors"
                      >
                        {t("Detailed Report", "Ripoti Kamili", locale)}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onBonus?.(cashier.cashierId, cashier.cashierName); }}
                        className="px-3 py-1.5 rounded-lg bg-savanna-50 dark:bg-savanna-900/20 text-savanna-600 dark:text-savanna-400 text-xs font-medium hover:bg-savanna-100 dark:hover:bg-savanna-900/30 transition-colors"
                      >
                        {t("Bonus", "Bonasi", locale)}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
