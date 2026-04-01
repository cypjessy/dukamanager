"use client";

import type { Locale } from "@/types";
import type { InventoryImpact } from "@/hooks/useSalesData";

interface InventoryImpactProps {
  locale: Locale;
  inventory: InventoryImpact[];
  onReorder?: (productId: string, productName: string, quantity: number) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const statusColors: Record<string, string> = {
  ok: "bg-forest-500",
  low: "bg-amber-500",
  critical: "bg-red-500",
  overstocked: "bg-blue-500",
};

const statusLabels: Record<string, string> = {
  ok: "OK",
  low: "Low",
  critical: "Critical",
  overstocked: "Overstocked",
};

export default function InventoryImpact({ locale, inventory, onReorder }: InventoryImpactProps) {
  const criticalItems = inventory.filter((i) => i.status === "critical");
  const lowItems = inventory.filter((i) => i.status === "low");

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {t("Inventory Impact", "Athari kwa Hifadhi", locale)}
        </h3>
        <div className="flex items-center gap-2">
          {criticalItems.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] font-bold">
              {criticalItems.length} {t("critical", "hatari", locale)}
            </span>
          )}
          {lowItems.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 text-[10px] font-bold">
              {lowItems.length} {t("low", "chini", locale)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {inventory.map((item) => (
          <div key={item.productId} className="flex items-center justify-between p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${statusColors[item.status]}`} />
              <div>
                <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{item.name}</p>
                <p className="text-[10px] text-warm-400">
                  {item.soldToday} {t("sold today", "imeuzwa leo", locale)} • {item.daysUntilStockout === 999 ? "∞" : item.daysUntilStockout} {t("days left", "siku zimebaki", locale)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-warm-900 dark:text-warm-50">{item.currentStock}</p>
                <p className="text-[10px] text-warm-400">{t("in stock", "hifadhi", locale)}</p>
              </div>
              {item.status === "critical" || item.status === "low" ? (
                <button
                  onClick={() => onReorder?.(item.productId, item.name, item.suggestedReorder)}
                  className="px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-[10px] font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 transition-colors"
                >
                  {t("Reorder", "Agiza Tena", locale)} ({item.suggestedReorder})
                </button>
              ) : (
                <span className="text-[10px] text-forest-500 font-medium">{statusLabels[item.status]}</span>
              )}
            </div>
          </div>
        ))}

        {inventory.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-warm-400">{t("No inventory data available", "Hakuna data ya hifadhi", locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
