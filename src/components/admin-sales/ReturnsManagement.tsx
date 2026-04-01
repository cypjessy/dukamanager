"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { ReturnEntry } from "@/hooks/useSalesData";

interface ReturnsManagementProps {
  locale: Locale;
  returns: ReturnEntry[];
  totalReturnAmount: number;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const reasonIcons: Record<string, string> = {
  damaged: "💔",
  wrong_item: "❌",
  changed_mind: "🔄",
  quality: "⚠️",
  other: "📋",
};

const reasonLabels: Record<string, string> = {
  damaged: "Damaged",
  wrong_item: "Wrong Item",
  changed_mind: "Changed Mind",
  quality: "Quality Issue",
  other: "Other",
};

export default function ReturnsManagement({ locale, returns, totalReturnAmount }: ReturnsManagementProps) {
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);

  const reasonCounts: Record<string, number> = {};
  returns.forEach((r) => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  });

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
          {t("Returns & Refunds", "Marejesho na Ruzuku", locale)}
        </h3>
        <span className="text-xs font-bold text-red-500">
          KSh {totalReturnAmount.toLocaleString()} {t("refunded", "imerudishwa", locale)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(reasonCounts).map(([reason, count]) => (
          <div key={reason} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50/50 dark:bg-red-900/10">
            <span>{reasonIcons[reason] || "📋"}</span>
            <span className="text-xs text-warm-700 dark:text-warm-300">{reasonLabels[reason] || reason}</span>
            <span className="text-xs font-bold text-red-500">{count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {returns.map((ret) => (
          <div key={ret.id} className="rounded-xl border border-warm-200/40 dark:border-warm-700/40" style={{ background: "rgba(255,255,255,0.4)" }}>
            <div
              className="p-3 cursor-pointer hover:bg-warm-50/50 dark:hover:bg-warm-800/20 transition-colors"
              onClick={() => setExpandedReturn(expandedReturn === ret.id ? null : ret.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{reasonIcons[ret.reason] || "📋"}</span>
                  <div>
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{ret.returnNo}</p>
                    <p className="text-[10px] text-warm-400">{ret.cashierName} • {new Date(ret.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500">-KSh {ret.total.toLocaleString()}</span>
                  <span className={`w-2 h-2 rounded-full ${ret.approved ? "bg-forest-500" : "bg-amber-500"}`} />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedReturn === ret.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-warm-200/40 dark:border-warm-700/40"
                >
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold text-warm-500 uppercase">{t("Items Returned", "Bidhaa Zilizorudishwa", locale)}</p>
                    {ret.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-warm-700 dark:text-warm-300">{item.name} × {item.qty}</span>
                        <span className="text-warm-900 dark:text-warm-50">KSh {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-warm-200/40 dark:border-warm-700/40">
                      <span className="text-xs text-warm-500">{t("Refund Method", "Njia ya Marejesho", locale)}</span>
                      <span className="text-xs font-medium text-warm-900 dark:text-warm-50 uppercase">{ret.method}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {returns.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-warm-400">{t("No returns in this period", "Hakuna marejesho kwa kipindi hiki", locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
