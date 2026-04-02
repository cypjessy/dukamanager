"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useDeveloperData } from "@/hooks/useDeveloperData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { ShopActivity } from "@/data/developerData";

type DateRange = "today" | "7d" | "30d" | "all";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export default function DeveloperActivityPage() {
  const { locale } = useLocale();
  const { activities, shops, loading, refresh } = useDeveloperData();
  const [typeFilter, setTypeFilter] = useState<"all" | "login" | "transaction" | "settings" | "payment" | "user_added">("all");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [search, setSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<ShopActivity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const pageSize = 15;
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const shopMap = useMemo(() => {
    const map: Record<string, string> = {};
    shops.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [shops]);

  const filtered = useMemo(() => {
    const now = new Date();
    return activities.filter((a) => {
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      const matchesShop = shopFilter === "all" || a.tenantId === shopFilter;
      const matchesSearch = !search || a.user.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
      let matchesDate = true;
      if (dateRange !== "all") {
        const activityDate = new Date(a.timestamp);
        const diffDays = (now.getTime() - activityDate.getTime()) / 86400000;
        if (dateRange === "today") matchesDate = diffDays < 1;
        else if (dateRange === "7d") matchesDate = diffDays < 7;
        else if (dateRange === "30d") matchesDate = diffDays < 30;
      }
      return matchesType && matchesShop && matchesSearch && matchesDate;
    });
  }, [activities, typeFilter, shopFilter, search, dateRange]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, ShopActivity[]> = {};
    paginated.forEach(a => {
      const group = getDateGroup(a.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(a);
    });
    return groups;
  }, [paginated]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = activities.filter(a => (now.getTime() - new Date(a.timestamp).getTime()) < 86400000).length;
    const thisWeek = activities.filter(a => (now.getTime() - new Date(a.timestamp).getTime()) < 604800000).length;
    const byType: Record<string, number> = {};
    activities.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; });
    const uniqueShops = new Set(activities.map(a => a.tenantId)).size;
    const uniqueUsers = new Set(activities.map(a => a.user)).size;
    return { total: activities.length, today, thisWeek, byType, uniqueShops, uniqueUsers };
  }, [activities]);

  const typeDistribution = useMemo(() => {
    const colors: Record<string, string> = { login: "#3b82f6", transaction: "#10b981", settings: "#f59e0b", payment: "#8b5cf6", user_added: "#06b6d4" };
    return Object.entries(stats.byType).map(([type, count]) => ({
      name: type.replace("_", " "),
      value: count,
      color: colors[type] || "#9ca3af",
    }));
  }, [stats.byType]);

  const suspiciousActivities = useMemo(() => {
    const userActivityCount: Record<string, number> = {};
    activities.forEach(a => { userActivityCount[a.user] = (userActivityCount[a.user] || 0) + 1; });
    const loginAttempts: Record<string, number> = {};
    activities.filter(a => a.type === "login").forEach(a => { loginAttempts[a.user] = (loginAttempts[a.user] || 0) + 1; });
    return activities.filter(a => {
      if (a.type === "login" && loginAttempts[a.user] > 5) return true;
      return false;
    }).slice(0, 5);
  }, [activities]);

  const handleRefresh = () => {
    refresh();
    setLastRefresh(new Date());
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Type", "User", "Description", "Shop"];
    const rows = filtered.map(a => [a.timestamp, a.type, a.user, a.description, shopMap[a.tenantId] || a.tenantId]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeColors: Record<string, string> = {
    login: "bg-blue-500",
    transaction: "bg-emerald-500",
    settings: "bg-amber-500",
    payment: "bg-terracotta-500",
    user_added: "bg-cyan-500",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    login: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>,
    transaction: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    payment: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user_added: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-xl border-2 border-terracotta-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
            {t("Activity Log", "Rekodi ya Shughuli")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("Audit trail across all shops", "Rekodi ya shughuli za maduka yote")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            {t("Export CSV", "Safirisha CSV")}
          </button>
          <button onClick={handleRefresh} className="p-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors" title={t("Refresh", "Onyesha Upya")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          </button>
          <span className="text-[10px] text-warm-400">{lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Total Activities", "Shughuli Zote")}</p>
          <p className="text-2xl font-bold text-warm-900 dark:text-warm-50">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-emerald-50 dark:bg-emerald-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Today", "Leo")}</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.today}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-terracotta-50 dark:bg-terracotta-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("This Week", "Wiki Hii")}</p>
          <p className="text-2xl font-bold text-terracotta-600">{stats.thisWeek}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-blue-50 dark:bg-blue-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Active Shops", "Maduka Hai")}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.uniqueShops}</p>
        </div>
      </div>

      {/* Suspicious Activity Alert */}
      {suspiciousActivities.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="font-heading font-bold text-sm text-red-700 dark:text-red-400">{t("Suspicious Activity Detected", "Shughuli ya Shaka Imegunduliwa")}</h3>
          </div>
          <div className="space-y-1">
            {suspiciousActivities.map(a => (
              <p key={a.id} className="text-xs text-red-600 dark:text-red-400">{a.user} - {t("Multiple login attempts", "Majaribio mengi ya kuingia")} ({formatRelativeTime(a.timestamp)})</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t("Search by user or description...", "Tafuta kwa mtumiaji au maelezo...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>
        <select
          value={shopFilter}
          onChange={(e) => { setShopFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Shops", "Maduka Yote")}</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden">
          {(["today", "7d", "30d", "all"] as DateRange[]).map((r) => (
            <button key={r} onClick={() => { setDateRange(r); setPage(1); }} className={`px-3 py-2 text-xs font-medium transition-colors ${dateRange === r ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
              {r === "all" ? t("All", "Yote") : r === "today" ? t("Today", "Leo") : r}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "transaction", "login", "settings", "payment", "user_added"] as const).map((type) => (
          <button
            key={type}
            onClick={() => { setTypeFilter(type); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              typeFilter === type ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700"
            }`}
          >
            {type !== "all" && <span className={`w-2 h-2 rounded-full ${typeColors[type]}`} />}
            {type === "all" ? t("All", "Zote") : type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Activity Distribution Chart */}
      {typeDistribution.length > 0 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Activity Distribution", "Usambazaji wa Shughuli")}
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-warm-400">{t("No activity recorded", "Hakuna shughuli zilizorekodiwa")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date}>
                <h4 className="text-xs font-bold text-warm-500 dark:text-warm-400 uppercase mb-2 sticky top-0 bg-white dark:bg-warm-900 py-1 z-10">{date}</h4>
                <div className="space-y-1">
                  {items.map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => { setSelectedActivity(activity); setShowDetailModal(true); }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        typeColors[activity.type] ? `${typeColors[activity.type]}/10` : "bg-warm-100 dark:bg-warm-800"
                      }`}>
                        <span className={typeColors[activity.type] ? typeColors[activity.type].replace("bg-", "text-") : "text-warm-400"}>
                          {typeIcons[activity.type] || typeIcons.settings}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-warm-400">{activity.user}</span>
                          <span className="text-[10px] text-warm-300 dark:text-warm-600">•</span>
                          <span className="text-[10px] text-warm-400">{shopMap[activity.tenantId] || activity.tenantId.slice(0, 12)}</span>
                          <span className="text-[10px] text-warm-300 dark:text-warm-600">•</span>
                          <span className="text-[10px] text-warm-400">{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize flex-shrink-0 ${
                        activity.type === "transaction" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                        activity.type === "login" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                        activity.type === "payment" ? "bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600" :
                        activity.type === "user_added" ? "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600" :
                        "bg-amber-100 dark:bg-amber-900/20 text-amber-600"
                      }`}>
                        {activity.type.replace("_", " ")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-200/60 dark:border-warm-700/60">
            <p className="text-xs text-warm-400">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} {t("of", "ya")} {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                {t("Prev", "Iliyopita")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                {t("Next", "Inayofuata")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedActivity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    typeColors[selectedActivity.type] ? `${typeColors[selectedActivity.type]}/10` : "bg-warm-100 dark:bg-warm-800"
                  }`}>
                    <span className={typeColors[selectedActivity.type] ? typeColors[selectedActivity.type].replace("bg-", "text-") : "text-warm-400"}>
                      {typeIcons[selectedActivity.type] || typeIcons.settings}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 capitalize">{selectedActivity.type.replace("_", " ")}</h2>
                    <p className="text-xs text-warm-400">{selectedActivity.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
                  <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-xs text-warm-400 uppercase mb-1">{t("Description", "Maelezo")}</p>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{selectedActivity.description}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("User", "Mtumiaji")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{selectedActivity.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Shop", "Duka")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{shopMap[selectedActivity.tenantId] || selectedActivity.tenantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Timestamp", "Muda")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{new Date(selectedActivity.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Relative Time", "Muda Ulinganishwa")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{formatRelativeTime(selectedActivity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
