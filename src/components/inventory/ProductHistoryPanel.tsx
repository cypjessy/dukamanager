"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/inventoryData";
import { getStockStatus, getProfitMargin, getDaysUntilStockout } from "@/data/inventoryData";

interface ProductHistoryPanelProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

type HistoryEvent = {
  id: string;
  type: "created" | "stock_adjust" | "price_change" | "restock" | "supplier_change" | "sale";
  date: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export default function ProductHistoryPanel({ product, isOpen, onClose }: ProductHistoryPanelProps) {
  const events = useMemo((): HistoryEvent[] => {
    if (!product) return [];
    const evts: HistoryEvent[] = [
      {
        id: "e1", type: "created", date: product.createdAt,
        title: "Product Created",
        detail: `Initial stock: ${product.quantity} ${product.unitLabel.en}. Cost: KSh ${product.buyingPrice}, Selling: KSh ${product.sellingPrice}`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
        color: "text-forest-600", bgColor: "bg-forest-100 dark:bg-forest-900/30",
      },
      {
        id: "e2", type: "price_change", date: addDays(product.createdAt, 5),
        title: "Price Updated",
        detail: `Selling price adjusted to KSh ${product.sellingPrice}. Margin: ${getProfitMargin(product)}%`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        color: "text-savanna-600", bgColor: "bg-savanna-100 dark:bg-savanna-900/30",
      },
      {
        id: "e3", type: "restock", date: product.lastRestocked,
        title: "Stock Restocked",
        detail: `Received ${Math.floor(product.quantity * 0.6)} units. New total: ${product.quantity} ${product.unitLabel.en}`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
        color: "text-forest-600", bgColor: "bg-forest-100 dark:bg-forest-900/30",
      },
      {
        id: "e4", type: "stock_adjust", date: addDays(product.lastRestocked, 3),
        title: "Stock Adjusted",
        detail: `Reduced by 5 units (damaged goods). Previous: ${product.quantity + 5}, New: ${product.quantity}`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
        color: "text-sunset-500", bgColor: "bg-sunset-50 dark:bg-sunset-900/20",
      },
      {
        id: "e5", type: "sale", date: addDays(product.lastRestocked, 5),
        title: "Sales Velocity Updated",
        detail: `Current velocity: ${product.salesVelocity}/day. Estimated ${getDaysUntilStockout(product)} days until stockout at reorder point ${product.reorderPoint}`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
        color: "text-terracotta-500", bgColor: "bg-terracotta-50 dark:bg-terracotta-900/20",
      },
      {
        id: "e6", type: "supplier_change", date: addDays(product.lastRestocked, 7),
        title: "Supplier Verified",
        detail: `Supplier ID: ${product.supplierId || "None"}. Warehouse: ${product.warehouse}`,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
        color: "text-warm-500", bgColor: "bg-warm-100 dark:bg-warm-800",
      },
    ];
    return evts.sort((a, b) => b.date.localeCompare(a.date));
  }, [product]);

  const status = product ? getStockStatus(product) : null;

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] bg-white dark:bg-warm-900 border-l border-warm-200 dark:border-warm-700 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Product History</h2>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              {/* Product summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <div className="w-10 h-10 rounded-lg bg-warm-200 dark:bg-warm-700 flex items-center justify-center text-xs font-mono text-warm-500">
                  {product.sku.slice(-3)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      status === "healthy" ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600" :
                      status === "low" ? "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600" :
                      status === "critical" ? "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600" :
                      "bg-red-100 dark:bg-red-900/30 text-red-500"
                    }`}>{product.quantity} in stock</span>
                    <span className="text-[10px] text-warm-400">{getProfitMargin(product)}% margin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-warm-200 dark:bg-warm-700" />

                <div className="space-y-4">
                  {events.map((evt, i) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative flex gap-3"
                    >
                      {/* Icon dot */}
                      <div className={`w-10 h-10 rounded-full ${evt.bgColor} ${evt.color} flex items-center justify-center flex-shrink-0 z-10`}>
                        {evt.icon}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{evt.title}</p>
                          <span className="text-[10px] text-warm-400 whitespace-nowrap">{formatDate(evt.date)}</span>
                        </div>
                        <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-relaxed">{evt.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with restock recommendation */}
            <div className="flex-shrink-0 p-4 border-t border-warm-100 dark:border-warm-800">
              {status === "low" || status === "critical" || status === "out" ? (
                <div className="p-3 rounded-xl bg-sunset-50 dark:bg-sunset-900/15 border border-sunset-200/60 dark:border-sunset-700/30">
                  <p className="text-xs font-medium text-sunset-700 dark:text-sunset-400 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    Restock Recommendation
                  </p>
                  <p className="text-xs text-warm-500 mt-1">
                    Order {Math.max(product.reorderPoint * 2 - product.quantity, product.reorderPoint)} units to reach optimal stock level.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/15 border border-forest-200/60 dark:border-forest-700/30">
                  <p className="text-xs font-medium text-forest-700 dark:text-forest-400 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Stock Level Healthy
                  </p>
                  <p className="text-xs text-warm-500 mt-1">
                    {product.quantity} units available. Reorder at {product.reorderPoint} units. ~{getDaysUntilStockout(product)} days supply.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}
