"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { useSettingsFirestore } from "@/hooks/useSettingsFirestore";
import { dt } from "@/lib/dashboardTranslations";
import TabSwitcher from "@/components/ui/TabSwitcher";
import Button from "@/components/ui/Button";
import ShopProfilePanel from "@/components/settings/ShopProfilePanel";
import UserManagementPanel from "@/components/settings/UserManagementPanel";
import PaymentConfigPanel from "@/components/settings/PaymentConfigPanel";
import InventorySettingsPanel from "@/components/settings/InventorySettingsPanel";
import { NotificationsPanel, DataSecurityPanel } from "@/components/settings/SettingsPanels";
import AdvancedPanel from "@/components/settings/AdvancedPanel";

type SettingsTab = "shop" | "users" | "payments" | "inventory" | "notifications" | "data" | "advanced";

const tabs: { key: SettingsTab; label: string; labelSw: string; icon: React.ReactNode }[] = [
  { key: "shop", label: "Shop Profile", labelSw: "Duka", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: "users", label: "Users & Permissions", labelSw: "Watumiaji", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
  { key: "payments", label: "Payments", labelSw: "Malipo", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: "inventory", label: "Inventory", labelSw: "Hesabu", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
  { key: "notifications", label: "Notifications", labelSw: "Arifa", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
  { key: "data", label: "Data & Security", labelSw: "Usalama", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  { key: "advanced", label: "Advanced", labelSw: "Zaidi", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

export default function SettingsPage() {
  const { locale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useViewport();
  const { shopSettings, paymentSettings, notificationSettings, loading, saveShopSettings, savePaymentSettings, saveNotificationSettings } = useSettingsFirestore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("shop");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<SettingsTab | null>("shop");

  const handleChange = useCallback(() => setHasChanges(true), []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setHasChanges(false);
    setIsSaving(false);
  };

  const renderPanel = (tab: SettingsTab) => {
    switch (tab) {
      case "shop": return <ShopProfilePanel locale={locale} onChange={handleChange} settings={shopSettings} onSave={saveShopSettings} />;
      case "users": return <UserManagementPanel locale={locale} onChange={handleChange} />;
      case "payments": return <PaymentConfigPanel locale={locale} onChange={handleChange} settings={paymentSettings} onSave={savePaymentSettings} />;
      case "inventory": return <InventorySettingsPanel locale={locale} onChange={handleChange} notificationSettings={notificationSettings} onSaveNotifications={saveNotificationSettings} />;
      case "notifications": return <NotificationsPanel locale={locale} onChange={handleChange} />;
      case "data": return <DataSecurityPanel locale={locale} onChange={handleChange} />;
      case "advanced": return <AdvancedPanel locale={locale} onChange={handleChange} />;
    }
  };

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
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {dt("settings", locale)}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {locale === "sw" ? "Sanidi mfumo wako" : "Configure your duka system"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-forest-50 dark:bg-forest-900/10 px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-forest-500" />
              <span className="text-xs text-forest-600 font-medium">{locale === "sw" ? "Imehifadhiwa" : "Synced"}</span>
            </div>
            <Button
              variant={hasChanges ? "primary" : "ghost"}
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
              iconLeft={!isSaving ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> : undefined}
            >
              <span className="hidden sm:inline">{locale === "sw" ? "Hifadhi" : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className={isMobile ? "" : "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4"}>
        <div className="hidden lg:flex flex-col overflow-y-auto scroll-container desktop-sidebar-content">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <TabSwitcher
              variant="vertical"
              tabs={tabs.map((t) => ({ key: t.key, label: t.label, labelSw: t.labelSw, icon: t.icon }))}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key as SettingsTab)}
              locale={locale}
            />
          </div>

          <div className="mt-3 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-warm-900 dark:text-warm-50">{locale === "sw" ? "Hali Nyeusi" : "Dark Mode"}</span>
              <button onClick={toggleTheme} className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-terracotta-500" : "bg-warm-300"}`} role="switch" aria-checked={theme === "dark"}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <p className="text-xs text-warm-400">{locale === "sw" ? "Badilisha mandhari" : "Switch between light and dark themes"}</p>
          </div>
        </div>

        <div className={isMobile ? "" : "flex-1 overflow-y-auto scroll-container"}>
          <div className="mobile-accordion lg:hidden space-y-2 mb-4">
            {tabs.map((tab) => (
              <div key={tab.key} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
                <button onClick={() => setMobileExpanded(mobileExpanded === tab.key ? null : tab.key)}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[48px]">
                  <div className="flex items-center gap-3">
                    <span className="text-terracotta-500">{tab.icon}</span>
                    <span className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{locale === "sw" ? tab.labelSw : tab.label}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-warm-400 transition-transform ${mobileExpanded === tab.key ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileExpanded === tab.key && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4">{renderPanel(tab.key)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            {renderPanel(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}
