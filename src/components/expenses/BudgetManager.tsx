"use client";

import { useMemo } from "react";
import type { Expense } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";
import type { Locale } from "@/types";

interface Props {
  expenses: Expense[];
  locale: Locale;
}

export default function BudgetManager({ expenses, locale }: Props) {
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.filter((e) => e.status !== "rejected").forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([cat, spent]) => ({
        category: cat as keyof typeof categoryConfig,
        config: categoryConfig[cat as keyof typeof categoryConfig],
        spent,
      }))
      .filter((b) => b.config)
      .sort((a, b) => b.spent - a.spent);
  }, [expenses]);

  const recurring = useMemo(() => expenses.filter((e) => e.isRecurring), [expenses]);

  return (
    <div className="space-y-4">
      {/* Recurring expenses */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
          {locale === "sw" ? "Gharama Zinazorudiwa" : "Recurring Expenses"}
        </h3>
        {recurring.length > 0 ? (
          <div className="space-y-2">
            {recurring.map((e) => {
              const cfg = categoryConfig[e.category];
              return (
                <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <div className="flex items-center gap-2">
                    <span>{cfg?.icon || "📌"}</span>
                    <div>
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{e.description}</p>
                      <p className="text-[10px] text-warm-400">{cfg?.label || e.category} &middot; {e.recurrenceFrequency || "monthly"}</p>
                    </div>
                  </div>
                  <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {e.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-4">{locale === "sw" ? "Hakuna gharama zinazorudiwa" : "No recurring expenses"}</p>
        )}
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
          {locale === "sw" ? "Bajeti kwa Jamii" : "Budget by Category"}
        </h3>
        {byCategory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byCategory.map((b) => (
              <div key={b.category} className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span>{b.config.icon}</span>
                  <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{b.config.label}</span>
                </div>
                <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {b.spent.toLocaleString()}</p>
                <div className="h-1.5 rounded-full bg-warm-200 dark:bg-warm-700 mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500" style={{ width: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-4">{locale === "sw" ? "Hakuna gharama" : "No expenses to show"}</p>
        )}
      </div>

      {/* Quick stats */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
          {locale === "sw" ? "Muhtasari" : "Overview"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-red-500 tabular-nums">KSh {expenses.filter((e) => e.status !== "rejected").reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jumla ya Gharama" : "Total Expenses"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{recurring.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Zinazorudiwa" : "Recurring"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{byCategory.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jamii" : "Categories"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
