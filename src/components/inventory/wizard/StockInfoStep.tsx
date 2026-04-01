"use client";

import { motion } from "framer-motion";
import type { Locale } from "@/types";
import type { NewProductFormData } from "@/lib/addInventorySchema";
import { QUICK_QUANTITIES, WAREHOUSE_PRESETS } from "@/lib/addInventorySchema";
import { suppliers } from "@/data/inventoryData";

interface Props {
  data: NewProductFormData;
  errors: Record<string, string>;
  locale: Locale;
  onChange: <K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => void;
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function StockInfoStep({ data, errors, locale, onChange }: Props) {
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const daysUntilExpiry = data.expiryDate
    ? Math.ceil((new Date(data.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5 sm:space-y-6">
      {/* Quantity with presets */}
      <motion.div variants={item}>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">
          {t("Current Quantity", "Idadi ya Sasa")} <span className="text-red-500">*</span>
        </label>
        <input type="number" value={data.quantity || ""} onChange={(e) => onChange("quantity", Number(e.target.value))} placeholder="0"
          className={`w-full px-4 py-3 sm:py-4 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-xl sm:text-2xl font-heading font-extrabold text-center text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors tabular-nums ${
            errors.quantity ? "border-red-400" : "border-warm-200 dark:border-warm-700"
          }`}
          style={{ minHeight: "64px" }} />
        <div className="flex gap-1.5 sm:gap-2 mt-2">
          {QUICK_QUANTITIES.map((q) => (
            <button key={q} onClick={() => onChange("quantity", (data.quantity || 0) + q)}
              className="flex-1 py-2.5 rounded-lg text-[11px] sm:text-xs font-medium bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all"
              style={{ minHeight: "40px" }}>
              +{q}
            </button>
          ))}
        </div>
        {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
      </motion.div>

      {/* Reorder + Location - side by side on tablet+ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Reorder Point", "Kiwango cha Kuagiza Tena")}
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min="0" max={Math.max(data.quantity, 100)} value={data.reorderPoint}
              onChange={(e) => onChange("reorderPoint", Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-terracotta-500" />
            <input type="number" value={data.reorderPoint || ""} onChange={(e) => onChange("reorderPoint", Number(e.target.value))} placeholder="0"
              className="w-20 px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-center outline-none focus:border-terracotta-500 tabular-nums"
              style={{ minHeight: "44px" }} />
          </div>
          {data.quantity > 0 && (
            <p className="text-[11px] text-warm-400 mt-1">
              {t("Suggested", "Pendekezo")}: {Math.round(data.quantity * 0.2)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Location", "Mahali")}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {WAREHOUSE_PRESETS.slice(0, 4).map((loc) => (
              <button key={loc} onClick={() => onChange("warehouse", loc)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                  data.warehouse === loc
                    ? "bg-terracotta-500 text-white"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
                }`}
                style={{ minHeight: "32px" }}>
                {loc}
              </button>
            ))}
          </div>
          <input type="text" value={data.warehouse} onChange={(e) => onChange("warehouse", e.target.value)}
            placeholder={t("or type custom...", "au weka mengine...")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
      </motion.div>

      {/* Supplier + Expiry - side by side on tablet+ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Supplier", "Msambazaji")}
          </label>
          <select value={data.supplierId} onChange={(e) => onChange("supplierId", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
            style={{ fontSize: "16px", minHeight: "48px" }}>
            <option value="">{t("-- Select --", "-- Chagua --")}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Expiry Date", "Tarehe ya Mwisho")}
          </label>
          <input type="date" value={data.expiryDate || ""} onChange={(e) => onChange("expiryDate", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
            style={{ fontSize: "16px", minHeight: "48px" }} />
          {daysUntilExpiry !== null && (
            <p className={`text-[11px] mt-1 font-medium ${
              daysUntilExpiry <= 30 ? "text-sunset-600" : daysUntilExpiry > 0 ? "text-warm-400" : "text-red-500"
            }`}>
              {daysUntilExpiry > 0
                ? `${daysUntilExpiry} ${t("days remaining", "siku zimebaki")}`
                : t("Expired!", "Imeisha muda!")}
            </p>
          )}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div variants={item}>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
          {t("Notes", "Maelezo")}
        </label>
        <textarea value={data.description || ""} onChange={(e) => onChange("description", e.target.value)} rows={2}
          placeholder={t("Additional details...", "Maelezo...")}
          className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
          style={{ fontSize: "16px", minHeight: "72px" }} />
      </motion.div>
    </motion.div>
  );
}
