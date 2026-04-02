"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import FloatingInput from "@/components/ui/FloatingInput";
import type { RegistrationData } from "@/hooks/useRegistration";
import type { Locale } from "@/types";
import { useBunnyUpload } from "@/hooks/useBunnyUpload";
import { useAuth } from "@/providers/AuthProvider";

interface ShopConfigurationStepProps {
  data: RegistrationData;
  onChange: (updates: Partial<RegistrationData>) => void;
  errors: string[];
  locale: Locale;
}

const shopCategories = [
  { value: "retail", en: "Retail Shop", sw: "Duka la Rejareja", icon: "🏪" },
  { value: "wholesale", en: "Wholesale", sw: "Jumla", icon: "📦" },
  { value: "supermarket", en: "Supermarket", sw: "Supamaketi", icon: "🛒" },
  { value: "kiosk", en: "Kiosk", sw: "Kibanda", icon: "🏠" },
  { value: "mobile", en: "Mobile Vendor", sw: "Mfanyabiashara", icon: "🚐" },
];

export default function ShopConfigurationStep({ data, onChange, errors, locale }: ShopConfigurationStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { shopId } = useAuth();
  const { uploading, progress, upload } = useBunnyUpload(shopId || undefined);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const result = await upload(file, "shops");
    if (result) {
      onChange({ shopLogoUrl: result.cdnUrl });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
          {locale === "sw" ? "Sanidi Duka Lako" : "Configure Your Shop"}
        </h3>
        <p className="text-xs text-warm-500">
          {locale === "sw" ? "Weka maelezo ya duka lako la kwanza" : "Set up your first shop details"}
        </p>
      </div>

      {/* Shop Logo */}
      <div className="flex items-center gap-4">
         <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
           {logoPreview ? (
             <Image src={logoPreview} alt="Shop logo" className="w-full h-full object-cover" width={16} height={16} />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
               <span className="text-white font-heading font-extrabold text-lg">
                 {data.shopName ? getInitials(data.shopName) : "D"}
               </span>
             </div>
           )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-10 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-forest-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-warm-700 dark:text-warm-300 mb-1">
            {locale === "sw" ? "Nembo ya Duka" : "Shop Logo"}
          </p>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warm-100 dark:bg-warm-700 text-xs text-warm-600 dark:text-warm-300 cursor-pointer hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors min-h-[36px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {locale === "sw" ? "Pakia Picha" : "Upload Image"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
      </div>

      <FloatingInput
        label={locale === "sw" ? "Jina la Duka" : "Shop Name"}
        type="text"
        value={data.shopName}
        onChange={(e) => onChange({ shopName: e.target.value })}
        error={errors.find((e) => e.includes("Shop name"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      />

      {/* Shop Category Selection */}
      <div>
        <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-2 block">
          {locale === "sw" ? "Aina ya Duka" : "Shop Category"}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {shopCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange({ shopCategory: cat.value })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[64px] ${
                data.shopCategory === cat.value
                  ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20 shadow-sm"
                  : "border-warm-200 dark:border-warm-600 bg-white/60 dark:bg-warm-700/60 hover:border-warm-300"
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] font-medium text-warm-700 dark:text-warm-300 leading-tight text-center">
                {locale === "sw" ? cat.sw : cat.en}
              </span>
            </button>
          ))}
        </div>
        {errors.find((e) => e.includes("category")) && (
          <p className="mt-1 text-xs text-red-500">{errors.find((e) => e.includes("category"))}</p>
        )}
      </div>

      {/* Locked settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
            {locale === "sw" ? "Sarafu" : "Currency"}
          </label>
          <div className="px-4 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 border-2 border-warm-200 dark:border-warm-700 text-sm text-warm-500 min-h-[48px] flex items-center">
            KSh (Kenyan Shilling)
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
            {locale === "sw" ? "Saa za Eneo" : "Timezone"}
          </label>
          <div className="px-4 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 border-2 border-warm-200 dark:border-warm-700 text-sm text-warm-500 min-h-[48px] flex items-center">
            Africa/Nairobi
          </div>
        </div>
      </div>

      {/* Default categories */}
      <div>
        <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-2 block">
          {locale === "sw" ? "Aina za Bidhaa (Zinaweza kubadilishwa baadaye)" : "Default Categories (Editable later)"}
        </label>
        <div className="flex flex-wrap gap-2">
          {data.defaultCategories.map((cat) => (
            <span key={cat} className="px-3 py-1.5 rounded-full bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 text-xs font-medium border border-forest-200 dark:border-forest-800">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
