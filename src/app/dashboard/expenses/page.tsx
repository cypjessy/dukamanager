"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/data/expenseData";
import { getTotalExpenses } from "@/data/expenseData";
import { useExpensesFirestore } from "@/hooks/useExpensesFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseAnalyticsSummary from "@/components/expenses/ExpenseAnalyticsSummary";
import ExpenseAnalytics from "@/components/expenses/ExpenseAnalytics";
import BudgetManager from "@/components/expenses/BudgetManager";

type ExpenseView = "expenses" | "analytics" | "budget";

export default function ExpensesPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { expenses, loading, addExpense, deleteExpense, deleteExpenses, duplicateExpense } = useExpensesFirestore();

  const [view, setView] = useState<ExpenseView>("expenses");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">("all");
  const [dateRange, setDateRange] = useState("month");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);

  const totalExpenses = useMemo(() => getTotalExpenses(expenses, dateRange), [expenses, dateRange]);

  const handleSaveExpense = useCallback(
    async (data: Parameters<typeof addExpense>[0]) => {
      try {
        await addExpense(data);
        setShowAddDialog(false);
      } catch (err) {
        console.error("Failed to save expense:", err);
      }
    },
    [addExpense]
  );

  const handleEdit = useCallback(
    async (_expense: Expense) => {
      // TODO: Implement edit dialog when expense editing is added
    },
    []
  );

  const handleAmountRangeChange = useCallback((min: string, max: string) => {
    setAmountMin(min);
    setAmountMax(max);
  }, []);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{t("Loading...", "Inapakia...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {t("Expenses", "Gharama")}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              <span className="text-red-500 font-semibold">KSh {totalExpenses.toLocaleString()}</span>{" "}
              {t("total", "jumla")} {dateRange !== "all" && `(${dateRange})`}
              <span className="ml-2 text-xs text-warm-400 bg-warm-100 dark:bg-warm-800 px-2 py-0.5 rounded-full">{expenses.length}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[48px] flex-shrink-0 self-start"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">{t("Add Expense", "Ongeza Matumizi")}</span>
          </button>
        </div>
      </motion.div>

      {/* View tabs */}
      <div className={`flex flex-wrap gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
          {(["expenses", "analytics", "budget"] as ExpenseView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[36px] ${
                view === v
                  ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                  : "text-warm-500 dark:text-warm-400"
              }`}
            >
              {v === "expenses" ? t("Expenses", "Gharama") : v === "analytics" ? t("Analytics", "Takwimu") : t("Budget", "Bajeti")}
            </button>
          ))}
        </div>
        {view === "expenses" && (
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px] transition-colors ${
              showAnalytics ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600" : "bg-warm-100/60 dark:bg-warm-800/60 text-warm-500"
            }`}
          >
            {t("Summary", "Muhtasari")}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "expenses" && (
          <div className={isMobile ? "space-y-4" : ""}>
            {showAnalytics && <ExpenseAnalyticsSummary expenses={expenses} />}

            <ExpenseFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              paymentFilter={paymentFilter}
              onPaymentChange={setPaymentFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              amountMin={amountMin}
              amountMax={amountMax}
              onAmountRangeChange={handleAmountRangeChange}
            />

            <ExpenseList
              expenses={expenses}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              paymentFilter={paymentFilter}
              dateRange={dateRange}
              amountMin={amountMin}
              amountMax={amountMax}
              onEdit={handleEdit}
              onDuplicate={duplicateExpense}
              onDelete={deleteExpense}
              onDeleteMany={deleteExpenses}
              isMobile={isMobile}
            />
          </div>
        )}

        {view === "analytics" && <ExpenseAnalytics expenses={expenses} locale={locale} />}
        {view === "budget" && <BudgetManager expenses={expenses} locale={locale} />}
      </div>

      <AddExpenseDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleSaveExpense}
        locale={locale}
        isMobile={isMobile}
      />
    </div>
  );
}
