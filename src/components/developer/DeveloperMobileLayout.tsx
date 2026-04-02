"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/types";

interface Props {
  children: React.ReactNode;
  locale: Locale;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const navItems = [
  { key: "dashboard", href: "/developer", label: { en: "Home", sw: "Nyumbani" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { key: "tenants", href: "/developer/tenants", label: { en: "Shops", sw: "Maduka" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { key: "analytics", href: "/developer/analytics", label: { en: "Stats", sw: "Takwimu" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )},
  { key: "more", href: "/developer/billing", label: { en: "More", sw: "Zaidi" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  )},
];

const moreItems = [
  { key: "billing", href: "/developer/billing", label: { en: "Billing", sw: "Malipo" }, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  )},
  { key: "users", href: "/developer/users", label: { en: "Users", sw: "Watumiaji" }, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
  )},
  { key: "activity", href: "/developer/activity", label: { en: "Activity", sw: "Shughuli" }, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
  )},
  { key: "settings", href: "/developer/settings", label: { en: "Settings", sw: "Mipangilio" }, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  )},
];

function MobileMoreSheet({ isOpen, onClose, locale, pathname, onLogout }: {
  isOpen: boolean; onClose: () => void; locale: Locale; pathname: string; onLogout: () => void;
}) {
  const _t = (en: string, sw: string) => locale === "sw" ? sw : en;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-warm-900 rounded-t-2xl border-t border-warm-200/60 dark:border-warm-700/60 max-h-[70vh] overflow-y-auto" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600 mx-auto mt-3 mb-4" />
            <div className="px-4 pb-4 space-y-1">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.key} href={item.href} onClick={onClose} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? "bg-terracotta-50 dark:bg-terracotta-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-700 text-warm-500"}`}>{item.icon}</div>
                    <div className="text-left"><p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{item.label[locale]}</p></div>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-terracotta-500" />}
                  </Link>
                );
              })}
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-red-50 dark:bg-red-900/15 mt-2"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div className="text-left"><p className="text-sm font-semibold text-red-600 dark:text-red-400">{_t("Log Out", "Ondoka")}</p></div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function DeveloperMobileLayout({ children, locale, userName, userRole: _userRole, onLogout }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const isRouteActive = (href: string) =>
    href === "/developer" ? pathname === "/developer" : pathname.startsWith(href);

  const _handleTabChange = (key: string, href: string) => {
    if (key === "more") {
      setShowMoreSheet(true);
    } else {
      router.push(href);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-warm-50 dark:bg-warm-950 overflow-hidden">
      {/* Status bar spacer */}
      <div className="h-0" />

      {/* Header */}
      <header className="bg-gradient-to-br from-terracotta-600 via-terracotta-500 to-savanna-500 text-white px-4 pt-4 pb-5 rounded-b-3xl shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-medium">{t("Developer Portal", "Tovuti ya Msanidi")}</p>
              <p className="text-sm font-heading font-bold">{t("DukaManager", "DukaManager")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">{userName.slice(0, 2).toUpperCase()}</span>
            </div>
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              title={t("Log Out", "Ondoka")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ paddingBottom: "72px" }}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-warm-900 border-t border-warm-200/60 dark:border-warm-700/60" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", minHeight: "56px" }}>
        <div className="flex items-center justify-around">
          {navItems.map((tab) => {
            const isActive = isRouteActive(tab.href);
            if (tab.key === "more") {
              return (
                <button key={tab.key} onClick={() => setShowMoreSheet(true)} className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px] min-h-[48px] relative">
                  <span className={`relative z-10 ${isActive ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.icon}</span>
                  <span className={`relative z-10 text-[10px] font-semibold ${isActive ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.label[locale]}</span>
                </button>
              );
            }
            return (
              <Link key={tab.key} href={tab.href} className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px] min-h-[48px] relative">
                {isActive && <motion.div layoutId="mobileDevNav" className="absolute inset-0 bg-terracotta-50 dark:bg-terracotta-900/20 rounded-t-lg" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                <span className={`relative z-10 ${isActive ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.icon}</span>
                <span className={`relative z-10 text-[10px] font-semibold ${isActive ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.label[locale]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* More Sheet */}
      <MobileMoreSheet isOpen={showMoreSheet} onClose={() => setShowMoreSheet(false)} locale={locale} pathname={pathname} onLogout={onLogout} />
    </div>
  );
}
