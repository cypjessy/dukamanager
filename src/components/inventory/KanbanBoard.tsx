"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Product, StockStatus } from "@/data/inventoryData";
import { getStockStatus } from "@/data/inventoryData";
import { useLocale } from "@/providers/LocaleProvider";

interface KanbanBoardProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onAdjustQty: (id: string, delta: number) => void;
}

interface Column {
  status: StockStatus;
  label: string;
  labelSw: string;
  color: string;
  dotColor: string;
}

const columns: Column[] = [
  { status: "healthy", label: "Healthy Stock", labelSw: "Hesabu Nzuri", color: "border-forest-300 dark:border-forest-700", dotColor: "bg-forest-500" },
  { status: "low", label: "Low Stock", labelSw: "Hesabu Ndogo", color: "border-savanna-300 dark:border-savanna-700", dotColor: "bg-savanna-500" },
  { status: "critical", label: "Critical", labelSw: "Hatarishi", color: "border-sunset-300 dark:border-sunset-700", dotColor: "bg-sunset-400" },
  { status: "out", label: "Out of Stock", labelSw: "Zimeisha", color: "border-red-300 dark:border-red-700", dotColor: "bg-red-500" },
];

export default function KanbanBoard({ products, onEdit, onAdjustQty }: KanbanBoardProps) {
  const { locale } = useLocale();
  const [dragOverCol, setDragOverCol] = useState<StockStatus | null>(null);

  const grouped = {
    healthy: products.filter((p) => getStockStatus(p) === "healthy"),
    low: products.filter((p) => getStockStatus(p) === "low"),
    critical: products.filter((p) => getStockStatus(p) === "critical"),
    out: products.filter((p) => getStockStatus(p) === "out"),
  };

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: StockStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: StockStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const currentStatus = getStockStatus(product);
    if (currentStatus === targetStatus) return;
    const targetQty = targetStatus === "out" ? 0
      : targetStatus === "critical" ? Math.floor(product.reorderPoint * 0.2)
      : targetStatus === "low" ? Math.floor(product.reorderPoint * 0.7)
      : product.reorderPoint + 10;
    const delta = targetQty - product.quantity;
    onAdjustQty(id, delta);
  }, [products, onAdjustQty]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div
          key={col.status}
          onDragOver={(e) => handleDragOver(e, col.status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, col.status)}
          className={`rounded-2xl border-2 ${col.color} p-3 transition-colors ${dragOverCol === col.status ? "bg-terracotta-50/50 dark:bg-terracotta-900/10" : ""}`}
          style={{ background: dragOverCol === col.status ? undefined : "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {locale === "sw" ? col.labelSw : col.label}
            </h3>
            <span className="ml-auto text-xs font-semibold text-warm-400 bg-warm-100 dark:bg-warm-800 px-2 py-0.5 rounded-full tabular-nums">
              {grouped[col.status].length}
            </span>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {grouped[col.status].map((p) => (
              <motion.div
                key={p.id}
                layout
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, p.id)}
                whileHover={{ scale: 1.02 }}
                onClick={() => onEdit(p)}
                className="rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200/40 dark:border-warm-700/40 p-3 cursor-grab active:cursor-grabbing"
              >
                <p className="font-medium text-xs text-warm-900 dark:text-warm-50 truncate mb-1">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">{p.quantity} {p.unitLabel[locale]}</span>
                  <span className="text-[10px] text-warm-400">KSh {p.sellingPrice}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); onAdjustQty(p.id, -1); }}
                    className="w-6 h-6 rounded bg-warm-100 dark:bg-warm-700 text-xs font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                    aria-label="Decrease">-</button>
                  <button onClick={(e) => { e.stopPropagation(); onAdjustQty(p.id, 1); }}
                    className="w-6 h-6 rounded bg-warm-100 dark:bg-warm-700 text-xs font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                    aria-label="Increase">+</button>
                </div>
              </motion.div>
            ))}
            {grouped[col.status].length === 0 && (
              <p className="text-xs text-warm-400 text-center py-4">No items</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
