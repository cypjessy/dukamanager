"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CashierUser } from "@/hooks/useCashierMonitoring";
import { useCashierLiveData } from "@/hooks/useCashierLiveData";

import { ProfileHeader } from "./ProfileHeader";
import { LiveActivityFeed } from "./LiveActivityFeed";
import { SalesAnalytics } from "./SalesAnalytics";
import { CashDrawerTracker } from "./CashDrawerTracker";
import { ActivityTimeline } from "./ActivityTimeline";
import { AdminControls } from "./AdminControls";
import { BiometricStatus } from "./BiometricStatus";
import { SuspiciousActivityAlerts } from "./SuspiciousActivityAlerts";
import { TransactionsTab } from "./TransactionsTab";

type ProfileTab = "overview" | "transactions" | "drawer" | "admin";

interface CashierProfileProps {
  cashier: CashierUser | null;
  locale: string;
  onClose: () => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function CashierProfile({ cashier, locale, onClose }: CashierProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const {
    cashier: liveCashier, activityLogs, cashDrawer,
    hourlySales, paymentBreakdown, salesTarget, shiftEvents,
    biometric, suspiciousAlerts, idleTime, isConnected,
    weeklySales, monthlySales, transactions, refunds,
    lockPortal, unlockPortal, forceLogout,
    grantPermission, sendMessage, performCashDrop, reconcileDrawer,
  } = useCashierLiveData(cashier?.uid ?? null);

  const effectiveCashier = liveCashier || cashier;

  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter((l) => l.timestamp?.startsWith(selectedDate));
  }, [activityLogs, selectedDate]);

  const filteredShiftEvents = useMemo(() => {
    return shiftEvents.filter((e) => e.time?.startsWith(selectedDate));
  }, [shiftEvents, selectedDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => txn.timestamp?.startsWith(selectedDate));
  }, [transactions, selectedDate]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => r.timestamp?.startsWith(selectedDate));
  }, [refunds, selectedDate]);

  const tabs: { key: ProfileTab; label: string; labelSw: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", labelSw: "Muhtasari", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { key: "transactions", label: "Transactions", labelSw: "Miamala", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
    { key: "drawer", label: "Drawer", labelSw: "Kasha", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
    { key: "admin", label: "Admin", labelSw: "Usimamizi", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
  ];

  // Drag-to-dismiss on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      currentYRef.current = delta;
      setDragOffset(delta);
    }
  };
  const handleTouchEnd = () => {
    if (currentYRef.current > 120) {
      onClose();
    }
    setDragOffset(0);
  };

  if (!effectiveCashier) return null;

  // Mobile: Android-style bottom sheet
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Bottom sheet */}
        <motion.div
          ref={sheetRef}
          initial={{ y: "100%" }}
          animate={{ y: dragOffset > 0 ? dragOffset : 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative mt-auto w-full h-[92vh] bg-white dark:bg-warm-900 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="flex-shrink-0 flex items-center justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600" />
          </div>

          {/* Mobile header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {effectiveCashier.photoUrl ? (
                  <img src={effectiveCashier.photoUrl} alt={effectiveCashier.displayName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center">
                    <span className="text-xs font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                      {effectiveCashier.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-warm-900 ${
                  effectiveCashier.onlineStatus === "online" ? "bg-forest-500 animate-pulse" :
                  effectiveCashier.onlineStatus === "on_break" ? "bg-savanna-500" : "bg-warm-300"
                }`} />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">{effectiveCashier.displayName}</h2>
                <p className="text-[10px] text-warm-500">
                  #{effectiveCashier.uid.slice(0, 6).toUpperCase()}
                  {" · "}
                  <span className={effectiveCashier.onlineStatus === "online" ? "text-forest-600" : "text-warm-400"}>
                    {effectiveCashier.onlineStatus === "online" ? t("Online", "Mtandaoni") :
                     effectiveCashier.onlineStatus === "on_break" ? t("On Break", "Mapumzikoni") :
                     t("Offline", "Nje")}
                  </span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-warm-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tab content - scrollable area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pb-4">
                  <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
                  <ProfileHeader cashier={effectiveCashier} locale={locale} isConnected={isConnected} idleTime={idleTime} />
                  <LiveActivityFeed activityLogs={filteredActivityLogs} locale={locale} selectedDate={selectedDate} />
                  <SalesAnalytics
                    hourlySales={hourlySales} paymentBreakdown={paymentBreakdown} salesTarget={salesTarget}
                    weeklySales={weeklySales} monthlySales={monthlySales}
                    todaySales={effectiveCashier.todaySales} todayTransactions={effectiveCashier.todayTransactions}
                    avgBasketSize={effectiveCashier.avgBasketSize} locale={locale}
                  />
                  <ActivityTimeline shiftEvents={filteredShiftEvents} locale={locale} selectedDate={selectedDate} />
                  <BiometricStatus biometric={biometric} locale={locale} />
                  <SuspiciousActivityAlerts suspiciousAlerts={suspiciousAlerts} locale={locale} />
                  <CashDrawerTracker cashDrawer={cashDrawer} locale={locale} onCashDrop={performCashDrop} onReconcile={reconcileDrawer} activityLogs={filteredActivityLogs} />
                  <AdminControls cashier={effectiveCashier} locale={locale} onLock={lockPortal} onUnlock={unlockPortal} onForceLogout={forceLogout} onGrantPermission={grantPermission} onSendMessage={sendMessage} />
                </motion.div>
              )}

              {activeTab === "transactions" && (
                <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-4">
                  <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
                  <TransactionsTab transactions={filteredTransactions} refunds={filteredRefunds} locale={locale} selectedDate={selectedDate} />
                </motion.div>
              )}

              {activeTab === "drawer" && (
                <motion.div key="drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-4">
                  <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
                  <CashDrawerTracker cashDrawer={cashDrawer} locale={locale} onCashDrop={performCashDrop} onReconcile={reconcileDrawer} activityLogs={filteredActivityLogs} />
                </motion.div>
              )}

              {activeTab === "admin" && (
                <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pb-4">
                  <AdminControls cashier={effectiveCashier} locale={locale} onLock={lockPortal} onUnlock={unlockPortal} onForceLogout={forceLogout} onGrantPermission={grantPermission} onSendMessage={sendMessage} />
                  <SuspiciousActivityAlerts suspiciousAlerts={suspiciousAlerts} locale={locale} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Android-style bottom navigation */}
          <div className="flex-shrink-0 bg-white dark:bg-warm-900 border-t border-warm-100 dark:border-warm-800 flex items-center justify-around z-10 safe-bottom" style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))", minHeight: "56px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] relative ${
                  activeTab === tab.key ? "text-terracotta-600" : "text-warm-400"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="mobileProfileTab"
                    className="absolute inset-0 bg-terracotta-50 dark:bg-terracotta-900/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10 text-[9px] font-semibold">{t(tab.label, tab.labelSw)}</span>
                {tab.key === "transactions" && transactions.length > 0 && (
                  <span className={`absolute top-0 right-1 w-3.5 h-3.5 rounded-full text-[7px] font-bold flex items-center justify-center ${
                    activeTab === tab.key ? "bg-terracotta-500 text-white" : "bg-warm-200 dark:bg-warm-700 text-warm-600"
                  }`}>
                    {transactions.length > 99 ? "99+" : transactions.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop: centered modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[1200px] rounded-2xl border border-white/20 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {effectiveCashier.photoUrl ? (
                <img src={effectiveCashier.photoUrl} alt={effectiveCashier.displayName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center">
                  <span className="text-sm font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                    {effectiveCashier.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-warm-900 ${
                effectiveCashier.onlineStatus === "online" ? "bg-forest-500 animate-pulse" :
                effectiveCashier.onlineStatus === "on_break" ? "bg-savanna-500" : "bg-warm-300"
              }`} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{effectiveCashier.displayName}</h2>
              <p className="text-xs text-warm-500">
                #{effectiveCashier.uid.slice(0, 6).toUpperCase()}
                {effectiveCashier.deviceName && ` · ${effectiveCashier.deviceName}`}
                {" · "}
                <span className={effectiveCashier.onlineStatus === "online" ? "text-forest-600" : "text-warm-400"}>
                  {effectiveCashier.onlineStatus === "online" ? t("Online", "Mtandaoni") :
                   effectiveCashier.onlineStatus === "on_break" ? t("On Break", "Mapumzikoni") :
                   t("Offline", "Nje")}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-warm-400 hover:text-warm-600 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Desktop tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${
                activeTab === tab.key
                  ? "bg-terracotta-500 text-white shadow-sm"
                  : "text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"
              }`}
            >
              {t(tab.label, tab.labelSw)}
              {tab.key === "transactions" && transactions.length > 0 && (
                <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-white/20" : "bg-warm-200 dark:bg-warm-700"
                }`}>
                  {transactions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop tab content */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
              <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <ProfileHeader cashier={effectiveCashier} locale={locale} isConnected={isConnected} idleTime={idleTime} />
                  <LiveActivityFeed activityLogs={filteredActivityLogs} locale={locale} selectedDate={selectedDate} />
                  <SalesAnalytics
                    hourlySales={hourlySales} paymentBreakdown={paymentBreakdown} salesTarget={salesTarget}
                    weeklySales={weeklySales} monthlySales={monthlySales}
                    todaySales={effectiveCashier.todaySales} todayTransactions={effectiveCashier.todayTransactions}
                    avgBasketSize={effectiveCashier.avgBasketSize} locale={locale}
                  />
                  <ActivityTimeline shiftEvents={filteredShiftEvents} locale={locale} selectedDate={selectedDate} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <BiometricStatus biometric={biometric} locale={locale} />
                    <SuspiciousActivityAlerts suspiciousAlerts={suspiciousAlerts} locale={locale} />
                  </div>
                </div>
                <div className="space-y-6">
                  <CashDrawerTracker cashDrawer={cashDrawer} locale={locale} onCashDrop={performCashDrop} onReconcile={reconcileDrawer} activityLogs={filteredActivityLogs} />
                  <AdminControls cashier={effectiveCashier} locale={locale} onLock={lockPortal} onUnlock={unlockPortal} onForceLogout={forceLogout} onGrantPermission={grantPermission} onSendMessage={sendMessage} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-3">
              <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
              <TransactionsTab transactions={filteredTransactions} refunds={filteredRefunds} locale={locale} selectedDate={selectedDate} />
            </div>
          )}

          {activeTab === "drawer" && (
            <div className="max-w-lg mx-auto space-y-3">
              <DatePickerBar selectedDate={selectedDate} onDateChange={setSelectedDate} locale={locale} />
              <CashDrawerTracker cashDrawer={cashDrawer} locale={locale} onCashDrop={performCashDrop} onReconcile={reconcileDrawer} activityLogs={filteredActivityLogs} />
            </div>
          )}

          {activeTab === "admin" && (
            <div className="max-w-lg mx-auto space-y-6">
              <AdminControls cashier={effectiveCashier} locale={locale} onLock={lockPortal} onUnlock={unlockPortal} onForceLogout={forceLogout} onGrantPermission={grantPermission} onSendMessage={sendMessage} />
              <SuspiciousActivityAlerts suspiciousAlerts={suspiciousAlerts} locale={locale} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DatePickerBar({ selectedDate, onDateChange, locale }: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  locale: string;
}) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const today = todayStr();
  const isToday = selectedDate === today;

  const shiftDay = (offset: number) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (dateStr === today) return t("Today", "Leo");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().slice(0, 10)) return t("Yesterday", "Jana");
    return d.toLocaleDateString(locale === "sw" ? "sw-KE" : "en-KE", { weekday: "short", month: "short", day: "numeric" });
  };

  const canGoForward = selectedDate < today;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-warm-50/80 dark:bg-warm-800/40 border border-warm-200/50 dark:border-warm-700/50">
      <button
        onClick={() => shiftDay(-1)}
        className="w-8 h-8 rounded-lg bg-white dark:bg-warm-700 border border-warm-200 dark:border-warm-600 flex items-center justify-center text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400 flex-shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => onDateChange(e.target.value)}
            className="sr-only"
          />
          <span className={`text-xs font-heading font-bold truncate ${isToday ? "text-terracotta-600" : "text-warm-900 dark:text-warm-50"}`}>
            {formatDateLabel(selectedDate)}
          </span>
          {isToday && (
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse flex-shrink-0" />
          )}
        </label>
      </div>

      <button
        onClick={() => canGoForward && shiftDay(1)}
        disabled={!canGoForward}
        className="w-8 h-8 rounded-lg bg-white dark:bg-warm-700 border border-warm-200 dark:border-warm-600 flex items-center justify-center text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={() => onDateChange(today)}
          className="text-[9px] font-bold px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 transition-colors flex-shrink-0"
        >
          {t("Today", "Leo")}
        </button>
      )}
    </div>
  );
}
