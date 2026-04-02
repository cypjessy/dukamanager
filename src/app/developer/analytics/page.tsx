"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useDeveloperData } from "@/hooks/useDeveloperData";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

type TimePeriod = "7d" | "30d" | "90d" | "all";

export default function DeveloperAnalyticsPage() {
  const { locale } = useLocale();
  const { shops, metrics, loading } = useDeveloperData();
  const [period, setPeriod] = useState<TimePeriod>("30d");
  const [salesHistory, setSalesHistory] = useState<Array<{ date: string; revenue: number; transactions: number }>>([]);
  const [shopCreationDates, setShopCreationDates] = useState<string[]>([]);
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  // Fetch real sales history from all shops
  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        const shopsSnap = await getDocs(collection(db, "shops"));
        const shopIds = shopsSnap.docs.map(d => d.id);
        const allSales: Array<{ date: string; revenue: number; transactions: number }> = [];
        for (const shopId of shopIds.slice(0, 10)) {
          const salesSnap = await getDocs(query(collection(db, "shops", shopId, "sales"), orderBy("createdAt", "desc")));
          salesSnap.docs.forEach(doc => {
            const data = doc.data();
            const ts = data.createdAt || data.timestamp;
            if (ts) {
              const date = new Date(String(ts)).toISOString().split("T")[0];
              allSales.push({ date, revenue: Number(data.total) || 0, transactions: 1 });
            }
          });
        }
        // Aggregate by date
        const aggregated: Record<string, { revenue: number; transactions: number }> = {};
        allSales.forEach(s => {
          if (!aggregated[s.date]) aggregated[s.date] = { revenue: 0, transactions: 0 };
          aggregated[s.date].revenue += s.revenue;
          aggregated[s.date].transactions += s.transactions;
        });
        setSalesHistory(Object.entries(aggregated).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)));
        // Shop creation dates
        setShopCreationDates(shopsSnap.docs.map(d => {
          const data = d.data();
          return data.createdAt ? String(data.createdAt).split("T")[0] : "";
        }).filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch sales history:", err);
      }
    };
    fetchSalesHistory();
  }, []);

  const topShops = useMemo(() => [...shops].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 10), [shops]);
  const _bottomShops = useMemo(() => [...shops].sort((a, b) => a.monthlyRevenue - b.monthlyRevenue).slice(0, 5), [shops]);

  const planDistribution = useMemo(() => [
    { name: "Free", value: shops.filter((s) => s.subscription === "free").length, color: "#9ca3af" },
    { name: "Growth", value: shops.filter((s) => s.subscription === "growth").length, color: "#3b82f6" },
    { name: "Enterprise", value: shops.filter((s) => s.subscription === "enterprise").length, color: "#8b5cf6" },
  ], [shops]);

  const statusDistribution = useMemo(() => ({
    active: shops.filter((s) => s.status === "active").length,
    trial: shops.filter((s) => s.status === "trial").length,
    pending: shops.filter((s) => s.status === "pending").length,
    suspended: shops.filter((s) => s.status === "suspended").length,
  }), [shops]);

  const countyDistribution: Record<string, number> = useMemo(() => {
    const dist: Record<string, number> = {};
    shops.forEach((s) => { const county = s.county || "Unknown"; dist[county] = (dist[county] || 0) + 1; });
    return dist;
  }, [shops]);
  const topCounties = Object.entries(countyDistribution).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const mpesaAdoptionRate = useMemo(() => {
    if (shops.length === 0) return 0;
    return Math.round((shops.filter(s => s.mpesaConfigured).length / shops.length) * 100);
  }, [shops]);

  const kraComplianceRate = useMemo(() => {
    if (shops.length === 0) return 0;
    return Math.round((shops.filter(s => s.kraCompliant).length / shops.length) * 100);
  }, [shops]);

  const avgTransactionValue = useMemo(() => {
    if (shops.length === 0 || metrics.totalTransactions === 0) return 0;
    return Math.round(metrics.monthlyRevenue / metrics.totalTransactions);
  }, [shops, metrics.totalTransactions, metrics.monthlyRevenue]);

  const avgProductCustomerRatio = useMemo(() => {
    if (shops.length === 0) return { products: 0, customers: 0, ratio: 0 };
    const totalProducts = shops.reduce((s, shop) => s + shop.productCount, 0);
    const totalCustomers = shops.reduce((s, shop) => s + shop.customerCount, 0);
    const ratio = totalCustomers > 0 ? (totalProducts / totalCustomers).toFixed(1) : "0";
    return { products: totalProducts, customers: totalCustomers, ratio };
  }, [shops]);

  const engagementScores = useMemo(() => {
    return shops.map(shop => {
      let score = 0;
      if (shop.status === "active") score += 30;
      else if (shop.status === "trial") score += 15;
      if (shop.mpesaConfigured) score += 15;
      if (shop.kraCompliant) score += 10;
      if (shop.activeUsers > 2) score += 15;
      else if (shop.activeUsers > 0) score += 10;
      if (shop.monthlyRevenue > 50000) score += 20;
      else if (shop.monthlyRevenue > 10000) score += 10;
      if (shop.transactionCount > 1000) score += 10;
      return { ...shop, engagementScore: Math.min(score, 100) };
    }).sort((a, b) => b.engagementScore - a.engagementScore);
  }, [shops]);

  const decliningShops = useMemo(() => {
    return shops.filter(shop => {
      if (shop.dailyTransactions.length < 7) return false;
      const recent = shop.dailyTransactions.slice(-3).reduce((s, v) => s + v, 0);
      const previous = shop.dailyTransactions.slice(0, 4).reduce((s, v) => s + v, 0);
      return recent < previous * 0.5 && shop.status === "active";
    });
  }, [shops]);

  const trendData = useMemo(() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30;
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split("T")[0];
      const dayStr = date.toLocaleDateString("en", { month: "short", day: "numeric" });
      const dayData = salesHistory.find(s => s.date === dateKey);
      const baseRevenue = metrics.monthlyRevenue / days;
      const baseTransactions = metrics.totalTransactions / days;
      return {
        date: dayStr,
        revenue: dayData ? dayData.revenue : Math.round(baseRevenue * 0.85),
        transactions: dayData ? dayData.transactions : Math.round(baseTransactions * 0.85),
      };
    });
  }, [period, metrics.monthlyRevenue, metrics.totalTransactions, salesHistory]);

  const newShopsGrowth = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const now = new Date();
    const currentMonth = now.getMonth();
    return months.map((month, i) => {
      const monthIdx = (currentMonth - 5 + i + 12) % 12;
      const year = currentMonth - 5 + i < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const monthPrefix = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
      const newShops = shopCreationDates.filter(d => d.startsWith(monthPrefix)).length;
      const cumulative = shopCreationDates.filter(d => d <= `${year}-${String(monthIdx + 1).padStart(2, "0")}-31`).length;
      return { month, newShops, cumulative };
    });
  }, [shops.length, shopCreationDates]);

  const revenueByPlan = useMemo(() => {
    return [
      { name: "Free", revenue: shops.filter(s => s.subscription === "free").reduce((sum, s) => sum + s.monthlyRevenue, 0) },
      { name: "Growth", revenue: shops.filter(s => s.subscription === "growth").reduce((sum, s) => sum + s.monthlyRevenue, 0) },
      { name: "Enterprise", revenue: shops.filter(s => s.subscription === "enterprise").reduce((sum, s) => sum + s.monthlyRevenue, 0) },
    ];
  }, [shops]);

  const exportReport = () => {
    const lines = [
      "Platform Analytics Report",
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "Summary Metrics",
      `Total Shops: ${metrics.totalShops}`,
      `Active Shops: ${metrics.activeShops}`,
      `Monthly Revenue: KSh ${metrics.monthlyRevenue.toLocaleString()}`,
      `Total Transactions: ${metrics.totalTransactions.toLocaleString()}`,
      `Active Users: ${metrics.activeUsers}`,
      `Churn Rate: ${metrics.churnRate}%`,
      `M-Pesa Adoption: ${mpesaAdoptionRate}%`,
      `KRA Compliance: ${kraComplianceRate}%`,
      `Avg Transaction Value: KSh ${avgTransactionValue}`,
      "",
      "Top Revenue Shops",
      ...topShops.map((s, i) => `${i + 1}. ${s.name}: KSh ${s.monthlyRevenue.toLocaleString()}`),
      "",
      "Plan Distribution",
      ...planDistribution.map(p => `${p.name}: ${p.value} shops`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-xl border-2 border-terracotta-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
            {t("Platform Analytics", "Uchambuzi wa Platform")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("Insights across all shops and users", "Uchambuzi wa maduka na watumiaji wote")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportReport} className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            {t("Export Report", "Safirisha Ripoti")}
          </button>
          <div className="flex rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden">
            {(["7d", "30d", "90d", "all"] as TimePeriod[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-2 text-xs font-medium transition-colors ${period === p ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
                {p === "all" ? t("All", "Yote") : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("Avg Revenue/Shop", "Wastani/Duka"), value: shops.length > 0 ? `KSh ${Math.round(metrics.monthlyRevenue / shops.length).toLocaleString()}` : "KSh 0", sub: `${metrics.newShopsThisMonth} ${t("new this month", "mpya mwezi huu")}` },
          { label: t("Avg Transactions", "Wastani Mauzo"), value: shops.length > 0 ? Math.round(metrics.totalTransactions / shops.length).toLocaleString() : "0", sub: `${avgTransactionValue > 0 ? `KSh ${avgTransactionValue} ${t("avg value", "wastani")}` : "-"}` },
          { label: t("Active Users", "Watumiaji Hai"), value: metrics.activeUsers.toString(), sub: `${metrics.totalUsers} ${t("total", "jumla")}` },
          { label: t("Churn Rate", "Kiwango cha Kushindwa"), value: `${metrics.churnRate}%`, sub: metrics.churnRate > 10 ? t("High", "Juu") : t("Normal", "Kawaida") },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
            <p className="text-xs text-warm-400 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-warm-900 dark:text-warm-50">{m.value}</p>
            <p className="text-[10px] text-warm-400 mt-1">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Adoption & Compliance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("M-Pesa Adoption", "Matumizi ya M-Pesa"), value: `${mpesaAdoptionRate}%`, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10", icon: "📱" },
          { label: t("KRA Compliance", "Utiifu wa KRA"), value: `${kraComplianceRate}%`, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10", icon: "📋" },
          { label: t("Products", "Bidhaa"), value: avgProductCustomerRatio.products.toLocaleString(), color: "text-terracotta-500", bg: "bg-terracotta-50 dark:bg-terracotta-900/10", icon: "📦", sub: `${avgProductCustomerRatio.ratio} ${t("prod/customer", "bidhaa/mteja")}` },
          { label: t("Customers", "Wateja"), value: avgProductCustomerRatio.customers.toLocaleString(), color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10", icon: "👥" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className={`rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5 ${m.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{m.icon}</span>
              <p className="text-xs text-warm-400">{m.label}</p>
            </div>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            {m.sub && <p className="text-[10px] text-warm-400 mt-1">{m.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {decliningShops.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <h3 className="font-heading font-bold text-sm text-amber-700 dark:text-amber-400">{t("Declining Revenue Alert", "Onyo la Mapato Yanayopungua")}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {decliningShops.map(shop => (
              <span key={shop.id} className="px-3 py-1.5 rounded-xl bg-white dark:bg-warm-900/50 text-xs text-amber-700 dark:text-amber-400 font-medium">{shop.name}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Transactions Trend */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Revenue & Transactions Trend", "Mwelekeo wa Mapato na Mauzo")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} name={t("Revenue", "Mapato")} />
                <Area type="monotone" dataKey="transactions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name={t("Transactions", "Mauzo")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Shops Growth */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("New Shops Growth", "Ukuaji wa Maduka Mapya")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newShopsGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="newShops" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t("New Shops", "Maduka Mapya")} />
                <Bar dataKey="cumulative" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t("Cumulative", "Jumla")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Revenue Shops */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Top Revenue Shops", "Maduka Bora kwa Mapato")}
          </h3>
          <div className="space-y-2">
            {topShops.map((shop, i) => {
              const maxRevenue = topShops[0]?.monthlyRevenue || 1;
              const pct = Math.round((shop.monthlyRevenue / maxRevenue) * 100);
              return (
                <div key={shop.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-warm-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{shop.name}</p>
                    <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 mt-1">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50 flex-shrink-0">KSh {(shop.monthlyRevenue / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Subscription Distribution", "Usambazaji wa Mipango")}
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {planDistribution.map((plan) => {
                const pct = shops.length > 0 ? Math.round((plan.value / shops.length) * 100) : 0;
                return (
                  <div key={plan.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                        <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{plan.name}</span>
                      </div>
                      <span className="text-xs font-bold text-warm-900 dark:text-warm-50">{plan.value} ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-warm-200/60 dark:border-warm-700/60">
            <h4 className="text-xs font-medium text-warm-400 mb-3">{t("Status Distribution", "Usambazaji wa Hali")}</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "trial" ? "bg-amber-500" : status === "pending" ? "bg-blue-500" : "bg-red-500"}`} />
                  <span className="text-xs text-warm-600 dark:text-warm-400 capitalize">{status}</span>
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50 ml-auto">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Revenue by Plan", "Mapato kwa Mpango")}
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" />
                <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.3)" tickFormatter={(v) => `KSh ${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, t("Revenue", "Mapato")]} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Shop Engagement Scores", "Alama za Ushirikishaji wa Maduka")}
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {engagementScores.map((shop, i) => (
              <div key={shop.id} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-warm-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{shop.name}</p>
                    <span className={`text-xs font-bold ${shop.engagementScore >= 70 ? "text-emerald-500" : shop.engagementScore >= 40 ? "text-amber-500" : "text-red-500"}`}>{shop.engagementScore}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${shop.engagementScore}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} className={`h-full rounded-full ${shop.engagementScore >= 70 ? "bg-emerald-500" : shop.engagementScore >= 40 ? "bg-amber-500" : "bg-red-500"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5 lg:col-span-2">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Geographic Distribution", "Usambazaji wa Kijiografia")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {topCounties.map(([county, count]) => {
              const maxCount = topCounties[0]?.[1] || 1;
              const pct = Math.round((count / maxCount) * 100);
              return (
                <motion.div key={county} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <p className="text-lg font-bold text-terracotta-500">{count}</p>
                  <p className="text-[10px] text-warm-500 mt-1 truncate">{county}</p>
                  <div className="h-1 rounded-full bg-warm-200 dark:bg-warm-700 mt-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full bg-terracotta-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
