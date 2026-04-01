"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { AdminSale } from "@/hooks/useSalesData";

interface LiveSalesFeedProps {
  locale: Locale;
  sales: AdminSale[];
  cashierNames: string[];
  cashierColors: string[];
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function LiveSalesFeed({ locale, sales, cashierNames, cashierColors }: LiveSalesFeedProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [filterCashier, setFilterCashier] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterAmountMin, setFilterAmountMin] = useState("");
  const [filterAmountMax, setFilterAmountMax] = useState("");
  const [hoveredSale, setHoveredSale] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedSales = useMemo(() => sales.filter((s) => s.status === "completed"), [sales]);

  const filteredSales = useMemo(() => {
    return completedSales.filter((s) => {
      if (filterCashier && s.cashierId !== filterCashier) return false;
      if (filterMethod && s.method !== filterMethod) return false;
      if (filterAmountMin && s.total < Number(filterAmountMin)) return false;
      if (filterAmountMax && s.total > Number(filterAmountMax)) return false;
      return true;
    });
  }, [completedSales, filterCashier, filterMethod, filterAmountMin, filterAmountMax]);

  const displaySales = paused ? filteredSales.slice(0, 50) : filteredSales.slice(0, 50);

  useEffect(() => {
    if (autoScroll && !paused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [displaySales.length, autoScroll, paused]);

  const getRelativeTime = useCallback((timestamp: string) => {
    const now = new Date();
    const saleTime = new Date(timestamp);
    const diffMs = now.getTime() - saleTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t("just now", "sasa hivi", locale);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return saleTime.toLocaleDateString();
  }, [locale]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "mpesa": return "text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/20";
      case "cash": return "text-terracotta-600 dark:text-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/20";
      case "credit": return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
      case "bank": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      default: return "text-warm-600 dark:text-warm-400 bg-warm-50 dark:bg-warm-900/20";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        );
      case "cash":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case "credit":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case "bank":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const uniqueCashiers = useMemo(() => {
    const seen = new Set<string>();
    return completedSales.filter((s) => {
      if (seen.has(s.cashierId)) return false;
      seen.add(s.cashierId);
      return true;
    });
  }, [completedSales]);

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="p-4 border-b border-warm-200/60 dark:border-warm-700/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Live Sales Feed", "Mauzo ya Moja kwa Moja", locale)}
            </h3>
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
            <span className="text-xs text-warm-400">{completedSales.length} {t("sales", "mauzo", locale)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-1 rounded-lg text-xs font-medium min-h-[28px] ${
                autoScroll
                  ? "bg-forest-50 dark:bg-forest-900/20 text-forest-600"
                  : "bg-warm-100 dark:bg-warm-800 text-warm-500"
              }`}
            >
              {autoScroll ? t("Auto-scroll ON", "Auto-scroll ON", locale) : t("Auto-scroll OFF", "Auto-scroll OFF", locale)}
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className={`px-2 py-1 rounded-lg text-xs font-medium min-h-[28px] ${
                paused
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  : "bg-warm-100 dark:bg-warm-800 text-warm-500"
              }`}
            >
              {paused ? t("Resume", "Endelea", locale) : t("Pause", "Simamisha", locale)}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCashier}
            onChange={(e) => setFilterCashier(e.target.value)}
            className="px-2 py-1 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-xs text-warm-700 dark:text-warm-300 min-h-[32px]"
          >
            <option value="">{t("All Cashiers", "Wote", locale)}</option>
            {uniqueCashiers.map((c) => (
              <option key={c.cashierId} value={c.cashierId}>{c.cashierName}</option>
            ))}
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-2 py-1 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-xs text-warm-700 dark:text-warm-300 min-h-[32px]"
          >
            <option value="">{t("All Methods", "Njia Zote", locale)}</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">{t("Cash", "Pesa Taslimu", locale)}</option>
            <option value="credit">{t("Credit", "Mkopo", locale)}</option>
            <option value="bank">{t("Bank", "Benki", locale)}</option>
          </select>

          <input
            type="number"
            placeholder={t("Min KSh", "KSh Chini", locale)}
            value={filterAmountMin}
            onChange={(e) => setFilterAmountMin(e.target.value)}
            className="w-24 px-2 py-1 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-xs text-warm-700 dark:text-warm-300 min-h-[32px]"
          />
          <input
            type="number"
            placeholder={t("Max KSh", "KSh Juu", locale)}
            value={filterAmountMax}
            onChange={(e) => setFilterAmountMax(e.target.value)}
            className="w-24 px-2 py-1 rounded-lg border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 text-xs text-warm-700 dark:text-warm-300 min-h-[32px]"
          />
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {displaySales.map((sale) => {
            const cashierIdx = cashierNames.indexOf(sale.cashierName || "");
            const avatarColor = cashierIdx >= 0 ? cashierColors[cashierIdx] : "#888";

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-3 border-b border-warm-100 dark:border-warm-800/60 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors cursor-pointer relative"
                onMouseEnter={() => setHoveredSale(sale.id)}
                onMouseLeave={() => setHoveredSale(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {(sale.cashierName || "U").charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">
                          {sale.cashierName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getMethodColor(sale.method)} flex items-center gap-1`}>
                          {getMethodIcon(sale.method)}
                          {sale.method.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                        KSh {sale.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-[10px] text-warm-400">
                        <span>{getRelativeTime(sale.timestamp)}</span>
                        <span>•</span>
                        <span>{sale.items.length} {t("items", "bidhaa", locale)}</span>
                        <span>•</span>
                        <span className={sale.customerType === "registered" ? "text-forest-500" : ""}>
                          {sale.customerType === "registered" ? t("Registered", "Imesajiliwa", locale) : t("Walk-in", "Mgeni", locale)}
                        </span>
                      </div>
                      {sale.discount && sale.discount > 0 && (
                        <span className="text-[10px] text-amber-500 font-medium">
                          -KSh {sale.discount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {hoveredSale === sale.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 right-0 bottom-0 z-10 p-3 bg-white dark:bg-warm-800 border-t border-warm-200 dark:border-warm-700 shadow-lg rounded-b-xl"
                    >
                      <p className="text-[10px] font-bold text-warm-500 uppercase mb-1">{t("Items", "Bidhaa", locale)}</p>
                      <div className="space-y-0.5">
                        {sale.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-warm-700 dark:text-warm-300">{item.name} × {item.qty}</span>
                            <span className="text-warm-900 dark:text-warm-50 font-medium">KSh {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      {sale.receiptCode && (
                        <p className="text-[10px] text-warm-400 mt-2">
                          {t("Receipt", "Risiti", locale)}: {sale.receiptCode}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displaySales.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-warm-400">{t("No sales match filters", "Hakuna mauzo yanayolingana", locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
