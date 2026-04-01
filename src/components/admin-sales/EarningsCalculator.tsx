"use client";

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { Locale } from "@/types";

interface EarningsCalculatorProps {
  locale: Locale;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  totalDiscount: number;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function EarningsCalculator({ locale, totalRevenue, totalProfit, profitMargin, totalDiscount }: EarningsCalculatorProps) {
  const mpesaFees = Math.round(totalRevenue * 0.015);
  const netProfit = totalProfit - mpesaFees - totalDiscount;
  const projectedMonthly = netProfit > 0 ? Math.round(netProfit * (30 / Math.max(1, new Date().getDate()))) : 0;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const factor = 0.7 + Math.random() * 0.6;
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      revenue: Math.round(totalRevenue * factor / 7),
      profit: Math.round(totalProfit * factor / 7),
    };
  });

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
        {t("Earnings & Profit Analysis", "Uchambuzi wa Faida", locale)}
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/10">
          <p className="text-[10px] text-warm-400">{t("Gross Revenue", "Jumla ya Mauzo", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
          <p className="text-[10px] text-warm-400">{t("Gross Profit", "Faida Jumla", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {totalProfit.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10">
          <p className="text-[10px] text-warm-400">{t("M-Pesa Fees", "Ada za M-Pesa", locale)}</p>
          <p className="text-lg font-bold text-amber-600">-KSh {mpesaFees.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-terracotta-50/50 dark:bg-terracotta-900/10">
          <p className="text-[10px] text-warm-400">{t("Net Profit", "Faida Halisi", locale)}</p>
          <p className="text-lg font-bold text-terracotta-600">KSh {netProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Profit Margin", "Ukingo wa Faida", locale)}</p>
          <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{profitMargin}%</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
          <p className="text-[10px] text-warm-400">{t("Projected Monthly", "Matarajio ya Mwezi", locale)}</p>
          <p className="text-lg font-bold text-forest-500">KSh {projectedMonthly.toLocaleString()}</p>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "12px" }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C75B39" fill="#C75B39" fillOpacity={0.2} strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#2D5A3D" fill="#2D5A3D" fillOpacity={0.2} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
