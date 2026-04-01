"use client";

import { useMemo } from "react";
import type { Supplier } from "@/data/supplierData";
import type { Locale } from "@/types";

interface Props {
  suppliers: Supplier[];
  locale: Locale;
}

export default function SupplierAnalytics({ suppliers, locale }: Props) {
  const ranked = useMemo(() =>
    suppliers
      .map((s) => ({
        id: s.id,
        name: s.name,
        rating: s.rating,
        avgDeliveryDays: s.avgDeliveryDays,
        score: Math.round(s.rating * 20),
      }))
      .sort((a, b) => b.score - a.score),
    [suppliers]
  );

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    suppliers.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      count,
    }));
  }, [suppliers]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Watoa Huduma Bora" : "Top Suppliers"}
          </h3>
          {ranked.length > 0 ? (
            <div className="space-y-2.5">
              {ranked.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-warm-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-warm-400">{"★".repeat(Math.round(s.rating))}</span>
                      <span className="text-[10px] text-warm-400">{s.avgDeliveryDays}d delivery</span>
                    </div>
                  </div>
                  <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{s.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna watoa huduma" : "No suppliers yet"}</p>
          )}
        </div>

        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Aina za Watoa Huduma" : "Supplier Categories"}
          </h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-2.5">
              {categoryBreakdown.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{c.category}</span>
                      <span className="text-xs text-warm-400">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                        style={{ width: `${(c.count / suppliers.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna data" : "No data available"}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Muhtasari" : "Summary"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{suppliers.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jumla" : "Total"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{suppliers.filter((s) => s.isActive).length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Hai" : "Active"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
              {suppliers.length > 0 ? (suppliers.reduce((s, sup) => s + sup.avgDeliveryDays, 0) / suppliers.length).toFixed(1) : "0"}d
            </p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Wastani wa Siku" : "Avg Delivery"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
              {suppliers.length > 0 ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1) : "0"}
            </p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Kiwango" : "Avg Rating"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
