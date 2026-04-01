"use client";

import type { Locale } from "@/types";
import type { HourlyHeatmapData } from "@/hooks/useSalesData";

interface ShiftAnalysisProps {
  locale: Locale;
  heatmap: HourlyHeatmapData[];
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function ShiftAnalysis({ locale, heatmap }: ShiftAnalysisProps) {
  const maxTx = Math.max(...heatmap.map((h) => h.transactions), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const peakHour = heatmap.reduce((a, b) => (a.transactions > b.transactions ? a : b), heatmap[0]);
  const slowHour = heatmap.reduce((a, b) => (a.transactions < b.transactions ? a : b), heatmap[0]);

  const getHeatColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity === 0) return "bg-warm-100 dark:bg-warm-800/30";
    if (intensity < 0.25) return "bg-terracotta-100 dark:bg-terracotta-900/20";
    if (intensity < 0.5) return "bg-terracotta-200 dark:bg-terracotta-900/30";
    if (intensity < 0.75) return "bg-terracotta-300 dark:bg-terracotta-900/40";
    return "bg-terracotta-500 dark:bg-terracotta-800/60";
  };

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {t("Shift & Time Analysis", "Uchambuzi wa Muda", locale)}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-warm-400">
          <span>{t("Peak", "Kilele", locale)}: {peakHour?.day} {peakHour?.hour}:00 ({peakHour?.transactions} txns)</span>
          <span>{t("Slow", "Polepole", locale)}: {slowHour?.day} {slowHour?.hour}:00 ({slowHour?.transactions} txns)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid gap-1" style={{ gridTemplateColumns: "40px repeat(14, 1fr)" }}>
            <div />
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="text-center text-[9px] text-warm-400 py-1">
                {7 + i}
              </div>
            ))}

            {days.map((day) => (
              <div key={day} className="contents">
                <div className="text-[10px] text-warm-500 font-medium flex items-center">{day}</div>
                {Array.from({ length: 14 }, (_, h) => {
                  const hour = 7 + h;
                  const data = heatmap.find((hm) => hm.day === day && hm.hour === hour);
                  const txCount = data?.transactions || 0;
                  return (
                    <div
                      key={h}
                      className={`rounded-sm ${getHeatColor(txCount, maxTx)} cursor-pointer transition-colors hover:ring-1 hover:ring-terracotta-400`}
                      style={{ height: "24px" }}
                      title={`${day} ${hour}:00 - ${txCount} transactions, KSh ${data?.sales.toLocaleString() || 0}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] text-warm-400">
        <span>{t("Low", "Chini", locale)}</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-warm-100 dark:bg-warm-800/30" />
          <div className="w-4 h-3 rounded-sm bg-terracotta-100 dark:bg-terracotta-900/20" />
          <div className="w-4 h-3 rounded-sm bg-terracotta-200 dark:bg-terracotta-900/30" />
          <div className="w-4 h-3 rounded-sm bg-terracotta-300 dark:bg-terracotta-900/40" />
          <div className="w-4 h-3 rounded-sm bg-terracotta-500 dark:bg-terracotta-800/60" />
        </div>
        <span>{t("High", "Juu", locale)}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/10">
          <p className="text-[10px] text-warm-400">{t("Peak Hours", "Saa za Kilele", locale)}</p>
          <p className="text-sm font-bold text-forest-600">
            {peakHour?.hour}:00 - {Math.min(peakHour?.hour + 2 || 9, 20)}:00
          </p>
          <p className="text-[10px] text-warm-400">{t("Staff optimization", "Boresha wafanyakazi", locale)}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10">
          <p className="text-[10px] text-warm-400">{t("Slow Periods", "Vipindi vya Polepole", locale)}</p>
          <p className="text-sm font-bold text-amber-600">
            {slowHour?.hour}:00 - {Math.min(slowHour?.hour + 2 || 9, 20)}:00
          </p>
          <p className="text-[10px] text-warm-400">{t("Promo opportunity", "Nafasi ya matangazo", locale)}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
          <p className="text-[10px] text-warm-400">{t("Best Day", "Siku Bora", locale)}</p>
          <p className="text-sm font-bold text-blue-600">
            {days.reduce((best, day) => {
              const dayTotal = heatmap.filter((h) => h.day === day).reduce((s, h) => s + h.sales, 0);
              const bestTotal = heatmap.filter((h) => h.day === best).reduce((s, h) => s + h.sales, 0);
              return dayTotal > bestTotal ? day : best;
            }, days[0])}
          </p>
          <p className="text-[10px] text-warm-400">{t("Highest revenue", "Mapato ya juu", locale)}</p>
        </div>
      </div>
    </div>
  );
}
