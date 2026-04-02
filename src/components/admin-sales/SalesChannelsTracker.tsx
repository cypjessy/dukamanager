"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { Locale } from "@/types";
import type { ChannelData } from "@/hooks/useSalesData";

interface SalesChannelsTrackerProps {
  locale: Locale;
  channels: ChannelData[];
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const channelIcons: Record<string, string> = {
  "in-store": "🏪",
  online: "🌐",
  phone: "📞",
  whatsapp: "💬",
};

export default function SalesChannelsTracker({ locale, channels }: SalesChannelsTrackerProps) {
  const chartData = channels.map((c) => ({
    name: c.channel,
    revenue: c.revenue,
    volume: c.volume,
    growth: c.growthRate,
  }));

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
        {t("Sales Channels", "Njia za Mauzo", locale)}
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {channels.map((ch) => (
          <div key={ch.channel} className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{channelIcons[ch.channel] || "📊"}</span>
              <span className="text-xs font-medium text-warm-700 dark:text-warm-300 capitalize">{ch.channel}</span>
            </div>
            <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {ch.revenue.toLocaleString()}</p>
            <p className="text-[10px] text-warm-400">{ch.volume} {t("orders", "maagizo", locale)}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] font-bold ${ch.growthRate >= 0 ? "text-forest-500" : "text-red-500"}`}>
                {ch.growthRate >= 0 ? "↑" : "↓"} {Math.abs(ch.growthRate)}%
              </span>
              <span className="text-[10px] text-warm-400">{t("growth", "ukuaji", locale)}</span>
            </div>
            {ch.avgResponseTime && (
              <p className="text-[10px] text-warm-400 mt-1">
                {t("Avg response", "Wastani wa majibu", locale)}: {ch.avgResponseTime}
              </p>
            )}
          </div>
        ))}
      </div>

      {channels.length > 0 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8c8a85" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8c8a85" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [name === "revenue" ? `KSh ${Number(value).toLocaleString()}` : value, name]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={["#C75B39", "#2D5A3D", "#D4A574", "#4A90D9"][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
