"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StockStatus, ViewMode, Product } from "@/data/inventoryData";
import { getStockStatus } from "@/data/inventoryData";
import { useProducts } from "@/hooks/useProducts";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { dt } from "@/lib/dashboardTranslations";
import type { NewProductFormData } from "@/lib/addInventorySchema";
import { KENYAN_CATEGORIES } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import InventoryToolbar from "@/components/inventory/InventoryToolbar";
import DataTable from "@/components/inventory/DataTable";
import KanbanBoard from "@/components/inventory/KanbanBoard";
import ProductCard from "@/components/inventory/ProductCard";
import AddInventoryDialog from "@/components/inventory/AddInventoryDialog";
import InventoryAnalytics from "@/components/inventory/InventoryAnalytics";
import FilterChips from "@/components/inventory/FilterChips";
import QuickActionBar from "@/components/inventory/QuickActionBar";
import ProductHistoryPanel from "@/components/inventory/ProductHistoryPanel";
import BarcodePrintDialog from "@/components/inventory/BarcodePrintDialog";

export default function InventoryPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { shopId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState<StockStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.nameSw.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesStatus = stockFilter === "all" || getStockStatus(p) === stockFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const lowStockCount = useMemo(() => products.filter((p) => {
    const s = getStockStatus(p);
    return s === "low" || s === "critical" || s === "out";
  }).length, [products]);

  const totalValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0), [products]);
  const potentialProfit = useMemo(() => products.reduce((sum, p) => sum + p.quantity * (p.sellingPrice - p.buyingPrice), 0), [products]);

  const categoryName = useMemo(() => {
    if (!selectedCategory) return "";
    const cat = KENYAN_CATEGORIES.find(c => c.value === selectedCategory);
    return locale === "sw" ? (cat?.labelSw || selectedCategory) : (cat?.label || selectedCategory);
  }, [selectedCategory, locale]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((p) => p.id));
    });
  }, [filtered]);

  const handleAdjustQty = useCallback(async (id: string, delta: number) => {
    const p = products.find(prod => prod.id === id);
    if (p) {
        await updateProduct(id, { quantity: Math.max(0, p.quantity + delta) });
    }
  }, [products, updateProduct]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  }, []);

  const handleViewHistory = useCallback((product: Product) => {
    setHistoryProduct(product);
    setHistoryOpen(true);
  }, []);

  const handlePrintBarcode = useCallback((product: Product) => {
    setBarcodeProduct(product);
    setBarcodeOpen(true);
  }, []);

  const handleDuplicate = useCallback(async (product: Product) => {
    const { id: _id, createdAt: _cr, lastRestocked: _lr, ...rest } = product;
    void _id; void _cr; void _lr;
    await addProduct({
      ...rest,
      name: `Copy of ${product.name}`,
      sku: "",
      quantity: 0,
    });
  }, [addProduct]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteProduct(id);
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, [deleteProduct]);

  const handleAdd = useCallback(() => {
    setEditProduct(null);
    setModalOpen(true);
  }, []);

  const handleReorderFromInsight = useCallback((product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data: NewProductFormData) => {
    const unitValue = (data.unit === "other" ? data.customUnit || "pieces" : data.unit) as Product["unit"];

    // Use wizard-uploaded URL first, then existing product image, then empty
    let imageUrl = data.imageUrl || editProduct?.imageUrl || "";

    // Only upload if there's a file but no URL yet
    if (data.imageFile && !imageUrl) {
      try {
        const { uploadToBunny } = await import("@/lib/bunny");
        const uploadResult = await uploadToBunny({
          file: data.imageFile,
          folder: "products",
          shopId,
        });
        if (uploadResult.cdnUrl) {
          imageUrl = uploadResult.cdnUrl;
        }
      } catch (e) {
        console.error("Failed to upload product image:", e);
      }
    }

    const productData = {
      name: data.name,
      nameSw: data.nameSw || data.name,
      sku: data.sku || (editProduct ? editProduct.sku : `NEW-${Date.now().toString(36).toUpperCase()}`),
      category: data.category,
      categorySw: "",
      unit: unitValue,
      unitLabel: { en: data.unit, sw: data.unit },
      quantity: data.quantity,
      reorderPoint: data.reorderPoint,
      buyingPrice: data.buyingPrice,
      sellingPrice: data.sellingPrice,
      wholesalePrice: data.wholesalePrice || 0,
      supplierId: data.supplierId || "",
      description: data.description || "",
      salesVelocity: 1,
      warehouse: data.warehouse || "Shelf A",
      imageUrl,
    };

    if (editProduct) {
      await updateProduct(editProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setModalOpen(false);
  }, [editProduct, addProduct, updateProduct, shopId]);

  const handleBulkDelete = useCallback(async () => {
    for (const id of Array.from(selectedIds)) {
        await deleteProduct(id);
    }
    setSelectedIds(new Set());
  }, [selectedIds, deleteProduct]);

  const handleBulkExport = useCallback(() => {
    const csv = ["Name,SKU,Category,Qty,Price,Status"]
      .concat(products.filter((p) => selectedIds.has(p.id)).map((p) => `${p.name},${p.sku},${p.category},${p.quantity},${p.sellingPrice},${getStockStatus(p)}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventory-export.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [products, selectedIds]);

  const hasActiveFilters = searchQuery || selectedCategory || stockFilter !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{locale === "sw" ? "Inapakia..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {dt("inventory", locale)}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {products.length} products &middot; {lowStockCount} need attention
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            {showAnalytics ? (locale === "sw" ? "Ficha" : "Hide Analytics") : (locale === "sw" ? "Onyesha" : "Show Analytics")}
          </Button>
        </div>
      </motion.div>

      {showAnalytics && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
          <InventoryAnalytics products={products} />
        </motion.div>
      )}

      <div className={isMobile ? "" : "page-section-fixed"}>
        <InventoryToolbar
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
          stockFilter={stockFilter} onStockFilterChange={setStockFilter}
          viewMode={viewMode} onViewModeChange={setViewMode}
          onAddProduct={handleAdd}
        />
        <AnimatePresence>
          <FilterChips
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            stockFilter={stockFilter}
            categoryName={categoryName}
            onClearSearch={() => setSearchQuery("")}
            onClearCategory={() => setSelectedCategory("")}
            onClearStockFilter={() => setStockFilter("all")}
            onClearAll={() => { setSearchQuery(""); setSelectedCategory(""); setStockFilter("all"); }}
          />
        </AnimatePresence>
      </div>

      {/* Desktop: Master-detail grid with internal scrolling */}
      {!isMobile && (
        <div className="flex-1 min-h-0 mt-3 desktop-split-grid grid-cols-1 lg:grid-cols-10">
          <div className="lg:col-span-7 overflow-hidden flex flex-col rounded-2xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <div className="flex-1 overflow-y-auto scroll-container">
              {viewMode === "table" ? (
                <DataTable
                  products={filtered}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onAdjustQty={handleAdjustQty}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onViewHistory={handleViewHistory}
                  onPrintBarcode={handlePrintBarcode}
                  searchQuery={searchQuery}
                />
              ) : (
                <div className="p-4"><KanbanBoard products={filtered} onEdit={handleEdit} onAdjustQty={handleAdjustQty} /></div>
              )}
            </div>
            <div className="border-t border-warm-200/60 dark:border-warm-700/60 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-4 text-xs text-warm-500 dark:text-warm-400">
                <span><strong className="text-warm-900 dark:text-warm-50">{products.length}</strong> items</span>
                <span><strong className="text-warm-900 dark:text-warm-50">KSh {totalValue.toLocaleString()}</strong> value</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-warm-500 dark:text-warm-400">
                <span className={lowStockCount > 0 ? "text-red-500 font-semibold" : ""}><strong>{lowStockCount}</strong> low stock</span>
                <span><strong className="text-forest-600">KSh {potentialProfit.toLocaleString()}</strong> profit</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <div className="p-4 border-b border-warm-200/60 dark:border-warm-700/60 flex-shrink-0">
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{locale === "sw" ? "Takwimu" : "Inventory Analytics"}</h3>
            </div>
            <div className="flex-1 overflow-y-auto analytics-scroll p-4">
              <InventoryAnalytics products={products} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Card list flowing naturally */}
      {isMobile && (
        <div className="mt-4 space-y-3">
          {/* Summary bar */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white/80 dark:bg-warm-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-warm-500 dark:text-warm-400">
              <span><strong className="text-warm-900 dark:text-warm-50">{products.length}</strong> items</span>
              <span><strong className="text-warm-900 dark:text-warm-50">KSh {totalValue.toLocaleString()}</strong> value</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-warm-500 dark:text-warm-400">
              <span className={lowStockCount > 0 ? "text-red-500 font-semibold" : ""}><strong>{lowStockCount}</strong> low stock</span>
            </div>
          </div>

          {/* Product cards */}
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isSelected={selectedIds.has(p.id)}
                onEdit={handleEdit}
                onAdjustQty={handleAdjustQty}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onSelect={handleToggleSelect}
                onViewHistory={handleViewHistory}
                onPrintBarcode={handlePrintBarcode}
              />
            ))
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4">
                {hasActiveFilters ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M19 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M13 10V6H7a2 2 0 0 0-2 2v9" /><path d="M17 10h3v7a2 2 0 0 1-2 2h-3" />
                  </svg>
                )}
              </div>
              <h3 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50 mb-1">
                {hasActiveFilters
                  ? (locale === "sw" ? "Hakuna bidhaa zinazolingana" : "No matching products")
                  : (locale === "sw" ? "Orodha yako ni tupu" : "Your inventory is empty")
                }
              </h3>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-4 max-w-xs">
                {hasActiveFilters
                  ? (locale === "sw" ? "Badilisha vichujio vyako kuona bidhaa" : "Adjust your filters to see products")
                  : (locale === "sw" ? "Anza kwa kuongeza bidhaa yako ya kwanza" : "Start by adding your first product")
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory(""); setStockFilter("all"); }}>
                  {locale === "sw" ? "Futa Vichujio" : "Clear Filters"}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleAdd}
                  iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>
                  {locale === "sw" ? "Ongeza Bidhaa" : "Add First Product"}
                </Button>
              )}
            </motion.div>
          )}

          {/* Bottom padding for floating action bar */}
          {selectedIds.size > 0 && <div className="h-20" />}
        </div>
      )}

      {/* Desktop empty state */}
      {!isMobile && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-warm-200/60 dark:border-warm-700/60 mt-3"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4">
            {hasActiveFilters ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            )}
          </div>
          <h3 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50 mb-1">
            {hasActiveFilters
              ? (locale === "sw" ? "Hakuna bidhaa zinazolingana" : "No matching products")
              : (locale === "sw" ? "Orodha yako ni tupu" : "Your inventory is empty")
            }
          </h3>
          <p className="text-sm text-warm-500 dark:text-warm-400 mb-4 max-w-xs">
            {hasActiveFilters
              ? (locale === "sw" ? "Badilisha vichujio vyako kuona bidhaa" : "Try adjusting your filters")
              : (locale === "sw" ? "Anza kwa kuongeza bidhaa yako ya kwanza" : "Add your first product to get started")
            }
          </p>
          {hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory(""); setStockFilter("all"); }}>
              {locale === "sw" ? "Futa Vichujio" : "Clear Filters"}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleAdd}
              iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>
              {locale === "sw" ? "Ongeza Bidhaa" : "Add First Product"}
            </Button>
          )}
        </motion.div>
      )}

      {/* Floating bulk action bar (mobile) */}
      {isMobile && <QuickActionBar selectedCount={selectedIds.size} onClearSelection={() => setSelectedIds(new Set())} onBulkDelete={handleBulkDelete} onBulkExport={handleBulkExport} />}

      <AddInventoryDialog isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProduct(null); }} locale={locale} onSave={handleSave} initialData={editProduct} />
      <ProductHistoryPanel product={historyProduct} isOpen={historyOpen} onClose={() => { setHistoryOpen(false); setHistoryProduct(null); }} />
      <BarcodePrintDialog product={barcodeProduct} isOpen={barcodeOpen} onClose={() => { setBarcodeOpen(false); setBarcodeProduct(null); }} />
    </div>
  );
}
