"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { DateRange as DR, ReportCategory } from "@/data/reportData";
import { useReportsFirestore } from "@/hooks/useReportsFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { dt } from "@/lib/dashboardTranslations";
import SalesReports from "@/components/reports/SalesReports";
import FinancialReports from "@/components/reports/FinancialReports";
import InventoryReports from "@/components/reports/InventoryReports";
import CustomerAnalytics from "@/components/reports/CustomerAnalytics";
import OperationalReports from "@/components/reports/OperationalReports";

const categories: { key: ReportCategory; label: string; labelSw: string }[] = [
  { key: "sales", label: "Sales", labelSw: "Mauzo" },
  { key: "inventory", label: "Inventory", labelSw: "Hesabu" },
  { key: "financial", label: "Financial", labelSw: "Kifedha" },
  { key: "customers", label: "Customers", labelSw: "Wateja" },
  { key: "operations", label: "Operations", labelSw: "Utendaji" },
];

const dateRanges: { key: DR; label: string }[] = [
  { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" }, { key: "last_week", label: "Last Week" },
  { key: "month", label: "This Month" }, { key: "last_month", label: "Last Month" },
  { key: "quarter", label: "Quarter" }, { key: "ytd", label: "YTD" },
];

export default function ReportsPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { sales, metrics, topProducts, loading, getDateRangeLabel } = useReportsFirestore();
  const [category, setCategory] = useState<ReportCategory>("sales");
  const [dateRange, setDateRange] = useState<DR>("month");

  const keyMetrics = useMemo(() => [
    { label: "Revenue", labelSw: "Mapato", value: `KSh ${metrics.totalRevenue.toLocaleString()}`, change: 0 },
    { label: "Transactions", labelSw: "Miamala", value: metrics.totalTransactions.toString(), change: 0 },
    { label: "Avg Basket", labelSw: "Wastani", value: `KSh ${metrics.avgBasket.toLocaleString()}`, change: 0 },
    { label: "Net Profit", labelSw: "Faida", value: `KSh ${metrics.netProfit.toLocaleString()}`, change: metrics.netProfit >= 0 ? 1 : -1 },
  ], [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{locale === "sw" ? "Inapakia..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">{dt("reports", locale)}</h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">{getDateRangeLabel(dateRange)}</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
            {(["pdf", "excel", "print"] as const).map((fmt) => (
              <button key={fmt} className="px-3 py-1 rounded-lg text-xs font-medium text-warm-500 dark:text-warm-400 hover:text-warm-700 hover:bg-white dark:hover:bg-warm-700 transition-all min-h-[32px] uppercase">{fmt}</button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[48px] ${category === cat.key ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
              {locale === "sw" ? cat.labelSw : cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {dateRanges.map((dr) => (
            <button key={dr.key} onClick={() => setDateRange(dr.key)}
              className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${dateRange === dr.key ? "bg-terracotta-500 text-white" : "bg-warm-100/60 dark:bg-warm-800/60 text-warm-500 dark:text-warm-400"}`}>
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-2 ${isMobile ? "grid-cols-2 mb-5" : "grid-cols-2 sm:grid-cols-4 mb-4 page-section-fixed"}`}>
        {keyMetrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
            <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? m.labelSw : m.label}</p>
            <p className={`font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums mt-0.5 ${isMobile ? "text-base" : "text-base sm:text-lg"}`}>{m.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={m.change >= 0 ? "text-forest-500" : "text-red-500"}>
                <polyline points={m.change >= 0 ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
              <span className={`text-xs font-semibold ${m.change >= 0 ? "text-forest-500" : "text-red-500"}`}>{Math.abs(m.change)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={isMobile ? "" : "page-section-scroll"}>
        {category === "sales" && <SalesReports sales={sales} topProducts={topProducts} metrics={metrics} locale={locale} dateRange={dateRange} />}
        {category === "financial" && <FinancialReports metrics={metrics} sales={sales} locale={locale} />}
        {category === "inventory" && <InventoryReports metrics={metrics} topProducts={topProducts} locale={locale} />}
        {category === "customers" && <CustomerAnalytics metrics={metrics} locale={locale} />}
        {category === "operations" && <OperationalReports metrics={metrics} sales={sales} locale={locale} />}
      </div>
    </div>
  );
}
