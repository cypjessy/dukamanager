"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import type { HeldSale } from "@/app/cashier/page";

interface TransactionToolsProps {
  dailySales: { count: number; total: number; cash: number; mpesa: number };
  heldSales: HeldSale[];
  onResumeSale: (sale: HeldSale) => void;
  onHoldSale: () => void;
  onShowHeldDrawer: () => void;
  shiftStart: string;
  cartCount: number;
  cashierName: string;
  onClockOut: () => void;
  onReprint: () => void;
}

export default function TransactionTools({ dailySales, heldSales, onHoldSale, onShowHeldDrawer, shiftStart, cartCount, cashierName, onClockOut, onReprint }: TransactionToolsProps) {
  const getShiftDuration = useCallback(() => {
    const start = new Date(shiftStart).getTime();
    const now = Date.now();
    const hrs = Math.floor((now - start) / (1000 * 60 * 60));
    const mins = Math.floor(((now - start) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  }, [shiftStart]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto p-3 space-y-3">
      {/* Cashier info */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">{cashierName.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-warm-900 dark:text-warm-50 truncate">{cashierName}</p>
            <p className="text-[10px] text-warm-400">Cashier</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
            <span className="text-[10px] text-warm-500">Shift: {getShiftDuration()}</span>
          </div>
          <button onClick={onClockOut} className="px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/15 text-red-600 text-[9px] font-medium min-h-[28px]">
            Clock Out
          </button>
        </div>
      </div>

      {/* Daily summary */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2">Today&apos;s Sales</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] text-warm-400">Transactions</p>
            <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50">{dailySales.count}</p>
          </div>
          <div>
            <p className="text-[9px] text-warm-400">Total</p>
            <p className="text-sm font-heading font-extrabold text-forest-600 tabular-nums">KSh {dailySales.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-warm-400">Cash</p>
            <p className="text-xs font-bold text-warm-600 dark:text-warm-300 tabular-nums">KSh {dailySales.cash.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-warm-400">M-Pesa</p>
            <p className="text-xs font-bold text-[#00A650] tabular-nums">KSh {dailySales.mpesa.toLocaleString()}</p>
          </div>
        </div>
        {/* Target progress */}
        <div className="mt-2">
          <div className="flex justify-between text-[9px] text-warm-400 mb-1">
            <span>Daily Target</span>
            <span>KSh {dailySales.total.toLocaleString()} / KSh 50,000</span>
          </div>
          <div className="h-1.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
              initial={{ width: 0 }} animate={{ width: `${Math.min((dailySales.total / 50000) * 100, 100)}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onHoldSale} disabled={cartCount === 0}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-savanna-50 dark:bg-savanna-900/15 text-savanna-600 text-[10px] font-medium min-h-[44px] disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            Hold Sale
          </button>
          <button onClick={onShowHeldDrawer}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-warm-600 dark:text-warm-300 text-[10px] font-medium min-h-[44px] relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Parked
            {heldSales.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[8px] font-bold flex items-center justify-center">{heldSales.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2">Recent Transactions</p>
        {dailySales.count === 0 ? (
          <p className="text-xs text-warm-400 text-center py-3">No transactions yet today</p>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-[10px] text-warm-500">Last sale</p>
                <p className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {dailySales.total.toLocaleString()}</p>
              </div>
              <button onClick={onReprint} className="px-2 py-1 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-500 text-[9px] min-h-[28px]">Reprint</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
