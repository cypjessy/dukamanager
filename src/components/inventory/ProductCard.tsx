"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import type { Product, StockStatus } from "@/data/inventoryData";
import { getStockStatus, getProfitMargin, getDaysUntilStockout } from "@/data/inventoryData";
import StockLevelIndicator from "./StockLevelIndicator";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAdjustQty: (id: string, delta: number) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewHistory: (product: Product) => void;
  onPrintBarcode: (product: Product) => void;
}

const statusDot: Record<StockStatus, string> = {
  healthy: "bg-forest-500",
  low: "bg-savanna-500",
  critical: "bg-sunset-400 animate-pulse",
  out: "bg-red-500 animate-pulse",
};

const statusLabel: Record<StockStatus, string> = {
  healthy: "In Stock",
  low: "Low Stock",
  critical: "Critical",
  out: "Out of Stock",
};

const categoryColors: Record<string, string> = {
  cereals: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  cooking_oil: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400",
  soap: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  beverages: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400",
  snacks: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  household: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300",
  farming: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  emergency: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  dairy: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400",
  personal: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  meat: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  other: "bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300",
};

export default function ProductCard({
  product,
  onEdit,
  onAdjustQty,
  onDuplicate,
  onDelete,
  onViewHistory,
  onPrintBarcode,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [swipedAction, setSwipedAction] = useState<"left" | "right" | null>(null);

  const status = getStockStatus(product);
  const margin = getProfitMargin(product);
  const daysLeft = getDaysUntilStockout(product);

  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [-200, -80, 0], [1, 0.8, 0]);
  const bgRight = useTransform(x, [0, 80, 200], [0, 0.8, 1]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x < -80 || info.velocity.x < -400) {
      setSwipedAction("left");
      onViewHistory(product);
    } else if (info.offset.x > 80 || info.velocity.x > 400) {
      setSwipedAction("right");
      onEdit(product);
    } else {
      setSwipedAction(null);
    }
  }, [onViewHistory, onEdit, product]);

  const resetSwipe = useCallback(() => setSwipedAction(null), []);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe action backgrounds */}
      <div className="absolute inset-0 flex">
        <motion.div style={{ opacity: bgRight }}
          className="w-20 flex flex-col items-center justify-center gap-1 bg-forest-500 text-white rounded-l-2xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          <span className="text-[9px] font-bold">History</span>
        </motion.div>
        <div className="flex-1" />
        <motion.div style={{ opacity: bgLeft }}
          className="w-20 flex flex-col items-center justify-center gap-1 bg-terracotta-500 text-white rounded-r-2xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          <span className="text-[9px] font-bold">Edit</span>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={swipedAction === "left" ? { x: -160 } : swipedAction === "right" ? { x: 160 } : { x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 border border-warm-200/60 dark:border-warm-700/60 cursor-pointer"
        onClick={() => { if (swipedAction) { resetSwipe(); } else { setExpanded(!expanded); } }}
      >
        <div className="p-4 bg-white/80 dark:bg-warm-900/80 backdrop-blur-sm rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                 {product.imageUrl && product.imageUrl.length > 5 && !imageError ? (
                   <Image
                     src={product.imageUrl}
                     alt={product.name}
                     className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-warm-200/60 dark:border-warm-700/60"
                     width={20}
                     height={20}
                     onError={() => setImageError(true)}
                   />
                 ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-800 dark:to-warm-700 flex items-center justify-center flex-shrink-0 border border-warm-200/60 dark:border-warm-700/60">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} />
                    <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">
                      {product.name}
                    </h3>
                  </div>
                  {product.nameSw && product.nameSw !== product.name && (
                    <p className="text-[11px] text-warm-400 truncate mb-1">{product.nameSw}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${categoryColors[product.category] || "bg-warm-100 text-warm-500"}`}>
                      {product.categorySw || product.category}
                    </span>
                    <span className="text-[10px] text-warm-400 font-mono">{product.sku}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
                KSh {product.sellingPrice.toLocaleString()}
              </p>
              <span className={`text-[10px] font-bold ${
                margin >= 30 ? "text-forest-600" : margin >= 20 ? "text-savanna-600" : "text-red-500"
              }`}>
                {margin}% margin
              </span>
            </div>
          </div>

          {/* Stock level bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-semibold ${
                status === "healthy" ? "text-forest-600" :
                status === "low" ? "text-savanna-600" :
                status === "critical" ? "text-sunset-500" : "text-red-500"
              }`}>
                {statusLabel[status]}
              </span>
              <span className="text-[10px] text-warm-400 tabular-nums">
                {product.quantity} / {product.reorderPoint} reorder
              </span>
            </div>
            <StockLevelIndicator current={product.quantity} reorderPoint={product.reorderPoint} status={status} size="sm" showLabel={false} />
          </div>

          {/* Quick qty adjust */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100 dark:border-warm-800">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustQty(product.id, -1); }}
                className="w-9 h-9 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-90 flex items-center justify-center text-lg font-bold transition-all"
                aria-label="Decrease"
              >
                -
              </button>
              <span className="text-base font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[2.5rem] text-center">
                {product.quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustQty(product.id, 1); }}
                className="w-9 h-9 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-90 flex items-center justify-center text-lg font-bold transition-all"
                aria-label="Increase"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {(status === "low" || status === "critical" || status === "out") && (
                <span className="text-[10px] font-semibold text-sunset-500 bg-sunset-50 dark:bg-sunset-900/20 px-2 py-0.5 rounded-md">
                  {status === "out" ? "Restock!" : `~${daysLeft}d left`}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="w-9 h-9 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 active:scale-90 flex items-center justify-center transition-all"
                aria-label="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 bg-white/80 dark:bg-warm-900/80 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-warm-100 dark:border-warm-800">
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Cost</p>
                    <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {product.buyingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Selling</p>
                    <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {product.sellingPrice.toLocaleString()}</p>
                  </div>
                  {product.wholesalePrice > 0 && (
                    <div>
                      <p className="text-[10px] text-warm-400 uppercase tracking-wider">Wholesale</p>
                      <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {product.wholesalePrice.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Location</p>
                    <p className="text-sm text-warm-900 dark:text-warm-50">{product.warehouse}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Last Restocked</p>
                    <p className="text-sm text-warm-900 dark:text-warm-50 tabular-nums">{product.lastRestocked}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-400 uppercase tracking-wider">Velocity</p>
                    <p className="text-sm text-warm-900 dark:text-warm-50 tabular-nums">{product.salesVelocity}/day</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewHistory(product); }}
                    className="py-2.5 rounded-lg text-xs font-medium bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    History
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPrintBarcode(product); }}
                    className="py-2.5 rounded-lg text-xs font-medium bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8v8M10 8v8M14 8v4M18 8v8" /></svg>
                    Barcode
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(product); }}
                    className="py-2.5 rounded-lg text-xs font-medium bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    className="py-2.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
