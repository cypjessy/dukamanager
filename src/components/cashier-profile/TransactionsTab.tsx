"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CashierTransaction, CashierRefund } from "@/hooks/useCashierLiveData";

interface TransactionsTabProps {
  transactions: CashierTransaction[];
  refunds: CashierRefund[];
  locale: string;
  selectedDate?: string;
}

type PaymentFilter = "all" | "mpesa" | "cash" | "credit" | "bank";
type ViewMode = "sales" | "refunds";

const methodConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  mpesa: { icon: "📱", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "M-Pesa" },
  cash: { icon: "💵", color: "text-forest-600", bg: "bg-forest-50 dark:bg-forest-900/20", label: "Cash" },
  credit: { icon: "🏦", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Credit" },
  bank: { icon: "🏧", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", label: "Bank" },
  split: { icon: "🔀", color: "text-savanna-600", bg: "bg-savanna-50 dark:bg-savanna-900/20", label: "Split" },
};

export function TransactionsTab({ transactions, refunds, locale, selectedDate }: TransactionsTabProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("sales");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dateFilter = selectedDate || new Date().toISOString().slice(0, 10);

  const filteredTransactions = useMemo(() => {
    let txns = transactions;
    if (paymentFilter !== "all") {
      txns = txns.filter((txn) => txn.method === paymentFilter);
    }
    return txns;
  }, [transactions, paymentFilter]);

  const stats = useMemo(() => {
    const dateTxns = transactions.filter((txn) => txn.timestamp?.startsWith(dateFilter));
    const dateRefunds = refunds.filter((r) => r.timestamp?.startsWith(dateFilter));

    const byMethod: Record<string, { count: number; total: number }> = {};
    dateTxns.forEach((txn) => {
      const m = txn.method || "cash";
      if (!byMethod[m]) byMethod[m] = { count: 0, total: 0 };
      byMethod[m].count += 1;
      byMethod[m].total += txn.total;
    });

    return {
      todayCount: dateTxns.length,
      todayTotal: dateTxns.reduce((s, txn) => s + txn.total, 0),
      todayRefundCount: dateRefunds.length,
      todayRefundTotal: dateRefunds.reduce((s, r) => s + r.amount, 0),
      byMethod,
    };
  }, [transactions, refunds, dateFilter]);

  const formatTime = (ts: string) => {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (ts: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      const today = new Date().toISOString().slice(0, 10);
      const dateStr = ts.slice(0, 10);
      if (dateStr === today) return t("Today", "Leo");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dateStr === yesterday.toISOString().slice(0, 10)) return t("Yesterday", "Jana");
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: t("Today Sales", "Mauzo Leo"), value: `KSh ${(stats.todayTotal / 1000).toFixed(1)}k`, sub: `${stats.todayCount} ${t("txns", "miamala")}`, color: "text-terracotta-600" },
          { label: t("M-Pesa", "M-Pesa"), value: `KSh ${((stats.byMethod.mpesa?.total || 0) / 1000).toFixed(1)}k`, sub: `${stats.byMethod.mpesa?.count || 0}`, color: "text-green-600" },
          { label: t("Cash", "Pesa"), value: `KSh ${((stats.byMethod.cash?.total || 0) / 1000).toFixed(1)}k`, sub: `${stats.byMethod.cash?.count || 0}`, color: "text-forest-600" },
          { label: t("Refunds", "Kurudisha"), value: `KSh ${(stats.todayRefundTotal / 1000).toFixed(1)}k`, sub: `${stats.todayRefundCount}`, color: "text-red-500" },
        ].map((card) => (
          <div key={card.label} className="p-2 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className={`text-xs font-heading font-extrabold ${card.color} tabular-nums`}>{card.value}</p>
            <p className="text-[8px] text-warm-500">{card.label}</p>
            <p className="text-[7px] text-warm-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 w-fit">
        <button
          onClick={() => setViewMode("sales")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all min-h-[28px] ${
            viewMode === "sales" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"
          }`}
        >
          {t("Sales", "Mauzo")} ({transactions.length})
        </button>
        <button
          onClick={() => setViewMode("refunds")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all min-h-[28px] ${
            viewMode === "refunds" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"
          }`}
        >
          {t("Refunds", "Kurudisha")} ({refunds.length})
        </button>
      </div>

      {/* Payment method filter chips (only for sales) */}
      {viewMode === "sales" && (
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {(["all", "mpesa", "cash", "credit", "bank"] as PaymentFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPaymentFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors min-h-[26px] flex items-center gap-1 ${
                paymentFilter === f ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"
              }`}
            >
              {f !== "all" && <span>{methodConfig[f]?.icon}</span>}
              {f === "all" ? t("All", "Yote") : methodConfig[f]?.label || f}
            </button>
          ))}
        </div>
      )}

      {/* Transactions / Refunds list */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="max-h-[500px] overflow-y-auto hide-scrollbar">
          <AnimatePresence initial={false}>
            {viewMode === "sales" ? (
              filteredTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <p className="text-sm text-warm-400">{t("No transactions found", "Hakuna miamala")}</p>
                </div>
              ) : (
                filteredTransactions.slice(0, 100).map((txn, i) => {
                  const mc = methodConfig[txn.method] || methodConfig.cash;
                  const isExpanded = expandedId === txn.id;
                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : txn.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-warm-100/60 dark:border-warm-800/40 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg ${mc.bg} flex items-center justify-center flex-shrink-0 text-sm`}>
                          {mc.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mc.bg} ${mc.color} uppercase`}>{mc.label}</span>
                            {txn.status === "refunded" && (
                              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">{t("Refunded", "Imerejeshwa")}</span>
                            )}
                            {txn.receiptCode && (
                              <span className="text-[8px] text-warm-400 font-mono">{txn.receiptCode}</span>
                            )}
                          </div>
                          <p className="text-[9px] text-warm-400 mt-0.5">
                            {txn.items.length} {t("items", "bidhaa")}
                            {txn.items.length > 0 && ` · ${txn.items.map(i => i.name).slice(0, 2).join(", ")}${txn.items.length > 2 ? "..." : ""}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {txn.total.toLocaleString()}</p>
                          <p className="text-[9px] text-warm-400 tabular-nums">{formatDate(txn.timestamp)} · {formatTime(txn.timestamp)}</p>
                        </div>
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`text-warm-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-2 bg-warm-50/80 dark:bg-warm-800/30 border-b border-warm-100/60 dark:border-warm-800/40">
                              <div className="space-y-1">
                                {txn.items.map((item, j) => (
                                  <div key={j} className="flex items-center justify-between text-[10px]">
                                    <span className="text-warm-600 dark:text-warm-400">{item.qty}x {item.name}</span>
                                    <span className="text-warm-900 dark:text-warm-50 font-medium tabular-nums">KSh {(item.qty * item.price).toLocaleString()}</span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-warm-200/40 dark:border-warm-700/40">
                                  <span className="font-bold text-warm-700 dark:text-warm-300">{t("Total", "Jumla")}</span>
                                  <span className="font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {txn.total.toLocaleString()}</span>
                                </div>
                              </div>
                              {txn.receiptCode && (
                                <p className="text-[9px] text-warm-400 mt-1.5 font-mono">{t("Receipt", "Risiti")}: {txn.receiptCode}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )
            ) : (
              refunds.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400">
                      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </div>
                  <p className="text-sm text-warm-400">{t("No refunds found", "Hakuna kurudisha")}</p>
                </div>
              ) : (
                refunds.slice(0, 100).map((refund, i) => (
                  <motion.div
                    key={refund.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 border-b border-warm-100/60 dark:border-warm-800/40"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-sm">
                      ↩️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 uppercase">{t("Refund", "Kurudisha")}</span>
                      </div>
                      <p className="text-[10px] text-warm-500 truncate mt-0.5">{refund.details}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-heading font-bold text-red-500 tabular-nums">-KSh {refund.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-warm-400 tabular-nums">{formatDate(refund.timestamp)} · {formatTime(refund.timestamp)}</p>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
