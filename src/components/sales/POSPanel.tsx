"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem, PaymentMethod } from "@/data/salesData";
import { getAvailableProducts, creditCustomers } from "@/data/salesData";
import type { Locale } from "@/types";
import Button from "@/components/ui/Button";
import { useBarcodeScanner, playBeep } from "@/hooks/useBarcodeScanner";
import CameraScanner from "./CameraScanner";

interface POSPanelProps {
  locale: Locale;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProcessSale: (paymentMethod: PaymentMethod, details: Record<string, string | number>) => void;
  isProcessing: boolean;
}

const paymentOptions: { key: PaymentMethod; label: string; labelSw: string; color: string }[] = [
  { key: "mpesa", label: "M-Pesa", labelSw: "M-Pesa", color: "bg-[#00A650] text-white" },
  { key: "cash", label: "Cash", labelSw: "Pesa Taslimu", color: "bg-savanna-500 text-white" },
  { key: "credit", label: "Credit", labelSw: "Mkopo", color: "bg-sunset-400 text-white" },
  { key: "bank", label: "Bank", labelSw: "Benki", color: "bg-forest-500 text-white" },
];

export default function POSPanel({
  locale, cart, onAddToCart, onUpdateQty, onRemoveItem, onClearCart, onProcessSale, isProcessing,
}: POSPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [creditCustomer, setCreditCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanFeedback, setScanFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const products = getAvailableProducts();
  const recentProducts = products.slice(0, 5);

  const results = searchQuery.length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameSw.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = vatEnabled ? Math.round(subtotal * 0.16) : 0;
  const total = subtotal + vat - discount;
  const changeDue = paymentMethod === "cash" && Number(cashTendered) >= total ? Number(cashTendered) - total : 0;

  const handleScanResult = useCallback((code: string) => {
    const product = products.find(
      (p) => p.sku.toLowerCase() === code.toLowerCase() ||
             p.id === code
    );

    if (product && product.stock > 0) {
      onAddToCart({
        productId: product.id,
        name: product.name,
        nameSw: product.nameSw,
        price: product.price,
        quantity: 1,
        maxQty: product.stock,
      });
      playBeep(true);
      setScanFeedback({ type: "success", message: `${product.name} added` });
      setTimeout(() => setScanFeedback(null), 1500);
    } else {
      playBeep(false);
      setScanFeedback({ type: "error", message: locale === "sw" ? "Bidhaa haipatikani" : "Product not found" });
      setTimeout(() => setScanFeedback(null), 2000);
    }
  }, [products, onAddToCart, locale]);

  const { status: scannerStatus, showCamera, setShowCamera, manualScan } = useBarcodeScanner({
    onScan: handleScanResult,
    enabled: true,
  });

  const handleManualSubmit = useCallback(() => {
    if (manualCode.trim()) {
      manualScan(manualCode.trim());
      setManualCode("");
      setManualMode(false);
    }
  }, [manualCode, manualScan]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddProduct = useCallback((product: typeof products[0]) => {
    if (product.stock <= 0) return;
    onAddToCart({
      productId: product.id,
      name: product.name,
      nameSw: product.nameSw,
      price: product.price,
      quantity: 1,
      maxQty: product.stock,
    });
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

  return (
    <div className="flex flex-col h-full">
      {/* Scanner Status Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Scanner status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
            scannerStatus.isConnected
              ? "bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400"
              : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"
          }`}>
            {scannerStatus.isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-500" />
                </span>
                {locale === "sw" ? "Skana Imeunganishwa" : "Scanner Connected"}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {locale === "sw" ? "Hali ya Kamera" : "Camera Mode"}
              </>
            )}
          </div>
          {scannerStatus.lastScan && (
            <span className="text-[11px] text-warm-400 tabular-nums">
              {scannerStatus.lastScan}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Camera scan button */}
          {!scannerStatus.isConnected && (
            <button
              onClick={() => setShowCamera(true)}
              className="p-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label={locale === "sw" ? "Skana kwa kamera" : "Scan with camera"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </button>
          )}
          {/* Manual entry button */}
          <button
            onClick={() => { setManualMode(!manualMode); setTimeout(() => manualInputRef.current?.focus(), 100); }}
            className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
              manualMode
                ? "bg-terracotta-500 text-white"
                : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
            }`}
            aria-label={locale === "sw" ? "Weka nambari" : "Type code"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scan feedback toast */}
      <AnimatePresence>
        {scanFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-3 rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-medium ${
              scanFeedback.type === "success"
                ? "bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            }`}
          >
            {scanFeedback.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            )}
            {scanFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual code entry */}
      <AnimatePresence>
        {manualMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                placeholder={locale === "sw" ? "Weka SKU au barcode..." : "Enter SKU or barcode..."}
                className="flex-1 px-4 py-2.5 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[44px] font-mono"
              />
              <Button variant="primary" size="sm" onClick={handleManualSubmit} disabled={!manualCode.trim()}>
                {locale === "sw" ? "Ongeza" : "Add"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div ref={searchRef} className="relative mb-4">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder={locale === "sw" ? "Tafuta bidhaa au SKU..." : "Search products or SKU..."}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 transition-colors min-h-[48px]"
            aria-label={locale === "sw" ? "Tafuta bidhaa" : "Search products"}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 min-w-[32px] min-h-[32px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-glass-lg overflow-hidden"
            >
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  disabled={p.stock <= 0}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-terracotta-50/50 dark:hover:bg-terracotta-900/10 active:bg-terracotta-100/50 transition-colors disabled:opacity-40 min-h-[52px]"
                >
                  <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[10px] font-mono text-warm-400 flex-shrink-0">
                    {p.sku.slice(-3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{p.name}</p>
                    <p className="text-xs text-warm-400">{p.category} &middot; Stock: {p.stock}</p>
                  </div>
                  <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.price}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent products (shown when cart is empty and search is empty) */}
      {cart.length === 0 && !searchQuery && (
        <div className="mb-4">
          <p className="text-xs text-warm-400 mb-2 font-medium">{locale === "sw" ? "Bidhaa za Hivi Karibuni" : "Recent Products"}</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {recentProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p)}
                disabled={p.stock <= 0}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200/40 dark:border-warm-700/40 hover:bg-terracotta-50/50 dark:hover:bg-terracotta-900/10 active:scale-95 transition-all disabled:opacity-40 min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[9px] font-mono text-warm-400">
                  {p.sku.slice(-3)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate max-w-[80px]">{p.name}</p>
                  <p className="text-[10px] text-warm-400 tabular-nums">KSh {p.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[120px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-warm-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="text-sm">{locale === "sw" ? "Kikapu ni tupu" : "Cart is empty"}</p>
            <p className="text-xs mt-1">
              {scannerStatus.isConnected
                ? (locale === "sw" ? "Skana bidhaa kuongeza" : "Scan products to add")
                : (locale === "sw" ? "Tafuta au skana bidhaa" : "Search or scan products")}
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200/40 dark:border-warm-700/40 p-3"
            >
              <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[10px] font-mono text-warm-400 flex-shrink-0">
                {item.productId.slice(-3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{item.name}</p>
                <p className="text-xs text-warm-400 tabular-nums">KSh {item.price} each</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-700 text-sm font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 active:scale-90 transition-all"
                  aria-label="Decrease">-</button>
                <span className="text-sm font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[1.5rem] text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.productId, Math.min(item.quantity + 1, item.maxQty))}
                  disabled={item.quantity >= item.maxQty}
                  className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-700 text-sm font-bold text-warm-600 dark:text-warm-300 flex items-center justify-center hover:bg-warm-200 dark:hover:bg-warm-600 active:scale-90 transition-all disabled:opacity-40"
                  aria-label="Increase">+</button>
              </div>
              <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[4.5rem] text-right">
                KSh {(item.price * item.quantity).toLocaleString()}
              </span>
              <button onClick={() => onRemoveItem(item.productId)}
                className="p-1.5 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all"
                aria-label="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-warm-200/60 dark:border-warm-700/60 pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-warm-500 dark:text-warm-400">
          <span>{locale === "sw" ? "Jumla" : "Subtotal"}</span>
          <span className="tabular-nums font-medium">KSh {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-warm-500 dark:text-warm-400 cursor-pointer">
            <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="rounded accent-terracotta-500" />
            VAT (16%)
          </label>
          <span className="text-sm tabular-nums font-medium text-warm-500 dark:text-warm-400">KSh {vat.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-warm-500 dark:text-warm-400">{locale === "sw" ? "Punguzo" : "Discount"}</span>
          <input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="0"
            className="w-24 px-2 py-1 rounded-lg bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-right text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[36px] tabular-nums" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-warm-200/60 dark:border-warm-700/60">
          <span className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{locale === "sw" ? "JUMLA" : "TOTAL"}</span>
          <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-2xl font-heading font-extrabold text-terracotta-600 tabular-nums">
            KSh {total.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {paymentOptions.map((opt) => (
            <button key={opt.key} onClick={() => setPaymentMethod(opt.key)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[48px] active:scale-95 ${paymentMethod === opt.key ? opt.color + " shadow-md" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
              {locale === "sw" ? opt.labelSw : opt.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {paymentMethod === "mpesa" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712 345 678"
                className="w-full px-4 py-3 rounded-xl bg-[#00A650]/10 dark:bg-[#00A650]/20 border border-[#00A650]/30 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-[#00A650] min-h-[48px]"
                aria-label="M-Pesa phone number" />
              <p className="text-xs text-[#00A650] mt-1 font-medium">STK Push will be sent to this number</p>
            </motion.div>
          )}
          {paymentMethod === "cash" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <input type="number" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} placeholder="Cash tendered"
                className="w-full px-4 py-3 rounded-xl bg-savanna-50 dark:bg-savanna-900/20 border border-savanna-300 dark:border-savanna-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-savanna-500 min-h-[48px] tabular-nums"
                aria-label="Cash tendered" />
              {changeDue > 0 && (
                <p className="text-sm text-forest-600 mt-1 font-bold">Change due: KSh {changeDue.toLocaleString()}</p>
              )}
            </motion.div>
          )}
          {paymentMethod === "credit" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <select value={creditCustomer} onChange={(e) => setCreditCustomer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-sunset-50 dark:bg-sunset-900/20 border border-sunset-300 dark:border-sunset-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-sunset-500 min-h-[48px] appearance-none">
                <option value="">-- {locale === "sw" ? "Chagua mteja" : "Select customer"} --</option>
                {creditCustomers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - KSh {c.outstanding.toLocaleString()} outstanding</option>
                ))}
              </select>
            </motion.div>
          )}
          {paymentMethod === "bank" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <input type="text" value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="Bank reference number"
                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 border border-forest-300 dark:border-forest-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-forest-500 min-h-[48px]"
                aria-label="Bank reference" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={onClearCart} className="flex-1">
            {locale === "sw" ? "Futa" : "Clear"}
          </Button>
          <Button size="md" isLoading={isProcessing}
            disabled={!paymentMethod || cart.length === 0 || isProcessing}
            onClick={handleProcessSale}
            className="flex-1">
            {locale === "sw" ? "Kamilisha Mauzo" : "Complete Sale"}
          </Button>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <CameraScanner
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onScan={(code) => { setShowCamera(false); handleScanResult(code); }}
        locale={locale}
      />
    </div>
  );
}
