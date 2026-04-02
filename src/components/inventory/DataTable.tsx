"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/data/inventoryData";
import { getStockStatus, getProfitMargin, getDaysUntilStockout, suppliers } from "@/data/inventoryData";
import StockLevelIndicator from "./StockLevelIndicator";

function ProductImageCell({ product }: { product: Product }) {
  const [err, setErr] = useState(false);
  if (!product.imageUrl || product.imageUrl.length <= 5 || err) {
    return (
      <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[10px] text-warm-400 font-mono flex-shrink-0">
        {product.sku.slice(-3)}
      </div>
    );
  }
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-warm-200/60 dark:border-warm-700/60"
      width={8}
      height={8}
      onError={() => setErr(true)}
    />
  );
}

interface DataTableProps {
  products: Product[];
  onAdjustQty: (id: string, delta: number) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewHistory: (product: Product) => void;
  onPrintBarcode: (product: Product) => void;
  searchQuery: string;
}

type SortField = "name" | "quantity" | "sellingPrice" | "category" | "lastRestocked";
type SortDir = "asc" | "desc";

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

export default function DataTable({
  products,
  onAdjustQty,
  onEdit,
  onDuplicate,
  onDelete,
  onViewHistory,
  onPrintBarcode,
  searchQuery,
}: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameSw.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categorySw.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "quantity": cmp = a.quantity - b.quantity; break;
        case "sellingPrice": cmp = a.sellingPrice - b.sellingPrice; break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "lastRestocked": cmp = a.lastRestocked.localeCompare(b.lastRestocked); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }, [sortField]);

  return (
    <div className="overflow-visible rounded-2xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(245,245,240,0.95)", backdropFilter: "blur(12px)" }}>
              <SortHeader field="name" label="Product" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader field="category" label="Category" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader field="quantity" label="Stock" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader field="sellingPrice" label="Price" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider whitespace-nowrap">Margin</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider whitespace-nowrap">Supplier</th>
              <SortHeader field="lastRestocked" label="Restocked" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => {
              const status = getStockStatus(p);
              const margin = getProfitMargin(p);
              const sup = suppliers.find((s) => s.id === p.supplierId);
              const daysLeft = getDaysUntilStockout(p);
              const isExpanded = expandedRowId === p.id;

              return (
                <>
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 transition-colors group hover:bg-terracotta-50/20 dark:hover:bg-terracotta-900/8 cursor-pointer"
                  onClick={() => setExpandedRowId(isExpanded ? null : p.id)}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <ProductImageCell product={p} />
                      <div className="min-w-0">
                        <p className="font-medium text-warm-900 dark:text-warm-50 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-[10px] text-warm-400 font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${categoryColors[p.category] || "bg-warm-100 text-warm-500"}`}>
                      {p.categorySw}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <StockLevelIndicator current={p.quantity} reorderPoint={p.reorderPoint} status={status} size="sm" />
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                        <button
                          onClick={() => onAdjustQty(p.id, -1)}
                          className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-90 flex items-center justify-center text-sm sm:text-xs font-bold transition-colors"
                          aria-label="Decrease"
                        >-</button>
                        <button
                          onClick={() => onAdjustQty(p.id, 1)}
                          className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-90 flex items-center justify-center text-sm sm:text-xs font-bold transition-colors"
                          aria-label="Increase"
                        >+</button>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.sellingPrice}</p>
                    <p className="text-[10px] text-warm-400 tabular-nums">cost: {p.buyingPrice}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold ${margin < 20 ? "text-red-500" : margin < 30 ? "text-savanna-600" : "text-forest-600"}`}>
                      {margin}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-xs text-warm-600 dark:text-warm-300 truncate max-w-[120px]">{sup?.name || "-"}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-xs text-warm-400 tabular-nums">{p.lastRestocked}</p>
                    {(status === "low" || status === "critical" || status === "out") && (
                      <p className="text-[10px] text-sunset-500 font-medium">~{daysLeft}d left</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 relative">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                        className="p-1.5 rounded-lg hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20 text-warm-400 hover:text-terracotta-500 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                        aria-label="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedRowId(isExpanded ? null : p.id); }}
                        className={`p-1.5 rounded-lg transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center ${
                          isExpanded ? "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600" : "hover:bg-warm-100 dark:hover:bg-warm-800 text-warm-400 hover:text-warm-600"
                        }`}
                        aria-label="More actions"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isExpanded ? "rotate-180" : ""}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>

                {/* Expanded row with actions */}
                {isExpanded && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-warm-50 dark:bg-warm-800/30"
                  >
                    <td colSpan={8} className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => { onDuplicate(p); setExpandedRowId(null); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                          Duplicate
                        </button>
                        <button
                          onClick={() => { onViewHistory(p); setExpandedRowId(null); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          View History
                        </button>
                        <button
                          onClick={() => { onPrintBarcode(p); setExpandedRowId(null); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8v8M10 8v8M14 8v4M18 8v8" /></svg>
                          Print Barcode
                        </button>
                        <button
                          onClick={() => { onDelete(p.id); setExpandedRowId(null); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
                </>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-warm-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2 text-xs text-warm-500">
            <span>Show</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 rounded-lg bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs min-h-[32px]">
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>of {sorted.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-600 disabled:opacity-40 min-h-[32px]">
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium min-h-[32px] min-w-[32px] ${p === page ? "bg-terracotta-500 text-white" : "bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-600"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-600 disabled:opacity-40 min-h-[32px]">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: "name" | "quantity" | "sellingPrice" | "category" | "lastRestocked";
  label: string;
  sortField: string;
  sortDir: string;
  onSort: (field: "name" | "quantity" | "sellingPrice" | "category" | "lastRestocked") => void;
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className="px-3 py-3 text-left text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider cursor-pointer hover:text-warm-700 dark:hover:text-warm-200 select-none whitespace-nowrap"
    >
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        className={`inline ml-0.5 transition-transform ${sortField === field ? "opacity-100" : "opacity-0"} ${sortField === field && sortDir === "desc" ? "rotate-180" : ""}`}>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </th>
  );
}
