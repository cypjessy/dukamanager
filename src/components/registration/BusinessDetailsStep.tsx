"use client";

import { motion } from "framer-motion";
import FloatingInput from "@/components/ui/FloatingInput";
import type { RegistrationData } from "@/hooks/useRegistration";
import type { Locale } from "@/types";

interface BusinessDetailsStepProps {
  data: RegistrationData;
  onChange: (updates: Partial<RegistrationData>) => void;
  errors: string[];
  locale: Locale;
}

const businessTypes = [
  { value: "sole_proprietorship", en: "Sole Proprietorship", sw: "Biashara ya Binafsi" },
  { value: "partnership", en: "Partnership", sw: "Ushirikiano" },
  { value: "limited_company", en: "Limited Company", sw: "Kampuni ya Hisa" },
  { value: "cooperative", en: "Cooperative", sw: "Ushirika" },
];

const counties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
  "Kitale", "Garissa", "Nyeri", "Machakos", "Meru", "Embu", "Kakamega",
  "Kericho", "Narok", "Naivasha", "Nanyuki", "Lodwar", "Isiolo",
];

export default function BusinessDetailsStep({ data, onChange, errors, locale }: BusinessDetailsStepProps) {
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
          {locale === "sw" ? "Taarifa za Biashara" : "Business Details"}
        </h3>
        <p className="text-xs text-warm-500">
          {locale === "sw" ? "Weka taarifa za biashara yako" : "Tell us about your business"}
        </p>
      </div>

      <FloatingInput
        label={locale === "sw" ? "Jina la Biashara" : "Business Name"}
        type="text"
        value={data.businessName}
        onChange={(e) => onChange({ businessName: e.target.value })}
        error={errors.find((e) => e.includes("Business name"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      />

      <div>
        <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
          {locale === "sw" ? "Aina ya Biashara" : "Business Type"}
        </label>
        <select
          value={data.businessType}
          onChange={(e) => onChange({ businessType: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-700/80 border-2 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px] ${
            errors.find((e) => e.includes("type")) ? "border-red-400" : "border-warm-200 dark:border-warm-600 focus:border-terracotta-500"
          }`}
        >
          <option value="">{locale === "sw" ? "Chagua aina" : "Select type"}</option>
          {businessTypes.map((t) => (
            <option key={t.value} value={t.value}>{locale === "sw" ? t.sw : t.en}</option>
          ))}
        </select>
        {errors.find((e) => e.includes("type")) && (
          <p className="mt-1 text-xs text-red-500">{errors.find((e) => e.includes("type"))}</p>
        )}
      </div>

      <FloatingInput
        label="KRA PIN"
        type="text"
        value={data.kraPin}
        onChange={(e) => onChange({ kraPin: e.target.value.toUpperCase() })}
        error={errors.find((e) => e.includes("KRA"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="8" x2="17" y2="8" />
            <line x1="7" y1="12" x2="13" y2="12" />
          </svg>
        }
      />

      <FloatingInput
        label={locale === "sw" ? "Nambari ya Usajili (Hiari)" : "Registration Number (Optional)"}
        type="text"
        value={data.registrationNumber}
        onChange={(e) => onChange({ registrationNumber: e.target.value })}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
            {locale === "sw" ? "Kaunti" : "County"}
          </label>
          <select
            value={data.county}
            onChange={(e) => onChange({ county: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-700/80 border-2 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px] ${
              errors.find((e) => e.includes("County")) ? "border-red-400" : "border-warm-200 dark:border-warm-600 focus:border-terracotta-500"
            }`}
          >
            <option value="">{locale === "sw" ? "Chagua" : "Select"}</option>
            {counties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <FloatingInput
          label={locale === "sw" ? "Mji" : "Town"}
          type="text"
          value={data.town}
          onChange={(e) => onChange({ town: e.target.value })}
          error={errors.find((e) => e.includes("Town"))}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
          {locale === "sw" ? "Maelezo ya Biashara (Hiari)" : "Business Description (Optional)"}
        </label>
        <textarea
          value={data.businessDescription}
          onChange={(e) => onChange({ businessDescription: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-700/80 border-2 border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 resize-none"
          placeholder={locale === "sw" ? "Eleza biashara yako..." : "Describe your business..."}
        />
      </div>
    </motion.div>
  );
}
