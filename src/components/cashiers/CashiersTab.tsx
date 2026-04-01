"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCashierMonitoring } from "@/hooks/useCashierMonitoring";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { CashierUser } from "@/hooks/useCashierMonitoring";
import { UserTable } from "./UserTable";
import { UserCard } from "./UserCard";
import { OnboardCashierModal } from "./OnboardCashierModal";
import { StatusBadge } from "./StatusBadge";
import { PerformanceSparkline } from "./PerformanceSparkline";
import { UserActionsMenu } from "./UserActionsMenu";
import { SearchBar } from "./SearchBar";
import { FilterChips } from "./FilterChips";

export function CashiersTab() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const {
    cashiers,
    onlineCashiers,
    loading,
    addCashier,
    suspendCashier,
    activateCashier,
  } = useCashierMonitoring();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<CashierUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "on_break" | "offline" | "suspended">("all");
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredCashiers = useMemo(() => {
    let result = cashiers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.uid.toLowerCase().includes(q) ||
          (c.deviceName && c.deviceName.toLowerCase().includes(q))
      );
    }

    switch (activeFilter) {
      case "active":
        result = result.filter((c) => c.status === "active" && c.onlineStatus === "online");
        break;
      case "on_break":
        result = result.filter((c) => c.onlineStatus === "on_break");
        break;
      case "offline":
        result = result.filter((c) => c.onlineStatus === "offline" && c.status === "active");
        break;
      case "suspended":
        result = result.filter((c) => c.status === "suspended");
        break;
    }

    return result;
  }, [cashiers, searchQuery, activeFilter]);

  const handleAddCashier = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        await addCashier({
          displayName: String(data.displayName || ""),
          email: String(data.email || ""),
          phone: String(data.phone || ""),
          nationalId: String(data.nationalId || ""),
          role: (data.role as "cashier" | "head_cashier" | "trainee") || "cashier",
          pin: String(data.pin || "1234"),
          permissions: (data.permissions as CashierPermissions) || {
            processSales: true,
            applyDiscounts: true,
            maxDiscountPercent: 10,
            handleRefunds: false,
            viewReports: false,
            manageInventory: false,
            openCloseRegister: true,
            voidTransactions: false,
          },
          password: String(data.password || "Cashier123!"),
        });
        setShowAddModal(false);
      } catch (err) {
        console.error("Failed to add cashier:", err);
      }
    },
    [addCashier]
  );

  const handleToggleBulkSelect = useCallback((cashierId: string) => {
    setBulkSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cashierId)) {
        newSet.delete(cashierId);
      } else {
        newSet.add(cashierId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const ids = filteredCashiers.map((c) => c.uid);
    if (ids.every((id) => bulkSelection.has(id))) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(ids));
    }
  }, [filteredCashiers, bulkSelection]);

  const handleBulkAction = useCallback(
    async (action: string) => {
      for (const id of Array.from(bulkSelection)) {
        if (action === "suspend") {
          await suspendCashier(id);
        } else if (action === "activate") {
          await activateCashier(id);
        }
      }
      setIsBulkMode(false);
      setBulkSelection(new Set());
    },
    [bulkSelection, suspendCashier, activateCashier]
  );

  const handleCashierAction = useCallback(
    async (cashier: CashierUser, action: string) => {
      switch (action) {
        case "view":
          setSelectedCashier(cashier);
          setShowProfileDrawer(true);
          break;
        case "message":
          break;
        case "reset-pin":
          break;
        case "lock":
          if (cashier.status === "active") {
            await suspendCashier(cashier.uid);
          } else {
            await activateCashier(cashier.uid);
          }
          break;
        case "suspend":
          await suspendCashier(cashier.uid);
          break;
        case "activate":
          await activateCashier(cashier.uid);
          break;
      }
    },
    [suspendCashier, activateCashier]
  );

  const handleCardAction = useCallback(
    async (action: string) => {
      if (action === "view" && selectedCashier) {
        setShowProfileDrawer(true);
      } else if (action === "suspend" && selectedCashier) {
        await suspendCashier(selectedCashier.uid);
      } else if (action === "activate" && selectedCashier) {
        await activateCashier(selectedCashier.uid);
      }
    },
    [selectedCashier, suspendCashier, activateCashier]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm font-medium text-warm-500">{t("Loading cashiers...", "Inapakia mabenki...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Title and count row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center shadow-lg shadow-terracotta-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
                {t("Cashier Portal Users", "Watumiaji wa Portal ya Mhasibu")}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
                  {onlineCashiers.length} {t("Active", "Hai")}
                </span>
                <span className="text-[10px] text-warm-400">
                  / {cashiers.length} {t("Total", "Jumla")}
                </span>
                <span className="text-[10px] text-warm-400 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2v6h-6" />
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M3 22v-6h6" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  </svg>
                  {t("Live", "Moja kwa moja")}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/20 hover:shadow-xl hover:shadow-terracotta-500/30 transition-all min-h-[44px] self-end sm:self-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("Onboard Cashier", "Sajili Mhasibu")}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("Search by name, ID, phone, or device", "Tafuta kwa jina, ID, simu, au kifaa")}
          />
          <div className="flex-1 overflow-x-auto">
            <FilterChips
              activeFilter={activeFilter}
              onChange={setActiveFilter}
              counts={{
                all: cashiers.length,
                active: onlineCashiers.length,
                on_break: cashiers.filter((c) => c.onlineStatus === "on_break").length,
                offline: cashiers.filter((c) => c.onlineStatus === "offline" && c.status === "active").length,
                suspended: cashiers.filter((c) => c.status === "suspended").length,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Bulk Selection Bar */}
      <AnimatePresence>
        {isBulkMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-terracotta-200/60 dark:border-terracotta-700/60 bg-terracotta-50/60 dark:bg-terracotta-900/20 backdrop-blur-sm"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={bulkSelection.size === filteredCashiers.length && filteredCashiers.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded accent-terracotta-500"
              />
              <span className="text-sm font-semibold text-warm-900 dark:text-warm-50">
                {bulkSelection.size} {t("selected", "imechaguliwa")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("suspend")}
                disabled={bulkSelection.size === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-40 min-h-[36px]"
              >
                {t("Suspend", "Simamisha")}
              </button>
              <button
                onClick={() => handleBulkAction("activate")}
                disabled={bulkSelection.size === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/20 hover:bg-forest-100 dark:hover:bg-forest-900/30 transition-colors disabled:opacity-40 min-h-[36px]"
              >
                {t("Activate", "Washa")}
              </button>
              <button
                onClick={() => {
                  setIsBulkMode(false);
                  setBulkSelection(new Set());
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800/50 transition-colors min-h-[36px]"
              >
                {t("Cancel", "Ghairi")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk mode toggle (when not in bulk mode and there are cashiers) */}
      {!isBulkMode && filteredCashiers.length > 0 && (
        <button
          onClick={() => setIsBulkMode(true)}
          className="text-xs font-medium text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          {t("Select multiple", "Chagua vingi")}
        </button>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {filteredCashiers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-12 text-center"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta-100 to-savanna-100 dark:from-terracotta-900/30 dark:to-savanna-900/30 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-terracotta-500">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
                  {searchQuery || activeFilter !== "all"
                    ? t("No Matching Cashiers", "Hakuna Mhasibu Anayefanana")
                    : t("No Cashiers Yet", "Hakuna Mabenki Bado")}
                </h3>
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  {searchQuery || activeFilter !== "all"
                    ? t("Try adjusting your search or filters", "Jaribu kubadilisha utafutaji au vichujio vyako")
                    : t("Add your first cashier to get started", "Ongeza mhasibu wako wa kwanza kuanza")}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/20 min-h-[44px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t("Add Cashier", "Ongeza Mhasibu")}
              </button>
            </div>
          </motion.div>
        ) : isMobile ? (
          <motion.div
            key="mobile-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredCashiers.map((cashier) => (
              <UserCard
                key={cashier.uid}
                cashier={cashier}
                isSelected={bulkSelection.has(cashier.uid)}
                onSelect={() => {
                  if (isBulkMode) {
                    handleToggleBulkSelect(cashier.uid);
                  } else {
                    setSelectedCashier(cashier);
                  }
                }}
                onAction={handleCardAction}
                isBulkMode={isBulkMode}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="desktop-table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserTable
              cashiers={filteredCashiers}
              onCashierSelect={(cashier) => {
                if (isBulkMode) {
                  handleToggleBulkSelect(cashier.uid);
                } else {
                  setSelectedCashier(cashier);
                  setShowProfileDrawer(true);
                }
              }}
              onCashierAction={handleCashierAction}
              isBulkMode={isBulkMode}
              bulkSelection={bulkSelection}
              onToggleBulkSelect={handleToggleBulkSelect}
              onSelectAll={handleSelectAll}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboard Cashier Modal */}
      <OnboardCashierModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCashier}
        locale={locale}
      />

      {/* Profile Drawer */}
      <AnimatePresence>
        {showProfileDrawer && selectedCashier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowProfileDrawer(false);
                setSelectedCashier(null);
              }
            }}
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-2xl max-h-[85vh] overflow-y-auto"
              style={{ backdropFilter: "blur(20px)" }}
            >
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl border-b border-warm-200/40 dark:border-warm-700/40">
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                  {t("Cashier Profile", "Wasifu wa Mhasibu")}
                </h3>
                <button
                  onClick={() => {
                    setShowProfileDrawer(false);
                    setSelectedCashier(null);
                  }}
                  className="p-2 rounded-xl text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {selectedCashier.photoUrl ? (
                      <img
                        src={selectedCashier.photoUrl}
                        alt={selectedCashier.displayName}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-warm-800"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center ring-4 ring-white dark:ring-warm-800">
                        <span className="text-lg font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                          {selectedCashier.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-warm-800 ${
                        selectedCashier.onlineStatus === "online"
                          ? "bg-forest-500 animate-pulse"
                          : selectedCashier.onlineStatus === "on_break"
                          ? "bg-sunset-500"
                          : selectedCashier.status === "suspended"
                          ? "bg-red-500"
                          : "bg-warm-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-warm-900 dark:text-warm-50">{selectedCashier.displayName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                          selectedCashier.role === "head_cashier"
                            ? "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-700 dark:text-terracotta-400"
                            : selectedCashier.role === "cashier"
                            ? "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400"
                            : "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400"
                        }`}
                      >
                        {selectedCashier.role.replace("_", " ")}
                      </span>
                      <StatusBadge
                        status={
                          selectedCashier.status === "suspended" ? "suspended" : selectedCashier.onlineStatus
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("Employee ID", "Kitambulisho"), value: selectedCashier.uid.slice(0, 8).toUpperCase() },
                    { label: t("Phone", "Simu"), value: selectedCashier.phone || "—" },
                    { label: t("Email", "Barua Pepe"), value: selectedCashier.email || "—" },
                    { label: t("National ID", "Kitambulisho cha Taifa"), value: selectedCashier.nationalId || "—" },
                    { label: t("Device", "Kifaa"), value: selectedCashier.deviceName || t("Unassigned", "Hajapewa") },
                    { label: t("Last Login", "Mwisho Kuingia"), value: selectedCashier.lastLogin ? new Date(selectedCashier.lastLogin).toLocaleDateString() : "—" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-warm-50/60 dark:bg-warm-800/30 p-3">
                      <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-warm-900 dark:text-warm-50 mt-0.5 truncate">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Today's Performance */}
                <div className="rounded-xl bg-warm-50/60 dark:bg-warm-800/30 p-4">
                  <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide mb-3">
                    {t("Today's Performance", "Utendaji wa Leo")}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                        {selectedCashier.todayTransactions}
                      </p>
                      <p className="text-[10px] text-warm-500 dark:text-warm-400 mt-0.5">
                        {t("Transactions", "Miamala")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-terracotta-600 tabular-nums">
                        KSh {selectedCashier.todaySales.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-warm-500 dark:text-warm-400 mt-0.5">
                        {t("Revenue", "Mapato")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-warm-200/40 dark:border-warm-700/40">
                    <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide mb-2">
                      {t("7-Day Trend", "Mwelekeo wa Siku 7")}
                    </p>
                    <PerformanceSparkline
                      data={[100, 120, 90, 150, 130, 180, 160]}
                      height={40}
                      width="100%"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleCashierAction(selectedCashier, "message");
                      setShowProfileDrawer(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-sm font-semibold min-h-[48px] transition-colors hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {t("Message", "Ujumbe")}
                  </button>
                  <button
                    onClick={() => {
                      handleCashierAction(
                        selectedCashier,
                        selectedCashier.status === "active" ? "suspend" : "activate"
                      );
                      setShowProfileDrawer(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold min-h-[48px] transition-colors ${
                      selectedCashier.status === "active"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                        : "bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900/30"
                    }`}
                  >
                    {selectedCashier.status === "active" ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        {t("Suspend", "Simamisha")}
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {t("Activate", "Washa")}
                      </>
                    )}
                  </button>
                  <UserActionsMenu
                    cashier={selectedCashier}
                    onAction={(action) => {
                      handleCashierAction(selectedCashier, action);
                      setShowProfileDrawer(false);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
