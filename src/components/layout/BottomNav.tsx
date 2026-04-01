"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";

interface BottomNavProps {
  locale: Locale;
  onOpenProductModal: () => void;
}

const navItems = [
  { key: "dashboard", href: "/dashboard", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { key: "inventory", href: "/dashboard/inventory", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )},
  { key: "add", href: "#", icon: null },
  { key: "sales", href: "/dashboard/sales", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )},
  { key: "reports", href: "/dashboard/reports", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )},
];

export default function BottomNav({ locale, onOpenProductModal }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl border-t border-warm-200/60 dark:border-warm-700/60 safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          if (item.key === "add") {
            return (
              <button
                key="add"
                onClick={onOpenProductModal}
                className="w-12 h-12 -mt-4 rounded-2xl bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95"
                aria-label={dt("addProduct", locale)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            );
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl transition-colors ${
                isActive
                  ? "text-terracotta-500"
                  : "text-warm-400 hover:text-warm-600 dark:hover:text-warm-300"
              }`}
              aria-label={item.key === "add" ? undefined : dt(item.key as "dashboard" | "inventory" | "sales" | "reports", locale)}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-terracotta-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {item.icon}
              <span className="text-[10px] mt-0.5 font-medium">
                {item.key === "add" ? "" : dt(item.key as "dashboard" | "inventory" | "sales" | "reports", locale)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
