"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";

interface FABProps {
  locale: Locale;
  onOpenProductModal: () => void;
}

const actions = [
  { key: "addProduct", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <line x1="12" y1="12" x2="12" y2="18" /><line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )},
  { key: "addSale", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )},
  { key: "addSupplier", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )},
];

export default function FAB({ locale, onOpenProductModal }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (key: string) => {
    setIsOpen(false);
    if (key === "addProduct") onOpenProductModal();
  };

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 right-0 mb-2 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden min-w-[180px]"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.key}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAction(action.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-warm-700 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[48px]"
              >
                <span className="text-terracotta-500">{action.icon}</span>
                {dt(action.key as "addProduct" | "addSale" | "addSupplier", locale)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label={dt("quickActions", locale)}
        aria-expanded={isOpen}
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </motion.svg>
      </motion.button>
    </div>
  );
}
