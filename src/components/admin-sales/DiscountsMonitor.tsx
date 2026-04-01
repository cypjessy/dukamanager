"use client";

import type { Locale } from "@/types";
import type { DiscountEntry } from "@/hooks/useSalesData";

interface DiscountsMonitorProps {
  locale: Locale;
  discounts: DiscountEntry[];
  totalDiscountAmount: number;
  totalRevenue: number;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function DiscountsMonitor({ locale, discounts, totalDiscountAmount, totalRevenue }: DiscountsMonitorProps) {
  const discountPercent = totalRevenue > 0 ? ((totalDiscountAmount / totalRevenue) * 100).toFixed(1) : "0";
  const reasonCounts: Record<string, number> = {};
  discounts.forEach((d) => {
    reasonCounts[d.reason] = (reasonCounts[d.reason] || 0) + 1;
  });

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {t("Discounts & Promotions", "Mapunguzo na Matangazo", locale)}
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
          Number(discountPercent) > 15 ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-forest-50 dark:bg-forest-900/20 text-forest-500"
        }`}>
          {discountPercent}% {t("of revenue", "ya mapato", locale)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Total Discounts", "Jumla ya Mapunguzo", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {totalDiscountAmount.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Discount Count", "Idadi ya Mapunguzo", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{discounts.length}</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Avg Discount", "Wastani wa Punguzo", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">
            KSh {discounts.length > 0 ? Math.round(totalDiscountAmount / discounts.length).toLocaleString() : 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Unapproved", "Zisizoidhinishwa", locale)}</p>
          <p className="text-lg font-bold text-amber-500">
            {discounts.filter((d) => !d.approved).length}
          </p>
        </div>
      </div>

      {Object.keys(reasonCounts).length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-warm-500 mb-2">{t("By Reason", "Kwa Sababu", locale)}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(reasonCounts).map(([reason, count]) => (
              <span key={reason} className="px-2 py-1 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs text-warm-700 dark:text-warm-300">
                {reason}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-1">
        {discounts.slice(0, 10).map((d) => (
          <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-warm-50/30 dark:bg-warm-800/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-700 dark:text-warm-300">{d.cashierName}</span>
              <span className="text-[10px] text-warm-400">{d.reason}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-500">-KSh {d.amount.toLocaleString()}</span>
              <span className={`w-2 h-2 rounded-full ${d.approved ? "bg-forest-500" : "bg-amber-500"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
