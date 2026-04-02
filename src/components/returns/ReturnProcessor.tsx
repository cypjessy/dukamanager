"use client";

import { useState } from "react";
import type { ReturnRequest, ReturnReason, RefundMethod, ReturnCondition } from "@/data/returnData";
import { reasonConfig } from "@/data/returnData";
import type { Locale } from "@/types";
import { useSuppliersFirestore } from "@/hooks/useSuppliersFirestore";

interface ReturnProcessorProps {
  locale: Locale;
  onProcess: (returnData: Partial<ReturnRequest>) => void;
}

interface SupplierReturnItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  returnQty: number;
}

export default function ReturnProcessor({ locale, onProcess }: ReturnProcessorProps) {
  const [returnType, setReturnType] = useState<"customer" | "supplier">("customer");

  return (
    <div className="space-y-4">
      {/* Type toggle */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 w-fit">
        <button
          onClick={() => setReturnType("customer")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${
            returnType === "customer" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"
          }`}
        >
          {locale === "sw" ? "Wateja" : "Customer"}
        </button>
        <button
          onClick={() => setReturnType("supplier")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${
            returnType === "supplier" ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"
          }`}
        >
          {locale === "sw" ? "Wasambazaji" : "Supplier"}
        </button>
      </div>

      {returnType === "customer" ? (
        <CustomerReturnFlow locale={locale} onProcess={onProcess} />
      ) : (
        <SupplierReturnFlow locale={locale} onProcess={onProcess} />
      )}
    </div>
  );
}

/* ============================================
   CUSTOMER RETURN FLOW (existing)
   ============================================ */

function CustomerReturnFlow({ locale, onProcess }: { locale: Locale; onProcess: (data: Partial<ReturnRequest>) => void }) {
  const [receiptNo, setReceiptNo] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReturnReason | "">("");
  const [condition, setCondition] = useState<ReturnCondition>("sellable");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("mpesa");
  const [refundAmount, setRefundAmount] = useState(330);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);

  const handleLookup = () => {
    if (receiptNo.length > 3) setStep(2);
  };

  const handleApprove = () => {
    onProcess({
      type: "customer",
      refundAmount,
      refundMethod,
      reason: selectedReason || "defective",
      condition,
      reasonNote: notes,
      originalReceipt: receiptNo,
    });
    setStep(1);
    setReceiptNo("");
    setSelectedReason("");
    setNotes("");
  };

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"} transition-colors`} />
        ))}
      </div>
      <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
        {step === 1 ? (locale === "sw" ? "Tafuta Risiti" : "Find Receipt") : step === 2 ? (locale === "sw" ? "Chagua Sababu" : "Select Reason") : (locale === "sw" ? "Thibitisha" : "Confirm")}
      </h3>

      {step === 1 && (
        <div className="space-y-3">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="search" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} placeholder="Receipt #, Phone, or Date"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px]" />
          </div>
          <button onClick={handleLookup} disabled={receiptNo.length < 3}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40">
            {locale === "sw" ? "Tafuta" : "Look Up Sale"}
          </button>

          <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
            <p className="text-xs text-warm-400 mb-2">Quick recent sales</p>
            {["RCP20001 - Wanjiku M. - KSh 680", "RCP19980 - Baba Karanja - KSh 1,250", "RCP19950 - Mama Fatuma - KSh 920"].map((sale) => (
              <button key={sale} onClick={() => { setReceiptNo(sale.split(" - ")[0]); setStep(2); }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[36px]">
                {sale}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 mb-2">
            <p className="text-xs text-warm-400">Returning from</p>
            <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{receiptNo}</p>
            <p className="text-xs text-warm-500">Elianto Cooking Oil 1L &middot; KSh 330</p>
          </div>

          <div>
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Sababu ya Kurudisha" : "Return Reason"}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["defective", "wrong_item", "changed_mind", "expired", "quality", "size_issue"] as ReturnReason[]).map((reason) => {
                const rc = reasonConfig[reason];
                return (
                  <label key={reason} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer border-2 transition-all min-h-[44px] ${selectedReason === reason ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10" : "border-transparent bg-warm-50 dark:bg-warm-800/50"}`}>
                    <input type="radio" value={reason} checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} className="sr-only" />
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300">{rc.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Hali ya Bidhaa" : "Condition"}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["sellable", "resell_discount", "damaged", "destroyed"] as ReturnCondition[]).map((c) => (
                <button key={c} onClick={() => setCondition(c)}
                  className={`p-2 rounded-xl text-[10px] font-medium min-h-[44px] ${condition === c ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"}`}>
                  {c === "sellable" ? "OK" : c === "resell_discount" ? "Discount" : c === "damaged" ? "Damaged" : "Write Off"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-warm-300 dark:border-warm-600 p-3 text-center cursor-pointer hover:border-terracotta-400 transition-colors min-h-[56px] flex flex-col items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs text-warm-500">{locale === "sw" ? "Pakia Picha" : "Upload Photo (Damaged Goods)"}</span>
          </div>

          <button onClick={() => setStep(3)} disabled={!selectedReason}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40">
            {locale === "sw" ? "Endelea" : "Continue"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Njya ya Kurejesha" : "Refund Method"}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["mpesa", "cash", "credit", "exchange"] as RefundMethod[]).map((m) => (
                <button key={m} onClick={() => setRefundMethod(m)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl min-h-[52px] ${refundMethod === m ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"}`}>
                  <span className="text-base">{m === "mpesa" ? "\uD83D\uDCF2" : m === "cash" ? "\uD83D\uDCB5" : m === "credit" ? "\uD83D\uDCB3" : "\uD83D\uDD04"}</span>
                  <span className="text-[9px] font-medium capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">Refund Amount (KSh)</label>
            <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none min-h-[48px] tabular-nums" />
            {refundAmount <= 500 && <p className="text-xs text-forest-600 mt-1">Auto-approved (under KSh 500)</p>}
            {refundAmount > 500 && <p className="text-xs text-sunset-500 mt-1">Manager approval required</p>}
          </div>

          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={locale === "sw" ? "Maelezo ya ziada" : "Additional notes (optional)"}
            className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none min-h-[60px] resize-none" />

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px]">
              {locale === "sw" ? "Rudi" : "Back"}
            </button>
            <button onClick={handleApprove} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px]">
              {locale === "sw" ? "Kamilisha Rejesho" : "Process Return"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   SUPPLIER RETURN FLOW (new)
   ============================================ */

function SupplierReturnFlow({ locale, onProcess }: { locale: Locale; onProcess: (data: Partial<ReturnRequest>) => void }) {
  const { suppliers, purchaseOrders } = useSuppliersFirestore();
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReturnReason | "">("");
  const [condition, setCondition] = useState<ReturnCondition>("damaged");
  const [notes, setNotes] = useState("");
  const [returnItems, setReturnItems] = useState<SupplierReturnItem[]>([]);
  const [step, setStep] = useState(1);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const supplierOrders = purchaseOrders.filter(
    (o) => o.supplierId === selectedSupplierId && (o.status === "delivered" || o.status === "confirmed" || o.status === "in_transit")
  );
  const selectedOrder = purchaseOrders.find((o) => o.id === selectedOrderId);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = purchaseOrders.find((o) => o.id === orderId);
    if (order) {
      setReturnItems(
        order.items.map((item) => ({
          productId: item.productId || item.name,
          name: item.name,
          qty: item.qty,
          unitPrice: item.unitPrice,
          returnQty: 0,
        }))
      );
    }
  };

  const updateReturnQty = (productId: string, qty: number) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, returnQty: Math.max(0, Math.min(qty, item.qty)) } : item
      )
    );
  };

  const totalRefundValue = returnItems.reduce((sum, item) => sum + item.returnQty * item.unitPrice, 0);
  const hasSelectedItems = returnItems.some((item) => item.returnQty > 0);

  const handleSubmit = () => {
    const items = returnItems
      .filter((item) => item.returnQty > 0)
      .map((item) => ({
        productName: item.name,
        sku: item.productId,
        quantity: item.returnQty,
        unitPrice: item.unitPrice,
        total: item.returnQty * item.unitPrice,
      }));

    onProcess({
      type: "supplier",
      originalReceipt: selectedOrder?.id || "",
      customerName: selectedSupplier?.name || "",
      customerPhone: selectedSupplier?.phone || "",
      items,
      totalValue: totalRefundValue,
      reason: selectedReason || "defective",
      reasonNote: notes,
      condition,
      refundMethod: "credit",
      refundAmount: totalRefundValue,
    });
    setStep(1);
    setSelectedSupplierId("");
    setSelectedOrderId("");
    setReturnItems([]);
    setSelectedReason("");
    setNotes("");
  };

  const supplierReasons: ReturnReason[] = ["defective", "wrong_item", "expired", "quality", "damaged_transit", "overstock", "supplier_error", "breakage"];

  return (
    <div className="space-y-4">
      {/* Step 1: Select Supplier */}
      {step === 1 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
            {locale === "sw" ? "Chagua Msambazaji" : "Select Supplier"}
          </h3>

          {suppliers.length === 0 ? (
            <div className="text-center py-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-300 dark:text-warm-600 mx-auto mb-2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna wasambazaji" : "No suppliers added yet"}</p>
              <p className="text-xs text-warm-400 mt-1">{locale === "sw" ? "Ongeza msambazaji kwanza" : "Add suppliers first from the Suppliers page"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suppliers
                .filter((s) => s.isActive)
                .map((s) => {
                  const orderCount = purchaseOrders.filter((o) => o.supplierId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSupplierId(s.id); setStep(2); }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedSupplierId === s.id
                          ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10"
                          : "border-warm-200 dark:border-warm-700 bg-white/60 dark:bg-warm-800/40 hover:border-warm-300 dark:hover:border-warm-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{s.name}</p>
                          <p className="text-[10px] text-warm-400">{s.phone}{s.location ? ` · ${s.location}` : ""}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-warm-100 dark:bg-warm-700 text-warm-500">
                            {orderCount} {locale === "sw" ? "oda" : "orders"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Order */}
      {step === 2 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setStep(1)} className="p-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-500">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {locale === "sw" ? "Chagua Oda ya" : "Select Order for"} {selectedSupplier?.name}
            </h3>
          </div>

          {supplierOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna oda zilizopatikana" : "No orders found for this supplier"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {supplierOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  delivered: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
                  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                  in_transit: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
                };
                const statusLabels: Record<string, string> = {
                  delivered: locale === "sw" ? "Imewasilishwa" : "Delivered",
                  confirmed: locale === "sw" ? "Imethibitishwa" : "Confirmed",
                  in_transit: locale === "sw" ? "Njiani" : "In Transit",
                };
                return (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedOrderId === order.id
                        ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10"
                        : "border-warm-200 dark:border-warm-700 bg-white/60 dark:bg-warm-800/40 hover:border-warm-300 dark:hover:border-warm-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-warm-400">{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusColors[order.status] || "bg-warm-100 text-warm-500"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-xs text-warm-500">
                      {order.items.length} {locale === "sw" ? "bidhaa" : "items"} &middot; {order.orderDate}
                    </p>
                    <p className="text-sm font-bold text-warm-900 dark:text-warm-50 tabular-nums mt-0.5">
                      KSh {order.total.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {selectedOrderId && (
            <button
              onClick={() => setStep(3)}
              disabled={!hasSelectedItems}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40"
            >
              {locale === "sw" ? "Endelea" : "Continue"}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Select Items to Return */}
      {step === 3 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setStep(2)} className="p-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-500">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {locale === "sw" ? "Bidhaa za Kurudisha" : "Items to Return"}
            </h3>
          </div>

          <div className="space-y-2 mb-4">
            {returnItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{item.name}</p>
                  <p className="text-[10px] text-warm-400">
                    {locale === "sw" ? "Inapatikana" : "Available"}: {item.qty} &middot; KSh {item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  <button
                    onClick={() => updateReturnQty(item.productId, item.returnQty - 1)}
                    className="w-8 h-8 rounded-lg bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums">{item.returnQty}</span>
                  <button
                    onClick={() => updateReturnQty(item.productId, item.returnQty + 1)}
                    className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalRefundValue > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-200/60 dark:border-terracotta-700/30 mb-3">
              <span className="text-xs font-medium text-warm-600 dark:text-warm-300">{locale === "sw" ? "Jumla ya Rejesho" : "Return Total"}</span>
              <span className="text-lg font-heading font-extrabold text-terracotta-600 tabular-nums">KSh {totalRefundValue.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={() => setStep(4)}
            disabled={!hasSelectedItems}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40"
          >
            {locale === "sw" ? "Endelea" : "Continue"}
          </button>
        </div>
      )}

      {/* Step 4: Reason & Confirm */}
      {step === 4 && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setStep(3)} className="p-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-500">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
              {locale === "sw" ? "Sababu na Kuthibitisha" : "Reason & Confirm"}
            </h3>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 mb-4">
            <p className="text-xs text-warm-400 mb-1">{selectedSupplier?.name}</p>
            <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
              {returnItems.filter((i) => i.returnQty > 0).length} {locale === "sw" ? "bidhaa" : "items"} &middot;{" "}
              <span className="text-terracotta-600 font-bold">KSh {totalRefundValue.toLocaleString()}</span>
            </p>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Sababu ya Kurudisha" : "Return Reason"}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {supplierReasons.map((reason) => {
                const rc = reasonConfig[reason];
                return (
                  <label key={reason} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer border-2 transition-all min-h-[44px] ${selectedReason === reason ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10" : "border-transparent bg-warm-50 dark:bg-warm-800/50"}`}>
                    <input type="radio" value={reason} checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} className="sr-only" />
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300">
                      {locale === "sw" ? rc.labelSw : rc.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Condition */}
          <div className="mb-4">
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Hali ya Bidhaa" : "Item Condition"}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["sellable", "resell_discount", "damaged", "destroyed"] as ReturnCondition[]).map((c) => (
                <button key={c} onClick={() => setCondition(c)}
                  className={`p-2 rounded-xl text-[10px] font-medium min-h-[44px] ${condition === c ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"}`}>
                  {c === "sellable" ? "OK" : c === "resell_discount" ? "Discount" : c === "damaged" ? "Damaged" : "Write Off"}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={locale === "sw" ? "Maelezo ya ziada (hiari)" : "Additional notes (optional)"}
            className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none min-h-[60px] resize-none mb-4"
          />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px]"
            >
              {locale === "sw" ? "Rudi" : "Back"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40"
            >
              {locale === "sw" ? "Wasilisha Rejesho" : "Submit Return"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
