"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction, PaymentMethod } from "@/data/salesData";
import type { Locale } from "@/types";

interface TransactionHistoryProps {
  transactions: Transaction[];
  locale: Locale;
  paymentFilter: PaymentMethod | "all";
}

const methodConfig: Record<PaymentMethod, { color: string; label: string; labelSw: string; icon: React.ReactNode }> = {
  mpesa: { color: "bg-[#00A650]", label: "M-Pesa", labelSw: "M-Pesa", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  cash: { color: "bg-savanna-500", label: "Cash", labelSw: "Pesa", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  credit: { color: "bg-sunset-400", label: "Credit", labelSw: "Mkopo", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
  bank: { color: "bg-forest-500", label: "Bank", labelSw: "Benki", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
};

const statusColors = {
  completed: "bg-forest-500",
  pending: "bg-savanna-500",
  voided: "bg-red-500",
  refunded: "bg-warm-400",
};

export default function TransactionHistory({ transactions, locale, paymentFilter }: TransactionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    if (paymentFilter === "all") return transactions;
    return transactions.filter((t) => t.method === paymentFilter);
  }, [transactions, paymentFilter]);

  const paginated = filtered.slice(0, page * pageSize);
  const hasMore = paginated.length < filtered.length;

  const totalRevenue = filtered.filter((t) => t.status === "completed").reduce((s, t) => s + t.total, 0);
  const avgBasket = filtered.length > 0 ? Math.round(totalRevenue / filtered.filter((t) => t.status === "completed").length) : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {locale === "sw" ? "Miamala" : "Transactions"}
        </h3>
        <span className="text-xs text-warm-400 tabular-nums">{filtered.length} total</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200/40 dark:border-warm-700/40 p-2.5 text-center">
          <p className="text-[10px] text-warm-400">{locale === "sw" ? "Mauzo" : "Revenue"}</p>
          <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {(totalRevenue / 1000).toFixed(1)}k</p>
        </div>
        <div className="rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200/40 dark:border-warm-700/40 p-2.5 text-center">
          <p className="text-[10px] text-warm-400">{locale === "sw" ? "Idadi" : "Count"}</p>
          <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{filtered.filter((t) => t.status === "completed").length}</p>
        </div>
        <div className="rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200/40 dark:border-warm-700/40 p-2.5 text-center">
          <p className="text-[10px] text-warm-400">{locale === "sw" ? "Wastani" : "Avg"}</p>
          <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {avgBasket.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {paginated.map((txn) => {
          const mc = methodConfig[txn.method];
          const isExpanded = expandedId === txn.id;

          return (
            <motion.div key={txn.id} layout className="rounded-xl border border-warm-200/40 dark:border-warm-700/40 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : txn.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors min-h-[52px]"
              >
                <div className={`w-8 h-8 rounded-lg ${mc.color} flex items-center justify-center text-white flex-shrink-0`}>{mc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{txn.customer}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[txn.status]}`} />
                  </div>
                  <p className="text-[10px] text-warm-400 tabular-nums">{txn.id} &middot; {txn.items.length} items &middot; {txn.time}</p>
                </div>
                <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums flex-shrink-0">
                  KSh {txn.total.toLocaleString()}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-warm-200/30 dark:border-warm-700/30 pt-2">
                      <div className="text-xs space-y-1">
                        {txn.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-warm-600 dark:text-warm-300">
                            <span>{item.name} x{item.qty}</span>
                            <span className="tabular-nums">KSh {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold text-warm-900 dark:text-warm-50 pt-1 border-t border-warm-200/30 dark:border-warm-700/30">
                          <span>Total</span>
                          <span className="tabular-nums">KSh {txn.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-warm-400">
                        <span>{locale === "sw" ? mc.labelSw : mc.label}</span>
                        {txn.mpesaRef && <span>Ref: {txn.mpesaRef}</span>}
                        {txn.cashTendered && <span>Tendered: KSh {txn.cashTendered.toLocaleString()}</span>}
                        {txn.changeDue && <span>Change: KSh {txn.changeDue.toLocaleString()}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {hasMore && (
          <button onClick={() => setPage((p) => p + 1)}
            className="w-full py-3 rounded-xl bg-warm-100/60 dark:bg-warm-800/60 text-sm font-medium text-warm-600 dark:text-warm-300 hover:bg-warm-200/60 dark:hover:bg-warm-700/60 transition-colors min-h-[44px]">
            {locale === "sw" ? "Onyesha zaidi" : "Load more"}
          </button>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm">
            {locale === "sw" ? "Hakuna miamala" : "No transactions found"}
          </div>
        )}
      </div>
    </div>
  );
}
