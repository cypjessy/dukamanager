"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Product, StockStatus } from "@/data/inventoryData";
import { getStockStatus, getProfitMargin } from "@/data/inventoryData";
import { useLocale } from "@/providers/LocaleProvider";

interface InventoryAnalyticsProps {
  products: Product[];
}

const statusConfig: Record<StockStatus, { color: string; label: string; labelSw: string }> = {
  healthy: { color: "#2D5A3D", label: "Healthy", labelSw: "Nzuri" },
  low: { color: "#D4A574", label: "Low", labelSw: "Ndogo" },
  critical: { color: "#E85D04", label: "Critical", labelSw: "Hatarishi" },
  out: { color: "#DC2626", label: "Out", labelSw: "Zimeisha" },
};

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };

    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

export default function InventoryAnalytics({ products }: InventoryAnalyticsProps) {
  const { locale } = useLocale();
  const t = useCallback((en: string, sw: string) => locale === "sw" ? sw : en, [locale]);

  const statusCounts = useMemo(() => {
    const counts: Record<StockStatus, number> = { healthy: 0, low: 0, critical: 0, out: 0 };
    products.forEach((p) => { counts[getStockStatus(p)]++; });
    return counts;
  }, [products]);

  const chartData = useMemo(() => {
    const entries = Object.entries(statusCounts) as Array<[StockStatus, number]>;
    return entries
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: t(statusConfig[key].label, statusConfig[key].labelSw),
        value,
        color: statusConfig[key].color,
      }));
  }, [statusCounts, t]);

  const totalProducts = products.length;
  const healthyPct = totalProducts > 0 ? Math.round((statusCounts.healthy / totalProducts) * 100) : 0;

  const topSellers = useMemo(() =>
    [...products]
      .sort((a, b) => b.salesVelocity - a.salesVelocity)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name.length > 22 ? p.name.slice(0, 20) + ".." : p.name,
        velocity: p.salesVelocity,
        quantity: p.quantity,
      })),
    [products]
  );

  const maxVelocity = topSellers.length > 0 ? topSellers[0].velocity : 1;

  const slowMovers = useMemo(() =>
    [...products]
      .filter((p) => p.salesVelocity <= 1 && p.quantity > 0)
      .sort((a, b) => a.salesVelocity - b.salesVelocity)
      .slice(0, 4),
    [products]
  );

  const totalValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0), [products]);
  const totalRetailValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0), [products]);
  const potentialProfit = totalRetailValue - totalValue;
  const avgMargin = useMemo(() =>
    products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + getProfitMargin(p), 0) / products.length)
      : 0,
    [products]
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
      {/* Primary Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div variants={item}>
          <MetricCard
            label={t("Inventory Value", "Thamani")}
            value={<AnimatedCounter value={totalValue} prefix="KSh " />}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M13 10V6H7a2 2 0 0 0-2 2v9" /><path d="M17 10h3v7a2 2 0 0 1-2 2h-3" /></svg>
            }
            iconBg="bg-terracotta-50 dark:bg-terracotta-900/20"
            iconColor="text-terracotta-500"
            trend={totalProducts > 0 ? { value: totalProducts, label: t("items", "bidhaa"), direction: "up" } : undefined}
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label={t("Potential Profit", "Faida")}
            value={<AnimatedCounter value={potentialProfit} prefix="KSh " />}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            }
            iconBg="bg-forest-50 dark:bg-forest-900/20"
            iconColor="text-forest-600"
            trend={{ value: Math.round(potentialProfit / Math.max(totalValue, 1) * 100), label: t("ROI", "ROI"), direction: "up" }}
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label={t("Avg Margin", "Wastani")}
            value={<AnimatedCounter value={avgMargin} suffix="%" />}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            }
            iconBg={avgMargin >= 30 ? "bg-forest-50 dark:bg-forest-900/20" : avgMargin >= 20 ? "bg-savanna-50 dark:bg-savanna-900/20" : "bg-red-50 dark:bg-red-900/20"}
            iconColor={avgMargin >= 30 ? "text-forest-600" : avgMargin >= 20 ? "text-savanna-600" : "text-red-500"}
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label={t("Slow Movers", "Polepole")}
            value={<AnimatedCounter value={slowMovers.length} />}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            }
            iconBg={slowMovers.length > 0 ? "bg-sunset-50 dark:bg-sunset-900/20" : "bg-warm-100 dark:bg-warm-800"}
            iconColor={slowMovers.length > 0 ? "text-sunset-500" : "text-warm-400"}
            alert={slowMovers.length > 0}
          />
        </motion.div>
      </div>

      {/* Stock Status Donut Chart */}
      <motion.div variants={item} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {t("Stock Status", "Hali ya Stock")}
          </h3>
          <span className="text-[10px] text-warm-400 font-medium">
            {totalProducts} {t("total", "jumla")}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50">{healthyPct}%</span>
              <span className="text-[9px] text-warm-400 font-medium">{t("healthy", "nzuri")}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {(Object.entries(statusConfig) as [StockStatus, typeof statusConfig["healthy"]][]).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: config.color }} />
                  <span className="text-xs text-warm-600 dark:text-warm-300">
                    {t(config.label, config.labelSw)}
                  </span>
                </div>
                <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                  {statusCounts[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top Sellers */}
      {topSellers.length > 0 && (
        <motion.div variants={item} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Top Sellers", "Zinazouzwa Sana")}
            </h3>
            <span className="text-[10px] text-warm-400 font-medium">
              {t("by velocity", "kwa kasi")}
            </span>
          </div>
          <div className="space-y-2.5">
            {topSellers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i === 0 ? "bg-terracotta-500 text-white" :
                  i === 1 ? "bg-savanna-500 text-white" :
                  i === 2 ? "bg-warm-300 dark:bg-warm-600 text-warm-700 dark:text-warm-200" :
                  "bg-warm-100 dark:bg-warm-800 text-warm-400"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: i === 0 ? "#C75B39" : i === 1 ? "#D4A574" : "rgba(199,91,57,0.4)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.velocity / maxVelocity) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-warm-500 tabular-nums flex-shrink-0">{p.velocity}/d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Slow Movers */}
      {slowMovers.length > 0 && (
        <motion.div variants={item} className="rounded-2xl border border-sunset-200/40 dark:border-sunset-700/20 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {t("Needs Attention", "Inahitaji Uangalifu")}
            </h3>
          </div>
          <div className="space-y-2">
            {slowMovers.map((p) => {
              const status = getStockStatus(p);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-sunset-50/50 dark:bg-sunset-900/10 border border-sunset-100/50 dark:border-sunset-800/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                    <p className="text-[10px] text-warm-400 mt-0.5">
                      {p.salesVelocity}/day &middot; {p.quantity} {p.unitLabel[locale]}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                    status === "out" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                    status === "critical" ? "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600" :
                    "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600"
                  }`}>
                    {status === "out" ? t("Out", "Zimeisha") : status === "critical" ? t("Critical", "Hatarishi") : t("Low", "Ndogo")}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ============================================
   METRIC CARD COMPONENT
   ============================================ */

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  alert,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; label: string; direction: "up" | "down" };
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3.5 relative overflow-hidden ${
        alert ? "border-sunset-200/60 dark:border-sunset-700/30" : "border-warm-200/60 dark:border-warm-700/60"
      }`}
      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={trend.direction === "up" ? "text-forest-500" : "text-red-500"}>
              {trend.direction === "up"
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />
              }
            </svg>
            <span className={`text-[10px] font-bold ${trend.direction === "up" ? "text-forest-500" : "text-red-500"}`}>
              {trend.value}
            </span>
          </div>
        )}
        {alert && (
          <span className="w-2 h-2 rounded-full bg-sunset-400 animate-pulse" />
        )}
      </div>
      <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 leading-tight">
        {value}
      </p>
      <p className="text-[10px] text-warm-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}
