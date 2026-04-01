"use client";

import { motion } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";

interface Transaction {
  id: string;
  customer: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  method: string;
  status: string;
  time: string;
  cashier: string;
}

interface RecentTransactionsProps {
  locale: Locale;
  transactions: Transaction[];
}

const methodColors: Record<string, string> = {
  mpesa: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  cash: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  credit: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400",
  bank: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
};

const statusColors: Record<string, string> = {
  completed: "bg-forest-500",
  pending: "bg-savanna-500",
  failed: "bg-red-500",
};

const methodIcons: Record<string, React.ReactNode> = {
  mpesa: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  cash: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  credit: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  bank: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  ),
};

export default function RecentTransactions({ locale, transactions }: RecentTransactionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="p-4 border-b border-warm-100/60 dark:border-warm-800/60">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {dt("recentTransactions", locale)}
          </h3>
          <a href="/dashboard/sales" className="text-xs text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors">
            {locale === "sw" ? "Tazama Zote" : "View All"} →
          </a>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto scroll-container">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-warm-100/40 dark:border-warm-800/40 last:border-0 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${methodColors[transaction.method] || "bg-warm-100 text-warm-500"}`}>
                  {methodIcons[transaction.method] || (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">
                    {transaction.customer}
                  </p>
                  <p className="text-xs text-warm-400 dark:text-warm-500 truncate">
                    {transaction.items.length > 0
                      ? transaction.items.slice(0, 2).map((item) => `${item.name} x${item.qty}`).join(", ") +
                        (transaction.items.length > 2 ? ` +${transaction.items.length - 2} more` : "")
                      : locale === "sw" ? "Hakuna bidhaa" : "No items"}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                  KSh {transaction.total.toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors[transaction.status] || "bg-warm-300"}`} />
                  <span className="text-[10px] text-warm-400 tabular-nums">{transaction.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna miamala bado" : "No transactions yet"}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
