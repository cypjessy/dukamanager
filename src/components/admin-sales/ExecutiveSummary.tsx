"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { Period } from "@/hooks/useSalesData";

interface ExecutiveSummaryProps {
  locale: Locale;
  todayTotal: number;
  yesterdayTotal: number;
  trendPercent: number;
  transactionCount: number;
  totalItemsSold: number;
  avgBasketValue: number;
  profitMargin: number;
  activeCashiers: number;
  period: string;
  onPeriodChange: (p: Period) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onCustomDateRange?: (start: string, end: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function ExecutiveSummary({
  locale,
  todayTotal,
  yesterdayTotal,
  trendPercent,
  transactionCount,
  totalItemsSold,
  avgBasketValue,
  profitMargin,
  activeCashiers,
  period,
  onPeriodChange,
  onExportPDF,
  onExportExcel,
  onCustomDateRange,
}: ExecutiveSummaryProps) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const prevTotalRef = useRef(0);

  useEffect(() => {
    if (prevTotalRef.current === todayTotal) return;
    const start = prevTotalRef.current;
    const end = todayTotal;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotal(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevTotalRef.current = todayTotal;
  }, [todayTotal]);

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd && onCustomDateRange) {
      onCustomDateRange(customStart, customEnd);
      setShowCustomPicker(false);
    }
  }, [customStart, customEnd, onCustomDateRange]);

  const periods = [
    { key: "today", label: t("Today", "Leo", locale) },
    { key: "yesterday", label: t("Yesterday", "Jana", locale) },
    { key: "week", label: t("This Week", "Wiki Hii", locale) },
    { key: "month", label: t("This Month", "Mwezi Huu", locale) },
    { key: "custom", label: t("Custom", "Maalum", locale) },
  ];

  const metrics = [
    {
      label: t("Transactions", "Miamala", locale),
      value: transactionCount.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: "terracotta" as const,
    },
    {
      label: t("Items Sold", "Bidhaa Zilizouzwa", locale),
      value: totalItemsSold.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      color: "sunset" as const,
    },
    {
      label: t("Avg Basket", "Wastani wa Kikapu", locale),
      value: `KSh ${avgBasketValue.toLocaleString()}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      color: "forest" as const,
    },
    {
      label: t("Profit Margin", "Ukingo wa Faida", locale),
      value: `${profitMargin}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      color: "savanna" as const,
    },
    {
      label: t("Active Cashiers", "Mhasibu Aktivu", locale),
      value: activeCashiers.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "terracotta" as const,
      isOnline: true,
    },
  ];

  const colorMap = {
    terracotta: { icon: "bg-terracotta-100 dark:bg-terracotta-800/40 text-terracotta-600 dark:text-terracotta-400" },
    sunset: { icon: "bg-sunset-100 dark:bg-sunset-800/40 text-sunset-500 dark:text-sunset-400" },
    forest: { icon: "bg-forest-100 dark:bg-forest-800/40 text-forest-500 dark:text-forest-400" },
    savanna: { icon: "bg-savanna-100 dark:bg-savanna-800/40 text-savanna-600 dark:text-savanna-400" },
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-6"
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <p className="text-sm text-warm-500 dark:text-warm-400 font-medium">
                {t("Today's Sales", "Mauzo ya Leo", locale)}
              </p>
              <p className="font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums" style={{ fontSize: "48px" }}>
                KSh {animatedTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                trendPercent >= 0
                  ? "bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              }`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {trendPercent >= 0 ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
                {Math.abs(trendPercent)}%
              </span>
              <span className="text-xs text-warm-400">
                {t("vs yesterday", "dhidi ya jana", locale)} (KSh {yesterdayTotal.toLocaleString()})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    if (p.key === "custom") {
                      setShowCustomPicker(!showCustomPicker);
                    } else {
                      onPeriodChange(p.key as Period);
                      setShowCustomPicker(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[32px] ${
                    period === p.key
                      ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                      : "text-warm-500 dark:text-warm-400 hover:text-warm-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={onExportPDF}
              className="px-3 py-1.5 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 transition-colors min-h-[32px] flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              PDF
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 text-xs font-medium hover:bg-forest-100 dark:hover:bg-forest-900/30 transition-colors min-h-[32px] flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCustomPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200/60 dark:border-warm-700/60">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50"
                />
                <span className="text-xs text-warm-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50"
                />
                <button
                  onClick={handleCustomApply}
                  className="px-4 py-1.5 rounded-lg bg-terracotta-500 text-white text-xs font-medium hover:bg-terracotta-600 transition-colors"
                >
                  {t("Apply", "Tumia", locale)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-warm-200/40 dark:border-warm-700/40 p-3"
              style={{ background: "rgba(255,255,255,0.5)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-warm-500 dark:text-warm-400 font-medium truncate">
                    {m.label}
                  </p>
                  <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
                    {m.value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[m.color].icon}`}>
                  {m.icon}
                </div>
              </div>
              {m.isOnline && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
                  <span className="text-[10px] text-forest-500 font-medium">{t("online", "mtandaoni", locale)}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
