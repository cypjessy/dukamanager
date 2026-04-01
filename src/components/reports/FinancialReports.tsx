"use client";

import type { Locale } from "@/types";

interface DailySalesPoint {
  date: string;
  revenue: number;
  transactions: number;
}

interface ReportMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalTransactions: number;
  avgBasket: number;
  mpesaPercent: number;
  cashPercent: number;
  creditPercent: number;
}

interface Props {
  metrics: ReportMetrics;
  sales: DailySalesPoint[];
  locale: Locale;
}

export default function FinancialReports({ metrics, locale }: Props) {
  const grossProfit = metrics.totalRevenue;
  const totalExpenses = metrics.totalExpenses;
  const netProfit = metrics.netProfit;
  const profitMargin = grossProfit > 0 ? Math.round((netProfit / grossProfit) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: locale === "sw" ? "Mapato" : "Revenue", value: `KSh ${grossProfit.toLocaleString()}`, color: "text-forest-600" },
          { label: locale === "sw" ? "Gharama" : "Expenses", value: `KSh ${totalExpenses.toLocaleString()}`, color: "text-red-500" },
          { label: locale === "sw" ? "Faida" : "Net Profit", value: `KSh ${netProfit.toLocaleString()}`, color: netProfit >= 0 ? "text-forest-600" : "text-red-500" },
          { label: locale === "sw" ? "Kiwango" : "Margin", value: `${profitMargin}%`, color: profitMargin >= 0 ? "text-forest-600" : "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <p className="text-xs text-warm-500 dark:text-warm-400">{stat.label}</p>
            <p className={`text-lg font-heading font-extrabold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Muhtasari wa Kifedha" : "Profit & Loss Summary"}
        </h3>
        <div className="space-y-2">
          {[
            { label: locale === "sw" ? "Jumla ya Mapato" : "Total Revenue", amount: grossProfit, isBold: false, isSub: false },
            { label: locale === "sw" ? "Jumla ya Gharama" : "Total Expenses", amount: -totalExpenses, isBold: false, isSub: false },
            { label: locale === "sw" ? "Faida Halisi" : "Net Profit", amount: netProfit, isBold: true, isSub: true },
          ].map((item) => (
            <div key={item.label} className={`flex items-center justify-between py-2 px-3 rounded-lg ${item.isSub ? "bg-warm-50 dark:bg-warm-800/50 mt-2" : ""}`}>
              <span className={`text-xs ${item.isBold ? "font-bold" : ""} text-warm-700 dark:text-warm-300`}>{item.label}</span>
              <span className={`text-sm font-heading ${item.isBold ? "font-extrabold" : "font-bold"} tabular-nums ${item.amount >= 0 ? "text-forest-600" : "text-red-500"}`}>
                {item.amount < 0 ? "-" : ""}KSh {Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Malipo kwa Njia" : "Revenue by Method"}
        </h3>
        <div className="space-y-2">
          {[
            { method: "M-Pesa", pct: metrics.mpesaPercent, color: "bg-[#00A650]" },
            { method: locale === "sw" ? "Pesa Taslimu" : "Cash", pct: metrics.cashPercent, color: "bg-terracotta-500" },
            { method: locale === "sw" ? "Mkopo" : "Credit", pct: metrics.creditPercent, color: "bg-sunset-400" },
          ].map((m) => (
            <div key={m.method} className="flex items-center gap-3">
              <span className="text-xs font-medium text-warm-700 dark:text-warm-300 w-16">{m.method}</span>
              <div className="flex-1 h-3 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
              <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums w-10 text-right">{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
