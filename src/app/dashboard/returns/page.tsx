"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { ReturnRequest } from "@/data/returnData";
import { useReturnsFirestore } from "@/hooks/useReturnsFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import ReturnProcessor from "@/components/returns/ReturnProcessor";
import ReturnHistory from "@/components/returns/ReturnHistory";

type ReturnsView = "process" | "history" | "damages";

export default function ReturnsPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { returns, loading, processReturn, todayReturns, pendingCount, totalRefunds, returnRate } = useReturnsFirestore();
  const [view, setView] = useState<ReturnsView>("process");

  const handleProcessReturn = useCallback(async (data: Partial<ReturnRequest>) => {
    try {
      await processReturn(data);
    } catch (err) {
      console.error("Failed to process return:", err);
    }
  }, [processReturn]);

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
              {locale === "sw" ? "Rejesho na Kurudisha Pesa" : "Returns & Refunds"}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              KSh {todayReturns.toLocaleString()} {locale === "sw" ? "leo" : "today"} &middot; {returnRate}% {locale === "sw" ? "kiasi cha kurudisha" : "return rate"}
              <span className="ml-2 text-xs text-warm-400 bg-warm-100 dark:bg-warm-800 px-2 py-0.5 rounded-full">{returns.length}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-savanna-50 dark:bg-savanna-900/10 px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-savanna-500 animate-pulse" />
                <span className="text-xs font-medium text-savanna-700 dark:text-savanna-400">{pendingCount} {locale === "sw" ? "inasubiri" : "pending"}</span>
              </div>
            )}
            {returnRate > 5 && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/10 px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-600">{locale === "sw" ? "Kiwango cha juu" : "High return rate"}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 w-fit ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        {(["process", "history", "damages"] as ReturnsView[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${view === v ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
            {v === "process" ? (locale === "sw" ? "Rejesha" : "Process") : v === "history" ? (locale === "sw" ? "Historia" : "History") : (locale === "sw" ? "Hasara" : "Damages")}
          </button>
        ))}
      </div>

      <div className={`grid gap-2 ${isMobile ? "grid-cols-2 mb-4" : "grid-cols-2 sm:grid-cols-4 mb-3 page-section-fixed"}`}>
        {[
          { label: locale === "sw" ? "Rejesho la Leo" : "Today Returns", value: `KSh ${todayReturns.toLocaleString()}`, red: true },
          { label: locale === "sw" ? "Kiwango" : "Return Rate", value: `${returnRate}%`, warning: returnRate > 5 },
          { label: locale === "sw" ? "Kurudisha Pesa" : "Total Refunds", value: `KSh ${totalRefunds.toLocaleString()}` },
          { label: locale === "sw" ? "Inasubiri" : "Pending", value: pendingCount, accent: pendingCount > 0 },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <p className="text-xs text-warm-500 dark:text-warm-400">{stat.label}</p>
            <p className={`text-lg font-heading font-extrabold tabular-nums ${stat.red ? "text-red-500" : stat.warning ? "text-red-500" : stat.accent ? "text-savanna-600" : "text-warm-900 dark:text-warm-50"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "process" && (
          <div className={`gap-4 ${isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-5 h-full"}`}>
            <div className={isMobile ? "" : "lg:col-span-3"}>
              <ReturnProcessor locale={locale} onProcess={handleProcessReturn} />
            </div>
            <div className={isMobile ? "" : "lg:col-span-2 hidden lg:block"}>
              <ReturnHistory returns={returns} locale={locale} />
            </div>
          </div>
        )}

        {view === "history" && <ReturnHistory returns={returns} locale={locale} />}
        {view === "damages" && <ReturnHistory returns={returns.filter((r) => r.condition === "damaged" || r.condition === "destroyed")} locale={locale} />}
      </div>
    </div>
  );
}
