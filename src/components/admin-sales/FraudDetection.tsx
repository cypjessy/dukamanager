"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { FraudAlert } from "@/hooks/useSalesData";

interface FraudDetectionProps {
  locale: Locale;
  alerts: FraudAlert[];
  onInvestigate?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const severityColors: Record<string, string> = {
  low: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600",
  medium: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600",
  high: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600",
};

const severityIcons: Record<string, string> = {
  low: "ℹ️",
  medium: "⚠️",
  high: "🚨",
};

export default function FraudDetection({ locale, alerts, onInvestigate, onDismiss }: FraudDetectionProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const highCount = alerts.filter((a) => a.severity === "high").length;
  const mediumCount = alerts.filter((a) => a.severity === "medium").length;
  const lowCount = alerts.filter((a) => a.severity === "low").length;

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-500">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {t("Fraud Detection", "Ugunduzi wa Udanganyifu", locale)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] font-bold">
              {highCount} {t("high", "juu", locale)}
            </span>
          )}
          {mediumCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 text-[10px] font-bold">
              {mediumCount} {t("medium", "kati", locale)}
            </span>
          )}
          {lowCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[10px] font-bold">
              {lowCount} {t("low", "chini", locale)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border p-3 ${severityColors[alert.severity]}`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            >
              <div className="flex items-center gap-2">
                <span>{severityIcons[alert.severity]}</span>
                <div>
                  <p className="text-xs font-medium">{alert.description}</p>
                  <p className="text-[10px] opacity-70">
                    {alert.cashierName} • {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                {alert.severity}
              </span>
            </div>

            <AnimatePresence>
              {expandedAlert === alert.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-current border-opacity-20">
                    <p className="text-[10px] font-bold uppercase mb-2 opacity-70">{t("Details", "Maelezo", locale)}</p>
                    <div className="space-y-1">
                      {Object.entries(alert.details).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="opacity-70 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onInvestigate?.(alert.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 text-xs font-medium hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        {t("Investigate", "Chunguza", locale)}
                      </button>
                      <button
                        onClick={() => onDismiss?.(alert.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 text-xs font-medium hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        {t("Dismiss", "Puuza", locale)}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-sm text-warm-500">{t("No anomalies detected", "Hakuna vitu visivyo vya kawaida", locale)}</p>
            <p className="text-xs text-warm-400 mt-1">{t("AI monitoring is active", "Ufuatiliaji wa AI unaendelea", locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
