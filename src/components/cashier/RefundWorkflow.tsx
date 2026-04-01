"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Locale } from "@/types";

interface RefundWorkflowProps {
  locale: Locale;
  onOpenRefund: () => void;
}

export default function RefundWorkflow({ locale, onOpenRefund }: RefundWorkflowProps) {
  const [showRecentReturns, setShowRecentReturns] = useState(false);

  const recentReturns = [
    { id: "RA-001", receipt: "RCP20001", amount: 330, status: "completed", date: "2026-03-28" },
    { id: "RA-002", receipt: "RCP19980", amount: 210, status: "pending", date: "2026-03-28" },
  ];

  return (
    <div className="space-y-3">
      {/* Return button */}
      <button
        onClick={onOpenRefund}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/15 text-red-600 font-heading font-bold text-sm min-h-[48px] active:scale-[0.98] transition-transform"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        {locale === "sw" ? "Rejesha" : "Return / Refund"}
      </button>

      {/* Recent returns toggle */}
      <button
        onClick={() => setShowRecentReturns(!showRecentReturns)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-warm-600 dark:text-warm-300 min-h-[40px]"
      >
        <span className="text-xs font-medium">
          {locale === "sw" ? "Rejesho za Hivi Karibuni" : "Recent Returns"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${showRecentReturns ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Recent returns list */}
      {showRecentReturns && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-1.5 overflow-hidden"
        >
          {recentReturns.map((ret) => (
            <div
              key={ret.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50"
            >
              <div>
                <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{ret.id}</p>
                <p className="text-[10px] text-warm-400">
                  {ret.receipt} - {ret.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-red-500 tabular-nums">-KSh {ret.amount}</p>
                <span
                  className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                    ret.status === "completed"
                      ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600"
                      : "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600"
                  }`}
                >
                  {ret.status}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
