"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";

interface SidebarProps {
  locale: Locale;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "inventory",
    href: "/dashboard/inventory",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    key: "cashier",
    href: "/dashboard/cashier",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: "sales",
    href: "/dashboard/sales",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    key: "sales",
    href: "/dashboard/sales",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    key: "suppliers",
    href: "/dashboard/suppliers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "expenses",
    href: "/dashboard/expenses",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "employees",
    href: "/dashboard/employees",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "customers",
    href: "/dashboard/customers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: "returns",
    href: "/dashboard/returns",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    key: "documents",
    href: "/dashboard/documents",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "reports",
    href: "/dashboard/reports",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    key: "help",
    href: "/dashboard/help",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function Sidebar({ locale, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen sticky top-0 z-40 border-r border-warm-200/60 dark:border-warm-700/60 bg-white/70 dark:bg-warm-900/70 backdrop-blur-xl"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        aria-label="Main navigation"
      >
        <div className="flex items-center h-16 px-4 border-b border-warm-200/60 dark:border-warm-700/60">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 flex-1 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-heading font-extrabold text-sm">D</span>
                </div>
                <span className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 truncate">
                  Duka<span className="text-terracotta-500">Manager</span>
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center w-full"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
                  <span className="text-white font-heading font-extrabold text-sm">D</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="ml-auto p-2 rounded-lg text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const label = dt(item.key as "dashboard" | "inventory" | "sales" | "suppliers" | "expenses" | "employees" | "customers" | "returns" | "documents" | "reports" | "settings" | "help", locale);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 min-h-[48px] ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-terracotta-500/10 dark:bg-terracotta-500/20 text-terracotta-600 dark:text-terracotta-400"
                    : "text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100/60 dark:hover:bg-warm-800/60"
                }`}
                title={collapsed ? label : undefined}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-terracotta-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-warm-200/60 dark:border-warm-700/60 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-savanna-200 dark:bg-savanna-800 flex items-center justify-center flex-shrink-0">
              <span className="text-savanna-700 dark:text-savanna-300 font-heading font-bold text-sm">
                MN
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">
                  Mama Njeri
                </p>
                <p className="text-xs text-warm-400 dark:text-warm-500 truncate">
                  Gikomba, Nairobi
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
