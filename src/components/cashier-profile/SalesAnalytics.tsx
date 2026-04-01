"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { HourlySalesData, PaymentBreakdown, SalesTarget } from "@/hooks/useCashierLiveData";

interface SalesAnalyticsProps {
  hourlySales: HourlySalesData[];
  paymentBreakdown: PaymentBreakdown[];
  salesTarget: SalesTarget | null;
  weeklySales: number;
  monthlySales: number;
  todaySales: number;
  todayTransactions: number;
  avgBasketSize: number;
  locale: string;
}

const COLORS = ["#C75B39", "#2D5A3D", "#D4A574", "#E85D04", "#4E9AF1"];

export function SalesAnalytics({
  hourlySales, paymentBreakdown, salesTarget,
  weeklySales, monthlySales, todaySales, todayTransactions, avgBasketSize, locale,
}: SalesAnalyticsProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const chartData = useMemo(() => {
    return hourlySales
      .filter((h) => h.hour >= 6 && h.hour <= 22)
      .map((h) => ({ name: h.label, sales: h.sales, txns: h.transactions }));
  }, [hourlySales]);

  const peakHour = useMemo(() => {
    if (!hourlySales.length) return null;
    return hourlySales.reduce((max, h) => (h.sales > max.sales ? h : max), hourlySales[0]);
  }, [hourlySales]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg px-2.5 py-1.5 shadow-lg border border-warm-200 dark:border-warm-700" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}>
        <p className="text-[10px] font-medium text-warm-600">{label}</p>
        <p className="text-xs font-heading font-bold text-terracotta-600 tabular-nums">KSh {payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t("Today", "Leo"), value: `KSh ${(todaySales / 1000).toFixed(1)}k`, sub: `${todayTransactions} ${t("txns", "miamala")}`, color: "text-terracotta-600" },
          { label: t("This Week", "Wiki Hii"), value: `KSh ${(weeklySales / 1000).toFixed(1)}k`, sub: t("7 days", "siku 7"), color: "text-forest-600" },
          { label: t("This Month", "Mwezi Huu"), value: `KSh ${(monthlySales / 1000).toFixed(1)}k`, sub: t("30 days", "siku 30"), color: "text-blue-600" },
        ].map((card) => (
          <div key={card.label} className="p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className={`text-sm font-heading font-extrabold ${card.color} tabular-nums`}>{card.value}</p>
            <p className="text-[9px] text-warm-500">{card.label}</p>
            <p className="text-[8px] text-warm-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales target */}
      {salesTarget && (
        <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">{t("Sales Target", "Lengo la Mauzo")}</h4>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              salesTarget.status === "exceeded" ? "bg-forest-100 text-forest-600" :
              salesTarget.status === "on_track" ? "bg-blue-100 text-blue-600" :
              "bg-savanna-100 text-savanna-600"
            }`}>
              {salesTarget.status === "exceeded" ? t("Exceeded!", "Imezidi!") :
               salesTarget.status === "on_track" ? t("On Track", "Sawa") :
               t("Behind", "Nyuma")}
            </span>
          </div>
          <div className="flex items-end justify-between mb-1.5">
            <div>
              <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {salesTarget.current.toLocaleString()}</p>
              <p className="text-[9px] text-warm-400">{t("Target", "Lengo")}: KSh {salesTarget.target.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-warm-400">{t("Projected", "Kukadiriwa")}</p>
              <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {salesTarget.projected.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, salesTarget.percentage)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${salesTarget.percentage >= 100 ? "bg-gradient-to-r from-forest-500 to-forest-400" : "bg-gradient-to-r from-terracotta-500 to-savanna-500"}`}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-warm-400">0%</span>
            <span className="text-[10px] font-bold text-warm-900 dark:text-warm-50 tabular-nums">{salesTarget.percentage}%</span>
            <span className="text-[9px] text-warm-400">100%</span>
          </div>
        </div>
      )}

      {/* Hourly sales chart */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">{t("Hourly Sales", "Mauzo kwa Saa")}</h4>
          {peakHour && peakHour.sales > 0 && (
            <span className="text-[9px] text-warm-400">
              {t("Peak", "Kileupe")}: <span className="font-bold text-terracotta-600">{peakHour.label}</span>
            </span>
          )}
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C75B39" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C75B39" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#a8a29e" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 8, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#C75B39" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Heatmap indicators */}
        <div className="flex gap-0.5 mt-2">
          {hourlySales.filter((h) => h.hour >= 6 && h.hour <= 22).map((h) => {
            const maxSales = Math.max(...hourlySales.map((s) => s.sales), 1);
            const intensity = h.sales / maxSales;
            return (
              <div
                key={h.hour}
                className="flex-1 h-3 rounded-sm"
                style={{
                  background: intensity > 0.7 ? "#C75B39" : intensity > 0.4 ? "#D4A574" : intensity > 0.1 ? "#f5f0ea" : "#faf8f5",
                  opacity: Math.max(0.2, intensity),
                }}
                title={`${h.label}: KSh ${h.sales.toLocaleString()}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[7px] text-warm-400">06:00</span>
          <span className="text-[7px] text-warm-400">22:00</span>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Payment Methods", "Njia za Malipo")}</h4>
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdown.length ? paymentBreakdown : [{ method: "none", amount: 1, count: 0, percentage: 100, trend: 0 }]} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={2} strokeWidth={0}>
                  {(paymentBreakdown.length ? paymentBreakdown : [{ method: "none" }]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {paymentBreakdown.length === 0 ? (
              <p className="text-[10px] text-warm-400">{t("No payments today", "Hakuna malipo leo")}</p>
            ) : (
              paymentBreakdown.map((p, i) => (
                <div key={p.method} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-medium text-warm-700 dark:text-warm-300 capitalize flex-1">{p.method}</span>
                  <span className="text-[10px] font-bold text-warm-900 dark:text-warm-50 tabular-nums">{p.percentage}%</span>
                  {p.trend !== 0 && (
                    <span className={`text-[8px] font-bold ${p.trend > 0 ? "text-forest-500" : "text-red-500"}`}>
                      {p.trend > 0 ? "↑" : "↓"}{Math.abs(p.trend)}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Avg basket + comparison */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
          <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {avgBasketSize.toLocaleString()}</p>
          <p className="text-[9px] text-warm-400">{t("Avg Basket", "Wastani")}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
          <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
            {todayTransactions > 0 ? Math.round(todaySales / todayTransactions) : 0}
          </p>
          <p className="text-[9px] text-warm-400">{t("Items/Txn", "Bidhaa/Muamala")}</p>
        </div>
      </div>
    </div>
  );
}
