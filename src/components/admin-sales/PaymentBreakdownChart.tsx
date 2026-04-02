"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Locale } from "@/types";
import type { PaymentBreakdown } from "@/hooks/useSalesData";

interface PaymentBreakdownChartProps {
  locale: Locale;
  breakdown: PaymentBreakdown[];
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const COLORS = { mpesa: "#2D5A3D", cash: "#C75B39", credit: "#D97706", bank: "#4A90D9", split: "#8B5CF6" };

export default function PaymentBreakdownChart({ locale, breakdown }: PaymentBreakdownChartProps) {
  const chartData = breakdown.map((b) => ({
    name: b.method.toUpperCase(),
    value: b.total,
    percentage: b.percentage,
    count: b.count,
  }));

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
        {t("Payment Methods", "Njia za Malipo", locale)}
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || "#888"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, t("Amount", "Kiasi", locale)]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {breakdown.map((item) => (
            <div key={item.method} className="flex items-center justify-between p-2 rounded-lg bg-warm-50/50 dark:bg-warm-800/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.method as keyof typeof COLORS] || "#888" }} />
                <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{item.icon} {item.method.toUpperCase()}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-warm-900 dark:text-warm-50">KSh {item.total.toLocaleString()}</p>
                <p className="text-[10px] text-warm-400">{item.count} {t("txns", "miamala", locale)} ({item.percentage}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
