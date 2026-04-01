"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CartRecoveryData } from "@/types/cashier";

interface CartRecoveryDialogProps {
  isOpen: boolean;
  recoveryData: CartRecoveryData;
  onResume: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export default function CartRecoveryDialog({ isOpen, recoveryData, onResume, onDiscard, onClose }: CartRecoveryDialogProps) {
  if (!isOpen || !recoveryData.hasRecovery || !recoveryData.cart) return null;

  const savedDate = new Date(recoveryData.savedAt);
  const timeAgo = getTimeAgo(savedDate);

  const sourceLabel = {
    sessionStorage: "Session Storage",
    localStorage: "Local Storage",
    indexedDB: "Database",
  }[recoveryData.source || "sessionStorage"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            style={{ backdropFilter: "blur(16px)" }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-savanna-100 dark:bg-savanna-900/30 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-savanna-600">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                      Resume Previous Sale?
                    </h2>
                    <p className="text-xs text-warm-500">Found an unsaved cart from your last session</p>
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="mx-5 mb-4 p-4 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200/60 dark:border-warm-700/60">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Items</p>
                    <p className="text-2xl font-heading font-extrabold text-warm-900 dark:text-warm-50">
                      {recoveryData.itemCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-heading font-extrabold text-forest-600 tabular-nums">
                      KSh {recoveryData.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="mt-3 pt-3 border-t border-warm-200/60 dark:border-warm-700/60 space-y-1.5">
                  {recoveryData.cart.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-warm-600 dark:text-warm-300 truncate">
                        {item.product.name} x{item.qty}
                      </span>
                      <span className="text-xs font-medium text-warm-900 dark:text-warm-50 tabular-nums">
                        KSh {(item.qty * item.product.sellingPrice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {recoveryData.cart.items.length > 3 && (
                    <p className="text-[10px] text-warm-400">
                      +{recoveryData.cart.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Meta info */}
                <div className="mt-3 pt-3 border-t border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {recoveryData.isStale && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600">
                        Stale
                      </span>
                    )}
                    <span className="text-[10px] text-warm-400">
                      Saved {timeAgo} via {sourceLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-2 flex gap-2">
                <button
                  onClick={onDiscard}
                  className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px] active:scale-[0.98] transition-transform"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    onResume();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] active:scale-[0.98] transition-transform shadow-md shadow-terracotta-500/20"
                >
                  Resume Sale
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
