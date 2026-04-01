"use client";

import { motion } from "framer-motion";
import FloatingInput from "@/components/ui/FloatingInput";
import type { RegistrationData } from "@/hooks/useRegistration";
import type { Locale } from "@/types";

interface AccountSetupStepProps {
  data: RegistrationData;
  onChange: (updates: Partial<RegistrationData>) => void;
  errors: string[];
  locale: Locale;
}

export default function AccountSetupStep({ data, onChange, errors, locale }: AccountSetupStepProps) {
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: "", color: "bg-warm-200", width: "0%" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: locale === "sw" ? "Dhaifu" : "Weak", color: "bg-red-400", width: "25%" };
    if (score <= 3) return { label: locale === "sw" ? "Wastani" : "Fair", color: "bg-savanna-500", width: "55%" };
    return { label: locale === "sw" ? "Imara" : "Strong", color: "bg-forest-500", width: "90%" };
  };

  const strength = getPasswordStrength(data.password);

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
          {locale === "sw" ? "Unda Akaunti Yako" : "Create Your Account"}
        </h3>
        <p className="text-xs text-warm-500">
          {locale === "sw" ? "Weka taarifa zako za kuingia" : "Enter your login credentials"}
        </p>
      </div>

      <FloatingInput
        label={locale === "sw" ? "Jina Kamili" : "Full Name"}
        type="text"
        value={data.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        error={errors.find((e) => e.includes("name"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
        autoComplete="name"
      />

      <FloatingInput
        label={locale === "sw" ? "Barua Pepe" : "Email Address"}
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        error={errors.find((e) => e.toLowerCase().includes("email"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
        autoComplete="email"
        inputMode="email"
      />

      <FloatingInput
        label={locale === "sw" ? "Nambari ya Simu" : "Phone Number"}
        type="tel"
        value={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        error={errors.find((e) => e.toLowerCase().includes("phone"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        }
        autoComplete="tel"
        inputMode="tel"
      />

      <div>
        <FloatingInput
          label={locale === "sw" ? "Nenosiri" : "Password"}
          type="password"
          value={data.password}
          onChange={(e) => onChange({ password: e.target.value })}
          error={errors.find((e) => e.toLowerCase().includes("password") && !e.toLowerCase().includes("match"))}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          autoComplete="new-password"
        />
        {data.password.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="h-1.5 flex-1 rounded-full bg-warm-200 dark:bg-warm-700 mr-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${strength.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: strength.width }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                strength.label === "Weak" || strength.label === "Dhaifu" ? "text-red-500" :
                strength.label === "Fair" || strength.label === "Wastani" ? "text-savanna-500" : "text-forest-500"
              }`}>
                {strength.label}
              </span>
            </div>
          </div>
        )}
      </div>

      <FloatingInput
        label={locale === "sw" ? "Thibitisha Nenosiri" : "Confirm Password"}
        type="password"
        value={data.confirmPassword}
        onChange={(e) => onChange({ confirmPassword: e.target.value })}
        error={errors.find((e) => e.toLowerCase().includes("match"))}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
        autoComplete="new-password"
      />

      <label className="flex items-start gap-3 cursor-pointer min-h-[44px] pt-1">
        <input
          type="checkbox"
          checked={data.acceptTerms}
          onChange={(e) => onChange({ acceptTerms: e.target.checked })}
          className="mt-0.5 w-4 h-4 rounded border-2 border-warm-300 text-terracotta-500 focus:ring-terracotta-500 accent-terracotta-500"
        />
        <span className="text-xs text-warm-600 dark:text-warm-400 leading-relaxed">
          {locale === "sw" ? "Nakubali" : "I agree to the"}{" "}
          <button type="button" className="text-terracotta-600 hover:underline font-medium">
            {locale === "sw" ? "Masharti ya Huduma" : "Terms of Service"}
          </button>{" "}
          {locale === "sw" ? "na" : "and"}{" "}
          <button type="button" className="text-terracotta-600 hover:underline font-medium">
            {locale === "sw" ? "Sera ya Faragha" : "Privacy Policy"}
          </button>
        </span>
      </label>
    </motion.div>
  );
}
