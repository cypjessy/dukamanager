"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useSalesData } from "@/hooks/useSalesData";
import type { Locale } from "@/types";
import ExecutiveSummary from "@/components/admin-sales/ExecutiveSummary";
import LiveSalesFeed from "@/components/admin-sales/LiveSalesFeed";
import CashierPerformanceGrid from "@/components/admin-sales/CashierPerformanceGrid";
import ProductAnalyticsSection from "@/components/admin-sales/ProductAnalyticsSection";
import PaymentBreakdownChart from "@/components/admin-sales/PaymentBreakdownChart";
import SalesChannelsTracker from "@/components/admin-sales/SalesChannelsTracker";
import DiscountsMonitor from "@/components/admin-sales/DiscountsMonitor";
import ReturnsManagement from "@/components/admin-sales/ReturnsManagement";
import EarningsCalculator from "@/components/admin-sales/EarningsCalculator";
import ShiftAnalysis from "@/components/admin-sales/ShiftAnalysis";
import CustomerInsights from "@/components/admin-sales/CustomerInsights";
import InventoryImpact from "@/components/admin-sales/InventoryImpact";
import FraudDetection from "@/components/admin-sales/FraudDetection";
import MultiShopConsolidation from "@/components/admin-sales/MultiShopConsolidation";
import CashierMessageModal from "@/components/admin-sales/CashierMessageModal";
import CashierReportModal from "@/components/admin-sales/CashierReportModal";
import BonusModal from "@/components/admin-sales/BonusModal";
import DiscountSuggestionModal from "@/components/admin-sales/DiscountSuggestionModal";
import ReorderModal from "@/components/admin-sales/ReorderModal";
import FraudInvestigationModal from "@/components/admin-sales/FraudInvestigationModal";

type Tab = "overview" | "live" | "cashiers" | "products" | "payments" | "analytics" | "security" | "more";

const CASHIER_NAMES = ["Mama Njeri", "John Ochieng", "Amina Hassan", "Peter Kamau", "Grace Wanjiku", "David Otieno"];
const CASHIER_COLORS = ["#C75B39", "#2D5A3D", "#D4A574", "#4A90D9", "#8B5CF6", "#F59E0B"];

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

function MobileBottomNav({ activeTab, onTabChange, locale }: { activeTab: Tab; onTabChange: (t: Tab) => void; locale: Locale }) {
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("Home", "Nyumbani", locale), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg> },
    { key: "live", label: t("Live", "Moja", locale), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { key: "cashiers", label: t("Team", "Timu", locale), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { key: "products", label: t("Items", "Bidhaa", locale), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
    { key: "more", label: t("More", "Zaidi", locale), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg> },
  ];

  return (
    <nav className="flex items-center justify-around bg-white dark:bg-warm-900 border-t border-warm-200/60 dark:border-warm-700/60 z-50" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", minHeight: "56px" }}>
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => onTabChange(tab.key)} className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px] relative">
          {activeTab === tab.key && <motion.div layoutId="mobileActiveTab" className="absolute inset-0 bg-terracotta-50 dark:bg-terracotta-900/20 rounded-t-lg" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
          <span className={`relative z-10 ${activeTab === tab.key ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.icon}</span>
          <span className={`relative z-10 text-[10px] font-semibold ${activeTab === tab.key ? "text-terracotta-600 dark:text-terracotta-400" : "text-warm-400"}`}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileMoreSheet({ isOpen, onClose, locale, activeTab, onTabChange }: {
  isOpen: boolean; onClose: () => void; locale: Locale; activeTab: Tab; onTabChange: (t: Tab) => void;
}) {
  const moreTabs: { key: Tab; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: "payments", label: t("Payments", "Malipo", locale), desc: t("Payment methods & channels", "Njia za malipo", locale), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
    { key: "analytics", label: t("Analytics", "Uchambuzi", locale), desc: t("Earnings, shifts, customers & inventory", "Mapato, muda, wateja", locale), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { key: "security", label: t("Security", "Usalama", locale), desc: t("Fraud detection & alerts", "Ugunduzi wa udanganyifu", locale), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-warm-900 rounded-t-2xl border-t border-warm-200/60 dark:border-warm-700/60 max-h-[70vh] overflow-y-auto" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600 mx-auto mt-3 mb-4" />
            <div className="px-4 pb-4 space-y-1">
              {moreTabs.map((item) => (
                <button key={item.key} onClick={() => { onTabChange(item.key); onClose(); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === item.key ? "bg-terracotta-50 dark:bg-terracotta-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === item.key ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-700 text-warm-500"}`}>{item.icon}</div>
                  <div className="text-left"><p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{item.label}</p><p className="text-[10px] text-warm-400">{item.desc}</p></div>
                  {activeTab === item.key && <div className="ml-auto w-2 h-2 rounded-full bg-terracotta-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileHeader({ data, locale, onExportPDF, onExportExcel }: {
  data: ReturnType<typeof useSalesData>; locale: Locale; onExportPDF: () => void; onExportExcel: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-terracotta-600 via-terracotta-500 to-savanna-500 text-white rounded-b-3xl shadow-lg">
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs font-medium">{t("Today's Sales", "Mauzo ya Leo", locale)}</p>
            <p className="text-3xl font-heading font-extrabold tabular-nums">KSh {data.todayTotal.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExportPDF} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </button>
            <button onClick={onExportExcel} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-white/20 backdrop-blur-sm">
            {[{ key: "today", label: t("Today", "Leo", locale) }, { key: "yesterday", label: t("Yesterday", "Jana", locale) }, { key: "week", label: t("Week", "Wiki", locale) }, { key: "month", label: t("Month", "Mwezi", locale) }].map((p) => (
              <button key={p.key} onClick={() => data.setPeriod(p.key as Parameters<typeof data.setPeriod>[0])} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${data.period === p.key ? "bg-white text-terracotta-600" : "text-white/80"}`}>{p.label}</button>
            ))}
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${data.trendPercent >= 0 ? "bg-emerald-500/30 text-emerald-100" : "bg-red-500/30 text-red-100"}`}>{data.trendPercent >= 0 ? "↑" : "↓"} {Math.abs(data.trendPercent)}%</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[{ label: t("Txns", "Miamala", locale), value: data.transactionCount.toString(), icon: "📋" }, { label: t("Items", "Bidhaa", locale), value: data.totalItemsSold.toLocaleString(), icon: "📦" }, { label: t("Avg", "Wastani", locale), value: `K${data.avgBasketValue >= 1000 ? `${(data.avgBasketValue / 1000).toFixed(1)}k` : data.avgBasketValue}`, icon: "🧺" }, { label: t("Profit", "Faida", locale), value: `${data.profitMargin}%`, icon: "📈" }].map((m, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center">
              <span className="text-sm">{m.icon}</span>
              <p className="text-xs font-bold mt-0.5">{m.value}</p>
              <p className="text-[9px] text-white/70">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileContent({ activeTab, locale, data }: {
  activeTab: Tab; locale: Locale; data: ReturnType<typeof useSalesData>;
}) {
  const totalRevenue = data.filteredSales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-3 pb-2">
      {(activeTab === "overview" || activeTab === "live") && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <LiveSalesFeed locale={locale} sales={data.filteredSales} cashierNames={CASHIER_NAMES} cashierColors={CASHIER_COLORS} />
        </motion.div>
      )}
      {(activeTab === "overview" || activeTab === "cashiers") && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <CashierPerformanceGrid locale={locale} cashiers={data.cashierMetrics} />
        </motion.div>
      )}
      {(activeTab === "overview" || activeTab === "products") && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <ProductAnalyticsSection locale={locale} products={data.productAnalytics} />
        </motion.div>
      )}
      {activeTab === "payments" && (
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><PaymentBreakdownChart locale={locale} breakdown={data.paymentBreakdown} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><SalesChannelsTracker locale={locale} channels={data.channelData} /></motion.div>
        </div>
      )}
      {activeTab === "analytics" && (
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><EarningsCalculator locale={locale} totalRevenue={totalRevenue} totalProfit={data.totalProfit} profitMargin={data.profitMargin} totalDiscount={data.totalDiscountAmount} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><ShiftAnalysis locale={locale} heatmap={data.hourlyHeatmap} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><DiscountsMonitor locale={locale} discounts={data.discounts} totalDiscountAmount={data.totalDiscountAmount} totalRevenue={totalRevenue} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}><ReturnsManagement locale={locale} returns={data.returns} totalReturnAmount={data.totalReturnAmount} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><CustomerInsights locale={locale} insights={data.customerInsights} /></motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}><InventoryImpact locale={locale} inventory={data.inventoryImpact} /></motion.div>
        </div>
      )}
      {activeTab === "security" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><FraudDetection locale={locale} alerts={data.fraudAlerts} /></motion.div>
      )}
    </div>
  );
}

export default function AdminSalesPage() {
  const { locale } = useLocale();
  const { shopId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showAllSections] = useState(false);

  const [msgModal, setMsgModal] = useState<{ open: boolean; name: string; id: string }>({ open: false, name: "", id: "" });
  const [reportModal, setReportModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [bonusModal, setBonusModal] = useState<{ open: boolean; name: string; id: string }>({ open: false, name: "", id: "" });
  const [discountModal, setDiscountModal] = useState<{ open: boolean; name: string; id: string; pct: number }>({ open: false, name: "", id: "", pct: 0 });
  const [reorderModal, setReorderModal] = useState<{ open: boolean; name: string; id: string; qty: number; stock: number }>({ open: false, name: "", id: "", qty: 0, stock: 0 });
  const [fraudModal, setFraudModal] = useState<{ open: boolean; alertId: string }>({ open: false, alertId: "" });

  const data = useSalesData();

  const selectedCashier = data.cashierMetrics.find((c) => c.cashierId === reportModal.id) || null;
  const selectedFraudAlert = data.fraudAlerts.find((a) => a.id === fraudModal.alertId) || null;
  const selectedInventoryItem = data.inventoryImpact.find((i) => i.productId === reorderModal.id) || null;

  if (!shopId) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" /><p className="text-sm text-warm-500">{t("Loading...", "Inapakia...", locale)}</p></div></div>;
  }

  if (data.loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 rounded-b-3xl bg-gradient-to-br from-terracotta-600 to-savanna-500 animate-pulse" />
        <div className="grid grid-cols-4 gap-2 px-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-warm-100 dark:bg-warm-800 animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-warm-50 dark:bg-warm-950 md:bg-transparent md:min-h-0">
      <div className="hidden md:block">
        <DesktopView data={data} locale={locale} activeTab={activeTab} setActiveTab={setActiveTab} showAllSections={showAllSections} />
      </div>

      <div className="md:hidden flex flex-col min-h-screen">
        <MobileHeader data={data} locale={locale} onExportPDF={data.exportPDF} onExportExcel={data.exportExcel} />
        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ paddingBottom: "64px" }}>
          <MobileContent activeTab={activeTab} locale={locale} data={data} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <MobileBottomNav activeTab={activeTab} onTabChange={(tab) => { if (tab === "more") setShowMoreSheet(true); else setActiveTab(tab); }} locale={locale} />
        </div>
        <MobileMoreSheet isOpen={showMoreSheet} onClose={() => setShowMoreSheet(false)} locale={locale} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <CashierMessageModal locale={locale} isOpen={msgModal.open} onClose={() => setMsgModal({ open: false, name: "", id: "" })} cashierName={msgModal.name} onSend={() => setMsgModal({ open: false, name: "", id: "" })} />
      <CashierReportModal locale={locale} isOpen={reportModal.open} onClose={() => setReportModal({ open: false, id: "" })} cashier={selectedCashier} />
      <BonusModal locale={locale} isOpen={bonusModal.open} onClose={() => setBonusModal({ open: false, name: "", id: "" })} cashierName={bonusModal.name} onAward={() => setBonusModal({ open: false, name: "", id: "" })} />
      <DiscountSuggestionModal locale={locale} isOpen={discountModal.open} onClose={() => setDiscountModal({ open: false, name: "", id: "", pct: 0 })} productName={discountModal.name} suggestedPercent={discountModal.pct} onApply={() => setDiscountModal({ open: false, name: "", id: "", pct: 0 })} />
      <ReorderModal locale={locale} isOpen={reorderModal.open} onClose={() => setReorderModal({ open: false, name: "", id: "", qty: 0, stock: 0 })} productName={reorderModal.name} suggestedQty={reorderModal.qty} currentStock={reorderModal.stock} onConfirm={() => setReorderModal({ open: false, name: "", id: "", qty: 0, stock: 0 })} />
      <FraudInvestigationModal locale={locale} isOpen={fraudModal.open} onClose={() => setFraudModal({ open: false, alertId: "" })} alert={selectedFraudAlert} onDismiss={() => setFraudModal({ open: false, alertId: "" })} onEscalate={() => setFraudModal({ open: false, alertId: "" })} />
    </div>
  );
}

function DesktopView({ data, locale, activeTab, setActiveTab, showAllSections }: {
  data: ReturnType<typeof useSalesData>; locale: Locale; activeTab: Tab; setActiveTab: (t: Tab) => void; showAllSections: boolean;
}) {
  const totalRevenue = data.filteredSales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.total, 0);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("Overview", "Muhtasari", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg> },
    { key: "live", label: t("Live Feed", "Moja kwa Moja", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { key: "cashiers", label: t("Cashiers", "Wahasibu", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { key: "products", label: t("Products", "Bidhaa", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
    { key: "payments", label: t("Payments", "Malipo", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
    { key: "analytics", label: t("Analytics", "Uchambuzi", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { key: "security", label: t("Security", "Usalama", locale), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h2 className="text-xl font-heading font-bold text-warm-900 dark:text-warm-50">{t("Sales Command Center", "Kituo cha Mauzo", locale)}</h2><p className="text-sm text-warm-500 dark:text-warm-400 mt-1">{t("Complete visibility into transactions, cashiers, and profitability", "Muonekano kamili wa miamala, wahasibu, na faida", locale)}</p></div>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[36px] ${activeTab === tab.key ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400 hover:text-warm-700"}`}>{tab.icon}<span className="hidden sm:inline">{tab.label}</span></button>
        ))}
      </div>
      <ExecutiveSummary locale={locale} todayTotal={data.todayTotal} yesterdayTotal={data.yesterdayTotal} trendPercent={data.trendPercent} transactionCount={data.transactionCount} totalItemsSold={data.totalItemsSold} avgBasketValue={data.avgBasketValue} profitMargin={data.profitMargin} activeCashiers={data.activeCashiers} period={data.period} onPeriodChange={data.setPeriod} onExportPDF={data.exportPDF} onExportExcel={data.exportExcel} onCustomDateRange={data.setCustomDateRange} />
      {(activeTab === "overview" || activeTab === "live") && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><LiveSalesFeed locale={locale} sales={data.filteredSales} cashierNames={CASHIER_NAMES} cashierColors={CASHIER_COLORS} /></motion.div>}
      {(activeTab === "overview" || activeTab === "cashiers") && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><CashierPerformanceGrid locale={locale} cashiers={data.cashierMetrics} /></motion.div>}
      {(activeTab === "overview" || activeTab === "products") && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><ProductAnalyticsSection locale={locale} products={data.productAnalytics} /></motion.div>}
      {(activeTab === "overview" || activeTab === "payments") && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><PaymentBreakdownChart locale={locale} breakdown={data.paymentBreakdown} /></motion.div><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><SalesChannelsTracker locale={locale} channels={data.channelData} /></motion.div></div>}
      {(activeTab === "overview" || activeTab === "analytics") && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><EarningsCalculator locale={locale} totalRevenue={totalRevenue} totalProfit={data.totalProfit} profitMargin={data.profitMargin} totalDiscount={data.totalDiscountAmount} /></motion.div><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><ShiftAnalysis locale={locale} heatmap={data.hourlyHeatmap} /></motion.div></div>}
      {(activeTab === "overview" || activeTab === "analytics") && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><DiscountsMonitor locale={locale} discounts={data.discounts} totalDiscountAmount={data.totalDiscountAmount} totalRevenue={totalRevenue} /></motion.div><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><ReturnsManagement locale={locale} returns={data.returns} totalReturnAmount={data.totalReturnAmount} /></motion.div></div>}
      {(activeTab === "overview" || activeTab === "analytics") && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><CustomerInsights locale={locale} insights={data.customerInsights} /></motion.div><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><InventoryImpact locale={locale} inventory={data.inventoryImpact} /></motion.div></div>}
      {(activeTab === "overview" || activeTab === "security") && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><FraudDetection locale={locale} alerts={data.fraudAlerts} /></motion.div>}
      {(activeTab === "overview" || showAllSections) && data.shops.length > 1 && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><MultiShopConsolidation locale={locale} shops={data.shops} /></motion.div>}
    </div>
  );
}
