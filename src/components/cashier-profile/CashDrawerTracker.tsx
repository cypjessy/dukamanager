"use client";

import { useState, useMemo } from "react";
import type { CashDrawerState } from "@/hooks/useCashierLiveData";
import type { ActivityLog } from "@/hooks/useCashierMonitoring";

interface CashDrawerTrackerProps {
  cashDrawer: CashDrawerState | null;
  locale: string;
  onCashDrop: (amount: number) => void;
  onReconcile: (actual: number) => void;
  activityLogs?: ActivityLog[];
}

export function CashDrawerTracker({ cashDrawer, locale, onCashDrop, onReconcile, activityLogs }: CashDrawerTrackerProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const [dropAmount, setDropAmount] = useState("");
  const [reconAmount, setReconAmount] = useState("");
  const [showRecon, setShowRecon] = useState(false);

  // Compute today's payment method totals from activity logs
  const paymentTotals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = (activityLogs || []).filter(
      (l) => l.action === "sale" && l.timestamp?.startsWith(today)
    );
    const todayRefunds = (activityLogs || []).filter(
      (l) => l.action === "refund" && l.timestamp?.startsWith(today)
    );

    const totals: Record<string, { amount: number; count: number }> = {};
    todayLogs.forEach((log) => {
      const method = log.paymentMethod || "cash";
      if (!totals[method]) totals[method] = { amount: 0, count: 0 };
      totals[method].amount += log.amount;
      totals[method].count += 1;
    });

    const totalSales = todayLogs.reduce((s, l) => s + l.amount, 0);
    const totalRefunds = todayRefunds.reduce((s, l) => s + l.amount, 0);
    const totalTransactions = todayLogs.length;

    return { totals, totalSales, totalRefunds, totalTransactions };
  }, [activityLogs]);

  const methodConfig: Record<string, { icon: string; color: string; bg: string; label: string; labelSw: string }> = {
    mpesa: { icon: "📱", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "M-Pesa", labelSw: "M-Pesa" },
    cash: { icon: "💵", color: "text-forest-600", bg: "bg-forest-50 dark:bg-forest-900/20", label: "Cash", labelSw: "Pesa Taslimu" },
    credit: { icon: "🏦", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Credit", labelSw: "Mkopo" },
    bank: { icon: "🏧", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", label: "Bank", labelSw: "Benki" },
    split: { icon: "🔀", color: "text-savanna-600", bg: "bg-savanna-50 dark:bg-savanna-900/20", label: "Split", labelSw: "Mchanganyiko" },
  };

  if (!cashDrawer) {
    return (
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-6 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="w-12 h-12 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <p className="text-sm text-warm-400">{t("No cash drawer data", "Hakuna data ya kasha")}</p>
      </div>
    );
  }

  const hasVariance = cashDrawer.actualBalance !== null && Math.abs(cashDrawer.variance) > 0;
  const isShort = cashDrawer.variance < 0;

  return (
    <div className="space-y-3">
      {/* Today's sales summary by payment method */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-200/40 dark:border-warm-700/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terracotta-600">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{t("Today's Payments", "Malipo ya Leo")}</h3>
          </div>
          <span className="text-[9px] text-warm-400">{paymentTotals.totalTransactions} {t("transactions", "miamala")}</span>
        </div>

        <div className="p-4 space-y-2">
          {/* Total */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-terracotta-50 to-savanna-50 dark:from-terracotta-900/20 dark:to-savanna-900/10 border border-terracotta-200/40 dark:border-terracotta-800/30">
            <p className="text-[9px] text-terracotta-600 font-medium mb-0.5">{t("Total Sales", "Jumla ya Mauzo")}</p>
            <p className="text-xl font-heading font-extrabold text-terracotta-700 dark:text-terracotta-400 tabular-nums">
              KSh {paymentTotals.totalSales.toLocaleString()}
            </p>
          </div>

          {/* Payment method breakdown */}
          <div className="space-y-1.5">
            {(["mpesa", "cash", "credit", "bank", "split"] as const).map((method) => {
              const mc = methodConfig[method];
              const data = paymentTotals.totals[method];
              if (!data && method === "split") return null;
              return (
                <div key={method} className={`flex items-center justify-between p-2 rounded-lg ${mc.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{mc.icon}</span>
                    <span className={`text-[10px] font-medium ${mc.color}`}>{t(mc.label, mc.labelSw)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                      KSh {(data?.amount || 0).toLocaleString()}
                    </span>
                    <span className="text-[8px] text-warm-400 ml-1.5">({data?.count || 0})</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refunds */}
          {paymentTotals.totalRefunds > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">↩️</span>
                <span className="text-[10px] font-medium text-red-600">{t("Refunds", "Kurudisha")}</span>
              </div>
              <span className="text-xs font-heading font-bold text-red-500 tabular-nums">
                -KSh {paymentTotals.totalRefunds.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main cash drawer status */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-200/40 dark:border-warm-700/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{t("Cash Drawer", "Kasha la Pesa")}</h3>
          </div>
          {cashDrawer.openingTime && (
            <span className="text-[9px] text-warm-400 tabular-nums">
              {t("Opened", "Imefunguliwa")}: {new Date(cashDrawer.openingTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Opening float */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
            <span className="text-[10px] text-warm-500">{t("Opening Float", "Fedha za Mwanzo")}</span>
            <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {cashDrawer.openingFloat.toLocaleString()}</span>
          </div>

          {/* Current cash */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-forest-50 to-forest-100/50 dark:from-forest-900/20 dark:to-forest-900/10 border border-forest-200/40 dark:border-forest-800/30">
            <p className="text-[9px] text-forest-600 font-medium mb-0.5">{t("Cash in Drawer", "Pesa kwenye Kasha")}</p>
            <p className="text-xl font-heading font-extrabold text-forest-700 dark:text-forest-400 tabular-nums">KSh {cashDrawer.currentCash.toLocaleString()}</p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 text-center">
              <p className="text-xs font-heading font-bold text-forest-600 tabular-nums">KSh {cashDrawer.cashSales.toLocaleString()}</p>
              <p className="text-[8px] text-warm-400">{t("Cash Sales", "Mauzo ya Pesa")}</p>
            </div>
            <div className="p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 text-center">
              <p className="text-xs font-heading font-bold text-red-500 tabular-nums">KSh {cashDrawer.cashRefunds.toLocaleString()}</p>
              <p className="text-[8px] text-warm-400">{t("Cash Refunds", "Kurudisha Pesa")}</p>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="p-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: hasVariance && isShort ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.4)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-warm-500">{t("Expected Balance", "Salio Inayotarajiwa")}</span>
              <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {cashDrawer.expectedBalance.toLocaleString()}</span>
            </div>
            {cashDrawer.actualBalance !== null && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-warm-500">{t("Actual Balance", "Salio Halisi")}</span>
                  <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {cashDrawer.actualBalance.toLocaleString()}</span>
                </div>
                <div className={`flex items-center justify-between p-1.5 rounded-lg ${hasVariance ? (isShort ? "bg-red-50 dark:bg-red-900/20" : "bg-forest-50 dark:bg-forest-900/20") : "bg-warm-50 dark:bg-warm-800/50"}`}>
                  <span className="text-[10px] font-medium text-warm-600 dark:text-warm-400">{t("Variance", "Tofauti")}</span>
                  <span className={`text-xs font-heading font-extrabold tabular-nums ${hasVariance ? (isShort ? "text-red-600" : "text-forest-600") : "text-warm-500"}`}>
                    {cashDrawer.variance > 0 ? "+" : ""}KSh {cashDrawer.variance.toLocaleString()}
                  </span>
                </div>
                {Math.abs(cashDrawer.variance) > 500 && (
                  <div className="flex items-center gap-1.5 mt-2 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <span className="text-[10px]">⚠️</span>
                    <span className="text-[9px] font-medium text-red-600">{t("Discrepancy detected! Investigate immediately.", "Tofauti imegunduliwa! Chunguza mara moja.")}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cash drops */}
      {cashDrawer.cashDrops.length > 0 && (
        <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Cash Drops to Safe", "Kupeleka Pesa Seifini")}</h4>
          <div className="space-y-1.5">
            {cashDrawer.cashDrops.map((drop, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💵</span>
                  <div>
                    <p className="text-[10px] font-medium text-warm-900 dark:text-warm-50 tabular-nums">KSh {drop.amount.toLocaleString()}</p>
                    <p className="text-[8px] text-warm-400">{t("By", "Na")}: {drop.approvedBy}</p>
                  </div>
                </div>
                <span className="text-[9px] text-warm-400 tabular-nums">{new Date(drop.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <h4 className="text-[9px] font-bold text-warm-500 uppercase mb-2">{t("Cash Drop", "Peleka Pesa")}</h4>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={dropAmount}
              onChange={(e) => setDropAmount(e.target.value)}
              placeholder="KSh"
              className="flex-1 px-2 py-1.5 rounded-lg bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-xs tabular-nums outline-none focus:border-terracotta-500 min-h-[32px]"
            />
            <button
              onClick={() => { onCashDrop(Number(dropAmount)); setDropAmount(""); }}
              disabled={!dropAmount || Number(dropAmount) <= 0}
              className="px-3 py-1.5 rounded-lg bg-forest-500 text-white text-[10px] font-bold min-h-[32px] disabled:opacity-40"
            >
              {t("Drop", "Peleka")}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
          <h4 className="text-[9px] font-bold text-warm-500 uppercase mb-2">{t("Reconcile", "Sawazisha")}</h4>
          {showRecon ? (
            <div className="flex gap-1.5">
              <input
                type="number"
                value={reconAmount}
                onChange={(e) => setReconAmount(e.target.value)}
                placeholder={`KSh ${cashDrawer.expectedBalance.toLocaleString()}`}
                className="flex-1 px-2 py-1.5 rounded-lg bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-xs tabular-nums outline-none focus:border-terracotta-500 min-h-[32px]"
              />
              <button
                onClick={() => { onReconcile(Number(reconAmount)); setReconAmount(""); setShowRecon(false); }}
                className="px-3 py-1.5 rounded-lg bg-terracotta-500 text-white text-[10px] font-bold min-h-[32px]"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRecon(true)}
              className="w-full py-2 rounded-lg bg-terracotta-500 text-white text-[10px] font-bold min-h-[32px]"
            >
              {t("Start Reconciliation", "Anza Kuhakiki")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
