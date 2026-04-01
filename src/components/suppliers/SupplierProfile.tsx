"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Supplier } from "@/data/supplierData";
import { supplierProducts, purchaseOrders, performanceMetrics, paymentTermLabels } from "@/data/supplierData";
import type { Locale } from "@/types";

interface SupplierProfileProps {
  supplier: Supplier | null;
  locale: Locale;
  onClose: () => void;
  onNewOrder: (supplier: Supplier) => void;
}

type ProfileTab = "details" | "products" | "orders" | "performance";

const tabs: { key: ProfileTab; label: string; labelSw: string }[] = [
  { key: "details", label: "Details", labelSw: "Maelezo" },
  { key: "products", label: "Products", labelSw: "Bidhaa" },
  { key: "orders", label: "Orders", labelSw: "Maagizo" },
  { key: "performance", label: "Performance", labelSw: "Utendaji" },
];

const orderStatusColors: Record<string, string> = {
  pending: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  confirmed: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  in_transit: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400",
  delivered: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export default function SupplierProfile({ supplier, locale, onClose, onNewOrder }: SupplierProfileProps) {
  const [tab, setTab] = useState<ProfileTab>("details");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!supplier) return null;

  const products = supplierProducts.filter((p) => p.supplierId === supplier.id);
  const orders = purchaseOrders.filter((o) => o.supplierId === supplier.id);
  const metrics = performanceMetrics.find((m) => m.supplierId === supplier.id);
  const terms = paymentTermLabels[supplier.paymentTerms];
  const initials = supplier.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <motion.div
          ref={dialogRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-glass-lg overflow-y-auto"
          role="dialog" aria-modal="true" aria-label={`${supplier.name} profile`}
        >
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-warm-900/90 backdrop-blur-sm border-b border-warm-200/60 dark:border-warm-700/60">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
                  <span className="text-white font-heading font-extrabold text-sm">{initials}</span>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">{supplier.name}</h2>
                  <p className="text-xs text-warm-400">{supplier.contactPerson}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex px-5 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-h-[36px] ${tab === t.key ? "border-terracotta-500 text-terracotta-600" : "border-transparent text-warm-400 hover:text-warm-600"}`}>
                  {locale === "sw" ? t.labelSw : t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {tab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{supplier.phone}</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Region</p>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{supplier.region}</p>
                  </div>
                  {supplier.email && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 col-span-2">
                    <p className="text-[10px] text-warm-400 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{supplier.email}</p>
                  </div>}
                  {supplier.kraPin && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">KRA PIN</p>
                    <p className="text-sm font-mono font-medium text-warm-900 dark:text-warm-50">{supplier.kraPin}</p>
                  </div>}
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Payment Terms</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${terms.color}`}>{terms.label}</span>
                  </div>
                  {supplier.mpesaPaybill && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">M-Pesa Paybill</p>
                    <p className="text-sm font-mono font-medium text-[#00A650]">{supplier.mpesaPaybill}</p>
                  </div>}
                  {supplier.bankName && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Bank</p>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{supplier.bankName}</p>
                    <p className="text-xs font-mono text-warm-400">{supplier.bankAccount}</p>
                  </div>}
                </div>
                <button onClick={() => onNewOrder(supplier)} className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[48px]">
                  {locale === "sw" ? "Tuma Agizo Mpya" : "Create New Order"}
                </button>
              </div>
            )}

            {tab === "products" && (
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <div>
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{p.name}</p>
                      <p className="text-xs text-warm-400">{p.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.lastPurchasePrice}</p>
                      <span className={`text-[10px] font-medium ${p.available ? "text-forest-500" : "text-red-500"}`}>{p.available ? "Available" : "Unavailable"}</span>
                    </div>
                  </div>
                ))}
                {products.length === 0 && <p className="text-sm text-warm-400 text-center py-6">No products catalog</p>}
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50">{order.id}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${orderStatusColors[order.status]}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-warm-500 dark:text-warm-400">
                      <span>{order.orderDate}</span>
                      <span className="font-semibold text-warm-900 dark:text-warm-50 tabular-nums">KSh {order.total.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-warm-400 mt-1">{order.items.length} items</p>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-sm text-warm-400 text-center py-6">No orders yet</p>}
              </div>
            )}

            {tab === "performance" && metrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">On-Time</p>
                    <p className={`text-lg font-heading font-extrabold ${metrics.onTimeRate >= 90 ? "text-forest-600" : metrics.onTimeRate >= 80 ? "text-savanna-600" : "text-red-500"}`}>{metrics.onTimeRate}%</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Accuracy</p>
                    <p className={`text-lg font-heading font-extrabold ${metrics.accuracyRate >= 95 ? "text-forest-600" : metrics.accuracyRate >= 90 ? "text-savanna-600" : "text-red-500"}`}>{metrics.accuracyRate}%</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Price Stable</p>
                    <p className={`text-lg font-heading font-extrabold ${metrics.priceStability >= 85 ? "text-forest-600" : metrics.priceStability >= 70 ? "text-savanna-600" : "text-red-500"}`}>{metrics.priceStability}%</p>
                  </div>
                </div>
                <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-warm-400">Total Orders</span><span className="font-bold text-warm-900 dark:text-warm-50">{metrics.totalOrders}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-warm-400">Total Spend</span><span className="font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {metrics.totalSpend.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-warm-400">Avg Order</span><span className="font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {metrics.avgOrderValue.toLocaleString()}</span></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
