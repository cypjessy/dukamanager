"use client";

import { useState } from "react";
import type { ReturnRequest, ReturnReason, RefundMethod, ReturnCondition } from "@/data/returnData";
import { reasonConfig, statusConfig } from "@/data/returnData";
import type { Locale } from "@/types";

interface ReturnProcessorProps {
  locale: Locale;
  onProcess: (returnData: Partial<ReturnRequest>) => void;
}

export default function ReturnProcessor({ locale, onProcess }: ReturnProcessorProps) {
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
    onProcess({ refundAmount, refundMethod, reason: selectedReason || "defective", condition });
    setStep(1);
    setReceiptNo("");
  };

  return (
    <div className="space-y-4">
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
                    <span className="text-base">{m === "mpesa" ? "\u{1F4F2}" : m === "cash" ? "\u{1F4B5}" : m === "credit" ? "\u{1F4B3}" : "\u{1F504}"}</span>
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

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Rejesho la Mtoa Huduma" : "Supplier Returns"}</h3>
        <div className="space-y-2">
          {[
            { supplier: "CCBA Kenya", items: "Coca-Cola 500ml x2", value: 1080, status: "processing" as const },
            { supplier: "Unga Group", items: "Pembe Flour 2kg x5", value: 600, status: "approved" as const },
          ].map((sr, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <div>
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{sr.supplier}</p>
                <p className="text-[10px] text-warm-400">{sr.items}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {sr.value.toLocaleString()}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusConfig[sr.status].color}`}>{statusConfig[sr.status].label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
