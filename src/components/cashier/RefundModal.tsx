"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RefundItem, RefundType, ReturnCondition, RefundMethod } from "@/types/cashier";
import type { Transaction } from "@/data/salesData";
import { useRefundValidation } from "@/hooks/useRefundValidation";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefundComplete: (refund: Record<string, unknown>) => void;
  recentSales: Transaction[];
  products: Array<{ id: string; name: string; stock: number; sku?: string; sellingPrice?: number }>;
  shopSupervisorPin?: string;
}

export default function RefundModal({ isOpen, onClose, onRefundComplete, recentSales, products, shopSupervisorPin }: RefundModalProps) {
  const { validateReturn, createRefundRequest, updateAnalytics } = useRefundValidation(shopSupervisorPin);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundType, setRefundType] = useState<RefundType>("full");
  const [condition, setCondition] = useState<ReturnCondition | "">("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("original");
  const [reason, setReason] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [exchangeItems, setExchangeItems] = useState<{ productId: string; productName: string; qty: number; price: number }[]>([]);
  const [exchangeSearch, setExchangeSearch] = useState("");

  const resetForm = useCallback(() => {
    setStep(1);
    setSearchQuery("");
    setSelectedTransaction(null);
    setRefundItems([]);
    setRefundType("full");
    setCondition("");
    setRefundMethod("original");
    setReason("");
    setSupervisorPin("");
    setValidationErrors([]);
    setValidationWarnings([]);
    setExchangeItems([]);
    setExchangeSearch("");
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredTransactions = recentSales.filter((t) => {
    if (!searchQuery) return t.status === "completed";
    const q = searchQuery.toLowerCase();
    return (
      t.status === "completed" &&
      (t.id.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        (t.customerPhone && t.customerPhone.includes(q)))
    );
  }).slice(0, 10);

  const handleSelectTransaction = (txn: Transaction) => {
    setSelectedTransaction(txn);
    const items: RefundItem[] = txn.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: item.name,
        sku: product?.sku || "",
        originalQty: item.qty,
        returnQty: item.qty,
        unitPrice: item.price,
        totalRefund: item.qty * item.price,
        selected: true,
        condition: "",
      };
    });
    setRefundItems(items);
    setStep(2);
  };

  const toggleItemSelection = (productId: string) => {
    setRefundItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const selected = !item.selected;
        return {
          ...item,
          selected,
          totalRefund: selected ? item.returnQty * item.unitPrice : 0,
        };
      })
    );
  };

  const updateReturnQty = (productId: string, qty: number) => {
    setRefundItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const returnQty = Math.max(0, Math.min(qty, item.originalQty));
        return {
          ...item,
          returnQty,
          totalRefund: item.selected ? returnQty * item.unitPrice : 0,
        };
      })
    );
  };

  const handleValidateAndProcess = () => {
    const validation = validateReturn(selectedTransaction, refundItems, refundType, condition, refundMethod, supervisorPin);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);

    if (validation.isValid && selectedTransaction) {
      const refund = createRefundRequest(
        selectedTransaction,
        refundItems,
        refundType,
        condition as ReturnCondition,
        refundMethod,
        reason,
        supervisorPin
      );

      const selectedItems = refundItems.filter((i) => i.selected);
      const totalRefund = selectedItems.reduce((s, i) => s + i.totalRefund, 0);
      updateAnalytics(totalRefund, condition as ReturnCondition, refundType);

      if (refundType === "exchange" && exchangeItems.length > 0) {
        refund.exchangeItems = exchangeItems;
        const exchangeTotal = exchangeItems.reduce((s, i) => s + i.qty * i.price, 0);
        refund.exchangeDifference = totalRefund - exchangeTotal;
      }

      onRefundComplete(refund as unknown as Record<string, unknown>);
      handleClose();
    }
  };

  const selectedRefundItems = refundItems.filter((i) => i.selected);
  const totalRefundAmount = selectedRefundItems.reduce((s, i) => s + i.totalRefund, 0);
  const exchangeTotal = exchangeItems.reduce((s, i) => s + i.qty * i.price, 0);

  const filteredExchangeProducts = products.filter((p) => {
    if (!exchangeSearch) return true;
    const q = exchangeSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            style={{ backdropFilter: "blur(16px)" }}
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              style={{ maxHeight: "90vh" }}
            >
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Rejesha / Return</h2>
                      <p className="text-[10px] text-warm-400">Step {step} of 4</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5 mt-3">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        step >= s ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Step 1: Receipt Lookup */}
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                        Tafuta Risiti / Find Receipt
                      </label>
                      <div className="relative">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Transaction ID, receipt #, or phone"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px]"
                          style={{ fontSize: "16px" }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2">Recent Transactions</p>
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                        {filteredTransactions.map((txn) => (
                          <button
                            key={txn.id}
                            onClick={() => handleSelectTransaction(txn)}
                            className="w-full text-left p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[56px]"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-warm-900 dark:text-warm-50">
                                  {txn.receiptNo} - {txn.customer}
                                </p>
                                <p className="text-[10px] text-warm-400">
                                  {txn.items.length} items - {txn.date} {txn.time}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                                  KSh {txn.total.toLocaleString()}
                                </p>
                                <p className="text-[9px] text-warm-400 capitalize">{txn.method}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <p className="text-xs text-warm-400 text-center py-4">No transactions found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Items & Condition */}
                {step === 2 && selectedTransaction && (
                  <div className="space-y-4">
                    {/* Transaction summary */}
                    <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{selectedTransaction.receiptNo}</p>
                        <p className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {selectedTransaction.total.toLocaleString()}</p>
                      </div>
                      <p className="text-[10px] text-warm-400">{selectedTransaction.customer} - {selectedTransaction.date}</p>
                    </div>

                    {/* Return type */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">Return Type</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([
                          { key: "full", label: "Full Refund", icon: "\u{1F504}" },
                          { key: "partial", label: "Partial", icon: "\u{2702}\u{FE0F}" },
                          { key: "exchange", label: "Exchange", icon: "\u{1F4E6}" },
                          { key: "store_credit", label: "Store Credit", icon: "\u{1F4B3}" },
                        ] as const).map((rt) => (
                          <button
                            key={rt.key}
                            onClick={() => setRefundType(rt.key)}
                            className={`flex items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium min-h-[44px] transition-all ${
                              refundType === rt.key
                                ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600"
                                : "border-transparent bg-warm-50 dark:bg-warm-800/50 text-warm-600 dark:text-warm-300"
                            }`}
                          >
                            <span>{rt.icon}</span> {rt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Item selection */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                        Select Items to Return
                      </label>
                      <div className="space-y-1.5">
                        {refundItems.map((item) => (
                          <div
                            key={item.productId}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                              item.selected
                                ? "border-terracotta-500/30 bg-terracotta-50/50 dark:bg-terracotta-900/10"
                                : "border-transparent bg-warm-50 dark:bg-warm-800/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItemSelection(item.productId)}
                              className="w-5 h-5 rounded accent-terracotta-500 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{item.productName}</p>
                              <p className="text-[10px] text-warm-400">
                                KSh {item.unitPrice} x {item.originalQty}
                              </p>
                            </div>
                            {item.selected && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => updateReturnQty(item.productId, item.returnQty - 1)}
                                  style={{ minHeight: 0, minWidth: 0 }}
                                  className="w-6 h-6 rounded-md bg-warm-200 dark:bg-warm-700 text-xs font-bold flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-bold tabular-nums">{item.returnQty}</span>
                                <button
                                  onClick={() => updateReturnQty(item.productId, item.returnQty + 1)}
                                  style={{ minHeight: 0, minWidth: 0 }}
                                  className="w-6 h-6 rounded-md bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                        Hali ya Bidhaa / Condition
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([
                          { key: "damaged", label: "Damaged", labelSw: "Kuharibika" },
                          { key: "wrong_item", label: "Wrong Item", labelSw: "Bidhaa Makosa" },
                          { key: "expired", label: "Expired", labelSw: "Muda Umeisha" },
                          { key: "changed_mind", label: "Changed Mind", labelSw: "Amebadilisha" },
                          { key: "quality_issue", label: "Quality Issue", labelSw: "Ubora Duni" },
                        ] as const).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => setCondition(c.key)}
                            className={`p-2 rounded-xl text-xs font-medium min-h-[40px] transition-all ${
                              condition === c.key
                                ? "bg-terracotta-500 text-white"
                                : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">Sababu / Reason (optional)</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Additional details about the return..."
                        className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Exchange Items (only for exchange type) or Refund Method */}
                {step === 3 && (
                  <div className="space-y-4">
                    {refundType === "exchange" && (
                      <div>
                        <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                          Exchange Items (select replacement items)
                        </label>

                        {/* Search exchange products */}
                        <div className="relative mb-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            type="search"
                            value={exchangeSearch}
                            onChange={(e) => setExchangeSearch(e.target.value)}
                            placeholder="Search products for exchange..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                          />
                        </div>

                        {/* Exchange product list */}
                        <div className="max-h-[200px] overflow-y-auto space-y-1 mb-3">
                          {filteredExchangeProducts.slice(0, 10).map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setExchangeItems((prev) => {
                                  const exists = prev.find((e) => e.productId === p.id);
                                  if (exists) return prev.map((e) => (e.productId === p.id ? { ...e, qty: e.qty + 1 } : e));
                                  return [...prev, { productId: p.id, productName: p.name, qty: 1, price: p.sellingPrice || 0 }];
                                });
                              }}
                              className="w-full text-left p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[40px]"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-warm-900 dark:text-warm-50">{p.name}</span>
                                <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {(p.sellingPrice || 0).toLocaleString()}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Selected exchange items */}
                        {exchangeItems.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-warm-400 uppercase">Selected for Exchange</p>
                            {exchangeItems.map((item) => (
                              <div key={item.productId} className="flex items-center justify-between p-2 rounded-lg bg-forest-50 dark:bg-forest-900/15">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-warm-900 dark:text-warm-50">{item.productName}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        setExchangeItems((prev) =>
                                          prev
                                            .map((e) => (e.productId === item.productId ? { ...e, qty: e.qty - 1 } : e))
                                            .filter((e) => e.qty > 0)
                                        )
                                      }
                                      style={{ minHeight: 0, minWidth: 0 }}
                                      className="w-5 h-5 rounded bg-warm-200 dark:bg-warm-700 text-[10px] font-bold flex items-center justify-center"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-bold tabular-nums w-4 text-center">{item.qty}</span>
                                    <button
                                      onClick={() =>
                                        setExchangeItems((prev) =>
                                          prev.map((e) => (e.productId === item.productId ? { ...e, qty: e.qty + 1 } : e))
                                        )
                                      }
                                      style={{ minHeight: 0, minWidth: 0 }}
                                      className="w-5 h-5 rounded bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <span className="text-xs font-bold tabular-nums">KSh {(item.qty * item.price).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Exchange difference */}
                        <div className={`p-3 rounded-xl border mt-2 ${totalRefundAmount >= exchangeTotal ? "bg-forest-50 dark:bg-forest-900/15 border-forest-200/60" : "bg-red-50 dark:bg-red-900/15 border-red-200/60"}`}>
                          <div className="flex justify-between text-xs">
                            <span className="text-warm-500">Return value</span>
                            <span className="font-bold tabular-nums">KSh {totalRefundAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-warm-500">Exchange value</span>
                            <span className="font-bold tabular-nums">KSh {exchangeTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2 pt-2 border-t border-warm-200/60 dark:border-warm-700/60">
                            <span className="font-medium">{totalRefundAmount >= exchangeTotal ? "Refund to customer" : "Customer pays"}</span>
                            <span className={`font-heading font-extrabold tabular-nums ${totalRefundAmount >= exchangeTotal ? "text-forest-600" : "text-red-500"}`}>
                              KSh {Math.abs(totalRefundAmount - exchangeTotal).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Refund Method */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                        Njia ya Kurejesha / Refund Method
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([
                          { key: "original", label: "Original Method", icon: "\u{1F504}" },
                          { key: "cash", label: "Cash", icon: "\u{1F4B5}" },
                          { key: "mpesa", label: "M-Pesa", icon: "\u{1F4F2}" },
                          { key: "store_credit", label: "Store Credit", icon: "\u{1F4B3}" },
                        ] as const).map((m) => (
                          <button
                            key={m.key}
                            onClick={() => setRefundMethod(m.key)}
                            className={`flex items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium min-h-[44px] transition-all ${
                              refundMethod === m.key
                                ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600"
                                : "border-transparent bg-warm-50 dark:bg-warm-800/50 text-warm-600 dark:text-warm-300"
                            }`}
                          >
                            <span>{m.icon}</span> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-warm-500">Items to return</span>
                        <span className="font-bold">{selectedRefundItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-warm-900 dark:text-warm-50">Refund Amount</span>
                        <span className="font-heading font-extrabold text-red-500 tabular-nums">
                          KSh {totalRefundAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Supervisor PIN & Confirm */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <p className="text-[10px] font-medium text-warm-400 uppercase mb-2">Return Summary</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">Receipt</span>
                          <span className="font-medium text-warm-900 dark:text-warm-50">{selectedTransaction?.receiptNo}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">Return Type</span>
                          <span className="font-medium text-warm-900 dark:text-warm-50 capitalize">{refundType.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">Items</span>
                          <span className="font-medium text-warm-900 dark:text-warm-50">
                            {selectedRefundItems.map((i) => `${i.productName} x${i.returnQty}`).join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">Condition</span>
                          <span className="font-medium text-warm-900 dark:text-warm-50 capitalize">{condition?.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">Refund Method</span>
                          <span className="font-medium text-warm-900 dark:text-warm-50 capitalize">{refundMethod.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-warm-200/60 dark:border-warm-700/60">
                          <span className="font-medium">Refund Amount</span>
                          <span className="font-heading font-extrabold text-red-500 tabular-nums">
                            KSh {totalRefundAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Supervisor PIN */}
                    <div>
                      <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Supervisor PIN (required)
                      </label>
                      <input
                        type="password"
                        value={supervisorPin}
                        onChange={(e) => setSupervisorPin(e.target.value)}
                        placeholder="Enter supervisor PIN"
                        className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px] font-mono text-center tracking-widest"
                        style={{ fontSize: "18px" }}
                        autoFocus
                      />
                      <p className="text-[10px] text-warm-400 mt-1 text-center">Default PIN: 1234</p>
                    </div>

                    {/* Validation errors & warnings */}
                    {validationErrors.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/60">
                        {validationErrors.map((err, i) => (
                          <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {err}
                          </p>
                        ))}
                      </div>
                    )}
                    {validationWarnings.length > 0 && (
                      <div className="p-3 rounded-xl bg-savanna-50 dark:bg-savanna-900/15 border border-savanna-200/60">
                        {validationWarnings.map((warn, i) => (
                          <p key={i} className="text-xs text-savanna-600 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {warn}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 p-4">
                <div className="flex gap-2">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px]"
                    >
                      Back
                    </button>
                  )}
                  {step < 4 && (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      disabled={step === 1 ? !selectedTransaction : step === 2 ? selectedRefundItems.length === 0 || !condition : false}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-40 active:scale-[0.98] transition-transform"
                    >
                      Continue
                    </button>
                  )}
                  {step === 4 && (
                    <button
                      onClick={handleValidateAndProcess}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] active:scale-[0.98] transition-transform shadow-md shadow-terracotta-500/20"
                    >
                      Process Return
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
