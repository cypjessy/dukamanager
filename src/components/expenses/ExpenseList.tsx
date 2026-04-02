"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";
import ExpenseCard from "./ExpenseCard";

interface ExpenseListProps {
  expenses: Expense[];
  searchQuery: string;
  categoryFilter: ExpenseCategory | "all";
  paymentFilter: PaymentMethod | "all";
  dateRange: string;
  amountMin: string;
  amountMax: string;
  onEdit: (expense: Expense) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: Set<string>) => void;
  isMobile: boolean;
}

const methodIcons: Record<PaymentMethod, string> = {
  cash: "💵", mpesa: "📲", bank: "🏦", mobile_banking: "📱",
};

const statusConfig = {
  draft: { label: "Draft", color: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300" },
  pending: { label: "Pending", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700" },
  approved: { label: "Approved", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700" },
  rejected: { label: "Rejected", color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  reimbursed: { label: "Reimbursed", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600" },
};

export default function ExpenseList({
  expenses,
  searchQuery,
  categoryFilter,
  paymentFilter,
  dateRange,
  amountMin,
  amountMax,
  onEdit,
  onDuplicate,
  onDelete,
  onDeleteMany,
  isMobile,
}: ExpenseListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [sortColumn, setSortColumn] = useState<"date" | "amount" | "category">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [viewDetails, setViewDetails] = useState<Expense | null>(null);
  const pageSize = 20;

  const filtered = useMemo(() => {
    const now = new Date();
    let result = [...expenses];

    // Date range
    if (dateRange === "today") {
      const today = now.toISOString().slice(0, 10);
      result = result.filter((e) => e.date === today);
    } else if (dateRange === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      result = result.filter((e) => e.date === y.toISOString().slice(0, 10));
    } else if (dateRange === "week") {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      result = result.filter((e) => e.date >= w.toISOString().slice(0, 10));
    } else if (dateRange === "month") {
      const m = new Date(now);
      m.setMonth(m.getMonth() - 1);
      result = result.filter((e) => e.date >= m.toISOString().slice(0, 10));
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.reference.toLowerCase().includes(q) ||
          e.amount.toString().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // Payment
    if (paymentFilter !== "all") {
      result = result.filter((e) => e.paymentMethod === paymentFilter);
    }

    // Amount range
    if (amountMin) {
      result = result.filter((e) => e.amount >= Number(amountMin));
    }
    if (amountMax) {
      result = result.filter((e) => e.amount <= Number(amountMax));
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "date") cmp = a.date.localeCompare(b.date);
      else if (sortColumn === "amount") cmp = a.amount - b.amount;
      else if (sortColumn === "category") cmp = a.category.localeCompare(b.category);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [expenses, searchQuery, categoryFilter, paymentFilter, dateRange, amountMin, amountMax, sortColumn, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const toggleSort = useCallback(
    (col: "date" | "amount" | "category") => {
      if (sortColumn === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortColumn(col);
        setSortDir("desc");
      }
    },
    [sortColumn]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((e) => e.id)));
    }
  }, [selectedIds.size, paginated]);

  // Empty state
  if (filtered.length === 0 && expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-medium text-warm-600 dark:text-warm-300 mb-1">No expenses recorded</p>
        <p className="text-xs text-warm-400">Add your first expense to start tracking</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="text-sm font-medium text-warm-600 dark:text-warm-300 mb-1">No results found</p>
        <p className="text-xs text-warm-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-warm-500 dark:text-warm-400">
          {filtered.length} expenses &middot;{" "}
          <strong className="text-red-500">KSh {totalAmount.toLocaleString()}</strong>
        </span>
        {isSelectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-500">{selectedIds.size} selected</span>
            <button
              onClick={() => onDeleteMany(selectedIds)}
              disabled={selectedIds.size === 0}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 min-h-[30px] disabled:opacity-40"
            >
              Delete
            </button>
            <button
              onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-warm-100 dark:bg-warm-800 text-warm-600 min-h-[30px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-warm-100 dark:bg-warm-800 text-warm-500 min-h-[30px]"
          >
            Select
          </button>
        )}
      </div>

      {/* DESKTOP/TABLET TABLE */}
      {!isMobile && (
        <div
          className="overflow-x-auto rounded-2xl border border-warm-200/60 dark:border-warm-700/60"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={selectAll} className="rounded accent-terracotta-500" />
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase cursor-pointer hover:text-warm-700 select-none"
                  onClick={() => toggleSort("date")}
                >
                  Date {sortColumn === "date" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase cursor-pointer hover:text-warm-700 select-none"
                  onClick={() => toggleSort("category")}
                >
                  Category {sortColumn === "category" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Description</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Method</th>
                <th
                  className="px-3 py-3 text-right text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase cursor-pointer hover:text-warm-700 select-none"
                  onClick={() => toggleSort("amount")}
                >
                  Amount {sortColumn === "amount" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase">Status</th>
                <th className="px-3 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((expense, i) => {
                const cat = categoryConfig[expense.category];
                const status = statusConfig[expense.status];
                const isSelected = selectedIds.has(expense.id);

                return (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors group ${
                      isSelected ? "bg-terracotta-50/30 dark:bg-terracotta-900/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(expense.id)} className="rounded accent-terracotta-500" />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{expense.date.slice(5)}</p>
                      <p className="text-[10px] text-warm-400">{expense.dayOfWeek}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${cat.bgColor} ${cat.color}`}>
                        {cat.icon} {cat.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm text-warm-900 dark:text-warm-50 truncate max-w-[200px] block">{expense.description}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{methodIcons[expense.paymentMethod]}</span>
                        <span className="text-xs text-warm-500 capitalize">{expense.paymentMethod.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-heading font-bold text-red-500 tabular-nums">-KSh {expense.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                        {/* View */}
                        <button
                          onClick={() => setViewDetails(expense)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800"
                          title="View details"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => onEdit(expense)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-terracotta-600 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicate(expense.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-forest-600 hover:bg-forest-50 dark:hover:bg-forest-900/20"
                          title="Duplicate"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-warm-400">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARDS */}
      {isMobile && (
        <div className="space-y-2">
          {paginated.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              isSelected={selectedIds.has(expense.id)}
              isSelectionMode={isSelectionMode}
              onSelect={toggleSelect}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onViewDetails={setViewDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-warm-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg text-xs bg-warm-100 dark:bg-warm-800 text-warm-600 disabled:opacity-40 min-h-[32px]"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg text-xs bg-warm-100 dark:bg-warm-800 text-warm-600 disabled:opacity-40 min-h-[32px]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* DETAILS PANEL */}
      <AnimatePresence>
        {viewDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setViewDetails(null)}
            />
            <motion.div
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed z-50 bg-white dark:bg-warm-900 shadow-2xl flex flex-col overflow-hidden ${
                isMobile
                  ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[80vh]"
                  : "top-0 right-0 bottom-0 w-[400px]"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60">
                <h3 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Expense Details</h3>
                <button
                  onClick={() => setViewDetails(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="text-center py-4">
                  <span className="text-3xl">{categoryConfig[viewDetails.category]?.icon}</span>
                  <p className="text-3xl font-heading font-extrabold text-red-500 tabular-nums mt-2">
                    KSh {viewDetails.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-warm-500 mt-1">{viewDetails.description}</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Date", value: `${viewDetails.date} (${viewDetails.dayOfWeek})` },
                    { label: "Category", value: `${categoryConfig[viewDetails.category]?.icon} ${categoryConfig[viewDetails.category]?.label}` },
                    { label: "Payment", value: `${methodIcons[viewDetails.paymentMethod]} ${viewDetails.paymentMethod.replace("_", " ")}` },
                    { label: "Reference", value: viewDetails.reference || "N/A" },
                    { label: "Status", value: viewDetails.status },
                    { label: "Recurring", value: viewDetails.isRecurring ? `Yes - ${viewDetails.recurrenceFrequency}` : "No" },
                    { label: "Notes", value: viewDetails.notes || "None" },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center justify-between py-2 border-b border-warm-100 dark:border-warm-800">
                      <span className="text-xs text-warm-400">{field.label}</span>
                      <span className="text-sm font-medium text-warm-900 dark:text-warm-50 capitalize">{field.value}</span>
                    </div>
                  ))}
                </div>
                {viewDetails.receiptUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">Receipt</p>
                     <a href={viewDetails.receiptUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-warm-200/60 dark:border-warm-700/60 hover:opacity-90 transition-opacity">
                       <Image src={viewDetails.receiptUrl} alt="Expense receipt" className="w-full h-40 object-cover" width={800} height={400} />
                     </a>
                    <a href={viewDetails.receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-xs text-terracotta-500 hover:text-terracotta-600 font-medium">
                      View full receipt
                    </a>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 p-4 border-t border-warm-200/60 dark:border-warm-700/60 flex gap-2">
                <button
                  onClick={() => { onEdit(viewDetails); setViewDetails(null); }}
                  className="flex-1 py-3 rounded-xl bg-terracotta-500 text-white font-heading font-bold text-sm min-h-[44px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => { onDuplicate(viewDetails.id); setViewDetails(null); }}
                  className="flex-1 py-3 rounded-xl bg-forest-500 text-white font-heading font-bold text-sm min-h-[44px]"
                >
                  Duplicate
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
