"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import type { Locale } from "@/types";
import type { NewProductFormData } from "@/lib/addInventorySchema";
import { INVENTORY_CATEGORIES, UNIT_OPTIONS } from "@/lib/addInventorySchema";
import { useBunnyUpload } from "@/hooks/useBunnyUpload";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  data: NewProductFormData;
  errors: Record<string, string>;
  locale: Locale;
  onChange: <K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => void;
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function ProductDetailsStep({ data, errors, locale, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { shopId } = useAuth();
  const { uploading, progress, upload } = useBunnyUpload(shopId || undefined);

  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const handleImage = useCallback(async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const result = await upload(file, "products");
    if (result) {
      onChange("imageUrl" as keyof NewProductFormData, result.cdnUrl as unknown as NewProductFormData[keyof NewProductFormData]);
    }
    onChange("imageFile", file as NewProductFormData["imageFile"]);
  }, [onChange, upload]);

  const generateSKU = useCallback(() => {
    const prefix = data.category ? data.category.slice(0, 3).toUpperCase() : "PRD";
    const ts = Date.now().toString(36).toUpperCase().slice(-5);
    onChange("sku", `${prefix}-${ts}`);
  }, [data.category, onChange]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5 sm:space-y-6">
      <motion.div variants={item}>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2 uppercase tracking-wider">
          {t("Product Image", "Picha ya Bidhaa")}
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleImage(e.dataTransfer.files[0]); }}
          className={`relative border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all hover:border-terracotta-400 hover:bg-terracotta-50/30 dark:hover:bg-terracotta-900/10 active:scale-[0.99] ${
            preview ? "border-forest-400 bg-forest-50/30 dark:bg-forest-900/10" : "border-warm-200 dark:border-warm-700"
          }`}
          style={{ minHeight: "clamp(180px, 30vw, 280px)" }}
        >
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" capture="environment"
            onChange={(e) => handleImage(e.target.files?.[0] || null)} className="hidden" />
          {preview ? (
            <div className="relative py-4">
              <img src={preview} alt="Product image preview"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-xl object-cover shadow-md" />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setPreview(null); onChange("imageFile", undefined); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:bg-red-600 active:scale-90 transition-all"
                aria-label={t("Remove image", "Ondoa picha")}
              >
                &times;
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-warm-700 dark:text-warm-300">
                {t("Take Photo or Upload Image", "Piga Picha au Weka Picha")}
              </p>
              <p className="text-xs text-warm-400 mt-1">JPG, PNG &middot; Max 5MB</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Product Names - two column on tablet+ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Product Name (English)", "Jina la Bidhaa (English)")} <span className="text-red-500">*</span>
          </label>
          <input type="text" value={data.name} onChange={(e) => onChange("name", e.target.value)} placeholder="e.g. Sugar 1kg"
            className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors ${
              errors.name ? "border-red-400 shake" : "border-warm-200 dark:border-warm-700"
            }`}
            style={{ fontSize: "16px", minHeight: "48px" }} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t("Name (Swahili)", "Jina (Kiswahili)")}
          </label>
          <input type="text" value={data.nameSw} onChange={(e) => onChange("nameSw", e.target.value)} placeholder="e.g. Sukari 1kg"
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
      </motion.div>

      {/* Category Selector */}
      <motion.div variants={item}>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">
          {t("Category", "Aina ya Bidhaa")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {INVENTORY_CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => onChange("category", cat.key)}
              className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all active:scale-95 ${
                data.category === cat.key
                  ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 shadow-sm"
                  : "border-warm-200 dark:border-warm-700 hover:border-warm-300 dark:hover:border-warm-600 text-warm-600 dark:text-warm-400"
              }`}
              style={{ minHeight: "64px" }}>
              <CategoryIcon icon={cat.icon} size={20} />
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-center line-clamp-2">
                {locale === "sw" ? cat.labelSw : cat.label}
              </span>
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </motion.div>

      {/* Unit + SKU row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">
            {t("Unit", "Kipimo")} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {UNIT_OPTIONS.slice(0, 4).map((u) => (
              <button key={u.value} onClick={() => onChange("unit", u.value)}
                className={`py-2.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all active:scale-95 ${
                  data.unit === u.value
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
                }`}
                style={{ minHeight: "40px" }}>
                {locale === "sw" ? u.labelSw : u.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
            {UNIT_OPTIONS.slice(4).map((u) => (
              <button key={u.value} onClick={() => onChange("unit", u.value)}
                className={`py-2.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all active:scale-95 ${
                  data.unit === u.value
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
                }`}
                style={{ minHeight: "40px" }}>
                {locale === "sw" ? u.labelSw : u.label}
              </button>
            ))}
          </div>
          {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
        </div>

        <div>
          {data.unit === "other" ? (
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t("Custom Unit", "Kipimo Chako")} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={data.customUnit || ""} onChange={(e) => onChange("customUnit", e.target.value)} placeholder="e.g. Dozen"
                className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors ${errors.customUnit ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                style={{ fontSize: "16px", minHeight: "48px" }} />
              {errors.customUnit && <p className="text-xs text-red-500 mt-1">{errors.customUnit}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t("SKU / Barcode", "Nambari (SKU)")}
              </label>
              <div className="flex gap-2">
                <input type="text" value={data.sku} onChange={(e) => onChange("sku", e.target.value)} placeholder="Auto or manual"
                  className="flex-1 px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors font-mono"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                <button onClick={generateSKU}
                  className="px-4 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all flex-shrink-0"
                  style={{ minHeight: "48px" }}>
                  {t("Generate", "Tengeneza")}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CategoryIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grain: <><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></>,
    oil: <><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></>,
    soap: <><path d="M17.5 6.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7 12a5 5 0 0010 0" /><path d="M12 12H4v6a2 2 0 002 2h12a2 2 0 002-2v-6h-8" /></>,
    cup: <><path d="M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v4M10 2v4M14 2v4" /></>,
    snack: <><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="12" y1="6" x2="12" y2="18" /></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    plant: <><path d="M7 20h10M12 20v-6" /><path d="M12 14c-2.5-4-7-5-7-5s1 6 7 10c6-4 7-10 7-10s-4.5 1-7 5z" /></>,
    firstaid: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    personal: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    dairy: <><path d="M8 2h8l2 4v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6l2-4z" /><line x1="6" y1="6" x2="18" y2="6" /></>,
    meat: <><path d="M6 12a6 6 0 0012 0 6 6 0 00-12 0z" /><path d="M12 6V2" /><path d="M8 18l4-4 4 4" /></>,
    other: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[icon] || paths.other}
    </svg>
  );
}
