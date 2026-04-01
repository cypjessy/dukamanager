"use client";

import { motion } from "framer-motion";
import type { RegistrationData } from "@/hooks/useRegistration";
import type { Locale } from "@/types";

interface PlanSelectionStepProps {
  data: RegistrationData;
  onChange: (updates: Partial<RegistrationData>) => void;
  errors: string[];
  locale: Locale;
}

const plans = [
  {
    id: "free" as const,
    price: "0",
    priceLabel: { en: "Free Forever", sw: "Bure Milele" },
    name: { en: "Free Tier", sw: "Mpango wa Bure" },
    features: [
      { en: "1 Shop", sw: "Duka 1" },
      { en: "100 transactions/month", sw: "Shughuli 100/mwezi" },
      { en: "Basic inventory", sw: "Hesabu ya kimsingi" },
      { en: "Cash & M-Pesa payments", sw: "Malipo ya pesa & M-Pesa" },
      { en: "Email support", sw: "Msaada wa barua pepe" },
    ],
    color: "border-warm-300 dark:border-warm-600",
    gradient: "from-warm-100 to-warm-50 dark:from-warm-800 dark:to-warm-900",
    recommended: false,
  },
  {
    id: "growth" as const,
    price: "2,999",
    priceLabel: { en: "per month", sw: "kwa mwezi" },
    name: { en: "Growth Tier", sw: "Mpango wa Kukua" },
    features: [
      { en: "Up to 3 Shops", sw: "Duka hadi 3" },
      { en: "Unlimited transactions", sw: "Shughuli bila kikomo" },
      { en: "Full inventory management", sw: "Usimamizi kamili" },
      { en: "Reports & analytics", sw: "Ripoti & takwimu" },
      { en: "Priority support", sw: "Msaada wa kipaumbele" },
      { en: "Employee management", sw: "Usimamizi wa wafanyakazi" },
    ],
    color: "border-terracotta-500",
    gradient: "from-terracotta-50 to-savanna-50 dark:from-terracotta-900/20 dark:to-savanna-900/20",
    recommended: true,
  },
  {
    id: "enterprise" as const,
    price: "9,999",
    priceLabel: { en: "per month", sw: "kwa mwezi" },
    name: { en: "Enterprise", sw: "Mpango wa Kampuni" },
    features: [
      { en: "Unlimited shops", sw: "Duka bila kikomo" },
      { en: "Unlimited everything", sw: "Kila kitu bila kikomo" },
      { en: "Custom integrations", sw: "Miunganisho maalum" },
      { en: "Dedicated account manager", sw: "Meneja wa akaunti" },
      { en: "API access", sw: "Ufikiaji wa API" },
      { en: "Advanced analytics", sw: "Takwimu za hali ya juu" },
    ],
    color: "border-sunset-500",
    gradient: "from-sunset-50 to-terracotta-50 dark:from-sunset-900/20 dark:to-terracotta-900/20",
    recommended: false,
  },
];

export default function PlanSelectionStep({ data, onChange, errors, locale }: PlanSelectionStepProps) {
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
          {locale === "sw" ? "Chagua Mpango" : "Choose Your Plan"}
        </h3>
        <p className="text-xs text-warm-500">
          {locale === "sw" ? "Anza na bure, badilisha wakati wowote" : "Start free, upgrade anytime"}
        </p>
      </div>

      {/* Plan Cards */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange({ selectedPlan: plan.id })}
            className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative overflow-hidden ${
              data.selectedPlan === plan.id
                ? `${plan.color} bg-gradient-to-br ${plan.gradient} shadow-md`
                : "border-warm-200 dark:border-warm-700 bg-white/60 dark:bg-warm-800/60 hover:border-warm-300"
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0">
                <div className="bg-terracotta-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">
                  {locale === "sw" ? "INAPENDEKEZWA" : "RECOMMENDED"}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
                  {plan.name[locale]}
                </h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading font-extrabold text-2xl text-warm-900 dark:text-warm-50">
                    {plan.price === "0" ? "KSh 0" : `KSh ${plan.price}`}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-[10px] text-warm-500">{plan.priceLabel[locale]}</span>
                  )}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  data.selectedPlan === plan.id
                    ? "border-terracotta-500 bg-terracotta-500"
                    : "border-warm-300 dark:border-warm-600"
                }`}
              >
                {data.selectedPlan === plan.id && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>

            <ul className="space-y-1.5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-warm-600 dark:text-warm-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-forest-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f[locale]}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Payment method for paid plans */}
      {data.selectedPlan !== "free" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 pt-2"
        >
          <p className="text-xs font-medium text-warm-600 dark:text-warm-400">
            {locale === "sw" ? "Njia ya Malipo" : "Payment Method"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ paymentMethod: "mpesa" })}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all min-h-[56px] ${
                data.paymentMethod === "mpesa"
                  ? "border-forest-500 bg-forest-50 dark:bg-forest-900/20"
                  : "border-warm-200 dark:border-warm-600 bg-white/60 dark:bg-warm-700/60"
              }`}
            >
              <span className="text-2xl">📱</span>
              <span className="text-sm font-medium text-warm-900 dark:text-warm-100">M-Pesa</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ paymentMethod: "card" })}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all min-h-[56px] ${
                data.paymentMethod === "card"
                  ? "border-forest-500 bg-forest-50 dark:bg-forest-900/20"
                  : "border-warm-200 dark:border-warm-600 bg-white/60 dark:bg-warm-700/60"
              }`}
            >
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium text-warm-900 dark:text-warm-100">
                {locale === "sw" ? "Kadi" : "Card"}
              </span>
            </button>
          </div>
          {errors.find((e) => e.includes("Payment")) && (
            <p className="text-xs text-red-500">{errors.find((e) => e.includes("Payment"))}</p>
          )}
        </motion.div>
      )}

      {/* Referral Code */}
      <div className="pt-2">
        <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">
          {locale === "sw" ? "Nambari ya Rufaa (Hiari)" : "Referral Code (Optional)"}
        </label>
        <input
          type="text"
          value={data.referralCode}
          onChange={(e) => onChange({ referralCode: e.target.value.toUpperCase() })}
          className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-700/80 border-2 border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px]"
          placeholder={locale === "sw" ? "Weka nambari" : "Enter referral code"}
        />
      </div>
    </motion.div>
  );
}
