"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { Expense, ExpenseCategory, PaymentMethod, ExpenseStatus } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";
import type { Locale } from "@/types";

interface ExpenseLedgerProps {
  expenses: Expense[];
  locale: Locale;
  searchQuery: string;
  categoryFilter: ExpenseCategory | "all";
  paymentFilter: PaymentMethod | "all";
  statusFilter: ExpenseStatus | "all";
  onEdit: (expense: Expense) => void;
}

const methodIcons: Record<PaymentMethod, string> = {
  cash: "💵", mpesa: "📲", bank: "🏦", mobile_banking: "📱",
};

const statusConfig: Record<ExpenseStatus, { label: string; labelSw: string; color: string }> = {
  draft: { label: "Draft", labelSw: "Rasimu", color: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300" },
  pending: { label: "Pending", labelSw: "Inasubiri", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400" },
  approved: { label: "Approved", labelSw: "Imeidhinishwa", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400" },
  rejected: { label: "Rejected", labelSw: "Imekataliwa", color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  reimbursed: { label: "Reimbursed", labelSw: "Imerejeshwa", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400" },
};

export default function ExpenseLedger({ expenses, locale, searchQuery, categoryFilter, paymentFilter, statusFilter, onEdit }: ExpenseLedgerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || e.description.toLowerCase().includes(q) || e.reference.toLowerCase().includes(q) || e.amount.toString().includes(q);
      const matchesCat = categoryFilter === "all" || e.category === categoryFilter;
      const matchesPay = paymentFilter === "all" || e.paymentMethod === paymentFilter;
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesCat && matchesPay && matchesStatus;
    });
  }, [expenses, searchQuery, categoryFilter, paymentFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-warm-500 dark:text-warm-400">{filtered.length} expenses &middot; <strong className="text-red-500">KSh {totalAmount.toLocaleString()}</strong></span>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-500">{selectedIds.size} selected</span>
            <button className="px-2.5 py-1 rounded-lg text-xs font-medium bg-forest-100 dark:bg-forest-900/30 text-forest-600 min-h-[30px]">Approve</button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 min-h-[30px]">Reject</button>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
              <th className="px-3 py-3 w-10"><input type="checkbox" onChange={() => setSelectedIds(selectedIds.size === paginated.length ? new Set() : new Set(paginated.map((e) => e.id)))} className="rounded accent-terracotta-500" /></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Description</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Category</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Method</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Status</th>
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((expense, i) => {
              const cat = categoryConfig[expense.category];
              const status = statusConfig[expense.status];
              const isExpanded = expandedId === expense.id;
              const isSelected = selectedIds.has(expense.id);

              return (
                <motion.tr key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={`border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors ${isSelected ? "bg-terracotta-50/30 dark:bg-terracotta-900/10" : ""}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(expense.id)} className="rounded accent-terracotta-500" /></td>
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{expense.date.slice(5)}</p>
                    <p className="text-[10px] text-warm-400">{expense.dayOfWeek}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm text-warm-900 dark:text-warm-50 truncate max-w-[200px]">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${cat.bgColor} ${cat.color}`}>{cat.label}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm font-heading font-bold text-red-500 tabular-nums">-KSh {expense.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{methodIcons[expense.paymentMethod]}</span>
                      <span className="text-xs text-warm-500 capitalize">{expense.paymentMethod.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${status.color}`}>{locale === "sw" ? status.labelSw : status.label}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setExpandedId(isExpanded ? null : expense.id)} className="p-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 text-warm-400 min-w-[28px] min-h-[28px] flex items-center justify-center" aria-label="Expand">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-warm-400">No expenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2 mt-3">
        {paginated.map((expense, i) => {
          const cat = categoryConfig[expense.category];
          const status = statusConfig[expense.status];
          return (
            <motion.div key={expense.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onEdit(expense)}
              className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3 cursor-pointer" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{cat.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{expense.description}</p>
                    <p className="text-[10px] text-warm-400">{expense.date} &middot; {expense.dayOfWeek}</p>
                  </div>
                </div>
                <span className="text-sm font-heading font-bold text-red-500 tabular-nums flex-shrink-0">-KSh {expense.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.bgColor} ${cat.color}`}>{cat.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
                <span className="text-[10px] text-warm-400 ml-auto">{methodIcons[expense.paymentMethod]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-warm-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg text-xs bg-warm-100 dark:bg-warm-800 text-warm-600 disabled:opacity-40 min-h-[32px]">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-lg text-xs bg-warm-100 dark:bg-warm-800 text-warm-600 disabled:opacity-40 min-h-[32px]">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
