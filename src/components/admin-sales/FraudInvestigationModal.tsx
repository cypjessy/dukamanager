"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import type { FraudAlert } from "@/hooks/useSalesData";

interface FraudInvestigationModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  alert: FraudAlert | null;
  onDismiss: (alertId: string, reason: string) => void;
  onEscalate: (alertId: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

const severityColors: Record<string, string> = {
  low: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  medium: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
  high: "bg-red-50 dark:bg-red-900/20 text-red-600",
};

const typeLabels: Record<string, string> = {
  high_voids: "High Void Rate",
  suspicious_discounts: "Suspicious Discounts",
  cash_discrepancy: "Cash Discrepancy",
  after_hours: "After-Hours Sales",
  multiple_refunds: "Multiple Refunds",
};

export default function FraudInvestigationModal({ locale, isOpen, onClose, alert, onDismiss, onEscalate }: FraudInvestigationModalProps) {
  const [dismissReason, setDismissReason] = useState("");
  const [showDismissForm, setShowDismissForm] = useState(false);

  if (!alert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-500">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">{t("Fraud Investigation", "Uchunguzi wa Udanganyifu", locale)}</h3>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className={`p-3 rounded-xl mb-4 ${severityColors[alert.severity]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase">{typeLabels[alert.type] || alert.type}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">{alert.severity}</span>
                </div>
                <p className="text-sm">{alert.description}</p>
                <p className="text-[10px] opacity-70 mt-1">{alert.cashierName} • {new Date(alert.timestamp).toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-warm-500 mb-2">{t("Details", "Maelezo", locale)}</p>
                <div className="space-y-1">
                  {Object.entries(alert.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 text-xs">
                      <span className="text-warm-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-medium text-warm-900 dark:text-warm-50">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {showDismissForm ? (
                <div className="mb-4">
                  <label className="text-xs font-medium text-warm-500 mb-1 block">{t("Dismissal Reason", "Sababu ya Kupuuza", locale)}</label>
                  <input type="text" value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} placeholder={t("e.g. False positive, verified", "mf. Si kweli, imethibitishwa", locale)} className="w-full px-3 py-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-forest-500" />
                </div>
              ) : null}

              <div className="flex gap-2">
                {!showDismissForm ? (
                  <>
                    <button onClick={() => setShowDismissForm(true)} className="flex-1 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">{t("Dismiss", "Puuza", locale)}</button>
                    <button onClick={() => { onEscalate(alert.id); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">{t("Escalate", "Pandisha", locale)}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowDismissForm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">{t("Back", "Rudi", locale)}</button>
                    <button onClick={() => { onDismiss(alert.id, dismissReason); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-600 transition-colors">{t("Confirm Dismiss", "Thibitisha Kupuuza", locale)}</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
