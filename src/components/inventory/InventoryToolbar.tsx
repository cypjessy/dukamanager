"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { StockStatus, ViewMode } from "@/data/inventoryData";
import { useLocale } from "@/providers/LocaleProvider";
import { dt } from "@/lib/dashboardTranslations";
import { KENYAN_CATEGORIES } from "@/data/sampleData";

interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  stockFilter: StockStatus | "all";
  onStockFilterChange: (f: StockStatus | "all") => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onAddProduct: () => void;
}

const stockFilters: { key: StockStatus | "all"; label: string; labelSw: string }[] = [
  { key: "all", label: "All", labelSw: "Zote" },
  { key: "healthy", label: "In Stock", labelSw: "Zilizoko" },
  { key: "low", label: "Low Stock", labelSw: "Zinazopungua" },
  { key: "critical", label: "Critical", labelSw: "Hatarishi" },
  { key: "out", label: "Out of Stock", labelSw: "Zimeisha" },
];

export default function InventoryToolbar({
  searchQuery, onSearchChange,
  selectedCategory, onCategoryChange,
  stockFilter, onStockFilterChange,
  viewMode, onViewModeChange,
  onAddProduct,
}: InventoryToolbarProps) {
  const { locale } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  return (
    <div className="space-y-3 mb-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={dt("searchPlaceholder", locale)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 transition-colors min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
            <button onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${viewMode === "table" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-400"}`}
              aria-label="Table view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
            </button>
            <button onClick={() => onViewModeChange("kanban")}
              className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${viewMode === "kanban" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-400"}`}
              aria-label="Kanban view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="12" rx="1" /></svg>
            </button>
          </div>

          <button onClick={onAddProduct}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/20 hover:shadow-xl hover:shadow-terracotta-500/30 transition-shadow min-h-[44px] flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span className="hidden sm:inline">{dt("addProduct", locale)}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Category chips with hidden scrollbar and fade indicators */}
        <div className="relative flex-1 min-w-0">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none transition-opacity duration-200"
            style={{
              background: "linear-gradient(to right, var(--scroll-fade-bg), transparent)",
              opacity: canScrollLeft ? 1 : 0,
            }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none transition-opacity duration-200"
            style={{
              background: "linear-gradient(to left, var(--scroll-fade-bg), transparent)",
              opacity: canScrollRight ? 1 : 0,
            }}
          />
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 py-0.5 hide-scrollbar"
          >
            <button onClick={() => onCategoryChange("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] flex-shrink-0 ${!selectedCategory ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
              All
            </button>
            {KENYAN_CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => onCategoryChange(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] flex-shrink-0 ${selectedCategory === cat.value ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
                {locale === "sw" ? cat.labelSw : cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {stockFilters.map((sf) => (
            <button key={sf.key} onClick={() => onStockFilterChange(sf.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[32px] whitespace-nowrap ${stockFilter === sf.key ? "bg-terracotta-500 text-white" : "bg-warm-100/80 dark:bg-warm-800/80 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
              {locale === "sw" ? sf.labelSw : sf.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
