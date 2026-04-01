"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Locale } from "@/types";
import LoginCard from "@/components/login/LoginCard";
import BrandSection from "@/components/login/BrandSection";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { t } from "@/lib/translations";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);
  const { user, role, loading } = useAuth();

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "sw" : "en"));
  }, []);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && user && role && !redirecting) {
      let targetPath = "/dashboard";
      if (role === "developer") {
        targetPath = "/developer";
      } else if (role === "cashier" || role === "head_cashier" || role === "trainee") {
        targetPath = "/cashier";
      }
      if (window.location.pathname !== targetPath) {
        setRedirecting(true);
        window.location.href = targetPath;
      }
    }
  }, [user, role, loading, redirecting]);

  if (redirecting) {
    return (
      <div className="login-page__loading">
        <svg className="animate-spin h-6 w-6 text-terracotta-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-warm-500">Redirecting...</span>
      </div>
    );
  }

  const fadeUp = (delay = 0) =>
    mounted ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: "easeOut" } } : {};

  return (
    <div className="login-page">
      {/* Subtle background */}
      <div className="login-page__bg" aria-hidden="true" />

      {/* Back to homepage */}
      <Link href="/" className="login-page__back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Homepage</span>
      </Link>

      {/* Language toggle */}
      <div className="login-page__lang-toggle">
        <LanguageToggle locale={locale} onToggle={toggleLocale} label={t("switchLang", locale)} />
      </div>

      {/* Grid layout */}
      <div className="login-page__grid">
        {/* LEFT COLUMN: Brand */}
        <motion.div {...fadeUp()} className="login-page__brand">
          <BrandSection locale={locale} />
        </motion.div>

        {/* RIGHT COLUMN: Login */}
        <div className="login-page__login">
          <motion.div {...fadeUp(0.15)} className="login-page__login-inner">
            <LoginCard locale={locale} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
