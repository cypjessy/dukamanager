"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { ProductSaleData } from "@/hooks/useSalesData";

interface ProductAnalyticsSectionProps {
  locale: Locale;
  products: ProductSaleData[];
  onSuggestDiscount?: (productId: string, productName: string, suggestedPercent: number) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function ProductAnalyticsSection({ locale, products, onSuggestDiscount }: ProductAnalyticsSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductSaleData | null>(null);
  const [sortBy, setSortBy] = useState<"revenue" | "units" | "velocity">("revenue");

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "units") return b.unitsSold - a.unitsSold;
    return b.velocity - a.velocity;
  });

  const topProducts = sorted.slice(0, 10);
  const slowMoving = sorted.filter((p) => p.velocity < 2).slice(0, 5);

  const stockStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-500";
      case "low": return "bg-amber-500";
      case "out": return "bg-red-700";
      default: return "bg-forest-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Top Selling Products", "Bidhaa Bora", locale)}
            </h3>
            <p className="text-xs text-warm-400 mt-0.5">
              {t("Product performance overview", "Muhtasari wa utendaji wa bidhaa", locale)}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
            {(["revenue", "units", "velocity"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all min-h-[28px] ${
                  sortBy === s
                    ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                    : "text-warm-500 dark:text-warm-400"
                }`}
              >
                {s === "revenue" ? t("Revenue", "Mapato", locale) : s === "units" ? t("Units", "Vipimo", locale) : t("Velocity", "Kasi", locale)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {topProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-warm-200/40 dark:border-warm-700/40 p-3 cursor-pointer hover:shadow-md transition-shadow"
              style={{ background: "rgba(255,255,255,0.5)" }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-lg">
                  📦
                </div>
                <div className={`w-2 h-2 rounded-full ${stockStatusColor(product.stockStatus)}`} />
              </div>

              <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{product.name}</p>
              <p className="text-[10px] text-warm-400">{product.category}</p>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-warm-400">{t("Sold", "Imezua", locale)}</span>
                  <span className="font-bold text-warm-900 dark:text-warm-50">{product.unitsSold}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-warm-400">{t("Revenue", "Mapato", locale)}</span>
                  <span className="font-bold text-warm-900 dark:text-warm-50">KSh {product.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-warm-400">{t("Stock", "Hifadhi", locale)}</span>
                  <span className={`font-bold ${product.stockStatus === "ok" ? "text-forest-500" : "text-red-500"}`}>
                    {product.stockLevel}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-warm-400 mb-0.5">
                  <span>{t("Velocity", "Kasi", locale)}</span>
                  <span>{product.velocity}/day</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-warm-100 dark:bg-warm-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                    style={{ width: `${Math.min(100, (product.velocity / Math.max(...products.map((p) => p.velocity), 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {slowMoving.length > 0 && (
        <div className="rounded-2xl border border-amber-200/60 dark:border-amber-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Slow-Moving Inventory", "Bidhaa Zinazosonga Polepole", locale)}
            </h3>
          </div>

          <div className="space-y-2">
            {slowMoving.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{product.name}</p>
                    <p className="text-[10px] text-warm-400">{product.velocity} {t("units/day", "vipimo/siku", locale)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-warm-400">{product.stockLevel} {t("in stock", "hifadhi", locale)}</span>
                  <button
                    onClick={() => {
                      const suggestedPercent = product.velocity === 0 ? 30 : product.velocity < 1 ? 20 : 10;
                      onSuggestDiscount?.(product.id, product.name, suggestedPercent);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    {t("Suggest Discount", "Pendekeza Punguzo", locale)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-warm-900 border border-warm-200/60 dark:border-warm-700/60 shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-2xl">📦</div>
                  <div>
                    <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">{selectedProduct.name}</h3>
                    <p className="text-xs text-warm-400">{selectedProduct.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("Units Sold", "Vipimo Vilivouzwa", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{selectedProduct.unitsSold}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("Revenue", "Mapato", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {selectedProduct.revenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("Profit Margin", "Ukingo wa Faida", locale)}</p>
                  <p className="text-lg font-bold text-warm-900 dark:text-warm-50">{selectedProduct.profitMargin}%</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-[10px] text-warm-400">{t("Stock Level", "Kiwango cha Hifadhi", locale)}</p>
                  <p className={`text-lg font-bold ${selectedProduct.stockStatus === "ok" ? "text-forest-500" : "text-red-500"}`}>
                    {selectedProduct.stockLevel}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-warm-500 mb-2">{t("Sales by Hour", "Mauzo kwa Saa", locale)}</p>
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 24 }, (_, h) => {
                    const val = selectedProduct.hourlyBreakdown[h.toString()] || 0;
                    const max = Math.max(...Object.values(selectedProduct.hourlyBreakdown), 1);
                    const height = Math.max(4, (val / max) * 100);
                    return (
                      <div
                        key={h}
                        className="flex-1 rounded-sm bg-terracotta-500/60 hover:bg-terracotta-500 transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${h}:00 - ${val} units`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-warm-400 mt-1">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
