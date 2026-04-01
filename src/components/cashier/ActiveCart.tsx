"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/app/cashier/page";

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  creditBalance: number;
}

interface ActiveCartProps {
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  subtotal: number;
  grandTotal: number;
  selectedCustomerId: string | null;
  onCustomerChange: (id: string | null) => void;
  onPayment: (method: "mpesa" | "cash" | "credit" | "bank" | "split") => void;
  customers: CustomerOption[];
}

export default function ActiveCart({ cart, onUpdateQty, onRemove, subtotal, grandTotal, selectedCustomerId, onCustomerChange, onPayment, customers }: ActiveCartProps) {
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Customer selection */}
      <div className="flex-shrink-0 p-3 pb-2">
        <select value={selectedCustomerId || ""} onChange={(e) => onCustomerChange(e.target.value || null)}
          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 appearance-none min-h-[44px]"
          style={{ fontSize: "16px" }}>
          <option value="">Walk-in Customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
        </select>
        {selectedCustomer && selectedCustomer.creditLimit > 0 && (
          <div className="flex items-center gap-2 mt-1.5 px-2 py-1 rounded-lg bg-warm-50 dark:bg-warm-800/50">
            <span className="text-[10px] text-warm-400">Credit:</span>
            <span className="text-[10px] font-bold tabular-nums text-warm-600 dark:text-warm-300">
              KSh {selectedCustomer.creditBalance.toLocaleString()} / {selectedCustomer.creditLimit.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            </div>
            <p className="text-sm font-medium text-warm-500 mb-1">Cart is empty</p>
            <p className="text-xs text-warm-400">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div key={item.product.id}
                  layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-warm-800/50 border border-warm-100 dark:border-warm-800">
                  <CartItemThumbnail product={item.product} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-warm-400 tabular-nums">KSh {item.product.sellingPrice} x {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                    KSh {(item.qty * item.product.sellingPrice).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => onUpdateQty(item.product.id, item.qty - 1)}
                      style={{ minHeight: 0, minWidth: 0 }}
                      className="w-6 h-6 rounded-md bg-warm-100 dark:bg-warm-700 text-xs font-bold flex items-center justify-center active:scale-90">-</button>
                    <button onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                      style={{ minHeight: 0, minWidth: 0 }}
                      className="w-6 h-6 rounded-md bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center active:scale-90">+</button>
                    <button onClick={() => onRemove(item.product.id)}
                      style={{ minHeight: 0, minWidth: 0 }}
                      className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center active:scale-90 ml-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Totals and payment */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 p-3 space-y-2">
          <div className="flex justify-between text-xs text-warm-500">
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span className="tabular-nums">KSh {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-end pt-1">
            <span className="text-xs font-medium text-warm-500">TOTAL</span>
            <span className="text-2xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">
              KSh {grandTotal.toLocaleString()}
            </span>
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => onPayment("mpesa")}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#00A650] text-white text-xs font-bold min-h-[48px] active:scale-[0.98] shadow-md shadow-[#00A650]/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              M-Pesa
            </button>
            <button onClick={() => onPayment("cash")}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-terracotta-500 text-white text-xs font-bold min-h-[48px] active:scale-[0.98] shadow-md shadow-terracotta-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Cash
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onPayment("credit")} className="py-2 rounded-lg bg-savanna-50 dark:bg-savanna-900/15 text-savanna-600 text-[10px] font-medium min-h-[36px]">Credit</button>
            <button onClick={() => onPayment("bank")} className="py-2 rounded-lg bg-forest-50 dark:bg-forest-900/15 text-forest-600 text-[10px] font-medium min-h-[36px]">Bank</button>
            <button onClick={() => onPayment("split")} className="py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-500 text-[10px] font-medium min-h-[36px]">Split</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemThumbnail({ product }: { product: CartItem["product"] }) {
  const [err, setErr] = useState(false);
  const hasImage = product.imageUrl && product.imageUrl.length > 5 && !err;
  if (hasImage) {
    return (
      <img src={product.imageUrl} alt={product.name}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-warm-200/60 dark:border-warm-700/60"
        onError={() => setErr(true)} />
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-800 dark:to-warm-700 flex items-center justify-center flex-shrink-0 border border-warm-200/60 dark:border-warm-700/60">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}
