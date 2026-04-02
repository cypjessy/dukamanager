"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import LoginForm from "./LoginForm";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { ShieldIcon, ShopIcon } from "@/components/ui/Icons";
import { t } from "@/lib/translations";

type Mode = "login" | "register";

export default function LoginCard({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<Mode>("login");
  const [lockedNotice, setLockedNotice] = useState(false);

  useEffect(() => {
    // Check for locked account notice
    if (sessionStorage.getItem("locked_account_notice")) {
      setLockedNotice(true);
      sessionStorage.removeItem("locked_account_notice");
    }
  }, []);

  return (
    <div className="login-card">
      <AnimatePresence mode="wait">
        {mode === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="login-card__inner"
          >
            {/* Locked account notice */}
            {lockedNotice && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl bg-savanna-50 dark:bg-savanna-900/20 border border-savanna-200 dark:border-savanna-800/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-savanna-100 dark:bg-savanna-900/40 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-savanna-600">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-savanna-700 dark:text-savanna-300 mb-0.5">
                      {locale === "sw" ? "Akaunti Imesimamishwa" : "Account Suspended"}
                    </p>
                    <p className="text-[11px] text-savanna-600 dark:text-savanna-400">
                      {locale === "sw"
                        ? "Akaunti yako imesimamishwa na msimamizi. Tafadhali wasiliana na msimamizi wako kwa usaidizi."
                        : "Your account has been suspended by the administrator. Please contact your supervisor for assistance."}
                    </p>
                    <button
                      onClick={() => setLockedNotice(false)}
                      className="mt-2 text-[10px] font-medium text-savanna-600 hover:text-savanna-800 dark:text-savanna-400 dark:hover:text-savanna-300 underline"
                    >
                      {locale === "sw" ? "Funga" : "Dismiss"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab switcher */}
            <div className="login-card__tabs">
              <div className="login-card__tabs-track">
                <motion.div
                  className="login-card__tabs-indicator"
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ left: mode === "login" ? "2px" : "50%" }}
                />
                <button onClick={() => setMode("login")}
                  className={`login-card__tab ${mode === "login" ? "login-card__tab--active" : ""}`}>
                  {locale === "sw" ? "Ingia" : "Login"}
                </button>
                <button onClick={() => setMode("register")}
                  className={`login-card__tab ${(mode as Mode) === "register" ? "login-card__tab--active" : ""}`}>
                  {locale === "sw" ? "Fungua" : "Create Account"}
                </button>
              </div>
            </div>

            {/* Header */}
            <div className="login-card__header">
              <h2 className="login-card__title">{t("tagline", locale)}</h2>
              <p className="login-card__subtitle">{t("subtitle", locale)}</p>
            </div>

            {/* Form */}
            <LoginForm locale={locale} />

            {/* Sign up */}
            <p className="login-card__footer-text">
              {t("noAccount", locale)}{" "}
              <button onClick={() => setMode("register")} className="login-card__link">
                {t("signUp", locale)}
              </button>
            </p>

            {/* Trust */}
            <div className="login-card__trust">
              <div className="login-card__trust-item">
                <ShieldIcon className="text-forest-500 flex-shrink-0" />
                <span>{t("secureEncrypted", locale)}</span>
              </div>
              <div className="login-card__trust-item">
                <ShopIcon className="text-savanna-500 flex-shrink-0" />
                <span>{t("trustedBy", locale)}</span>
              </div>
            </div>

            {/* Developer access link */}
            <div className="mt-4 pt-4 border-t border-warm-200/60 dark:border-warm-700/60 text-center">
              <a href="/developer-register" className="text-[10px] text-warm-400 hover:text-violet-500 transition-colors">
                Register Developer Account →
              </a>
            </div>

            {/* Developer access link */}
            <div className="mt-4 pt-4 border-t border-warm-200/60 dark:border-warm-700/60 text-center">
              <a href="/developer-register" className="text-[10px] text-warm-400 hover:text-violet-500 transition-colors">
                Register Developer Account →
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-center mb-3">
              <button onClick={() => setMode("login")}
                className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 transition-colors min-h-[44px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {locale === "sw" ? "Rudi" : "Back to Login"}
              </button>
            </div>
            <RegistrationWizard locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
