"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StockStatus } from "@/data/inventoryData";

interface FilterChipsProps {
  searchQuery: string;
  selectedCategory: string;
  stockFilter: StockStatus | "all";
  categoryName: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearStockFilter: () => void;
  onClearAll: () => void;
}

const stockLabels: Record<StockStatus | "all", { en: string; sw: string }> = {
  all: { en: "All", sw: "Zote" },
  healthy: { en: "In Stock", sw: "Zilizoko" },
  low: { en: "Low Stock", sw: "Zinazopungua" },
  critical: { en: "Critical", sw: "Hatarishi" },
  out: { en: "Out of Stock", sw: "Zimeisha" },
};

export default function FilterChips({
  searchQuery,
  selectedCategory,
  stockFilter,
  categoryName,
  onClearSearch,
  onClearCategory,
  onClearStockFilter,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = searchQuery || selectedCategory || stockFilter !== "all";
  if (!hasFilters) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1"
    >
      <AnimatePresence>
        {searchQuery && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs font-medium whitespace-nowrap"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            &quot;{searchQuery.length > 15 ? searchQuery.slice(0, 15) + "..." : searchQuery}&quot;
            <button onClick={onClearSearch} className="w-4 h-4 rounded-full hover:bg-terracotta-200 dark:hover:bg-terracotta-800 flex items-center justify-center transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </motion.span>
        )}
        {selectedCategory && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-savanna-50 dark:bg-savanna-900/20 text-savanna-700 dark:text-savanna-400 text-xs font-medium whitespace-nowrap"
          >
            {categoryName}
            <button onClick={onClearCategory} className="w-4 h-4 rounded-full hover:bg-savanna-200 dark:hover:bg-savanna-800 flex items-center justify-center transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </motion.span>
        )}
        {stockFilter !== "all" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 text-xs font-medium whitespace-nowrap"
          >
            {stockLabels[stockFilter].en}
            <button onClick={onClearStockFilter} className="w-4 h-4 rounded-full hover:bg-forest-200 dark:hover:bg-forest-800 flex items-center justify-center transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </motion.span>
        )}
      </AnimatePresence>
      <button
        onClick={onClearAll}
        className="px-2.5 py-1.5 rounded-full text-xs font-medium text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors whitespace-nowrap"
      >
        Clear all
      </button>
    </motion.div>
  );
}
