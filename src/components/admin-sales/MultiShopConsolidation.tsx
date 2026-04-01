"use client";

import type { Locale } from "@/types";
import type { ShopConsolidation } from "@/hooks/useSalesData";

interface MultiShopConsolidationProps {
  locale: Locale;
  shops: ShopConsolidation[];
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function MultiShopConsolidation({ locale, shops }: MultiShopConsolidationProps) {
  const totalRevenue = shops.reduce((s, sh) => s + sh.todayRevenue, 0);
  const totalTxns = shops.reduce((s, sh) => s + sh.todayTransactions, 0);
  const maxRevenue = Math.max(...shops.map((s) => s.todayRevenue), 1);

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {t("Multi-Shop Overview", "Muhtasari wa Maduka Mengi", locale)}
        </h3>
        <span className="text-xs text-warm-400">{shops.length} {t("locations", "maeneo", locale)}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {shops.map((shop) => (
          <div key={shop.shopId} className="p-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${shop.isActive ? "bg-forest-500 animate-pulse" : "bg-warm-300"}`} />
                <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{shop.shopName}</span>
              </div>
              <span className={`text-[10px] font-bold ${shop.growthRate >= 0 ? "text-forest-500" : "text-red-500"}`}>
                {shop.growthRate >= 0 ? "↑" : "↓"} {Math.abs(shop.growthRate)}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-warm-100 dark:bg-warm-800 mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                style={{ width: `${(shop.todayRevenue / maxRevenue) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-warm-400">
              <span>KSh {shop.todayRevenue.toLocaleString()}</span>
              <span>{shop.todayTransactions} {t("txns", "miamala", locale)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-gradient-to-r from-terracotta-50 to-savanna-50 dark:from-terracotta-900/10 dark:to-savanna-900/10 border border-terracotta-200/40 dark:border-terracotta-800/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{t("Consolidated Total", "Jumla ya Maduka Yote", locale)}</span>
          <span className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {totalRevenue.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-warm-400 mt-1">{totalTxns} {t("transactions across all shops", "miamala kote", locale)}</p>
      </div>
    </div>
  );
}
