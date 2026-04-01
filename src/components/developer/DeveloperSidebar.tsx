"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
  expanded: boolean;
  onToggleExpanded: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const navItems = [
  { key: "dashboard", href: "/developer", label: { en: "Dashboard", sw: "Dashibodi" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { key: "tenants", href: "/developer/tenants", label: { en: "Shops", sw: "Maduka" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { key: "analytics", href: "/developer/analytics", label: { en: "Analytics", sw: "Uchambuzi" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )},
  { key: "billing", href: "/developer/billing", label: { en: "Billing", sw: "Malipo" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )},
  { key: "users", href: "/developer/users", label: { en: "Users", sw: "Watumiaji" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )},
  { key: "activity", href: "/developer/activity", label: { en: "Activity", sw: "Shughuli" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )},
  { key: "settings", href: "/developer/settings", label: { en: "Settings", sw: "Mipangilio" }, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )},
];

export default function DeveloperSidebar({ locale, expanded, onToggleExpanded, onMouseEnter, onMouseLeave, userName, userRole, onLogout }: Props) {
  const pathname = usePathname();
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const isRouteActive = (href: string) =>
    href === "/developer" ? pathname === "/developer" : pathname.startsWith(href);

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-warm-900/80 backdrop-blur-xl border-r border-warm-200/60 dark:border-warm-700/60 z-40 flex flex-col transition-all duration-200 ${expanded ? "w-64" : "w-[72px]"}`}
      animate={{ width: expanded ? 256 : 72 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-warm-200/60 dark:border-warm-700/60">
        <button onClick={onToggleExpanded} className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="font-heading font-extrabold text-sm text-warm-900 dark:text-warm-50 whitespace-nowrap">
                  Duka<span className="text-terracotta-500">Manager</span>
                </span>
                <span className="text-[9px] text-warm-400 ml-1 font-medium">Dev</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isRouteActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl transition-colors min-h-[44px] ${
                isActive
                  ? "bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400"
                  : "text-warm-500 hover:bg-warm-50 dark:hover:bg-warm-800/50 hover:text-warm-700 dark:hover:text-warm-300"
              } ${expanded ? "px-3" : "justify-center px-1"}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && (
                <span className="text-sm font-medium truncate">{item.label[locale]}</span>
              )}
              {isActive && expanded && (
                <motion.div layoutId="dev-sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-terracotta-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-warm-200/60 dark:border-warm-700/60">
        {expanded ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">{userName.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-warm-900 dark:text-warm-50 truncate">{userName}</p>
              <p className="text-[9px] text-warm-400 capitalize">{userRole}</p>
            </div>
          </div>
        ) : null}
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 w-full rounded-xl text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[40px] ${expanded ? "px-3" : "justify-center px-1"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {expanded && <span className="text-sm font-medium">{t("Log Out", "Ondoka")}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
