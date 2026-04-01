"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ActivityLog } from "@/hooks/useCashierMonitoring";

interface LiveActivityFeedProps {
  activityLogs: ActivityLog[];
  locale: string;
  selectedDate?: string;
}

const actionConfig: Record<string, { icon: string; color: string; bg: string }> = {
  sale: { icon: "💰", color: "text-forest-600", bg: "bg-forest-50 dark:bg-forest-900/20" },
  refund: { icon: "↩️", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  discount: { icon: "🏷️", color: "text-savanna-600", bg: "bg-savanna-50 dark:bg-savanna-900/20" },
  void: { icon: "❌", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  login: { icon: "🔐", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  logout: { icon: "🚪", color: "text-warm-500", bg: "bg-warm-100 dark:bg-warm-800/50" },
  break_start: { icon: "☕", color: "text-savanna-600", bg: "bg-savanna-50 dark:bg-savanna-900/20" },
  break_end: { icon: "✅", color: "text-forest-600", bg: "bg-forest-50 dark:bg-forest-900/20" },
  register_open: { icon: "📂", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  register_close: { icon: "📁", color: "text-warm-500", bg: "bg-warm-100 dark:bg-warm-800/50" },
  cash_drop: { icon: "💵", color: "text-forest-600", bg: "bg-forest-50 dark:bg-forest-900/20" },
  error: { icon: "⚠️", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
};

export function LiveActivityFeed({ activityLogs, locale, selectedDate }: LiveActivityFeedProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const dateFilter = selectedDate || new Date().toISOString().slice(0, 10);
  const dateLogs = activityLogs.filter((l) => {
    return l.timestamp?.startsWith(dateFilter);
  });

  const runningBalance = dateLogs.reduce((bal, log) => {
    if (log.action === "sale") return bal + log.amount;
    if (log.action === "refund") return bal - log.amount;
    return bal;
  }, 0);

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-200/40 dark:border-warm-700/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{t("Live Activity", "Shughuli za Moja kwa Moja")}</h3>
          <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-warm-400">{t("Running Balance", "Salio")}</p>
          <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {runningBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto hide-scrollbar">
        <AnimatePresence initial={false}>
          {dateLogs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-warm-400">{t("No activity for this date", "Hakuna shughuli kwa tarehe hii")}</p>
            </div>
          ) : (
            dateLogs.slice(0, 50).map((log, i) => {
              const config = actionConfig[log.action] || actionConfig.error;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-2.5 px-4 py-2 border-b border-warm-100/60 dark:border-warm-800/40 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 text-sm`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase ${config.color}`}>{log.action.replace("_", " ")}</span>
                      {log.paymentMethod && (
                        <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-500">{log.paymentMethod}</span>
                      )}
                      {log.anomalyFlags.length > 0 && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">⚠ {log.anomalyFlags.length}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-warm-500 truncate">{log.details}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {log.amount > 0 && (
                      <p className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {log.amount.toLocaleString()}</p>
                    )}
                    <p className="text-[9px] text-warm-400 tabular-nums">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
