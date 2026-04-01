"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useCashierMonitoring } from "@/hooks/useCashierMonitoring";
import type { CashierUser, CashierPermissions } from "@/hooks/useCashierMonitoring";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { useSupervisorPin } from "@/hooks/useSupervisorPin";
import { CashierProfile } from "@/components/cashier-profile/CashierProfile";

type Tab = "cashiers" | "activity" | "reconciliation" | "alerts" | "shifts" | "performance" | "settings";

function SupervisorPinSettings() {
  const { pin, loading, updatePin } = useSupervisorPin();
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setMsg(null);
    if (newPin.length < 4) { setMsg({ type: "error", text: "PIN must be at least 4 digits" }); return; }
    if (newPin !== confirmPin) { setMsg({ type: "error", text: "PINs do not match" }); return; }
    if (!/^\d+$/.test(newPin)) { setMsg({ type: "error", text: "PIN must contain only numbers" }); return; }
    setSaving(true);
    try {
      await updatePin(newPin);
      setMsg({ type: "success", text: "Supervisor PIN updated successfully" });
      setNewPin(""); setConfirmPin("");
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to update PIN" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-terracotta-200/60 dark:border-terracotta-800/30 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-600">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">Supervisor PIN</h3>
          <p className="text-[10px] text-warm-400">Required for processing returns &amp; refunds</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">New PIN</label>
          <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)}
            placeholder="Enter new PIN (min 4 digits)"
            maxLength={8}
            className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px] font-mono tracking-widest"
            style={{ fontSize: "18px", textAlign: "center" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Confirm PIN</label>
          <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Confirm new PIN"
            maxLength={8}
            className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px] font-mono tracking-widest"
            style={{ fontSize: "18px", textAlign: "center" }} />
        </div>
        {msg && (
          <div className={`p-2.5 rounded-xl text-xs font-medium ${msg.type === "success" ? "bg-forest-50 dark:bg-forest-900/20 text-forest-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
            {msg.type === "success" ? "\u2713" : "\u2717"} {msg.text}
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !newPin}
          className="w-full py-2.5 rounded-xl bg-terracotta-500 text-white text-xs font-bold min-h-[40px] disabled:opacity-40">
          {saving ? "Saving..." : "Update Supervisor PIN"}
        </button>
        <p className="text-[10px] text-warm-400 text-center">Current PIN: {"\u2022".repeat(pin.length)} ({pin.length} digits)</p>
      </div>
    </div>
  );
}

export default function CashierManagementPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const {
    cashiers, activityLogs, loading,
    addCashier, suspendCashier, activateCashier,
    onlineCashiers, todayTotalTransactions, todayTotalSales, anomalies,
    defaultPermissions,
  } = useCashierMonitoring();

  const [tab, setTab] = useState<Tab>("cashiers");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<CashierUser | null>(null);
  const [selectedActivityCashier, setSelectedActivityCashier] = useState<string>("all");
  const [logFilter, setLogFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const filteredCashiers = useMemo(() => {
    if (!searchQuery) return cashiers;
    const q = searchQuery.toLowerCase();
    return cashiers.filter((c) => c.displayName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }, [cashiers, searchQuery]);

  const filteredLogs = useMemo(() => {
    let logs = activityLogs;
    if (selectedActivityCashier !== "all") {
      logs = logs.filter((l) => l.cashierId === selectedActivityCashier);
    }
    if (logFilter !== "all") {
      logs = logs.filter((l) => l.action === logFilter);
    }
    return logs;
  }, [activityLogs, selectedActivityCashier, logFilter]);

  const handleAddCashier = useCallback(async (data: Record<string, unknown>) => {
    try {
      await addCashier({
        displayName: String(data.displayName || ""),
        email: String(data.email || ""),
        phone: String(data.phone || ""),
        nationalId: String(data.nationalId || ""),
        role: (data.role as "cashier" | "head_cashier" | "trainee") || "cashier",
        pin: String(data.pin || "1234"),
        permissions: (data.permissions as CashierPermissions) || defaultPermissions,
        password: String(data.password || "Cashier123!"),
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add cashier:", err);
    }
  }, [addCashier, defaultPermissions]);

  const roleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      head_cashier: { bg: "bg-terracotta-100 dark:bg-terracotta-900/30", text: "text-terracotta-700 dark:text-terracotta-400" },
      cashier: { bg: "bg-forest-100 dark:bg-forest-900/30", text: "text-forest-700 dark:text-forest-400" },
      trainee: { bg: "bg-savanna-100 dark:bg-savanna-900/30", text: "text-savanna-700 dark:text-savanna-400" },
    };
    return badges[role] || badges.cashier;
  };

  const statusColor = (status: string) => {
    if (status === "online") return "bg-forest-500";
    if (status === "on_break") return "bg-savanna-500";
    return "bg-warm-300 dark:bg-warm-600";
  };

  const actionIcon = (action: string) => {
    const icons: Record<string, string> = {
      login: "🔐", logout: "🚪", sale: "💰", refund: "↩️", discount: "🏷️",
      void: "❌", break_start: "☕", break_end: "✅", register_open: "📂",
      register_close: "📁", cash_drop: "💵", error: "⚠️",
    };
    return icons[action] || "📋";
  };

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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {t("Cashier Portal Management", "Usimamizi wa Mabenki")}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {cashiers.length} {t("cashiers", "mabenki")} &middot; {onlineCashiers.length} {t("online", "mtandaoni")}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[44px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("Add Cashier", "Ongeza Mhasibu")}
          </button>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className={`grid gap-2 ${isMobile ? "grid-cols-2 mb-4" : "grid-cols-4 mb-3 page-section-fixed"}`}>
        {[
          { label: t("Active", "Hai"), value: onlineCashiers.length.toString(), color: "text-forest-600 bg-forest-50 dark:bg-forest-900/20" },
          { label: t("Today Sales", "Mauzo ya Leo"), value: `KSh ${(todayTotalSales / 1000).toFixed(0)}k`, color: "text-terracotta-600 bg-terracotta-50 dark:bg-terracotta-900/20" },
          { label: t("Transactions", "Miamala"), value: todayTotalTransactions.toString(), color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: t("Alerts", "Arifa"), value: anomalies.length.toString(), color: anomalies.length > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-warm-500 bg-warm-100 dark:bg-warm-800" },
        ].map((s) => (
          <div key={s.label} className={`p-3 rounded-xl ${s.color} text-center`}>
            <p className="text-lg font-heading font-extrabold">{s.value}</p>
            <p className="text-[10px] font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 w-fit ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        {(["cashiers", "activity", "reconciliation", "alerts", "shifts", "performance", "settings"] as Tab[]).map((v) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${tab === v ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
            {v === "cashiers" ? t("Cashiers", "Mabenki") : v === "activity" ? t("Activity", "Kumbukumbu") : v === "reconciliation" ? t("Cash Drawer", "Kasha") : v === "alerts" ? t("Alerts", "Arifa") : v === "shifts" ? t("Shifts", "Mabadiliko") : v === "performance" ? t("Performance", "Utendaji") : t("Settings", "Mipangio")}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === "cashiers" && (
        <div className={`relative ${isMobile ? "mb-4" : "mb-3 flex-shrink-0"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search cashiers...", "Tafuta mabenki...")}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[44px]" />
        </div>
      )}

      {/* Activity filter chips */}
      {tab === "activity" && (
        <div className="space-y-2 mb-3">
          {/* Cashier filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <button onClick={() => setSelectedActivityCashier("all")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors min-h-[28px] ${selectedActivityCashier === "all" ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
              {t("All Cashiers", "Wote")}
            </button>
            {cashiers.map((c) => (
              <button key={c.uid} onClick={() => setSelectedActivityCashier(c.uid)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors min-h-[28px] flex items-center gap-1 ${selectedActivityCashier === c.uid ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor(c.onlineStatus)}`} />
                {c.displayName.split(" ")[0]}
              </button>
            ))}
          </div>
          {/* Action type filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {["all", "login", "logout", "sale", "refund", "discount", "void", "error"].map((f) => (
              <button key={f} onClick={() => setLogFilter(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors min-h-[28px] ${logFilter === f ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
                {f === "all" ? "All" : f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={isMobile ? "" : "page-section-scroll"}>
        {/* Cashiers Tab */}
        {tab === "cashiers" && (
          <div className="space-y-2">
            {filteredCashiers.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">{t("No Cashiers Yet", "Hakuna Mabenki")}</h3>
                <p className="text-sm text-warm-400 mb-4">{t("Add your first cashier to get started", "Ongeza mhasibu wako wa kwanza")}</p>
                <button onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[44px]">
                  {t("Add Cashier", "Ongeza Mhasibu")}
                </button>
              </div>
            ) : (
              filteredCashiers.map((cashier, i) => (
                <motion.div key={cashier.uid} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCashier(cashier)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 cursor-pointer hover:bg-warm-50/50 dark:hover:bg-warm-800/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                  {/* Avatar + status */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center">
                      <span className="text-sm font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                        {cashier.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-warm-800 ${statusColor(cashier.onlineStatus)} ${cashier.onlineStatus === "online" ? "animate-pulse" : ""}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{cashier.displayName}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${roleBadge(cashier.role).bg} ${roleBadge(cashier.role).text} uppercase`}>
                        {cashier.role.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[10px] text-warm-400">
                      {cashier.onlineStatus === "online" ? t("Online now", "Mtandaoni sasa") : cashier.onlineStatus === "on_break" ? t("On break", "Mapumzikoni") : t("Offline", "Nje ya mtandao")}
                      {cashier.deviceName && ` · ${cashier.deviceName}`}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                      KSh {cashier.todaySales.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-warm-400">{cashier.todayTransactions} {t("txns", "miamala")}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {cashier.status === "active" ? (
                      <button onClick={(e) => { e.stopPropagation(); suspendCashier(cashier.uid); }}
                        className="p-1.5 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title={t("Suspend", "Simamisha")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); activateCashier(cashier.uid); }}
                        className="p-1.5 rounded-lg text-warm-400 hover:text-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title={t("Activate", "Washa")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {tab === "activity" && (
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <p className="text-sm text-warm-400">{t("No activity logs yet", "Hakuna kumbukumbu")}</p>
              </div>
            ) : (
              filteredLogs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60"
                  style={{ background: log.anomalyFlags.length > 0 ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                  <span className="text-lg flex-shrink-0">{actionIcon(log.action)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{log.cashierName}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 uppercase">{log.action.replace("_", " ")}</span>
                      {log.anomalyFlags.length > 0 && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">⚠ {log.anomalyFlags.length}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-warm-400 truncate">{log.details}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {log.amount > 0 && <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {log.amount.toLocaleString()}</p>}
                    <p className="text-[9px] text-warm-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cash Drawer Reconciliation Tab */}
        {tab === "reconciliation" && (
          <CashReconciliationTab cashiers={cashiers} activityLogs={activityLogs} locale={locale} />
        )}

        {/* Fraud Alerts Tab */}
        {tab === "alerts" && (
          <FraudAlertsTab cashiers={cashiers} activityLogs={activityLogs} anomalies={anomalies} locale={locale} />
        )}

        {/* Shifts Tab */}
        {tab === "shifts" && (
          <ShiftManagementTab cashiers={cashiers} locale={locale} />
        )}

        {/* Performance Tab */}
        {tab === "performance" && (
          <div className="space-y-3">
            {cashiers.filter((c) => c.todayTransactions > 0).sort((a, b) => b.todaySales - a.todaySales).map((cashier, i) => (
              <div key={cashier.uid} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-warm-400 w-4">#{i + 1}</span>
                    <span className="text-sm font-medium text-warm-900 dark:text-warm-50">{cashier.displayName}</span>
                  </div>
                  <span className="text-sm font-heading font-extrabold text-terracotta-600 tabular-nums">KSh {cashier.todaySales.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t("Txns", "Miamala"), value: cashier.todayTransactions.toString() },
                    { label: t("Avg", "Wastani"), value: `KSh ${cashier.avgBasketSize.toLocaleString()}` },
                    { label: t("Errors", "Makosa"), value: `${cashier.errorRate}%` },
                    { label: t("Status", "Hali"), value: cashier.onlineStatus === "online" ? t("Online", "Mtandaoni") : t("Offline", "Nje") },
                  ].map((m) => (
                    <div key={m.label} className="p-1.5 rounded-lg bg-warm-50 dark:bg-warm-800/50 text-center">
                      <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{m.value}</p>
                      <p className="text-[8px] text-warm-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {cashiers.filter((c) => c.todayTransactions > 0).length === 0 && (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <p className="text-sm text-warm-400">{t("No transactions today", "Hakuna mauzo leo")}</p>
              </div>
            )}

            {/* Commission tracking */}
            <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
              <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{t("Commission Summary", "Muhtasawa wa Kamisheni")}</h4>
              <div className="space-y-1.5">
                {cashiers.filter((c) => c.todaySales > 0).slice(0, 5).map((c) => {
                  const target = 10000;
                  const commission = c.todaySales > target ? Math.round((c.todaySales - target) * 0.005) : 0;
                  const progress = Math.min(100, Math.round((c.todaySales / target) * 100));
                  return (
                    <div key={c.uid} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-warm-900 dark:text-warm-50 truncate">{c.displayName.split(" ")[0]}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1.5 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
                            <div className={`h-full rounded-full ${progress >= 100 ? "bg-forest-500" : "bg-terracotta-500"}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[8px] text-warm-400 tabular-nums">{progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {c.todaySales.toLocaleString()}</p>
                        {commission > 0 && <p className="text-[9px] font-bold text-forest-600 tabular-nums">+KSh {commission}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-warm-400 mt-2">{t("Commission: 0.5% of sales above KSh 10,000 target", "Kamisheni: 0.5% ya mauzo juu ya KSh 10,000")}</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{t("Default Permissions", "Ruhusa za Kawaida")}</h3>
              <div className="space-y-2">
                {[
                  { key: "processSales", label: t("Process Sales", "Fanya Mauzo") },
                  { key: "applyDiscounts", label: t("Apply Discounts", "Weka Punguzo") },
                  { key: "handleRefunds", label: t("Handle Refunds", "Shughulikia Kurudisha") },
                  { key: "viewReports", label: t("View Reports", "Tazama Ripoti") },
                  { key: "manageInventory", label: t("Manage Inventory", "Dhibiti Hesabu") },
                  { key: "openCloseRegister", label: t("Open/Close Register", "Funga/Fungua Kasha") },
                  { key: "voidTransactions", label: t("Void Transactions", "Futa Mauzo") },
                ].map((p) => (
                  <div key={p.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-warm-50 dark:bg-warm-800/50">
                    <span className="text-xs text-warm-900 dark:text-warm-50">{p.label}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${defaultPermissions[p.key as keyof CashierPermissions] ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600" : "bg-warm-200 dark:bg-warm-700 text-warm-500"}`}>
                      {defaultPermissions[p.key as keyof CashierPermissions] ? t("Allowed", "Ruhusiwa") : t("Denied", "Kataa")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{t("Security Settings", "Mipangio ya Usalama")}</h3>
              <div className="space-y-3">
                {[
                  { label: t("Require PIN on Login", "Hitaji PIN Kuingia"), enabled: true },
                  { label: t("Device Binding", "Kufunga Kifaa"), enabled: false },
                  { label: t("Geofencing", "Ukanda wa Eneo"), enabled: false },
                  { label: t("Auto-logout on Idle", "Toka Kiotomatiki"), enabled: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-warm-900 dark:text-warm-50">{s.label}</span>
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${s.enabled ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SupervisorPinSettings />
          </div>
        )}
      </div>

      {/* Add Cashier Modal */}
      <AddCashierModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCashier}
        locale={locale}
      />

      {/* Cashier Profile Drawer */}
      {selectedCashier && (
        <CashierProfile
          cashier={selectedCashier}
          locale={locale}
          onClose={() => setSelectedCashier(null)}
        />
      )}
    </div>
  );
}

// Add Cashier Modal Component
function AddCashierModal({ isOpen, onClose, onSubmit, locale }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  locale: string;
}) {
  const [form, setForm] = useState({
    displayName: "", email: "", phone: "", nationalId: "",
    role: "cashier" as "cashier" | "head_cashier" | "trainee",
    pin: "1234", password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.displayName.trim()) { setFormError(t("Name is required", "Jina linahitajika")); return; }
    if (!form.email.trim()) { setFormError(t("Email is required", "Barua pepe inahitajika")); return; }
    if (!form.phone.trim()) { setFormError(t("Phone is required", "Simu inahitajika")); return; }
    if (form.password.length < 6) { setFormError(t("Password must be at least 6 characters", "Nenosiri lazima liwe angalau herufi 6")); return; }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("Failed to create account", "Imeshindwa kuunda akaunti");
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{t("Add New Cashier", "Ongeza Mhasibu")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-warm-400 hover:text-warm-600 min-w-[32px] min-h-[32px] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-medium">
              {formError}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Full Name", "Jina Kamili")} *</label>
            <input type="text" required value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
            </div>
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Phone", "Simu")} *</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("National ID", "Kitambulisho")}</label>
              <input type="text" value={form.nationalId} onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
            </div>
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Role", "Jukumu")}</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as typeof form.role }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px] appearance-none">
                <option value="cashier">{t("Cashier", "Mhasibu")}</option>
                <option value="head_cashier">{t("Head Cashier", "Mhasibu Mkuu")}</option>
                <option value="trainee">{t("Trainee", "Mfunzwa")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">PIN *</label>
              <input type="password" required minLength={4} maxLength={6} value={form.pin} onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                placeholder="4-6 digits" />
            </div>
            <div>
              <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Password", "Nenosiri")} *</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                placeholder="Min 6 characters" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-50">
            {submitting ? t("Creating...", "Inaunda...") : t("Create Cashier Account", "Unda Akaunti")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Shift Management Tab
function ShiftManagementTab({ cashiers, locale }: {
  cashiers: CashierUser[];
  locale: string;
}) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const now = new Date();
  const currentHour = now.getHours();
  const currentShift = currentHour >= 6 && currentHour < 14 ? "morning" : currentHour >= 14 && currentHour < 22 ? "afternoon" : "night";

  const shifts = [
    { key: "morning", label: t("Morning", "Asubuhi"), start: "06:00", end: "14:00", color: "bg-savanna-500" },
    { key: "afternoon", label: t("Afternoon", "Mchana"), start: "14:00", end: "22:00", color: "bg-terracotta-500" },
    { key: "night", label: t("Night", "Usiku"), start: "22:00", end: "06:00", color: "bg-[#4E9AF1]" },
  ];

  // Compute real shift data per cashier from Firestore fields
  const shiftData = useMemo(() => {
    const now = new Date();
    return cashiers.map((c) => {
      const shiftDuration = () => {
        if (!c.shiftStart) return null;
        const start = new Date(c.shiftStart);
        const end = c.shiftEnd ? new Date(c.shiftEnd) : now;
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${mins}m`;
      };

      const isActiveShift = c.onlineStatus === "online" && c.shiftStart;
      const shiftStartTime = c.shiftStart ? new Date(c.shiftStart) : null;
      const shiftEndTime = c.shiftEnd ? new Date(c.shiftEnd) : null;

      // Determine which shift type based on start time
      let assignedShift = "";
      if (shiftStartTime) {
        const h = shiftStartTime.getHours();
        assignedShift = h >= 6 && h < 14 ? "morning" : h >= 14 && h < 22 ? "afternoon" : "night";
      }

      return {
        ...c,
        shiftDuration: shiftDuration(),
        isActiveShift,
        shiftStartTime,
        shiftEndTime,
        assignedShift,
      };
    });
  }, [cashiers]);

  const onShiftNow = shiftData.filter((c) => c.isActiveShift);
  const offShift = shiftData.filter((c) => !c.isActiveShift);

  return (
    <div className="space-y-3">
      {/* Currently on shift */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50">{t("Current Shift", "Mabadiliko ya Sasa")}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${shifts.find((s) => s.key === currentShift)?.color} text-white`}>
            {shifts.find((s) => s.key === currentShift)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-heading font-extrabold text-warm-900 dark:text-warm-50">{onShiftNow.length}</span>
          <span className="text-xs text-warm-500">{t("cashiers on shift", "mabenki kazini")}</span>
        </div>
        {onShiftNow.length > 0 && (
          <div className="space-y-1.5">
            {onShiftNow.map((c) => (
              <div key={c.uid} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-forest-50 dark:bg-forest-900/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-warm-900 dark:text-warm-50">{c.displayName}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-warm-400 tabular-nums">
                    {c.shiftStartTime ? c.shiftStartTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                    {" - "}
                    {t("now", "sasa")}
                  </p>
                  <p className="text-[9px] font-medium text-forest-600">{c.shiftDuration || "--"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {onShiftNow.length === 0 && (
          <p className="text-[10px] text-warm-400 text-center py-2">{t("No cashiers currently on shift", "Hakuna mabenki kazini sasa")}</p>
        )}
      </div>

      {/* All cashier shift status */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{t("Cashier Shifts", "Mabadiliko ya Mabenki")}</h4>
        <div className="space-y-1.5">
          {shiftData.map((c) => (
            <div key={c.uid} className="flex items-center justify-between py-2 px-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.isActiveShift ? "bg-forest-500 animate-pulse" : c.onlineStatus === "on_break" ? "bg-savanna-500" : "bg-warm-300"}`} />
                <div>
                  <p className="text-[10px] font-medium text-warm-900 dark:text-warm-50">{c.displayName}</p>
                  <p className="text-[8px] text-warm-400">
                    {c.role.replace("_", " ")}
                    {c.deviceName && ` · ${c.deviceName}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {c.shiftStartTime ? (
                  <>
                    <p className="text-[9px] font-medium text-warm-900 dark:text-warm-50 tabular-nums">
                      {c.shiftStartTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {c.shiftEndTime ? ` - ${c.shiftEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ` - ${t("now", "sasa")}`}
                    </p>
                    <p className={`text-[8px] font-bold ${c.isActiveShift ? "text-forest-600" : "text-warm-400"}`}>
                      {c.shiftDuration || t("Ended", "Imeisha")}
                      {c.assignedShift && ` · ${shifts.find(s => s.key === c.assignedShift)?.label || ""}`}
                    </p>
                  </>
                ) : (
                  <p className="text-[9px] text-warm-400">{t("No shift today", "Hakuna zamu leo")}</p>
                )}
              </div>
            </div>
          ))}
          {shiftData.length === 0 && (
            <p className="text-[10px] text-warm-400 text-center py-2">{t("No cashiers", "Hakuna mabenki")}</p>
          )}
        </div>
      </div>

      {/* Shift templates */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{t("Shift Templates", "Mifano ya Mabadiliko")}</h4>
        <div className="space-y-1.5">
          {shifts.map((shift) => (
            <div key={shift.key} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${shift.color}`} />
                <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{shift.label}</span>
              </div>
              <span className="text-[10px] text-warm-400 tabular-nums">{shift.start} - {shift.end}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Off-shift cashiers */}
      {offShift.length > 0 && (
        <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{t("Off Shift", "Nje ya Zamu")}</h4>
          <div className="flex flex-wrap gap-1.5">
            {offShift.map((c) => (
              <span key={c.uid} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-500">
                {c.displayName.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Handover checklist */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">{t("Handover Checklist", "Orodha ya Kuagana")}</h4>
        <div className="space-y-1.5">
          {[
            t("Cash count verified", "Pesa zimehesabiwa"),
            t("Register closed", "Kasha limefungwa"),
            t("Pending orders noted", "Agizo zilizosalia zimeandikwa"),
            t("Stock check done", "Hesabu imefanywa"),
            t("Clean workspace", "Mahali safi"),
          ].map((item) => (
            <label key={item} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded accent-terracotta-500" />
              <span className="text-xs text-warm-900 dark:text-warm-50">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}


// Cash Drawer Reconciliation Tab
function CashReconciliationTab({ cashiers, activityLogs, locale }: {
  cashiers: CashierUser[];
  activityLogs: ReturnType<typeof useCashierMonitoring>["activityLogs"];
  locale: string;
}) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const [selectedCashier, setSelectedCashier] = useState<string>("all");
  const [drawerCloseAmount, setDrawerCloseAmount] = useState("");
  const [reconCashier, setReconCashier] = useState<string>("");

  // Calculate expected cash for each cashier from their sales
  const cashDrawerData = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return cashiers
      .filter((c) => c.onlineStatus === "online" || c.todayTransactions > 0)
      .map((c) => {
        const cashierLogs = activityLogs.filter((l) => l.cashierId === c.uid && l.timestamp?.startsWith(today));
        const cashSales = cashierLogs.filter((l) => l.action === "sale" && l.paymentMethod === "cash").reduce((s, l) => s + l.amount, 0);
        const cashRefunds = cashierLogs.filter((l) => l.action === "refund" && l.paymentMethod === "cash").reduce((s, l) => s + l.amount, 0);
        const mpesaSales = cashierLogs.filter((l) => l.action === "sale" && l.paymentMethod === "mpesa").reduce((s, l) => s + l.amount, 0);
        const opens = cashierLogs.filter((l) => l.action === "register_open");
        const closes = cashierLogs.filter((l) => l.action === "register_close");
        const voids = cashierLogs.filter((l) => l.action === "void");
        const discounts = cashierLogs.filter((l) => l.action === "discount").reduce((s, l) => s + l.amount, 0);
        const expectedCash = cashSales - cashRefunds;
        const voidRate = c.todayTransactions > 0 ? Math.round((voids.length / c.todayTransactions) * 100) : 0;

        return {
          ...c,
          cashSales,
          cashRefunds,
          mpesaSales,
          totalSales: c.todaySales,
          expectedCash,
          registerOpens: opens.length,
          registerCloses: closes.length,
          voidCount: voids.length,
          voidRate,
          totalDiscounts: discounts,
          variance: 0,
          status: opens.length > closes.length ? "open" : "closed",
        };
      });
  }, [cashiers, activityLogs]);

  const filteredDrawer = selectedCashier === "all" ? cashDrawerData : cashDrawerData.filter((c) => c.uid === selectedCashier);
  const totalExpectedCash = filteredDrawer.reduce((s, c) => s + c.expectedCash, 0);
  const totalVariance = filteredDrawer.reduce((s, c) => s + c.variance, 0);

  return (
    <div className="space-y-3">
      {/* Filter by cashier */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
        <button onClick={() => setSelectedCashier("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[28px] ${selectedCashier === "all" ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
          {t("All Cashiers", "Wote")}
        </button>
        {cashDrawerData.map((c) => (
          <button key={c.uid} onClick={() => setSelectedCashier(c.uid)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[28px] ${selectedCashier === c.uid ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
            {c.displayName.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 text-center">
          <p className="text-lg font-heading font-extrabold text-forest-600 tabular-nums">KSh {totalExpectedCash.toLocaleString()}</p>
          <p className="text-[10px] text-warm-500">{t("Expected Cash", "Pesa Inayotarajiwa")}</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{filteredDrawer.filter((c) => c.status === "open").length}</p>
          <p className="text-[10px] text-warm-500">{t("Open Registers", "Kasha Zilizofunguliwa")}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${Math.abs(totalVariance) > 500 ? "bg-red-50 dark:bg-red-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold tabular-nums ${totalVariance !== 0 ? (totalVariance > 0 ? "text-forest-600" : "text-red-500") : "text-warm-500"}`}>
            {totalVariance > 0 ? "+" : ""}KSh {totalVariance.toLocaleString()}
          </p>
          <p className="text-[10px] text-warm-500">{t("Variance", "Tofauti")}</p>
        </div>
      </div>

      {/* Per-cashier drawer details */}
      <div className="space-y-2">
        {filteredDrawer.map((drawer) => (
          <div key={drawer.uid} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3"
            style={{ background: drawer.voidRate > 10 || Math.abs(drawer.variance) > 500 ? "rgba(239,68,68,0.03)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${drawer.status === "open" ? "bg-forest-500 animate-pulse" : "bg-warm-300"}`} />
                <span className="text-sm font-medium text-warm-900 dark:text-warm-50">{drawer.displayName}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${drawer.status === "open" ? "bg-forest-100 text-forest-600" : "bg-warm-200 text-warm-500"}`}>
                  {drawer.status}
                </span>
              </div>
              {drawer.voidRate > 10 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">
                  ⚠ {drawer.voidRate}% void rate
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[
                { label: t("Cash Sales", "Mauzo ya Pesa"), value: `KSh ${drawer.cashSales.toLocaleString()}` },
                { label: t("M-Pesa", "M-Pesa"), value: `KSh ${drawer.mpesaSales.toLocaleString()}` },
                { label: t("Refunds", "Kurudisha"), value: `KSh ${drawer.cashRefunds.toLocaleString()}` },
                { label: t("Discounts", "Punguzo"), value: `KSh ${drawer.totalDiscounts.toLocaleString()}` },
              ].map((m) => (
                <div key={m.label} className="p-1.5 rounded-lg bg-warm-50 dark:bg-warm-800/50 text-center">
                  <p className="text-[10px] font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{m.value}</p>
                  <p className="text-[8px] text-warm-400">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Reconciliation form */}
            <div className="flex items-center gap-2 pt-2 border-t border-warm-200/40 dark:border-warm-700/40">
              <div className="flex-1">
                <label className="text-[9px] text-warm-400 block">{t("Actual Cash Count", "Pesa Halisi")}</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input type="number" value={reconCashier === drawer.uid ? drawerCloseAmount : ""}
                    onChange={(e) => { setReconCashier(drawer.uid); setDrawerCloseAmount(e.target.value); }}
                    placeholder={`KSh ${drawer.expectedCash.toLocaleString()}`}
                    className="flex-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-xs tabular-nums outline-none focus:border-terracotta-500 min-h-[32px]" />
                  <button onClick={() => {
                    const actual = Number(drawerCloseAmount) || 0;
                    const variance = actual - drawer.expectedCash;
                    console.warn(`Reconciliation for ${drawer.displayName}: Expected ${drawer.expectedCash}, Actual ${actual}, Variance ${variance}`);
                    setDrawerCloseAmount("");
                    setReconCashier("");
                  }}
                    className="px-3 py-1 rounded-lg bg-forest-500 text-white text-[10px] font-bold min-h-[32px]">
                    {t("Reconcile", "Sawazisha")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrawer.length === 0 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <p className="text-sm text-warm-400">{t("No active cashiers today", "Hakuna mabenki hai leo")}</p>
        </div>
      )}
    </div>
  );
}

// Fraud Prevention Alerts Tab
function FraudAlertsTab({ cashiers, activityLogs, anomalies, locale }: {
  cashiers: CashierUser[];
  activityLogs: ReturnType<typeof useCashierMonitoring>["activityLogs"];
  anomalies: ReturnType<typeof useCashierMonitoring>["anomalies"];
  locale: string;
}) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  // Detect fraud patterns
  const fraudAlerts = useMemo(() => {
    const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
    const alerts: Array<{
      id: string;
      type: "high_void" | "discount_abuse" | "cash_discrepancy" | "failed_login" | "unusual_hours" | "rapid_transactions";
      severity: "high" | "medium" | "low";
      cashierId: string;
      cashierName: string;
      message: string;
      details: string;
      timestamp: string;
    }> = [];

    const today = new Date().toISOString().slice(0, 10);

    cashiers.forEach((cashier) => {
      const cashierLogs = activityLogs.filter((l) => l.cashierId === cashier.uid && l.timestamp?.startsWith(today));

      // High void rate
      const voids = cashierLogs.filter((l) => l.action === "void");
      const voidRate = cashier.todayTransactions > 0 ? (voids.length / cashier.todayTransactions) * 100 : 0;
      if (voidRate > 10 && cashier.todayTransactions >= 5) {
        alerts.push({
          id: `void-${cashier.uid}`,
          type: "high_void",
          severity: voidRate > 25 ? "high" : "medium",
          cashierId: cashier.uid,
          cashierName: cashier.displayName,
          message: t("High void rate", "Kiwango cha juu cha kufuta"),
          details: `${voidRate.toFixed(1)}% void rate (${voids.length}/${cashier.todayTransactions} transactions)`,
          timestamp: new Date().toISOString(),
        });
      }

      // Excessive discounts
      const discounts = cashierLogs.filter((l) => l.action === "discount");
      const totalDiscounts = discounts.reduce((s, l) => s + l.amount, 0);
      if (discounts.length > 5 || totalDiscounts > cashier.todaySales * 0.15) {
        alerts.push({
          id: `discount-${cashier.uid}`,
          type: "discount_abuse",
          severity: totalDiscounts > cashier.todaySales * 0.2 ? "high" : "medium",
          cashierId: cashier.uid,
          cashierName: cashier.displayName,
          message: t("Excessive discounts", "Punguzo kupita kiasi"),
          details: `${discounts.length} discounts totaling KSh ${totalDiscounts.toLocaleString()}`,
          timestamp: new Date().toISOString(),
        });
      }

      // Error rate
      if (cashier.errorRate > 5) {
        alerts.push({
          id: `error-${cashier.uid}`,
          type: "cash_discrepancy",
          severity: cashier.errorRate > 15 ? "high" : "medium",
          cashierId: cashier.uid,
          cashierName: cashier.displayName,
          message: t("High error rate", "Kiwango cha juu cha makosa"),
          details: `${cashier.errorRate}% error rate`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Check for anomalies from activity logs
    anomalies.forEach((log) => {
      if (log.anomalyFlags.length > 0) {
        alerts.push({
          id: `anomaly-${log.id}`,
          type: "unusual_hours",
          severity: "high",
          cashierId: log.cashierId,
          cashierName: log.cashierName,
          message: log.anomalyFlags.join(", "),
          details: log.details,
          timestamp: log.timestamp,
        });
      }
    });

    return alerts.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      return sev[a.severity] - sev[b.severity];
    });
  }, [cashiers, activityLogs, anomalies, locale]);

  const highAlerts = fraudAlerts.filter((a) => a.severity === "high");
  const mediumAlerts = fraudAlerts.filter((a) => a.severity === "medium");

  const alertIcon = (type: string) => {
    const icons: Record<string, string> = {
      high_void: "❌", discount_abuse: "🏷️", cash_discrepancy: "💵",
      failed_login: "🔐", unusual_hours: "⏰", rapid_transactions: "⚡",
    };
    return icons[type] || "⚠️";
  };

  return (
    <div className="space-y-3">
      {/* Alert summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-3 rounded-xl text-center ${highAlerts.length > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold ${highAlerts.length > 0 ? "text-red-600" : "text-warm-500"}`}>{highAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("High Risk", "Hatari Kubwa")}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${mediumAlerts.length > 0 ? "bg-savanna-50 dark:bg-savanna-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold ${mediumAlerts.length > 0 ? "text-savanna-600" : "text-warm-500"}`}>{mediumAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("Medium Risk", "Hatari ya Kati")}</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
          <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{fraudAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("Total Alerts", "Arifa Zote")}</p>
        </div>
      </div>

      {/* Alert rules info */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Detection Rules", "Kanua za Ugunduzi")}</h4>
        <div className="space-y-1">
          {[
            { rule: t("Void rate > 10%", "Kiwango cha kufuta > 10%"), severity: "medium" },
            { rule: t("Void rate > 25%", "Kiwango cha kufuta > 25%"), severity: "high" },
            { rule: t("Discounts > 15% of sales", "Punguzo > 15% ya mauzo"), severity: "medium" },
            { rule: t("Error rate > 5%", "Kiwango cha makosa > 5%"), severity: "medium" },
            { rule: t("Anomaly flags detected", "Alama za kushangaza zimegunduliwa"), severity: "high" },
          ].map((r) => (
            <div key={r.rule} className="flex items-center gap-2 py-1">
              <span className={`w-2 h-2 rounded-full ${r.severity === "high" ? "bg-red-500" : "bg-savanna-500"}`} />
              <span className="text-[10px] text-warm-600 dark:text-warm-400">{r.rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      {fraudAlerts.length > 0 ? (
        <div className="space-y-2">
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border p-3"
              style={{
                background: alert.severity === "high" ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                borderColor: alert.severity === "high" ? "rgba(239,68,68,0.3)" : "rgba(212,165,116,0.3)",
              }}>
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{alertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{alert.cashierName}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      alert.severity === "high" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600"
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-[11px] font-medium text-warm-800 dark:text-warm-200">{alert.message}</p>
                  <p className="text-[10px] text-warm-400 mt-0.5">{alert.details}</p>
                </div>
                <span className="text-[9px] text-warm-400 flex-shrink-0">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-forest-200/60 dark:border-forest-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-1">{t("All Clear", "Hakuna Tatizo")}</h3>
          <p className="text-xs text-warm-400">{t("No suspicious activity detected", "Hakuna shughuli za kushangaza zimegunduliwa")}</p>
        </div>
      )}
    </div>
  );
}

