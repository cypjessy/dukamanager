"use client";

import { useMemo } from "react";
import type { Expense } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";
import type { Locale } from "@/types";

interface Props {
  expenses: Expense[];
  locale: Locale;
}

export default function ExpenseAnalytics({ expenses, locale }: Props) {
  const completed = useMemo(() => expenses.filter((e) => e.status !== "rejected"), [expenses]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .map(([cat, amount]) => ({ category: cat, label: categoryConfig[cat as keyof typeof categoryConfig]?.label || cat, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [completed]);

  const byPayment = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((e) => { map[e.paymentMethod] = (map[e.paymentMethod] || 0) + e.amount; });
    return Object.entries(map).map(([method, amount]) => ({ method, amount }));
  }, [completed]);

  const totalAmount = completed.reduce((s, e) => s + e.amount, 0);

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((e) => {
      const month = e.date.slice(0, 7);
      map[month] = (map[month] || 0) + e.amount;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => ({ month: month.slice(5), amount }));
  }, [completed]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Gharama kwa Jamii" : "Expenses by Category"}
          </h3>
          {byCategory.length > 0 ? (
            <div className="space-y-2">
              {byCategory.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{c.label}</span>
                      <span className="text-xs text-warm-400 tabular-nums">KSh {c.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                        style={{ width: `${totalAmount > 0 ? (c.amount / totalAmount) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna gharama" : "No expenses yet"}</p>
          )}
        </div>

        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Kwa Njia ya Malipo" : "By Payment Method"}
          </h3>
          {byPayment.length > 0 ? (
            <div className="space-y-2">
              {byPayment.map((p) => (
                <div key={p.method} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <span className="text-xs font-medium text-warm-900 dark:text-warm-50 capitalize">{p.method.replace("_", " ")}</span>
                  <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna data" : "No data"}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Muhtasari" : "Summary"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-red-500 tabular-nums">KSh {totalAmount.toLocaleString()}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jumla" : "Total"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{completed.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Rekodi" : "Records"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{byCategory.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jamii" : "Categories"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
              KSh {completed.length > 0 ? Math.round(totalAmount / completed.length).toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Wastani" : "Average"}</p>
          </div>
        </div>
      </div>

      {byMonth.length > 1 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Mwezi hadi Mwezi" : "Monthly Trend"}
          </h3>
          <div className="flex items-end gap-2 h-32">
            {byMonth.map((m) => {
              const maxAmt = Math.max(...byMonth.map((x) => x.amount));
              const height = maxAmt > 0 ? (m.amount / maxAmt) * 100 : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-warm-400 tabular-nums">{(m.amount / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-terracotta-500 to-savanna-500" style={{ height: `${height}%`, minHeight: 4 }} />
                  <span className="text-[10px] font-medium text-warm-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
