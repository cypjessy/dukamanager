"use client";

import { useState, useCallback } from "react";
import type { ExpenseCategory, PaymentMethod } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";

interface ExpenseFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: ExpenseCategory | "all";
  onCategoryChange: (c: ExpenseCategory | "all") => void;
  paymentFilter: PaymentMethod | "all";
  onPaymentChange: (m: PaymentMethod | "all") => void;
  dateRange: string;
  onDateRangeChange: (r: string) => void;
  amountMin: string;
  amountMax: string;
  onAmountRangeChange: (min: string, max: string) => void;
}

const dateRanges = [
  { key: "today", label: "Today", labelSw: "Leo" },
  { key: "yesterday", label: "Yesterday", labelSw: "Jana" },
  { key: "week", label: "This Week", labelSw: "Wiki Hii" },
  { key: "month", label: "This Month", labelSw: "Mwezi Huu" },
  { key: "all", label: "All Time", labelSw: "Zote" },
];

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "cash", label: "Cash", icon: "💵" },
  { key: "mpesa", label: "M-Pesa", icon: "📲" },
  { key: "bank", label: "Bank", icon: "🏦" },
  { key: "mobile_banking", label: "Mobile", icon: "📱" },
];

export default function ExpenseFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  paymentFilter,
  onPaymentChange,
  dateRange,
  onDateRangeChange,
  amountMin,
  amountMax,
  onAmountRangeChange,
}: ExpenseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilters = [
    categoryFilter !== "all" ? categoryFilter : null,
    paymentFilter !== "all" ? paymentFilter : null,
    dateRange !== "all" ? dateRange : null,
    amountMin ? `Min: ${amountMin}` : null,
    amountMax ? `Max: ${amountMax}` : null,
  ].filter(Boolean);

  const clearAll = useCallback(() => {
    onCategoryChange("all");
    onPaymentChange("all");
    onDateRangeChange("all");
    onAmountRangeChange("", "");
    onSearchChange("");
  }, [onCategoryChange, onPaymentChange, onDateRangeChange, onAmountRangeChange, onSearchChange]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search description, vendor, reference..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[44px]"
        />
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-terracotta-500 hover:text-terracotta-600"
          >
            Clear ({activeFilters.length})
          </button>
        )}
      </div>

      {/* Date range chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {dateRanges.map((dr) => (
          <button
            key={dr.key}
            onClick={() => onDateRangeChange(dr.key)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap min-h-[32px] transition-colors flex-shrink-0 ${
              dateRange === dr.key
                ? "bg-terracotta-500 text-white"
                : "bg-warm-100/60 dark:bg-warm-800/60 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
            }`}
          >
            {dr.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange("all")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap min-h-[32px] transition-colors flex-shrink-0 ${
            categoryFilter === "all"
              ? "bg-terracotta-500 text-white"
              : "bg-warm-100/60 dark:bg-warm-800/60 text-warm-500"
          }`}
        >
          All
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key as ExpenseCategory | "all")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap min-h-[32px] transition-colors flex-shrink-0 ${
              categoryFilter === key
                ? "bg-terracotta-500 text-white"
                : "bg-warm-100/60 dark:bg-warm-800/60 text-warm-500"
            }`}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600 min-h-[28px]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {showAdvanced ? "Less filters" : "More filters"}
      </button>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Payment method */}
          <div>
            <label className="text-[10px] text-warm-400 mb-1 block">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => onPaymentChange(e.target.value as PaymentMethod | "all")}
              className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs outline-none appearance-none min-h-[36px]"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.icon} {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount min */}
          <div>
            <label className="text-[10px] text-warm-400 mb-1 block">Min Amount</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => onAmountRangeChange(e.target.value, amountMax)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs outline-none min-h-[36px] tabular-nums"
            />
          </div>

          {/* Amount max */}
          <div>
            <label className="text-[10px] text-warm-400 mb-1 block">Max Amount</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => onAmountRangeChange(amountMin, e.target.value)}
              placeholder="Any"
              className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs outline-none min-h-[36px] tabular-nums"
            />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryFilter !== "all" && (
            <button
              onClick={() => onCategoryChange("all")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 min-h-[24px]"
            >
              {categoryConfig[categoryFilter]?.icon} {categoryConfig[categoryFilter]?.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {paymentFilter !== "all" && (
            <button
              onClick={() => onPaymentChange("all")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-forest-100 dark:bg-forest-900/30 text-forest-600 min-h-[24px]"
            >
              {paymentMethods.find((m) => m.key === paymentFilter)?.icon} {paymentFilter}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
