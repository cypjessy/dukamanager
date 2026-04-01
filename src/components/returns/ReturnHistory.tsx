"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ReturnRequest } from "@/data/returnData";
import { reasonConfig, statusConfig } from "@/data/returnData";
import type { Locale } from "@/types";

interface Props {
  returns: ReturnRequest[];
  locale: Locale;
}

export default function ReturnHistory({ returns, locale }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReturns = statusFilter === "all" ? returns : returns.filter((r) => r.status === statusFilter);

  const reasonsBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    returns.forEach((r) => { map[r.reason] = (map[r.reason] || 0) + 1; });
    const total = returns.length || 1;
    const colors = ["#C75B39", "#D4A574", "#2D5A3D", "#E85D04", "#4E9AF1", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444"];
    return Object.entries(map)
      .map(([name, count], i) => ({
        name: reasonConfig[name as keyof typeof reasonConfig]?.label || name,
        value: Math.round((count / total) * 100),
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [returns]);

  return (
    <div className="space-y-4">
      {reasonsBreakdown.length > 0 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Sababu za Kurudisha" : "Return Reasons"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {reasonsBreakdown.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-warm-50 dark:bg-warm-800/50">
                <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="text-[10px] font-medium text-warm-700 dark:text-warm-300">{r.name}</span>
                <span className="text-[10px] text-warm-400">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {(["all", "pending", "approved", "completed", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors min-h-[28px] ${statusFilter === s ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
            {s === "all" ? "All" : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      {filteredReturns.length === 0 ? (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna rejesho" : "No returns recorded"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReturns.map((ret) => {
            const rc = reasonConfig[ret.reason];
            const sc = statusConfig[ret.status];
            return (
              <motion.div key={ret.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-warm-900 dark:text-warm-50">{ret.returnNo}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${rc?.color || ""}`}>{rc?.label || ret.reason}</span>
                  </div>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${sc?.color || ""}`}>{sc?.label || ret.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-600 dark:text-warm-300">{ret.customerName || ret.originalReceipt || "N/A"}</p>
                    <p className="text-[10px] text-warm-400">{ret.items[0]?.productName} x{ret.items[0]?.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-heading font-bold text-red-500 tabular-nums">-KSh {ret.totalValue.toLocaleString()}</p>
                    <p className="text-[10px] text-warm-400">{ret.createdDate}</p>
                  </div>
                </div>
                {ret.reasonNote && <p className="text-[10px] text-warm-400 mt-1 italic">&ldquo;{ret.reasonNote}&rdquo;</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
