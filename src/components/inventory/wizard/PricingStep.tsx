"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Locale } from "@/types";
import type { NewProductFormData } from "@/lib/addInventorySchema";
import { INVENTORY_CATEGORIES } from "@/lib/addInventorySchema";

interface Props {
  data: NewProductFormData;
  errors: Record<string, string>;
  locale: Locale;
  onChange: <K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => void;
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function PricingStep({ data, errors, locale, onChange }: Props) {
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const margin = useMemo(() => {
    if (data.sellingPrice <= 0) return 0;
    return Math.round(((data.sellingPrice - data.buyingPrice) / data.sellingPrice) * 100);
  }, [data.buyingPrice, data.sellingPrice]);

  const marginColor = margin >= 30 ? "text-forest-600 bg-forest-50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-700/30" :
                      margin >= 20 ? "text-savanna-600 bg-savanna-50 dark:bg-savanna-900/20 border-savanna-200 dark:border-savanna-700/30" :
                      margin > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/30" : "";

  const suggestedMarkup = INVENTORY_CATEGORIES.find(c => c.key === data.category)?.markup || 30;
  const suggestedPrice = data.buyingPrice > 0 ? Math.ceil(data.buyingPrice * (1 + suggestedMarkup / 100)) : 0;
  const profit = Math.max(0, data.sellingPrice - data.buyingPrice);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5 sm:space-y-6">
      {/* Cost + Selling - side by side on tablet+ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Cost Price", "Bei ya Kununulia")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
            <input type="number" value={data.buyingPrice || ""} onChange={(e) => onChange("buyingPrice", Number(e.target.value))} placeholder="0"
              className={`w-full pl-12 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors tabular-nums ${
                errors.buyingPrice ? "border-red-400 shake" : "border-warm-200 dark:border-warm-700"
              }`}
              style={{ fontSize: "16px", minHeight: "48px" }} />
          </div>
          {errors.buyingPrice && <p className="text-xs text-red-500 mt-1">{errors.buyingPrice}</p>}
          <p className="text-[10px] text-warm-400 mt-1 hidden sm:block">{t("Cost per unit", "Gharama kwa kipimo")}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Selling Price", "Bei ya Kuuza")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
            <input type="number" value={data.sellingPrice || ""} onChange={(e) => onChange("sellingPrice", Number(e.target.value))} placeholder="0"
              className={`w-full pl-12 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors tabular-nums ${
                errors.sellingPrice ? "border-red-400 shake" : "border-warm-200 dark:border-warm-700"
              }`}
              style={{ fontSize: "16px", minHeight: "48px" }} />
          </div>
          {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice}</p>}
          {suggestedPrice > 0 && data.buyingPrice > 0 && (
            <button onClick={() => onChange("sellingPrice", suggestedPrice)}
              className="text-[11px] text-terracotta-500 hover:text-terracotta-600 mt-1 underline underline-offset-2 active:text-terracotta-700">
              {locale === "sw" ? `Pendekezo: KSh ${suggestedPrice.toLocaleString()}` : `Suggest: KSh ${suggestedPrice.toLocaleString()}`}
            </button>
          )}
        </div>
      </motion.div>

      {/* Profit margin display */}
      {data.buyingPrice > 0 && data.sellingPrice > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${marginColor}`}>
            <div>
              <span className="text-xs font-medium">{t("Profit Margin", "Faida")}</span>
              <p className="text-lg sm:text-xl font-heading font-extrabold tabular-nums">{margin}%</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-warm-500 dark:text-warm-400">{t("Amount", "Kiasi")}</span>
              <p className="text-sm sm:text-base font-heading font-bold tabular-nums">KSh {profit.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Wholesale - two column */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Wholesale Price", "Bei ya Jumla")}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
            <input type="number" value={data.wholesalePrice || ""} onChange={(e) => onChange("wholesalePrice", Number(e.target.value))} placeholder="0"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors tabular-nums"
              style={{ fontSize: "16px", minHeight: "48px" }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Min Qty", "Idadi Jumla")}
          </label>
          <input type="number" value={data.wholesaleMinQty || ""} onChange={(e) => onChange("wholesaleMinQty", Number(e.target.value))} placeholder="0"
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors tabular-nums"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
