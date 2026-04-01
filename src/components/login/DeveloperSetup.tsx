"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface DeveloperSetupProps {
  locale: Locale;
  onComplete: () => void;
  onBack: () => void;
}

export default function DeveloperSetup({ locale, onComplete, onBack }: DeveloperSetupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !name || !shopName) {
      setError(t("All fields are required", "Sehemu zote zinahitajika"));
      return;
    }
    if (password.length < 6) {
      setError(t("Password must be at least 6 characters", "Nenosiri lazima liwe na herufi 6 au zaidi"));
      return;
    }

    setSubmitting(true);
    try {
      const { registerUser } = await import("@/lib/firebase/auth");
      await registerUser(email, password, shopName);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Registration failed", "Usajili umeshindwa");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-card__inner">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
                {t("Developer Account Created!", "Akaunti ya Msanidi Imeundwa!")}
              </h2>
              <p className="text-xs text-warm-500">{t("Your account is ready", "Akaunti yako iko tayari")}</p>
            </div>

            <div className="rounded-xl bg-warm-50 dark:bg-warm-800/60 p-4 text-left space-y-2">
              <div>
                <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider">{t("Email", "Barua pepe")}</p>
                <p className="text-sm font-mono font-bold text-warm-900 dark:text-warm-50">{email}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider">{t("Password", "Nenosiri")}</p>
                <p className="text-sm font-mono font-bold text-warm-900 dark:text-warm-50">{password}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider">{t("Role", "Jukumu")}</p>
                <p className="text-sm font-bold text-terracotta-600">Owner / Developer</p>
              </div>
            </div>

            <p className="text-[10px] text-warm-400">
              {t("Save these credentials. You can now login.", "Hifadhi vitambulisho hivi. Sasa unaweza kuingia.")}
            </p>

            <button onClick={onComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px]">
              {t("Go to Login", "Nenda kwenye Kuingia")}
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4" noValidate>

            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                {t("Developer Setup", "Usanidi wa Msanidi")}
              </h2>
              <p className="text-xs text-warm-500 mt-1">
                {t("Create the initial owner account for this system", "Unda akaunti ya mmiliki wa kwanza kwa mfumo huu")}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                  {t("Full Name", "Jina Kamili")}
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("e.g. John Kamau", "mfano. John Kamau")}
                  className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                  style={{ fontSize: "16px" }} />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                  {t("Email", "Barua pepe")}
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                  style={{ fontSize: "16px" }} autoComplete="off" />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                  {t("Password", "Nenosiri")}
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Min 6 characters", "Angalau herufi 6")}
                  className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                  style={{ fontSize: "16px" }} autoComplete="new-password" />
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                  {t("Shop Name", "Jina la Duka")}
                </label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
                  placeholder={t("e.g. My Duka", "mfano. Duka Yangu")}
                  className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                  style={{ fontSize: "16px" }} />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">{error}</p>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-50">
              {submitting ? t("Creating...", "Inaunda...") : t("Create Developer Account", "Unda Akaunti ya Msanidi")}
            </button>

            <button type="button" onClick={onBack}
              className="w-full py-2 text-xs text-warm-400 hover:text-warm-600 transition-colors min-h-[36px]">
              {t("Back to Login", "Rudi kwenye Kuingia")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
