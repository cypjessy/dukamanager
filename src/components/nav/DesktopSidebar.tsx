"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { desktopNavItems } from "@/lib/navData";
import NavItem from "./NavItem";

interface DesktopSidebarProps {
  locale: Locale;
  expanded: boolean;
  collapseProgress: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleExpanded: () => void;
  userName: string;
  userRole: string;
  shopName: string;
  onLogout: () => void;
}

export default function DesktopSidebar({
  locale,
  expanded,
  collapseProgress,
  onMouseEnter,
  onMouseLeave,
  toggleExpanded,
  userName,
  userRole,
  shopName,
  onLogout,
}: DesktopSidebarProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("");

  const roleGradients: Record<string, string> = {
    admin: "from-terracotta-500 to-savanna-500",
    owner: "from-terracotta-500 to-savanna-500",
    manager: "from-savanna-500 to-savanna-400",
    cashier: "from-forest-500 to-forest-400",
    viewer: "from-warm-400 to-warm-300",
  };

  // Role-based nav filtering
  const restrictedNavKeys: Record<string, string[]> = {
    cashier: ["employees", "expenses", "reports", "settings"],
    viewer: ["employees", "settings"],
  };
  const hiddenKeys = restrictedNavKeys[userRole] || [];
  const filteredNavItems = desktopNavItems.filter((item) => !hiddenKeys.includes(item.key));

  return (
    <motion.aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={false}
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-40 border-r border-warm-200/60 dark:border-warm-700/60"
      style={{
        background: expanded ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)",
        backdropFilter: expanded ? "blur(16px)" : "blur(8px)",
        WebkitBackdropFilter: expanded ? "blur(16px)" : "blur(8px)",
      }}
      aria-label="Main navigation"
      role="navigation"
    >
      {collapseProgress > 0 && collapseProgress < 100 && (
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-terracotta-500 to-savanna-500 z-10"
          style={{ width: `${collapseProgress}%` }}
        />
      )}

      <div className="flex items-center h-16 px-3 overflow-hidden">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGradients[userRole] || roleGradients.admin} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-heading font-extrabold text-sm">D</span>
        </div>
        <AnimatePresence mode="wait">
          {expanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2.5 overflow-hidden whitespace-nowrap"
            >
              <span className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                Duka<span className="text-terracotta-500">Manager</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {filteredNavItems.map((item) => (
          <NavItem key={item.key} item={item} locale={locale} expanded={expanded} />
        ))}
      </nav>

      <div className="border-t border-warm-200/60 dark:border-warm-700/60 p-2 space-y-1">
        {expanded ? (
          <>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradients[userRole] || roleGradients.admin} flex items-center justify-center flex-shrink-0 relative`}>
                <span className="text-white font-heading font-bold text-xs">{initials}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-forest-500 border-2 border-white dark:border-warm-900" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">{userName}</p>
                <p className="text-[10px] text-warm-400 truncate">{shopName}</p>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 uppercase">{userRole}</span>
            </div>
            <Link href="/dashboard/help"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100/50 dark:hover:bg-warm-800/50 transition-colors min-h-[40px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              {locale === "sw" ? "Msaada" : "Help"}
            </Link>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors min-h-[40px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {locale === "sw" ? "Toka" : "Logout"}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradients[userRole] || roleGradients.admin} flex items-center justify-center relative`}>
              <span className="text-white font-heading font-bold text-xs">{initials}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-forest-500 border-2 border-white dark:border-warm-900" />
            </div>
          </div>
        )}

        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center p-2 rounded-xl text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 hover:bg-warm-100/50 dark:hover:bg-warm-800/50 transition-colors min-h-[36px]"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 ${expanded ? "" : "rotate-180"}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </motion.aside>
  );
}
