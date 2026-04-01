"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product, StockStatus } from "@/data/inventoryData";
import { getStockStatus } from "@/data/inventoryData";
import type { CartItem } from "@/app/cashier/page";

interface ProductBrowserProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  onAddToCart: (p: Product) => void;
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
}

const CATEGORIES = [
  { key: "", label: "All", icon: "\u25A6" },
  { key: "cereals", label: "Cereals", icon: "\uD83C\uDF3E" },
  { key: "cooking_oil", label: "Oil", icon: "\uD83E\uDDC2" },
  { key: "soap", label: "Soap", icon: "\uD83E\uDDFC" },
  { key: "beverages", label: "Drinks", icon: "\uD83E\uDDCB" },
  { key: "snacks", label: "Snacks", icon: "\uD83C\uDF6A" },
  { key: "household", label: "Home", icon: "\uD83C\uDFE0" },
  { key: "farming", label: "Farm", icon: "\uD83C\uDF31" },
  { key: "emergency", label: "Medical", icon: "\uD83E\uDE7A" },
];

const stockDot: Record<StockStatus, string> = {
  healthy: "bg-forest-500",
  low: "bg-savanna-500",
  critical: "bg-sunset-400 animate-pulse",
  out: "bg-red-500 animate-pulse",
};

const stockLabel: Record<StockStatus, string> = {
  healthy: "",
  low: "Low Stock",
  critical: "Stock Hatarishi",
  out: "Hakuna Stock",
};

export default function ProductBrowser({ products, searchQuery, onSearchChange, selectedCategory, onCategoryChange, onAddToCart, cart, onUpdateQty }: ProductBrowserProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search */}
      <div className="flex-shrink-0 p-3 pb-2">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products or scan barcode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
            style={{ fontSize: "16px" }} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-shrink-0 px-3 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => onCategoryChange(cat.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] flex-shrink-0 ${
                selectedCategory === cat.key ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
              }`}>
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {products.map((product) => {
            const status = getStockStatus(product);
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <ProductGridCard
                key={product.id}
                product={product}
                status={status}
                inCart={inCart}
                onAddToCart={onAddToCart}
                onUpdateQty={onUpdateQty}
              />
            );
          })}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-warm-400 text-sm">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductGridCard({ product, status, inCart, onAddToCart, onUpdateQty }: {
  product: Product;
  status: StockStatus;
  inCart: CartItem | undefined;
  onAddToCart: (p: Product) => void;
  onUpdateQty: (id: string, qty: number) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const hasImage = product.imageUrl && product.imageUrl.length > 5 && !imgErr;

  return (
    <motion.div layout whileTap={{ scale: 0.97 }}
      className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-2.5 cursor-pointer transition-all hover:border-terracotta-200 dark:hover:border-terracotta-700/40 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
      onClick={() => inCart ? onUpdateQty(product.id, inCart.qty + 1) : onAddToCart(product)}>
      {hasImage ? (
        <div className="w-full h-20 rounded-lg mb-2 overflow-hidden bg-warm-50 dark:bg-warm-800">
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        </div>
      ) : (
        <div className="w-full h-12 rounded-lg mb-2 bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-800 dark:to-warm-700 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      <div className="flex items-start gap-2 mb-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate leading-tight">{product.name}</p>
          {product.nameSw && product.nameSw !== product.name && (
            <p className="text-[9px] text-warm-400 truncate">{product.nameSw}</p>
          )}
        </div>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${stockDot[status]}`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
          KSh {product.sellingPrice.toLocaleString()}
        </span>
        {inCart ? (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onUpdateQty(product.id, inCart.qty - 1)}
              style={{ minHeight: 0, minWidth: 0 }}
              className="w-6 h-6 rounded-md bg-warm-200 dark:bg-warm-700 text-xs font-bold flex items-center justify-center active:scale-90">-</button>
            <span className="text-xs font-bold tabular-nums min-w-[1rem] text-center">{inCart.qty}</span>
            <button onClick={() => onUpdateQty(product.id, inCart.qty + 1)}
              style={{ minHeight: 0, minWidth: 0 }}
              className="w-6 h-6 rounded-md bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center active:scale-90">+</button>
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            style={{ minHeight: 0, minWidth: 0 }}
            className="w-7 h-7 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        )}
      </div>
      {stockLabel[status] && (
        <span className={`absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
          status === "out" ? "bg-red-500 text-white" : status === "critical" ? "bg-sunset-400 text-white" : "bg-savanna-500 text-white"
        }`}>
          {stockLabel[status]}
        </span>
      )}
    </motion.div>
  );
}
