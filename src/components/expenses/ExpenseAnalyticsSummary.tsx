"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Expense, ExpenseCategory } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";

interface ExpenseAnalyticsSummaryProps {
  expenses: Expense[];
}

export default function ExpenseAnalyticsSummary({ expenses }: ExpenseAnalyticsSummaryProps) {
  const { todayTotal, weekTotal, monthTotal, categoryBreakdown, highestExpense, todayChange, weekChange } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekStartStr = lastWeekStart.toISOString().slice(0, 10);

    const approved = expenses.filter((e) => e.status === "approved" || e.status === "draft");

    const todayTotal = approved.filter((e) => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
    const weekTotal = approved.filter((e) => e.date >= weekStartStr).reduce((s, e) => s + e.amount, 0);
    const monthTotal = approved.filter((e) => e.date >= monthStartStr).reduce((s, e) => s + e.amount, 0);

    const yesterdayTotal = approved.filter((e) => e.date === yesterdayStr).reduce((s, e) => s + e.amount, 0);
    const lastWeekTotal = approved.filter((e) => e.date >= lastWeekStartStr && e.date < weekStartStr).reduce((s, e) => s + e.amount, 0);

    const todayChange = yesterdayTotal > 0 ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : 0;
    const weekChange = lastWeekTotal > 0 ? Math.round(((weekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

    // Category breakdown
    const byCategory: Record<string, number> = {};
    approved.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.entries(byCategory)
      .map(([cat, amount]) => ({
        name: categoryConfig[cat as ExpenseCategory]?.label || cat,
        value: amount,
        color: getCategoryColor(cat as ExpenseCategory),
        icon: categoryConfig[cat as ExpenseCategory]?.icon || "📌",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const highestExpense = approved.length > 0
      ? approved.reduce((max, e) => (e.amount > max.amount ? e : max), approved[0])
      : null;

    return { todayTotal, weekTotal, monthTotal, categoryBreakdown, highestExpense, todayChange, weekChange };
  }, [expenses]);

  const ChangeIndicator = ({ value }: { value: number }) => (
    <span className={`text-[10px] font-medium flex items-center gap-0.5 ${value > 0 ? "text-red-500" : value < 0 ? "text-forest-500" : "text-warm-400"}`}>
      {value > 0 ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      ) : value < 0 ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      ) : null}
      {Math.abs(value)}%
    </span>
  );

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Today", labelSw: "Leo", total: todayTotal, change: todayChange },
          { label: "This Week", labelSw: "Wiki", total: weekTotal, change: weekChange },
          { label: "This Month", labelSw: "Mwezi", total: monthTotal, change: 0 },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}
          >
            <p className="text-[9px] text-warm-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-lg font-heading font-extrabold text-red-500 tabular-nums mt-0.5">
              KSh {card.total.toLocaleString()}
            </p>
            <ChangeIndicator value={card.change} />
          </motion.div>
        ))}
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div
          className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-4"
          style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}
        >
          <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-3">
            Category Breakdown
          </p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={2} dataKey="value">
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`KSh ${Number(v).toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {categoryBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[10px] text-warm-600 dark:text-warm-300">{cat.icon} {cat.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                    KSh {cat.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Highest expense alert */}
      {highestExpense && highestExpense.amount > 5000 && (
        <div
          className="rounded-xl border border-sunset-200/60 dark:border-sunset-700/30 p-3 flex items-center gap-3"
          style={{ background: "rgba(232,93,4,0.06)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-sunset-100 dark:bg-sunset-900/30 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-warm-900 dark:text-warm-50">Highest expense</p>
            <p className="text-[10px] text-warm-500 truncate">
              {highestExpense.description} - KSh {highestExpense.amount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(cat: ExpenseCategory): string {
  const colors: Record<ExpenseCategory, string> = {
    rent: "#C75B39",
    electricity: "#E85D04",
    water: "#3B82F6",
    salaries: "#2D5A3D",
    transport: "#D4A574",
    stock_purchase: "#56524b",
    marketing: "#EC4899",
    repairs: "#9a958a",
    licenses: "#8B5CF6",
    fuel: "#DC2626",
    communication: "#06B6D4",
    miscellaneous: "#9a958a",
  };
  return colors[cat] || "#9a958a";
}
