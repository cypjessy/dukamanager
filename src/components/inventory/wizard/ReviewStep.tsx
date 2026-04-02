"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Locale } from "@/types";
import type { NewProductFormData, WizardStep } from "@/lib/addInventorySchema";
import { INVENTORY_CATEGORIES, UNIT_OPTIONS } from "@/lib/addInventorySchema";
import { suppliers } from "@/data/inventoryData";

interface Props {
  data: NewProductFormData;
  errors: Record<string, string>;
  locale: Locale;
  onChange: <K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => void;
  onEditStep: (step: WizardStep) => void;
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function ReviewStep({ data, errors, locale, onChange, onEditStep }: Props) {
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const category = INVENTORY_CATEGORIES.find((c) => c.key === data.category);
  const unit = UNIT_OPTIONS.find((u) => u.value === data.unit);
  const supplier = suppliers.find((s) => s.id === data.supplierId);
  const margin = data.sellingPrice > 0 ? Math.round(((data.sellingPrice - data.buyingPrice) / data.sellingPrice) * 100) : 0;
  const profit = Math.max(0, data.sellingPrice - data.buyingPrice);

  const previewImage = data.imageFile ? URL.createObjectURL(data.imageFile) : null;

  const daysUntilExpiry = useMemo(() => {
    if (!data.expiryDate) return null;
    return Math.ceil((new Date(data.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [data.expiryDate]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
      {/* Product Summary Card */}
      <motion.div variants={item} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="flex items-start gap-3">
           <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
             {previewImage ? (
               <Image src={previewImage} alt={data.name} className="w-full h-full object-cover" width={16} height={16} />
             ) : (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                 <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
               </svg>
             )}
           </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50 truncate">{data.name}</h3>
            {data.nameSw && <p className="text-xs text-warm-500 truncate">{data.nameSw}</p>}
            {category && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600 text-[10px] font-medium">
                {locale === "sw" ? category.labelSw : category.label}
              </span>
            )}
            {data.sku && <p className="text-[10px] text-warm-400 font-mono mt-1">{data.sku}</p>}
          </div>
          <button onClick={() => onEditStep(1)}
            className="text-terracotta-500 text-xs underline underline-offset-2 min-h-[32px] active:text-terracotta-700">
            {t("Edit", "Hariri")}
          </button>
        </div>
      </motion.div>

      {/* Pricing Summary */}
      <motion.div variants={item} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wider">{t("Pricing", "Bei")}</h4>
          <button onClick={() => onEditStep(2)} className="text-terracotta-500 text-xs underline underline-offset-2 min-h-[24px] active:text-terracotta-700">
            {t("Edit", "Hariri")}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] text-warm-400">{t("Cost", "Gharama")}</p>
            <p className="text-sm sm:text-base font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {data.buyingPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-warm-400">{t("Selling", "Uuzaji")}</p>
            <p className="text-sm sm:text-base font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {data.sellingPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-warm-400">{t("Profit", "Faida")}</p>
            <p className={`text-sm sm:text-base font-heading font-bold tabular-nums ${margin >= 20 ? "text-forest-600" : "text-red-500"}`}>{margin}%</p>
            <p className="text-[10px] text-warm-400 tabular-nums">KSh {profit.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Stock Summary */}
      <motion.div variants={item} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wider">{t("Stock", "Hesabu")}</h4>
          <button onClick={() => onEditStep(3)} className="text-terracotta-500 text-xs underline underline-offset-2 min-h-[24px] active:text-terracotta-700">
            {t("Edit", "Hariri")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] text-warm-400">{t("Quantity", "Idadi")}</p>
            <p className="text-sm sm:text-base font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
              {data.quantity} {unit ? (locale === "sw" ? unit.labelSw : unit.label) : ""}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-warm-400">{t("Reorder", "Kiwango")}</p>
            <p className="text-sm sm:text-base font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{data.reorderPoint}</p>
          </div>
          {data.warehouse && (
            <div>
              <p className="text-[10px] text-warm-400">{t("Location", "Mahali")}</p>
              <p className="text-sm text-warm-900 dark:text-warm-50">{data.warehouse}</p>
            </div>
          )}
          {supplier && (
            <div>
              <p className="text-[10px] text-warm-400">{t("Supplier", "Msambazaji")}</p>
              <p className="text-sm text-warm-900 dark:text-warm-50 truncate">{supplier.name}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expiry Alert */}
      {data.expiryDate && daysUntilExpiry !== null && (
        <motion.div variants={item} className={`rounded-xl p-3 flex items-center gap-2 ${
          daysUntilExpiry <= 30 ? "bg-sunset-50 dark:bg-sunset-900/20 border border-sunset-200 dark:border-sunset-700/30" :
          "bg-warm-50 dark:bg-warm-800/50"
        }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={daysUntilExpiry <= 30 ? "#D4A574" : "currentColor"} strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="text-xs font-medium text-warm-900 dark:text-warm-50">
              {t("Expires", "Tarehe ya Mwisho")}: {data.expiryDate}
            </p>
            <p className="text-[10px] text-warm-500">{daysUntilExpiry} {t("days", "siku")}</p>
          </div>
        </motion.div>
      )}

      {/* Confirmation */}
      <motion.div variants={item} className="rounded-xl bg-terracotta-50/50 dark:bg-terracotta-900/10 border border-terracotta-200/30 dark:border-terracotta-700/20 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={data.confirmed} onChange={(e) => onChange("confirmed", e.target.checked)}
            className="mt-0.5 w-6 h-6 rounded border-2 border-terracotta-300 text-terracotta-500 focus:ring-terracotta-500 accent-terracotta-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
              {t("I confirm this information is accurate", "Nimehakikisha Taarifa Hizi Sawa")}
            </p>
            <p className="text-xs text-warm-500 mt-0.5">
              {t("The product will be added to your inventory", "Bidhaa itaongezwa kwenye orodha yako")}
            </p>
          </div>
        </label>
        {errors.confirmed && <p className="text-xs text-red-500 mt-2 ml-9">{errors.confirmed}</p>}
      </motion.div>
    </motion.div>
  );
}
