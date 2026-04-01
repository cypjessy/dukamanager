"use client";

import type { Locale } from "@/types";
import type { CustomerInsight } from "@/hooks/useSalesData";

interface CustomerInsightsProps {
  locale: Locale;
  insights: CustomerInsight;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function CustomerInsights({ locale, insights }: CustomerInsightsProps) {
  const totalCustomers = insights.newCustomers + insights.returningCustomers;
  const newPercent = totalCustomers > 0 ? Math.round((insights.newCustomers / totalCustomers) * 100) : 0;
  const returningPercent = totalCustomers > 0 ? Math.round((insights.returningCustomers / totalCustomers) * 100) : 0;

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
        {t("Customer Insights", "Maarifa ya Wateja", locale)}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("New Customers", "Wateja Wapya", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{insights.newCustomers}</p>
          <p className="text-[10px] text-warm-400">{newPercent}%</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Returning", "Wanaorudi", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{insights.returningCustomers}</p>
          <p className="text-[10px] text-warm-400">{returningPercent}%</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Lifetime Value", "Thamani ya Maisha", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {insights.avgLifetimeValue.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Return Rate", "Kiwango cha Marejesho", locale)}</p>
          <p className={`text-lg font-bold ${insights.returnRate > 5 ? "text-red-500" : "text-forest-500"}`}>
            {insights.returnRate}%
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-warm-500">{t("Customer Mix", "Mchanganyiko wa Wateja", locale)}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden flex">
          <div className="h-full bg-forest-500 rounded-l-full" style={{ width: `${returningPercent}%` }} />
          <div className="h-full bg-terracotta-500 rounded-r-full" style={{ width: `${newPercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-warm-400 mt-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-forest-500" />{t("Returning", "Wanaorudi", locale)}</span>
          <span className="flex items-center gap-1">{t("New", "Wapya", locale)}<span className="w-2 h-2 rounded-full bg-terracotta-500" /></span>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-warm-500 mb-2">{t("Top Customers", "Wateja Bora", locale)}</p>
        <div className="space-y-2">
          {insights.topCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-2 rounded-lg bg-warm-50/30 dark:bg-warm-800/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center text-white text-xs font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{customer.name}</p>
                  <p className="text-[10px] text-warm-400">{customer.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-warm-900 dark:text-warm-50">KSh {customer.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-warm-400">{customer.visits} {t("visits", "matembezi", locale)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
