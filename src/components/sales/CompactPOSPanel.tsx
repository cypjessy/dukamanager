"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type CartItem, type PaymentMethod, creditCustomers } from "@/data/salesData";
import type { Locale } from "@/types";
import { useBarcodeScanner, playBeep } from "@/hooks/useBarcodeScanner";
import CameraScanner from "@/components/sales/CameraScanner";
import AISuggestions from "@/components/sales/AISuggestions";
import HoldSales from "@/components/sales/HoldSales";

interface POSProduct {
  id: string;
  name: string;
  nameSw: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface CompactPOSPanelProps {
  locale: Locale;
  cart: CartItem[];
  products: POSProduct[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProcessSale: (paymentMethod: PaymentMethod, details: Record<string, string | number>) => void;
  isProcessing: boolean;
  maxHeight?: number;
}

const paymentOptions: { key: PaymentMethod; label: string; labelSw: string; color: string; icon: string }[] = [
  { key: "mpesa", label: "M-Pesa", labelSw: "M-Pesa", color: "bg-[#00A650] hover:bg-[#009645]", icon: "📱" },
  { key: "cash", label: "Cash", labelSw: "Pesa", color: "bg-terracotta-500 hover:bg-terracotta-600", icon: "💵" },
  { key: "credit", label: "Credit", labelSw: "Mkopo", color: "bg-sunset-400 hover:bg-sunset-500", icon: "📋" },
  { key: "bank", label: "Bank", labelSw: "Benki", color: "bg-[#4E9AF1] hover:bg-[#3D89E0]", icon: "🏦" },
];

export default function CompactPOSPanel({
  locale, cart, products, onAddToCart, onUpdateQty, onRemoveItem, onClearCart, onProcessSale, isProcessing, maxHeight,
}: CompactPOSPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [creditCustomer, setCreditCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [saleNote, setSaleNote] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recentProducts = products.slice(0, 8);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = vatEnabled ? Math.round(subtotal * 0.16) : 0;
  const total = subtotal + vat - discount;
  const changeDue = paymentMethod === "cash" && Number(cashTendered) >= total ? Number(cashTendered) - total : 0;

  const handleScanResult = useCallback((code: string) => {
    const product = products.find(
      (p) => p.sku.toLowerCase() === code.toLowerCase() || p.id === code
    );
    if (product && product.stock > 0) {
      onAddToCart({ productId: product.id, name: product.name, nameSw: product.nameSw, price: product.price, quantity: 1, maxQty: product.stock });
      playBeep(true);
      setScanFeedback({ type: "success", message: `${product.name} added` });
      setTimeout(() => setScanFeedback(null), 1500);
    } else {
      playBeep(false);
      setScanFeedback({ type: "error", message: locale === "sw" ? "Bidhaa haipatikani" : "Product not found" });
      setTimeout(() => setScanFeedback(null), 2000);
    }
  }, [products, onAddToCart, locale]);

  useBarcodeScanner({ onScan: handleScanResult, enabled: true });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search on load
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = useCallback((product: typeof products[0]) => {
    if (product.stock <= 0) return;
    onAddToCart({ productId: product.id, name: product.name, nameSw: product.nameSw, price: product.price, quantity: 1, maxQty: product.stock });
    setSearchQuery("");
    setShowResults(false);
    inputRef.current?.focus();
  }, [onAddToCart]);

  const handleProcessSale = useCallback(() => {
    if (!paymentMethod || cart.length === 0) return;
    const details: Record<string, string | number> = {};
    if (paymentMethod === "mpesa") details.phone = mpesaPhone;
    if (paymentMethod === "cash") details.cashTendered = Number(cashTendered);
    if (paymentMethod === "bank") details.reference = bankRef;
    if (paymentMethod === "credit") details.customerId = creditCustomer;
    onProcessSale(paymentMethod, details);
  }, [paymentMethod, cart, mpesaPhone, cashTendered, bankRef, creditCustomer, onProcessSale]);

  const containerStyle = maxHeight ? { maxHeight: `${maxHeight}px` } : undefined;

  return (
    <div className="flex flex-col" style={containerStyle}>
      {/* ===== ZONE 1: PRODUCT ENTRY ===== */}
      <div className="flex-shrink-0">
        {/* Search + Scanner inline */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                placeholder={locale === "sw" ? "Tafuta bidhaa..." : "Search products..."}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 transition-colors min-h-[40px]"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowResults(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 w-6 h-6 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
            <button onClick={() => setShowCamera(true)} className="p-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" title={locale === "sw" ? "Skana" : "Scan"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            {cart.length > 0 && (
              <button onClick={onClearCart} className="p-2 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" title={locale === "sw" ? "Futa" : "Clear"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            )}
          </div>

          {/* Hold/Recall + AI Suggestions row */}
          <div className="flex items-center justify-between mt-1.5">
            <HoldSales locale={locale} cart={cart} onRecall={(items) => items.forEach((i) => onAddToCart(i))} onClearCart={onClearCart} />
            <AISuggestions locale={locale} cart={cart} products={products} onAddProduct={handleAddProduct} />
          </div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {showResults && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-lg overflow-hidden"
              >
                {products.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 5).map((p) => (
                  <button key={p.id} onClick={() => handleAddProduct(p)} disabled={p.stock <= 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-terracotta-50/50 dark:hover:bg-terracotta-900/10 transition-colors disabled:opacity-40 min-h-[44px]">
                    <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[9px] font-mono text-warm-400 flex-shrink-0">{p.sku.slice(-3)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                      <p className="text-[10px] text-warm-400">Stock: {p.stock}</p>
                    </div>
                    <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.price}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan feedback */}
        <AnimatePresence>
          {scanFeedback && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className={`mt-1.5 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-medium ${
                scanFeedback.type === "success" ? "bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400" : "bg-red-50 dark:bg-red-900/20 text-red-600"
              }`}>
                {scanFeedback.type === "success" ? "✓" : "✗"} {scanFeedback.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state: Quick actions row */}
        {cart.length === 0 && !searchQuery && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-2 space-y-2">
            {/* Scan barcode CTA */}
            <button onClick={() => setShowCamera(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500/10 to-savanna-500/10 border border-terracotta-200/40 dark:border-terracotta-700/40 text-terracotta-600 dark:text-terracotta-400 font-heading font-bold text-xs hover:from-terracotta-500/15 hover:to-savanna-500/15 active:scale-[0.98] transition-all min-h-[44px]">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </motion.span>
              {locale === "sw" ? "Skana Barcode" : "Scan Barcode"}
            </button>

            {/* Quick category filters */}
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-1 px-1">
              {[
                { label: locale === "sw" ? "Nafaka" : "Cereals", icon: "🌾" },
                { label: locale === "sw" ? "Mafuta" : "Oil", icon: "🫒" },
                { label: locale === "sw" ? "Sabuni" : "Soap", icon: "🧼" },
                { label: locale === "sw" ? "Vinywaji" : "Drinks", icon: "🥤" },
                { label: locale === "sw" ? "Dawa" : "Toiletries", icon: "🧴" },
              ].map((cat) => (
                <button key={cat.label}
                  onClick={() => { setSearchQuery(cat.label.toLowerCase()); setShowResults(true); }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/40 dark:bg-warm-800/40 border border-warm-200/30 dark:border-warm-700/30 hover:bg-terracotta-50/40 dark:hover:bg-terracotta-900/10 active:scale-95 transition-all min-h-[32px]">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-[11px] font-medium text-warm-700 dark:text-warm-300 whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Recent products */}
            <div>
              <p className="text-[10px] text-warm-400 font-medium mb-1 uppercase tracking-wider">{locale === "sw" ? "Bidhaa za Hivi Karibuni" : "Recent Products"}</p>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1"
                onWheel={(e) => { if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) { e.currentTarget.scrollLeft += e.deltaY; } }}>
                {recentProducts.map((p) => (
                  <button key={p.id} onClick={() => handleAddProduct(p)} disabled={p.stock <= 0}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-warm-800/50 border border-warm-200/30 dark:border-warm-700/30 hover:bg-terracotta-50/50 dark:hover:bg-terracotta-900/10 active:scale-95 transition-all disabled:opacity-40 min-h-[36px]">
                    <div className="w-6 h-6 rounded bg-warm-100 dark:bg-warm-700 flex items-center justify-center text-[7px] font-mono text-warm-400">{p.sku.slice(-3)}</div>
                    <span className="text-[11px] font-medium text-warm-800 dark:text-warm-200 truncate max-w-[60px]">{p.name}</span>
                    <span className="text-[10px] text-warm-500 tabular-nums whitespace-nowrap">{p.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ===== ZONE 2: CART ITEMS (scrollable) or EMPTY STATE ===== */}
      <div className="flex-1 overflow-y-auto min-h-0 my-2" style={{ maxHeight: cart.length > 0 ? "40%" : "auto" }}>
        {cart.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div key={item.productId} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className="group flex items-center gap-2 rounded-lg bg-white/50 dark:bg-warm-800/50 border border-warm-200/30 dark:border-warm-700/30 px-2.5 py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate leading-tight">{item.name}</p>
                    <p className="text-[10px] text-warm-400 tabular-nums">KSh {item.price}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-warm-100 dark:bg-warm-700 text-sm font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 active:scale-90 transition-all">−</button>
                    <span className="text-sm font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.productId, Math.min(item.quantity + 1, item.maxQty))}
                      disabled={item.quantity >= item.maxQty}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-warm-100 dark:bg-warm-700 text-sm font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 active:scale-90 transition-all disabled:opacity-40">+</button>
                  </div>
                  <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[3.5rem] text-right">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button onClick={() => onRemoveItem(item.productId)}
                    className="p-1 rounded text-warm-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Rich empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center py-6 px-4 relative overflow-hidden"
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #C75B39 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }} aria-hidden="true" />

            {/* Animated illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-terracotta-100 to-savanna-100 dark:from-terracotta-900/30 dark:to-savanna-900/30 flex items-center justify-center shadow-inner">
                <motion.svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C75B39"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </motion.svg>
              </div>
              {/* Plus badge */}
              <motion.div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Heading */}
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-heading font-extrabold text-base text-warm-900 dark:text-warm-50 mb-1"
            >
              {locale === "sw" ? "Anza Mauzo" : "Start a Sale"}
            </motion.h3>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-warm-500 dark:text-warm-400 max-w-[240px] leading-relaxed mb-1"
            >
              {locale === "sw"
                ? "Skana barcode, tafuta kwa jina, au chagua kutoka bidhaa hapa chini"
                : "Scan a barcode, search by name, or pick from recent products below"}
            </motion.p>

            {/* Subtle scan hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-1.5 text-[10px] text-warm-400"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[9px] font-mono">F2</kbd>
              <span>{locale === "sw" ? "Mauzo Mapya" : "New Sale"}</span>
              <span className="mx-1 text-warm-300">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[9px] font-mono">F1</kbd>
              <span>{locale === "sw" ? "Tafuta" : "Search"}</span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ===== ZONE 3: ACTION PANEL (always visible) ===== */}
      <div className="flex-shrink-0 border-t border-warm-200/60 dark:border-warm-700/60 pt-2">
        {/* Totals - compact inline layout */}
        <div className="flex items-center justify-between text-xs text-warm-500 dark:text-warm-400 mb-0.5">
          <span>{locale === "sw" ? "Jumla" : "Subtotal"}</span>
          <span className="tabular-nums font-medium">KSh {subtotal.toLocaleString()}</span>
        </div>

        {/* Collapsible options */}
        <AnimatePresence>
          {showMoreOptions && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <label className="flex items-center gap-1.5 text-warm-500 cursor-pointer">
                  <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="rounded accent-terracotta-500 w-3 h-3" />
                  VAT 16%
                </label>
                <span className="text-warm-400 tabular-nums">KSh {vat.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs gap-2 mb-0.5">
                <span className="text-warm-500">{locale === "sw" ? "Punguzo" : "Discount"}</span>
                <div className="flex items-center gap-1">
                  {[5, 10, 15].map((pct) => (
                    <button key={pct} onClick={() => setDiscount(Math.round(subtotal * pct / 100))}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 hover:text-terracotta-600 transition-colors min-h-[22px]">
                      {pct}%
                    </button>
                  ))}
                  <input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="0"
                    className="w-16 px-2 py-1 rounded bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs text-right text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[26px] tabular-nums" />
                </div>
              </div>
              {/* Sale notes */}
              <div className="flex items-center gap-2 mb-0.5 mt-1">
                <span className="text-xs text-warm-500 whitespace-nowrap">{locale === "sw" ? "Maelezo" : "Notes"}</span>
                <input type="text" value={saleNote} onChange={(e) => setSaleNote(e.target.value)} placeholder={locale === "sw" ? "Maelezo ya mauzo..." : "Sale notes..."}
                  className="flex-1 px-2 py-1 rounded bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-xs text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[26px]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grand total */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50">{locale === "sw" ? "JUMLA" : "TOTAL"}</span>
            <button onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-[10px] text-warm-400 hover:text-terracotta-500 transition-colors min-h-[24px] flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform ${showMoreOptions ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {locale === "sw" ? "Zaidi" : "More"}
            </button>
          </div>
          <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            className="text-xl font-heading font-extrabold text-terracotta-600 tabular-nums">
            KSh {total.toLocaleString()}
          </motion.span>
        </div>

        {/* Payment buttons - compact horizontal */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {paymentOptions.map((opt) => (
            <button key={opt.key} onClick={() => setPaymentMethod(opt.key)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-white transition-all active:scale-95 min-h-[48px] justify-center ${
                paymentMethod === opt.key ? opt.color + " shadow-md text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"
              }`}>
              <span className="text-base">{opt.icon}</span>
              <span className="text-[10px] font-bold leading-none">{locale === "sw" ? opt.labelSw : opt.label}</span>
            </button>
          ))}
        </div>

        {/* Payment details inline */}
        <AnimatePresence>
          {paymentMethod === "mpesa" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
              <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712 345 678"
                className="w-full px-3 py-2 rounded-lg bg-[#00A650]/10 border border-[#00A650]/30 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-[#00A650] min-h-[40px]" />
            </motion.div>
          )}
          {paymentMethod === "cash" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
              <div className="flex items-center gap-2">
                <input type="number" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} placeholder={locale === "sw" ? "Pesa ulizopewa" : "Cash tendered"}
                  className="flex-1 px-3 py-2 rounded-lg bg-savanna-50 dark:bg-savanna-900/20 border border-savanna-300 dark:border-savanna-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-savanna-500 min-h-[40px] tabular-nums" />
                {changeDue > 0 && (
                  <span className="text-xs text-forest-600 font-bold whitespace-nowrap">Change: KSh {changeDue.toLocaleString()}</span>
                )}
              </div>
            </motion.div>
          )}
          {paymentMethod === "credit" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
              <select value={creditCustomer} onChange={(e) => setCreditCustomer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-sunset-50 dark:bg-sunset-900/20 border border-sunset-300 dark:border-sunset-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-sunset-500 min-h-[40px] appearance-none">
                <option value="">{locale === "sw" ? "Chagua mteja" : "Select customer"}</option>
                {creditCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </motion.div>
          )}
          {paymentMethod === "bank" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
              <input type="text" value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder={locale === "sw" ? "Nambari ya benki" : "Bank reference"}
                className="w-full px-3 py-2 rounded-lg bg-forest-50 dark:bg-forest-900/20 border border-forest-300 dark:border-forest-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-forest-500 min-h-[40px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete sale button */}
        <button
          onClick={handleProcessSale}
          disabled={!paymentMethod || cart.length === 0 || isProcessing}
          className={`w-full py-3 rounded-xl font-heading font-bold text-sm text-white transition-all active:scale-[0.98] min-h-[48px] ${
            isProcessing
              ? "bg-warm-400 cursor-wait"
              : paymentMethod && cart.length > 0
                ? "bg-gradient-to-r from-terracotta-500 to-savanna-500 shadow-lg shadow-terracotta-500/25 hover:shadow-xl"
                : "bg-warm-300 dark:bg-warm-700 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              {locale === "sw" ? "Inashughulikiwa..." : "Processing..."}
            </span>
          ) : (
            <>
              {locale === "sw" ? "Kamilisha Mauzo" : "Complete Sale"}
              {total > 0 && ` · KSh ${total.toLocaleString()}`}
            </>
          )}
        </button>

        {/* Keyboard shortcuts hint */}
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <span className="text-[9px] text-warm-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[8px] font-mono">F2</kbd> {locale === "sw" ? "Mpya" : "New"}
          </span>
          <span className="text-[9px] text-warm-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[8px] font-mono">F5</kbd> M-Pesa
          </span>
          <span className="text-[9px] text-warm-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[8px] font-mono">F6</kbd> Cash
          </span>
        </div>
      </div>

      {/* Camera Scanner */}
      <CameraScanner isOpen={showCamera} onClose={() => setShowCamera(false)}
        onScan={(code) => { setShowCamera(false); handleScanResult(code); }} locale={locale} />
    </div>
  );
}
