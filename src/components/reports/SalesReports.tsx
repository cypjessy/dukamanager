"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar } from "recharts";
import type { Locale } from "@/types";

interface DailySalesPoint {
  date: string;
  revenue: number;
  transactions: number;
  mpesa: number;
  cash: number;
  credit: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface ReportMetrics {
  totalRevenue: number;
  totalTransactions: number;
  avgBasket: number;
  mpesaPercent: number;
  cashPercent: number;
  creditPercent: number;
}

interface Props {
  sales: DailySalesPoint[];
  topProducts: TopProduct[];
  metrics: ReportMetrics;
  locale: Locale;
  dateRange: string;
}

export default function SalesReports({ sales, topProducts, locale }: Props) {
  const chartData = useMemo(() =>
    sales.slice(-30).map((d) => ({
      date: d.date.slice(5),
      revenue: d.revenue,
      mpesa: d.mpesa,
      cash: d.cash,
      credit: d.credit,
    })),
    [sales]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Mauzo kwa Siku" : "Daily Sales Trend"}
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C75B39" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C75B39" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(212,165,116,0.2)", fontSize: 12 }} formatter={(v: any) => [`KSh ${Number(v).toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="revenue" stroke="#C75B39" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-warm-400 text-center py-12">{locale === "sw" ? "Hakuna mauzo bado" : "No sales data yet"}</p>
        )}
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Mauzo kwa Njia" : "Sales by Payment Method"}
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`KSh ${Number(v).toLocaleString()}`, ""]} />
              <Bar dataKey="mpesa" stackId="a" fill="#00A650" radius={[0, 0, 0, 0]} name="M-Pesa" />
              <Bar dataKey="cash" stackId="a" fill="#C75B39" name="Cash" />
              <Bar dataKey="credit" stackId="a" fill="#E85D04" radius={[4, 4, 0, 0]} name="Credit" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-warm-400 text-center py-12">{locale === "sw" ? "Hakuna data" : "No data"}</p>
        )}
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Bidhaa Zinazouzwa Zaidi" : "Top Products"}
        </h3>
        {topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-warm-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                  <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                      style={{ width: `${topProducts[0] ? (p.revenue / topProducts[0].revenue) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.revenue.toLocaleString()}</p>
                  <p className="text-[9px] text-warm-400">x{p.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna mauzo" : "No sales yet"}</p>
        )}
      </div>
    </div>
  );
}
