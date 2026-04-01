"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLocale } from "@/providers/LocaleProvider";
import { useDeveloperData } from "@/hooks/useDeveloperData";

export default function DeveloperDashboardPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const { shops, metrics, alerts, activities, loading } = useDeveloperData();
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "trial">("all");

  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const filteredShops = shops.filter((s) => filter === "all" || s.status === filter);
  const recentActivities = activities.slice(0, 8);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");

  const metricCards = [
    { label: t("Total Shops", "Maduka Yote"), value: metrics.totalShops.toString(), change: metrics.totalShops > 0 ? 12 : 0, color: "terracotta", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    )},
    { label: t("Active Shops", "Maduka Hai"), value: metrics.activeShops.toString(), change: metrics.activeShops > 0 ? 8 : 0, color: "forest", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )},
    { label: t("Monthly Revenue", "Mapato ya Mwezi"), value: `KSh ${metrics.monthlyRevenue.toLocaleString()}`, change: 15, color: "savanna", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    )},
    { label: t("Total Users", "Watumiaji Wote"), value: metrics.totalUsers.toString(), change: 5, color: "sunset", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )},
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl border-2 border-terracotta-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-warm-500">{t("Loading platform data...", "Inapakia data ya platform...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
            {t("Platform Dashboard", "Dashibodi ya Platform")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("Overview of all shops and platform health", "Muhtasari wa maduka yote na afya ya platform")}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/developer/tenants")}
              className="px-4 py-2 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              {t("Manage Shops", "Simamia Maduka")}
            </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, i) => {
          const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
            terracotta: { bg: "bg-terracotta-50 dark:bg-terracotta-900/20", icon: "bg-terracotta-100 dark:bg-terracotta-800/40 text-terracotta-600 dark:text-terracotta-400", border: "border-terracotta-200/50 dark:border-terracotta-700/30" },
            forest: { bg: "bg-forest-50 dark:bg-forest-900/20", icon: "bg-forest-100 dark:bg-forest-800/40 text-forest-500 dark:text-forest-400", border: "border-forest-200/50 dark:border-forest-700/30" },
            savanna: { bg: "bg-savanna-50 dark:bg-savanna-900/20", icon: "bg-savanna-100 dark:bg-savanna-800/40 text-savanna-600 dark:text-savanna-400", border: "border-savanna-200/50 dark:border-savanna-700/30" },
            sunset: { bg: "bg-sunset-50 dark:bg-sunset-900/20", icon: "bg-sunset-100 dark:bg-sunset-800/40 text-sunset-500 dark:text-sunset-400", border: "border-sunset-200/50 dark:border-sunset-700/30" },
          };
          const colors = colorMap[m.color] || colorMap.terracotta;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-shadow hover:shadow-md ${colors.border}`}
              style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-warm-500 dark:text-warm-400 font-medium mb-1">{m.label}</p>
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{m.value}</p>
                  {m.change !== 0 && (
                    <span className={`text-xs font-medium mt-1 inline-block ${m.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {m.change > 0 ? "↑" : "↓"} {Math.abs(m.change)}%
                    </span>
                  )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                  {m.icon}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 page-section-fixed">
        {/* Health Alerts */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="p-4 border-b border-warm-100/60 dark:border-warm-800/60">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
                {t("Health Alerts", "Maonyo ya Afya")}
              </h3>
              {(criticalAlerts.length + warningAlerts.length) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 text-[10px] font-bold">
                  {criticalAlerts.length + warningAlerts.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-8">{t("All systems healthy", "Kila kitu kiko vizuri")}</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 6).map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl ${
                    alert.severity === "critical" ? "bg-red-50 dark:bg-red-900/10" : "bg-amber-50 dark:bg-amber-900/10"
                  }`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{alert.tenantName}</p>
                      <p className="text-[11px] text-warm-500">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="p-4 border-b border-warm-100/60 dark:border-warm-800/60">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Recent Activity", "Shughuli za Hivi Karibuni")}
            </h3>
          </div>
          <div className="p-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-8">{t("No recent activity", "Hakuna shughuli za hivi karibuni")}</p>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <div className="w-8 h-8 rounded-full bg-terracotta-100 dark:bg-terracotta-900/20 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-500">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{activity.description}</p>
                      <p className="text-[10px] text-warm-400">{activity.user} • {activity.tenantId.slice(0, 15)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shops Overview Table */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden page-section-fixed" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="p-4 border-b border-warm-100/60 dark:border-warm-800/60">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Shops Overview", "Muhtasari wa Maduka")}
            </h3>
            <div className="flex items-center gap-1">
              {(["all", "active", "trial", "suspended"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all min-h-[28px] ${
                    filter === f
                      ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                      : "text-warm-500 dark:text-warm-400 hover:text-warm-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
                  <th className="text-left py-2 px-3 text-xs font-medium text-warm-400 uppercase">{t("Shop", "Duka")}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-warm-400 uppercase">{t("Owner", "Mmiliki")}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-warm-400 uppercase">{t("Plan", "Mpango")}</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-warm-400 uppercase">{t("Status", "Hali")}</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-warm-400 uppercase">{t("Revenue", "Mapato")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.slice(0, 10).map((shop) => (
                  <tr key={shop.id} className="border-b border-warm-100 dark:border-warm-800/50 hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors last:border-0">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-warm-900 dark:text-warm-50 text-xs">{shop.name}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-warm-500">{shop.owner}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        shop.subscription === "enterprise" ? "bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600" :
                        shop.subscription === "growth" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                        "bg-warm-100 dark:bg-warm-800 text-warm-500"
                      }`}>
                        {shop.subscription}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        shop.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                        shop.status === "trial" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                        shop.status === "pending" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                        "bg-red-100 dark:bg-red-900/20 text-red-600"
                      }`}>
                        {shop.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs font-medium text-warm-900 dark:text-warm-50 tabular-nums">
                      KSh {shop.monthlyRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
