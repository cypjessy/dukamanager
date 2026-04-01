"use client";

import type { Locale } from "@/types";

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface ReportMetrics {
  totalProducts: number;
  inventoryValue: number;
  totalRevenue: number;
}

interface Props {
  metrics: ReportMetrics;
  topProducts: TopProduct[];
  locale: Locale;
}

export default function InventoryReports({ metrics, topProducts, locale }: Props) {
  const totalRevenue = metrics.totalRevenue || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Jumla ya Bidhaa" : "Total Products"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{metrics.totalProducts}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Thamani ya Hesabu" : "Inventory Value"}</p>
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {metrics.inventoryValue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Mapato ya Bidhaa" : "Products Revenue"}</p>
          <p className="text-lg font-heading font-extrabold text-forest-600 tabular-nums">KSh {topProducts.reduce((s, p) => s + p.revenue, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Uchambuzi wa Bidhaa" : "Product Analysis"}
        </h3>
        {topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map((p) => {
              const pct = Math.round((p.revenue / totalRevenue) * 100);
              const cls = pct >= 5 ? "A" : pct >= 1 ? "B" : "C";
              return (
                <div key={p.name} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cls === "A" ? "bg-forest-100 text-forest-700" : cls === "B" ? "bg-savanna-100 text-savanna-700" : "bg-warm-200 text-warm-600"}`}>{cls}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                    <p className="text-[9px] text-warm-400">x{p.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.revenue.toLocaleString()}</p>
                    <p className="text-[9px] text-warm-400">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna data ya bidhaa" : "No product data"}</p>
        )}
      </div>
    </div>
  );
}
