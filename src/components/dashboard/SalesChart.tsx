"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";

interface DailySales {
  day: string;
  date: string;
  revenue: number;
  mpesa: number;
  cash: number;
}

interface SalesChartProps {
  locale: Locale;
  dailySales: DailySales[];
}

type Period = "daily" | "weekly" | "monthly";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl border border-warm-200/60 dark:border-warm-700/60 shadow-glass p-3 text-sm">
      <p className="font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-warm-500">{entry.name}</span>
          </div>
          <span className="font-heading font-bold text-warm-900 dark:text-warm-50">KSh {entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function SalesChart({ locale, dailySales }: SalesChartProps) {
  const [period, setPeriod] = useState<Period>("daily");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 h-full flex flex-col"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {dt("salesOverview", locale)}
        </h3>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all min-h-[28px] ${
                period === p
                  ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                  : "text-warm-500 dark:text-warm-400 hover:text-warm-700"
              }`}
            >
              {p === "daily" ? dt("daily", locale) : p === "weekly" ? dt("weekly", locale) : dt("monthly", locale)}
            </button>
          ))}
        </div>
      </div>

      {dailySales.length > 0 ? (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySales} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C75B39" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C75B39" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMpesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#C75B39" fill="url(#colorRevenue)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="mpesa" name="M-Pesa" stroke="#2D5A3D" fill="url(#colorMpesa)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna mauzo bado" : "No sales data yet"}</p>
        </div>
      )}
    </motion.div>
  );
}
