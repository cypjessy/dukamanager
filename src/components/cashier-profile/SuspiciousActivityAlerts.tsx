"use client";

import { motion } from "framer-motion";
import type { SuspiciousAlert } from "@/hooks/useCashierLiveData";

interface SuspiciousActivityAlertsProps {
  suspiciousAlerts: SuspiciousAlert[];
  locale: string;
}

const alertConfig: Record<string, { icon: string; color: string; severityColor: string }> = {
  high_void: { icon: "❌", color: "text-red-600", severityColor: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  discount_abuse: { icon: "🏷️", color: "text-savanna-600", severityColor: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600" },
  cash_discrepancy: { icon: "💵", color: "text-red-600", severityColor: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  rapid_transactions: { icon: "⚡", color: "text-terracotta-600", severityColor: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600" },
  unusual_hours: { icon: "⏰", color: "text-blue-600", severityColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
};

export function SuspiciousActivityAlerts({ suspiciousAlerts, locale }: SuspiciousActivityAlertsProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  if (suspiciousAlerts.length === 0) {
    return (
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-6 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-sm text-warm-400">{t("No suspicious activity detected", "Hakuna shughuli za kushangaza zimegunduliwa")}</p>
      </div>
    );
  }

  const highAlerts = suspiciousAlerts.filter((a) => a.severity === "high");
  const mediumAlerts = suspiciousAlerts.filter((a) => a.severity === "medium");
  const lowAlerts = suspiciousAlerts.filter((a) => a.severity === "low");

  return (
    <div className="space-y-3">
      {/* Alert summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-3 rounded-xl text-center ${highAlerts.length > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold ${highAlerts.length > 0 ? "text-red-600" : "text-warm-500"}`}>{highAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("High Risk", "Hatari Kubwa")}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${mediumAlerts.length > 0 ? "bg-savanna-50 dark:bg-savanna-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold ${mediumAlerts.length > 0 ? "text-savanna-600" : "text-warm-500"}`}>{mediumAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("Medium Risk", "Hatari ya Kati")}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${lowAlerts.length > 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-warm-50 dark:bg-warm-800/50"}`}>
          <p className={`text-lg font-heading font-extrabold ${lowAlerts.length > 0 ? "text-blue-600" : "text-warm-500"}`}>{lowAlerts.length}</p>
          <p className="text-[10px] text-warm-500">{t("Low Risk", "Hatari Chini")}</p>
        </div>
      </div>

      {/* Alert details */}
      {suspiciousAlerts.length > 0 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Detected Alerts", "Alama Zimegunduliwa")}</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto hide-scrollbar">
            {suspiciousAlerts.map((alert) => {
              const config = alertConfig[alert.type] || alertConfig.unusual_hours;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: alert.id.length * 0.01 }}
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{
                    background: alert.severity === "high" ? "rgba(239,68,68,0.05)" : alert.severity === "medium" ? "rgba(212,165,116,0.05)" : "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                    borderColor: alert.severity === "high" ? "rgba(239,68,68,0.3)" : alert.severity === "medium" ? "rgba(212,165,116,0.3)" : "rgba(212,165,116,0.2)",
                  }}
                >
                  <span className={`text-lg flex-shrink-0 ${config.color}`}>{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium text-warm-900 dark:text-warm-50`}>Alert</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${config.severityColor}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-warm-800 dark:text-warm-200">{t(alert.message, alert.message)}</p>
                    {alert.details && <p className="text-[9px] text-warm-400 mt-0.5">{alert.details}</p>}
                  </div>
                  <span className="text-[9px] text-warm-400 flex-shrink-0">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
