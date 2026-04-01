"use client";

import type { Locale } from "@/types";

interface DailySalesPoint {
  date: string;
  revenue: number;
  transactions: number;
}

interface ReportMetrics {
  totalTransactions: number;
  totalRevenue: number;
  avgBasket: number;
  mpesaPercent: number;
}

interface Props {
  metrics: ReportMetrics;
  sales: DailySalesPoint[];
  locale: Locale;
}

export default function OperationalReports({ metrics, sales, locale }: Props) {
  const peakDay = sales.length > 0
    ? sales.reduce((max, s) => s.transactions > max.transactions ? s : max, sales[0])
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Miamala" : "Transactions"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{metrics.totalTransactions}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Wastani" : "Avg Basket"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {metrics.avgBasket.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">M-Pesa %</p>
          <p className="text-lg font-heading font-extrabold text-[#00A650]">{metrics.mpesaPercent}%</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Mapato" : "Revenue"}</p>
          <p className="text-lg font-heading font-extrabold text-forest-600 tabular-nums">KSh {metrics.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Siku Bora" : "Peak Performance"}
        </h3>
        {peakDay ? (
          <div className="p-4 rounded-xl bg-forest-50 dark:bg-forest-900/10 text-center">
            <p className="text-2xl font-heading font-extrabold text-forest-600 tabular-nums">{peakDay.transactions}</p>
            <p className="text-xs text-warm-500">{locale === "sw" ? "Miamala zaidi siku moja" : "Most transactions in a day"}</p>
            <p className="text-xs text-warm-400 mt-1">{peakDay.date} &middot; KSh {peakDay.revenue.toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna data" : "No data yet"}</p>
        )}
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Utendaji wa Siku" : "Daily Performance"}
        </h3>
        {sales.length > 0 ? (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {sales.slice(-14).reverse().map((s) => (
              <div key={s.date} className="flex items-center justify-between py-2 px-3 rounded-lg bg-warm-50 dark:bg-warm-800/50">
                <span className="text-xs text-warm-600 dark:text-warm-400">{s.date.slice(5)}</span>
                <span className="text-xs font-bold text-warm-900 dark:text-warm-50">{s.transactions} txns</span>
                <span className="text-xs font-heading font-bold text-forest-600 tabular-nums">KSh {s.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna mauzo" : "No sales data"}</p>
        )}
      </div>
    </div>
  );
}
