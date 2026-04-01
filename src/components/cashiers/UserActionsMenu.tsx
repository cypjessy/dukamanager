"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CashierUser } from "@/hooks/useCashierMonitoring";

interface UserActionsMenuProps {
  cashier: CashierUser;
  onAction: (action: string) => void;
  isTableView?: boolean;
}

export function UserActionsMenu({ cashier, onAction, isTableView = false }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      key: "view",
      label: "View Profile",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      className: "text-warm-700 dark:text-warm-300",
    },
    {
      key: "message",
      label: "Send Message",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      className: "text-terracotta-600 dark:text-terracotta-400",
    },
    {
      key: "reset-pin",
      label: "Reset PIN",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      className: "text-savanna-600 dark:text-savanna-400",
    },
    {
      key: "lock",
      label: cashier.status === "active" ? "Suspend Portal" : "Activate Portal",
      icon:
        cashier.status === "active" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      className:
        cashier.status === "active"
          ? "text-red-600 dark:text-red-400"
          : "text-forest-600 dark:text-forest-400",
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`rounded-lg transition-colors ${
          isTableView
            ? "p-2 text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800/50"
            : "p-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200 hover:bg-warm-100/50 dark:hover:bg-warm-800/50"
        }`}
        aria-label="More actions"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 w-48 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-lg overflow-hidden"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onAction(item.key);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-warm-50 dark:hover:bg-warm-800/50 ${item.className} min-h-[48px]`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
