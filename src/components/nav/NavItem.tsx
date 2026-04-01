"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItemData } from "@/lib/navData";
import type { Locale } from "@/types";

interface NavItemProps {
  item: NavItemData;
  locale: Locale;
  expanded: boolean;
  onClick?: () => void;
}

export default function NavItem({ item, locale, expanded, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
  const [showTooltip, setShowTooltip] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const label = item.label[locale];

  return (
    <div className="relative">
      <Link
        href={item.href}
        onClick={onClick}
        onMouseEnter={() => !expanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => !expanded && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 min-h-[44px] ${
          expanded ? "px-3" : "justify-center px-0"
        } ${
          isActive
            ? "bg-terracotta-500/10 dark:bg-terracotta-500/20 text-terracotta-600 dark:text-terracotta-400"
            : "text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100/60 dark:hover:bg-warm-800/60"
        }`}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        title={!expanded ? label : undefined}
        tabIndex={0}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-terracotta-500 to-savanna-500 shadow-[0_0_8px_rgba(199,91,57,0.3)]"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <span className="flex-shrink-0 relative">
          <motion.span whileHover={{ scale: 1.1 }} className="block">
            {item.icon}
          </motion.span>
          {item.badge && item.badge > 0 && (
            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${item.badgeColor || "bg-sunset-400"} text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-warm-900`}>
              {item.badge}
            </span>
          )}
        </span>

        <AnimatePresence mode="wait">
          {expanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden truncate"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {!expanded && (
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 text-xs font-medium whitespace-nowrap pointer-events-none z-50 shadow-lg"
              >
                {label}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-warm-900 dark:bg-warm-100" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Link>

      {isActive && item.children && expanded && (
        <button
          onClick={() => setSubmenuOpen(!submenuOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-warm-400 hover:text-warm-600 min-w-[28px] min-h-[28px] flex items-center justify-center"
          aria-label={submenuOpen ? "Collapse submenu" : "Expand submenu"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${submenuOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {submenuOpen && item.children && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4"
          >
            {item.children.map((child) => (
              <NavItem key={child.key} item={child} locale={locale} expanded={expanded} onClick={onClick} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
