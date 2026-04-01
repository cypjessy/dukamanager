"use client";

import type { Locale } from "@/types";

interface ReportMetrics {
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
  avgBasket: number;
  mpesaPercent: number;
  cashPercent: number;
}

interface Props {
  metrics: ReportMetrics;
  locale: Locale;
}

export default function CustomerAnalytics({ metrics, locale }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Wateja" : "Customers"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{metrics.totalCustomers}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Miamala" : "Transactions"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{metrics.totalTransactions}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Wastani" : "Avg Basket"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {metrics.avgBasket.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Mapato" : "Revenue"}</p>
          <p className="text-lg font-heading font-extrabold text-forest-600 tabular-nums">KSh {metrics.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Njia za Malipo" : "Payment Preferences"}
        </h3>
        <div className="space-y-3">
          {[
            { method: "M-Pesa", pct: metrics.mpesaPercent, color: "bg-[#00A650]" },
            { method: locale === "sw" ? "Pesa Taslimu" : "Cash", pct: metrics.cashPercent, color: "bg-terracotta-500" },
          ].map((m) => (
            <div key={m.method}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{m.method}</span>
                <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">{m.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Muhtasari" : "Overview"}
        </h3>
        <div className="space-y-2">
          {[
            { label: locale === "sw" ? "Wastani wa Mauzo kwa Mteja" : "Avg Transactions per Customer", value: metrics.totalCustomers > 0 ? (metrics.totalTransactions / metrics.totalCustomers).toFixed(1) : "0" },
            { label: locale === "sw" ? "Mapato kwa Mteja" : "Revenue per Customer", value: `KSh ${metrics.totalCustomers > 0 ? Math.round(metrics.totalRevenue / metrics.totalCustomers).toLocaleString() : "0"}` },
            { label: locale === "sw" ? "Wastani wa Kikapu" : "Average Basket Size", value: `KSh ${metrics.avgBasket.toLocaleString()}` },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-warm-50 dark:bg-warm-800/50">
              <span className="text-xs text-warm-600 dark:text-warm-400">{item.label}</span>
              <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
