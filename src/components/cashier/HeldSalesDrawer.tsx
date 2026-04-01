"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { HeldSale } from "@/app/cashier/page";

interface HeldSalesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  heldSales: HeldSale[];
  onResume: (sale: HeldSale) => void;
  onDelete: (id: string) => void;
}

export default function HeldSalesDrawer({ isOpen, onClose, heldSales, onResume, onDelete }: HeldSalesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] bg-white dark:bg-warm-900 border-l border-warm-200 dark:border-warm-700 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Parked Sales</h2>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <p className="text-xs text-warm-400 mt-1">{heldSales.length} parked transaction{heldSales.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {heldSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                      <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-warm-500 mb-1">No parked sales</p>
                  <p className="text-xs text-warm-400">Hold a sale to park it for later</p>
                </div>
              ) : (
                heldSales.map((sale, i) => {
                  const timeAgo = getTimeAgo(sale.heldAt);
                  return (
                    <motion.div key={sale.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3.5"
                      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-savanna-500" />
                          <span className="text-[10px] font-mono text-warm-400">{sale.id}</span>
                        </div>
                        <span className="text-[10px] text-warm-400">{timeAgo}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-warm-500">{sale.items.length} item{sale.items.length !== 1 ? "s" : ""}</p>
                          <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
                            KSh {sale.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onResume(sale)}
                          className="flex-1 py-2 rounded-lg bg-terracotta-500 text-white text-xs font-bold active:scale-95 transition-all min-h-[36px]">
                          Resume
                        </button>
                        <button onClick={() => onDelete(sale.id)}
                          className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/15 text-red-500 flex items-center justify-center active:scale-95 transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
