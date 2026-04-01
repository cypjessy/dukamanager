"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import toast from "react-hot-toast";

type TabKey = "platform" | "security" | "features" | "performance" | "tenant" | "communication" | "payment" | "compliance" | "changelog";

export default function DeveloperSettingsPage() {
  const { locale } = useLocale();
  const { data, hasChanges, saveChanges, updatePlatform, updateSecurity, updateFeature, updatePerformance, updateTenantDefaults, updateCommunication, updatePayment, updateCompliance, exportConfig, importConfig, rollbackChange, lastSaved, error } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState<TabKey>("platform");
  const [search, setSearch] = useState("");
  const [featureModuleFilter, setFeatureModuleFilter] = useState<string>("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: () => void; title: string; message: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "platform", label: t("Platform", "Platform"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
    { key: "security", label: t("Security", "Usalama"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
    { key: "features", label: t("Features", "Vipengele"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
    { key: "performance", label: t("Performance", "Utendaji"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { key: "tenant", label: t("Tenants", "Maduka"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { key: "communication", label: t("Communication", "Mawasiliano"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { key: "payment", label: t("Payments", "Malipo"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
    { key: "compliance", label: t("Compliance", "Utiifu"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
    { key: "changelog", label: t("Change Log", "Historia"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ];

  const handleSave = () => {
    setConfirmAction({
      action: async () => { await saveChanges(); toast.success(t("Settings saved successfully", "Mipangilio imehifadhiwa")); },
      title: t("Save Changes?", "Hifadhi Mabadiliko?"),
      message: t("This will apply all pending changes to the platform.", "Hii itatumia mabadiliko yote kwenye platform."),
    });
    setShowConfirmModal(true);
  };

  const handleExport = () => {
    exportConfig();
    toast.success(t("Configuration exported", "Usanidi umesafirishwa"));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = importConfig(content);
      if (success) {
        toast.success(t("Configuration imported", "Usanidi umeingizwa"));
        setImportError(null);
      } else {
        setImportError(t("Invalid configuration file", "Faili ya usanidi si sahihi"));
        toast.error(t("Import failed", "Uingizaji umeshindikana"));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredFeatures = data.features.filter(f => {
    const matchesModule = featureModuleFilter === "all" || f.module === featureModuleFilter;
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const modules = Array.from(new Set(data.features.map(f => f.module)));

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-terracotta-500 text-white text-sm">{t("Reload", "Pakia Upya")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
            {t("Platform Settings", "Mipangilio ya Platform")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("Configure global platform settings", "Sanidi mipangilio ya jumla ya platform")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-warm-400">{t("Last saved", "Imehifadhiwa mwisho")}: {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          )}
          <button onClick={handleExport} className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            {t("Export", "Safirisha")}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            {t("Import", "Ingiza")}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          {hasChanges && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleSave} className="px-4 py-2 rounded-xl bg-terracotta-500 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors">
              {t("Save Changes", "Hifadhi Mabadiliko")}
            </motion.button>
          )}
        </div>
      </div>

      {importError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-sm text-red-600">{importError}</div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder={t("Search settings...", "Tafuta mipangilio...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-warm-100 dark:bg-warm-800 rounded-xl p-1 overflow-x-auto -webkit-overflow-scrolling-touch" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
              activeTab === tab.key ? "bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 shadow-sm" : "text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.length > 8 ? tab.label.slice(0, 6) + "." : tab.label}</span>
          </button>
        ))}
      </div>

      {/* Platform Tab */}
      {activeTab === "platform" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Platform Identity", "Utambulisho wa Platform")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Platform Name", "Jina la Platform")}</label>
                <input type="text" value={data.platform.name} onChange={(e) => updatePlatform({ name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Tagline", "Maelezo")}</label>
                <input type="text" value={data.platform.tagline} onChange={(e) => updatePlatform({ tagline: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Support Email", "Barua pepe ya Msaada")}</label>
                <input type="email" value={data.platform.supportEmail} onChange={(e) => updatePlatform({ supportEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Support Phone", "Simu ya Msaada")}</label>
                <input type="text" value={data.platform.supportPhone} onChange={(e) => updatePlatform({ supportPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Timezone", "Saa za Eneo")}</label>
                <input type="text" value={data.platform.timezone} onChange={(e) => updatePlatform({ timezone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Date Format", "Umbizo la Tarehe")}</label>
                <input type="text" value={data.platform.dateFormat} onChange={(e) => updatePlatform({ dateFormat: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Security Policy", "Sera ya Usalama")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Min Password Length", "Urefu wa Nenosiri")}</label>
                <input type="number" min={4} max={32} value={data.security.passwordPolicy.minLength} onChange={(e) => updateSecurity({ passwordPolicy: { ...data.security.passwordPolicy, minLength: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Password Expiry (days)", "Muda wa Nenosiri")}</label>
                <input type="number" value={data.security.passwordPolicy.expiryDays} onChange={(e) => updateSecurity({ passwordPolicy: { ...data.security.passwordPolicy, expiryDays: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Max Login Attempts", "Majaribio ya Kuingia")}</label>
                <input type="number" value={data.security.maxLoginAttempts} onChange={(e) => updateSecurity({ maxLoginAttempts: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Session Timeout (min)", "Muda wa Sesheni")}</label>
                <input type="number" value={data.security.sessionTimeout} onChange={(e) => updateSecurity({ sessionTimeout: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Lockout Duration (min)", "Muda wa Kufungwa")}</label>
                <input type="number" value={data.security.lockoutDuration} onChange={(e) => updateSecurity({ lockoutDuration: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Suspicious Activity Detection", "Ugunduzi wa Shughuli ya Shaka")}</label>
                <select value={data.security.suspiciousActivityDetection} onChange={(e) => updateSecurity({ suspiciousActivityDetection: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                  <option value="low">{t("Low", "Chini")}</option>
                  <option value="medium">{t("Medium", "Kati")}</option>
                  <option value="high">{t("High", "Juu")}</option>
                </select>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: t("Require Uppercase", "Herufi Kubwa"), key: "requireUppercase" as const },
                { label: t("Require Numbers", "Nambari"), key: "requireNumbers" as const },
                { label: t("Require Symbols", "Alama"), key: "requireSymbols" as const },
                { label: t("2FA for Admins", "2FA kwa Wasimamizi"), key: "twoFactorAdmins" as const },
                { label: t("2FA for Developers", "2FA kwa Wasanidi"), key: "twoFactorDevelopers" as const },
                { label: t("Encryption at Rest", "Usimbaji fiche"), key: "encryptionAtRest" as const },
              ].map((toggle) => {
                let isChecked = false;
                if (toggle.key === "twoFactorAdmins") isChecked = data.security.twoFactorAuth.admins;
                else if (toggle.key === "twoFactorDevelopers") isChecked = data.security.twoFactorAuth.developers;
                else if (toggle.key === "encryptionAtRest") isChecked = data.security.encryptionAtRest;
                else isChecked = data.security.passwordPolicy[toggle.key as keyof typeof data.security.passwordPolicy] as boolean;
                return (
                  <div key={toggle.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <span className="text-sm text-warm-700 dark:text-warm-300">{toggle.label}</span>
                    <button onClick={() => {
                      if (toggle.key === "twoFactorAdmins") updateSecurity({ twoFactorAuth: { ...data.security.twoFactorAuth, admins: !isChecked } });
                      else if (toggle.key === "twoFactorDevelopers") updateSecurity({ twoFactorAuth: { ...data.security.twoFactorAuth, developers: !isChecked } });
                      else if (toggle.key === "encryptionAtRest") updateSecurity({ encryptionAtRest: !isChecked });
                      else updateSecurity({ passwordPolicy: { ...data.security.passwordPolicy, [toggle.key]: !isChecked } });
                    }} className={`w-11 h-6 rounded-full transition-colors relative ${isChecked ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isChecked ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === "features" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={featureModuleFilter} onChange={(e) => setFeatureModuleFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50">
              <option value="all">{t("All Modules", "Moduli Zote")}</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Feature Flags", "Vipengele")}</h3>
            <div className="space-y-3">
              {filteredFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{feature.name}</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600">{feature.module}</span>
                    </div>
                    <p className="text-[10px] text-warm-400">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={100} value={feature.rolloutPercentage} onChange={(e) => updateFeature(feature.id, { rolloutPercentage: Number(e.target.value) })} className="w-20 accent-terracotta-500" />
                      <span className="text-[10px] text-warm-400 w-8">{feature.rolloutPercentage}%</span>
                    </div>
                    <button onClick={() => updateFeature(feature.id, { enabled: !feature.enabled })} className={`w-11 h-6 rounded-full transition-colors relative ${feature.enabled ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${feature.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Performance Settings", "Mipangilio ya Utendaji")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Requests/min", "Maombi/dakika")}</label>
                <input type="number" value={data.performance.rateLimiting.requestsPerMinute} onChange={(e) => updatePerformance({ rateLimiting: { ...data.performance.rateLimiting, requestsPerMinute: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Burst Allowance", "Ruhusa ya Mlipuko")}</label>
                <input type="number" value={data.performance.rateLimiting.burstAllowance} onChange={(e) => updatePerformance({ rateLimiting: { ...data.performance.rateLimiting, burstAllowance: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Cache TTL (sec)", "Muda wa Cache")}</label>
                <input type="number" value={data.performance.caching.ttl} onChange={(e) => updatePerformance({ caching: { ...data.performance.caching, ttl: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <div>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{t("Enable Caching", "Washa Cache")}</p>
                </div>
                <button onClick={() => updatePerformance({ caching: { ...data.performance.caching, enabled: !data.performance.caching.enabled } })} className={`w-11 h-6 rounded-full transition-colors relative ${data.performance.caching.enabled ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.performance.caching.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <div>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{t("Maintenance Mode", "Hali ya Matengenezo")}</p>
                  <p className="text-[10px] text-warm-400">{t("Take platform offline for maintenance", "Ondoa platform mtandaoni kwa matengenezo")}</p>
                </div>
                <button onClick={() => {
                  setConfirmAction({
                    action: () => updatePerformance({ maintenanceMode: { ...data.performance.maintenanceMode, enabled: !data.performance.maintenanceMode.enabled } }),
                    title: data.performance.maintenanceMode.enabled ? t("Disable Maintenance Mode?", "Zima Hali ya Matengenezo?") : t("Enable Maintenance Mode?", "Washa Hali ya Matengenezo?"),
                    message: data.performance.maintenanceMode.enabled ? t("The platform will become available again.", "Platform itarudi kuonekana tena.") : t("All users will see a maintenance message.", "Watumiaji wote wataona ujumbe wa matengenezo."),
                  });
                  setShowConfirmModal(true);
                }} className={`w-11 h-6 rounded-full transition-colors relative ${data.performance.maintenanceMode.enabled ? "bg-red-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.performance.maintenanceMode.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {data.performance.maintenanceMode.enabled && (
                <div>
                  <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Maintenance Message", "Ujumbe wa Matengenezo")}</label>
                  <textarea value={data.performance.maintenanceMode.message} onChange={(e) => updatePerformance({ maintenanceMode: { ...data.performance.maintenanceMode, message: e.target.value } })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Defaults Tab */}
      {activeTab === "tenant" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Tenant Defaults", "Mipangilio ya Maduka")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Default Plan", "Mpango wa Kawaida")}</label>
                <select value={data.tenantDefaults.defaultPlan} onChange={(e) => updateTenantDefaults({ defaultPlan: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                  <option value="free">{t("Free", "Bure")}</option>
                  <option value="growth">{t("Growth", "Ukuaji")}</option>
                  <option value="enterprise">{t("Enterprise", "Enterprise")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Welcome Email Template", "Template ya Barua ya Karibu")}</label>
                <input type="text" value={data.tenantDefaults.welcomeEmail} onChange={(e) => updateTenantDefaults({ welcomeEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-warm-500 mb-3">{t("Shop Limits by Plan", "Vikomo vya Maduka kwa Mpango")}</h4>
              <div className="grid grid-cols-3 gap-3">
                {(["free", "growth", "enterprise"] as const).map(plan => (
                  <div key={plan}>
                    <label className="block text-xs text-warm-400 mb-1 capitalize">{plan}</label>
                    <input type="number" value={data.tenantDefaults.shopLimits[plan]} onChange={(e) => updateTenantDefaults({ shopLimits: { ...data.tenantDefaults.shopLimits, [plan]: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-warm-500 mb-3">{t("Default Features", "Vipengele vya Kawaida")}</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.tenantDefaults.defaultFeatures).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <span className="text-sm text-warm-700 dark:text-warm-300 capitalize">{key}</span>
                    <button onClick={() => updateTenantDefaults({ defaultFeatures: { ...data.tenantDefaults.defaultFeatures, [key]: !value } })} className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <div>
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{t("Auto-approve New Shops", "Idhinisha Maduka Mapya Kiotomatiki")}</p>
              </div>
              <button onClick={() => updateTenantDefaults({ autoApprove: !data.tenantDefaults.autoApprove })} className={`w-11 h-6 rounded-full transition-colors relative ${data.tenantDefaults.autoApprove ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.tenantDefaults.autoApprove ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === "communication" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("SMS Gateway", "Geti ya SMS")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Primary Provider", "Mtoaji Mkuu")}</label>
                <input type="text" value={data.communication.smsGateway.primary} onChange={(e) => updateCommunication({ smsGateway: { ...data.communication.smsGateway, primary: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Fallback Provider", "Mtoaji wa Akiba")}</label>
                <input type="text" value={data.communication.smsGateway.fallback} onChange={(e) => updateCommunication({ smsGateway: { ...data.communication.smsGateway, fallback: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Sender ID", "Kitambulisho cha Mtumaji")}</label>
                <input type="text" value={data.communication.smsGateway.senderId} onChange={(e) => updateCommunication({ smsGateway: { ...data.communication.smsGateway, senderId: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Email Service", "Huduma ya Barua Pepe")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Provider", "Mtoaji")}</label>
                <input type="text" value={data.communication.emailService.primary} onChange={(e) => updateCommunication({ emailService: { ...data.communication.emailService, primary: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("From Name", "Jina la Mtumaji")}</label>
                <input type="text" value={data.communication.emailService.fromName} onChange={(e) => updateCommunication({ emailService: { ...data.communication.emailService, fromName: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("From Email", "Barua ya Mtumaji")}</label>
                <input type="email" value={data.communication.emailService.fromEmail} onChange={(e) => updateCommunication({ emailService: { ...data.communication.emailService, fromEmail: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Channels & Limits", "Njia na Vikomo")}</h3>
            <div className="space-y-3">
              {[
                { label: t("WhatsApp", "WhatsApp"), key: "whatsappEnabled" as const, value: data.communication.whatsappEnabled },
                { label: t("Push Notifications", "Arifa za Push"), key: "pushEnabled" as const, value: data.communication.pushNotifications.enabled },
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <span className="text-sm text-warm-700 dark:text-warm-300">{toggle.label}</span>
                  <button onClick={() => {
                    if (toggle.key === "whatsappEnabled") updateCommunication({ whatsappEnabled: !toggle.value });
                    else updateCommunication({ pushNotifications: { ...data.communication.pushNotifications, enabled: !toggle.value } });
                  }} className={`w-11 h-6 rounded-full transition-colors relative ${toggle.value ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("SMS/Hour", "SMS/Saa")}</label>
                <input type="number" value={data.communication.frequencyLimits.smsPerHour} onChange={(e) => updateCommunication({ frequencyLimits: { ...data.communication.frequencyLimits, smsPerHour: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("Email/Hour", "Barua/Saa")}</label>
                <input type="number" value={data.communication.frequencyLimits.emailPerHour} onChange={(e) => updateCommunication({ frequencyLimits: { ...data.communication.frequencyLimits, emailPerHour: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("Push/Hour", "Push/Saa")}</label>
                <input type="number" value={data.communication.frequencyLimits.pushPerHour} onChange={(e) => updateCommunication({ frequencyLimits: { ...data.communication.frequencyLimits, pushPerHour: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("M-Pesa Integration", "Uunganishaji wa M-Pesa")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Environment", "Mazingira")}</label>
                <select value={data.payment.mpesa.environment} onChange={(e) => updatePayment({ mpesa: { ...data.payment.mpesa, environment: e.target.value as any } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                  <option value="sandbox">{t("Sandbox", "Sandbox")}</option>
                  <option value="production">{t("Production", "Uzalishaji")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Timeout (sec)", "Muda wa Kusahau")}</label>
                <input type="number" value={data.payment.mpesa.defaultTimeout} onChange={(e) => updatePayment({ mpesa: { ...data.payment.mpesa, defaultTimeout: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <span className="text-sm text-warm-700 dark:text-warm-300">{t("M-Pesa Enabled", "M-Pesa Imewashwa")}</span>
              <button onClick={() => updatePayment({ mpesa: { ...data.payment.mpesa, enabled: !data.payment.mpesa.enabled } })} className={`w-11 h-6 rounded-full transition-colors relative ${data.payment.mpesa.enabled ? "bg-emerald-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.payment.mpesa.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Refund Policy", "Sera ya Marejesho")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Max Days", "Siku za Juu")}</label>
                <input type="number" value={data.payment.refundPolicy.maxDays} onChange={(e) => updatePayment({ refundPolicy: { ...data.payment.refundPolicy, maxDays: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Auto-approve Limit", "Kikomo cha Kiotomatiki")}</label>
                <input type="number" value={data.payment.refundPolicy.autoApproveLimit} onChange={(e) => updatePayment({ refundPolicy: { ...data.payment.refundPolicy, autoApproveLimit: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Require Approval Above", "Idhini Juu ya")}</label>
                <input type="number" value={data.payment.refundPolicy.requireApprovalAbove} onChange={(e) => updatePayment({ refundPolicy: { ...data.payment.refundPolicy, requireApprovalAbove: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Fee Handling", "Ushughulikiaji wa Ada")}</h3>
            <select value={data.payment.feeHandling} onChange={(e) => updatePayment({ feeHandling: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
              <option value="absorbed">{t("Absorbed by Platform", "Inafyonzwa na Platform")}</option>
              <option value="passed_to_customer">{t("Passed to Customer", "Inapitishwa kwa Mteja")}</option>
              <option value="split">{t("Split", "Imegawanywa")}</option>
            </select>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("KRA Integration", "Uunganishaji wa KRA")}</h3>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 mb-4">
              <span className="text-sm text-warm-700 dark:text-warm-300">{t("KRA Enabled", "KRA Imewashwa")}</span>
              <button onClick={() => updateCompliance({ kraIntegration: { ...data.compliance.kraIntegration, enabled: !data.compliance.kraIntegration.enabled } })} className={`w-11 h-6 rounded-full transition-colors relative ${data.compliance.kraIntegration.enabled ? "bg-emerald-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.compliance.kraIntegration.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("VAT Rate (%)", "Kiwango cha VAT (%)")}</label>
              <input type="number" value={data.compliance.kraIntegration.vatRate} onChange={(e) => updateCompliance({ kraIntegration: { ...data.compliance.kraIntegration, vatRate: Number(e.target.value) } })} className="w-full md:w-1/2 px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Data & Privacy", "Data na Faragha")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Data Residency", "Makazi ya Data")}</label>
                <select value={data.compliance.dataResidency} onChange={(e) => updateCompliance({ dataResidency: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                  <option value="kenya_only">{t("Kenya Only", "Kenya Pekee")}</option>
                  <option value="africa">{t("Africa", "Afrika")}</option>
                  <option value="global">{t("Global", "Kimataifa")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("GDPR Mode", "Hali ya GDPR")}</label>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateCompliance({ gdprMode: !data.compliance.gdprMode })} className={`w-11 h-6 rounded-full transition-colors relative ${data.compliance.gdprMode ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.compliance.gdprMode ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-warm-600 dark:text-warm-400">{data.compliance.gdprMode ? t("Enabled", "Imewashwa") : t("Disabled", "Imezimwa")}</span>
                </div>
              </div>
            </div>
            <h4 className="text-xs font-medium text-warm-500 mb-3">{t("Data Retention (years)", "Uhifadhi wa Data (miaka)")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("Transactions", "Muamala")}</label>
                <input type="number" value={data.compliance.dataRetention.transactions} onChange={(e) => updateCompliance({ dataRetention: { ...data.compliance.dataRetention, transactions: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("User Data", "Data ya Watumiaji")}</label>
                <input type="number" value={data.compliance.dataRetention.userData} onChange={(e) => updateCompliance({ dataRetention: { ...data.compliance.dataRetention, userData: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs text-warm-400 mb-1">{t("Deleted Shop Grace (days)", "Muda wa Rehema")}</label>
                <input type="number" value={data.compliance.dataRetention.deletedShopGracePeriod} onChange={(e) => updateCompliance({ dataRetention: { ...data.compliance.dataRetention, deletedShopGracePeriod: Number(e.target.value) } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Legal URLs", "Viungo vya Kisheria")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Terms", "Masharti")}</label>
                <input type="url" value={data.compliance.legalUrls.terms} onChange={(e) => updateCompliance({ legalUrls: { ...data.compliance.legalUrls, terms: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Privacy", "Faragha")}</label>
                <input type="url" value={data.compliance.legalUrls.privacy} onChange={(e) => updateCompliance({ legalUrls: { ...data.compliance.legalUrls, privacy: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1.5">{t("Refund Policy", "Sera ya Marejesho")}</label>
                <input type="url" value={data.compliance.legalUrls.refund} onChange={(e) => updateCompliance({ legalUrls: { ...data.compliance.legalUrls, refund: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Log Tab */}
      {activeTab === "changelog" && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Change History", "Historia ya Mabadiliko")}</h3>
          {data.changeLog.length === 0 ? (
            <p className="text-sm text-warm-400 text-center py-8">{t("No changes recorded", "Hakuna mabadiliko yaliyorekodiwa")}</p>
          ) : (
            <div className="space-y-2">
              {data.changeLog.map(change => (
                <div key={change.id} className={`flex items-center justify-between p-3 rounded-xl ${change.rolledBack ? "bg-red-50 dark:bg-red-900/10" : "bg-warm-50 dark:bg-warm-800/50"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{change.setting}</p>
                    <p className="text-[10px] text-warm-400">{change.changedBy} • {change.changedAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-warm-400">{change.oldValue} → {change.newValue}</span>
                    {change.rolledBack ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-900/20 text-red-600">{t("Rolled Back", "Imerejeshwa")}</span>
                    ) : (
                      <button onClick={() => {
                        setConfirmAction({
                          action: () => { rollbackChange(change.id); toast.success(t("Change rolled back", "Mabadiliko yamerejeshwa")); },
                          title: t("Rollback Change?", "Rejesha Mabadiliko?"),
                          message: t("This will mark the change as rolled back.", "Hii itaweka mabadiliko kama yamerejeshwa."),
                        });
                        setShowConfirmModal(true);
                      }} className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-[10px] font-medium hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors">
                        {t("Rollback", "Rejesha")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-5">
                <h3 className="text-lg font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{confirmAction.title}</h3>
                <p className="text-sm text-warm-400">{confirmAction.message}</p>
              </div>
              <div className="px-5 pb-5 flex items-center gap-2">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                  {t("Cancel", "Ghairi")}
                </button>
                <button onClick={() => { confirmAction.action(); setShowConfirmModal(false); setConfirmAction(null); }} className="flex-1 py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors">
                  {t("Confirm", "Thibitisha")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
