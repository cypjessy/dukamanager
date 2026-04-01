"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/data/salesData";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
  transactions: Transaction[];
}

export default function SalesAnalytics({ locale, transactions }: Props) {
  const completedTxns = useMemo(
    () => transactions.filter((t) => t.status === "completed"),
    [transactions]
  );

  const topProducts = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const txn of completedTxns) {
      for (const item of txn.items) {
        totals[item.name] = (totals[item.name] || 0) + item.qty * item.price;
      }
    }
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({
        name: name.length > 18 ? name.slice(0, 16) + ".." : name,
        revenue,
      }));
  }, [completedTxns]);

  const dailySales = useMemo(() => {
    const days: Array<{ day: string; sales: number; transactions: number }> = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en", { weekday: "short" });
      const dayTxns = completedTxns.filter((t) => t.date === key);
      days.push({
        day: dayName,
        sales: dayTxns.reduce((s, t) => s + t.total, 0),
        transactions: dayTxns.length,
      });
    }
    return days;
  }, [completedTxns]);

  const totalSales = completedTxns.reduce((s, t) => s + t.total, 0);
  const txnCount = completedTxns.length;
  const avgBasket = txnCount > 0 ? Math.round(totalSales / txnCount) : 0;
  const mpesaPercent = transactions.length > 0
    ? Math.round((transactions.filter((t) => t.method === "mpesa").length / transactions.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Mauzo Wiki Hii" : "This Week's Sales"}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailySales}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(212,165,116,0.2)", fontSize: 12 }} formatter={(v: number) => [`KSh ${v.toLocaleString()}`, "Sales"]} />
              <Bar dataKey="sales" fill="#C75B39" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Bidhaa Bora" : "Top Products"}
          </h3>
          <div className="space-y-2.5">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-warm-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                  <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500" style={{ width: `${(p.revenue / (topProducts[0]?.revenue || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.revenue.toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna mauzo bado" : "No sales data yet"}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Muhtasari" : "Summary"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {totalSales.toLocaleString()}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jumla ya Mauzo" : "Total Sales"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{txnCount}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Miamala" : "Transactions"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {avgBasket.toLocaleString()}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Wastani" : "Avg. Basket"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{mpesaPercent}%</p>
            <p className="text-[10px] text-warm-500 font-medium">M-Pesa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
