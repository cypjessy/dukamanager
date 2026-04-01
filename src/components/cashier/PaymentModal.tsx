"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  creditBalance: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  method?: "mpesa" | "cash" | "credit" | "bank" | "split";
  onPaymentComplete: (method: string, amount: number) => void;
  customers?: CreditCustomer[];
  shopId?: string;
  receiptCode?: string;
}

type PaymentStatus = "idle" | "processing" | "stk_sent" | "stk_received" | "success" | "failed";

export default function PaymentModal({ isOpen, onClose, total, method: initialMethod, onPaymentComplete, customers = [], shopId, receiptCode }: PaymentModalProps) {
  const [method, setMethod] = useState(initialMethod || "mpesa");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState("");
  const { isMobile } = useResponsiveDialog();

  // M-Pesa state
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [stkStep, setStkStep] = useState<"input" | "sending" | "waiting" | "received">("input");

  // Cash state
  const [cashTendered, setCashTendered] = useState("");
  const cashGiven = Number(cashTendered) || 0;
  const changeDue = cashGiven - total;

  // Credit state
  const [creditCustomerId, setCreditCustomerId] = useState("");
  const [creditConfirmed, setCreditConfirmed] = useState(false);

  // Split state
  const [splitMpesa, setSplitMpesa] = useState(0);
  const [splitCash, setSplitCash] = useState(0);

  // Bank state
  const [bankName, setBankName] = useState("Equity Bank");
  const [bankRef] = useState(() => `DUKA-${Date.now().toString(36).toUpperCase()}`);

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod || "mpesa");
      setStatus("idle"); setError(""); setMpesaPhone(""); setMpesaCode("");
      setStkStep("input"); setCashTendered(""); setCreditCustomerId(""); setCreditConfirmed(false);
      setSplitMpesa(0); setSplitCash(0); setBankName("Equity Bank");
    }
  }, [isOpen, initialMethod]);

  const creditCustomer = customers.find((c) => c.id === creditCustomerId);

  const handleMpesaPay = useCallback(async () => {
    if (!shopId || !mpesaPhone) return;
    setStatus("processing");
    setError("");
    setStkStep("sending");

    try {
      const res = await fetch("/api/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, phone: mpesaPhone, amount: total, receiptCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "M-Pesa request failed");
        setStatus("failed");
        setStkStep("input");
        return;
      }

      setStkStep("waiting");

      // Poll for status
      const checkoutId = data.checkoutRequestId;
      let attempts = 0;
      const maxAttempts = 30;

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          setError("Payment timed out. Please check your phone.");
          setStatus("failed");
          setStkStep("input");
          return;
        }
        attempts++;

        const statusRes = await fetch("/api/mpesa/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutRequestId: checkoutId, shopId }),
        });
        const statusData = await statusRes.json();

        if (statusData.status === "success") {
          setStkStep("received");
          setMpesaCode(statusData.mpesaReceiptNumber || checkoutId.slice(-8));
          setStatus("success");
          setTimeout(() => onPaymentComplete("mpesa", total), 1500);
        } else if (statusData.status === "failed") {
          setError(statusData.resultDesc || "Payment was cancelled or failed");
          setStatus("failed");
          setStkStep("input");
        } else {
          await new Promise((r) => setTimeout(r, 2000));
          return poll();
        }
      };

      await poll();
    } catch {
      setError("Network error. Please try again.");
      setStatus("failed");
      setStkStep("input");
    }
  }, [mpesaPhone, total, onPaymentComplete, shopId, receiptCode]);

  const handleCashPay = useCallback(async () => {
    if (cashGiven < total) return;
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setTimeout(() => onPaymentComplete("cash", cashGiven), 1500);
  }, [cashGiven, total, onPaymentComplete]);

  const handleCreditPay = useCallback(async () => {
    if (!creditCustomer || creditCustomer.creditBalance + total > creditCustomer.creditLimit) return;
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
    setTimeout(() => onPaymentComplete("credit", total), 1500);
  }, [creditCustomer, total, onPaymentComplete]);

  const handleSplitPay = useCallback(async () => {
    if (splitMpesa + splitCash !== total) return;
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
    setTimeout(() => onPaymentComplete("split", total), 1500);
  }, [splitMpesa, splitCash, total, onPaymentComplete]);

  const handleBankPay = useCallback(async () => {
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setTimeout(() => onPaymentComplete("bank", total), 1500);
  }, [total, onPaymentComplete]);

  const canPay = method === "mpesa" ? mpesaPhone.length >= 10 :
    method === "cash" ? cashGiven >= total :
    method === "credit" ? !!creditCustomer && creditConfirmed :
    method === "split" ? splitMpesa + splitCash === total :
    method === "bank" ? !!bankName :
    false;

  const handlePay = useCallback(() => {
    if (method === "mpesa") handleMpesaPay();
    else if (method === "cash") handleCashPay();
    else if (method === "credit") handleCreditPay();
    else if (method === "split") handleSplitPay();
    else if (method === "bank") handleBankPay();
  }, [method, handleMpesaPay, handleCashPay, handleCreditPay, handleSplitPay, handleBankPay]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md" style={{ backdropFilter: "blur(16px)" }}
            onClick={status === "idle" ? onClose : undefined} />

          {isMobile ? (
            <motion.div key="pay-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", borderRadius: "24px 24px 0 0" }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden">
              <PaymentContent method={method} setMethod={setMethod} total={total} status={status}
                mpesaPhone={mpesaPhone} setMpesaPhone={setMpesaPhone} mpesaCode={mpesaCode} setMpesaCode={setMpesaCode} stkStep={stkStep}
                cashTendered={cashTendered} setCashTendered={setCashTendered} cashGiven={cashGiven} changeDue={changeDue}
                creditCustomerId={creditCustomerId} setCreditCustomerId={setCreditCustomerId} creditCustomer={creditCustomer}
                creditConfirmed={creditConfirmed} setCreditConfirmed={setCreditConfirmed}
                splitMpesa={splitMpesa} setSplitMpesa={setSplitMpesa} splitCash={splitCash} setSplitCash={setSplitCash}
                bankName={bankName} setBankName={setBankName} bankRef={bankRef}
                canPay={canPay} error={error} onPay={handlePay} onClose={onClose} customers={customers} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={status === "idle" ? onClose : undefined}>
              <motion.div key="pay-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: "min(520px, calc(100vw - 32px))", maxHeight: "92vh" }}>
                <PaymentContent method={method} setMethod={setMethod} total={total} status={status}
                  mpesaPhone={mpesaPhone} setMpesaPhone={setMpesaPhone} mpesaCode={mpesaCode} setMpesaCode={setMpesaCode} stkStep={stkStep}
                  cashTendered={cashTendered} setCashTendered={setCashTendered} cashGiven={cashGiven} changeDue={changeDue}
                  creditCustomerId={creditCustomerId} setCreditCustomerId={setCreditCustomerId} creditCustomer={creditCustomer}
                  creditConfirmed={creditConfirmed} setCreditConfirmed={setCreditConfirmed}
                  splitMpesa={splitMpesa} setSplitMpesa={setSplitMpesa} splitCash={splitCash} setSplitCash={setSplitCash}
                  bankName={bankName} setBankName={setBankName} bankRef={bankRef}
                  canPay={canPay} error={error} onPay={handlePay} onClose={onClose} customers={customers} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   PAYMENT CONTENT
   ============================================ */

interface PaymentContentProps {
  method: string;
  setMethod: React.Dispatch<React.SetStateAction<"mpesa" | "cash" | "credit" | "bank" | "split">>;
  total: number; status: PaymentStatus;
  mpesaPhone: string; setMpesaPhone: (v: string) => void; mpesaCode: string; setMpesaCode: (v: string) => void; stkStep: string;
  cashTendered: string; setCashTendered: (v: string) => void; cashGiven: number; changeDue: number;
  creditCustomerId: string; setCreditCustomerId: (v: string) => void; creditCustomer: CreditCustomer | undefined;
  creditConfirmed: boolean; setCreditConfirmed: (v: boolean) => void;
  splitMpesa: number; setSplitMpesa: (n: number) => void; splitCash: number; setSplitCash: (n: number) => void;
  bankName: string; setBankName: (v: string) => void; bankRef: string;
  canPay: boolean; error: string; onPay: () => void; onClose: () => void;
  customers: CreditCustomer[];
}

function PaymentContent(p: PaymentContentProps) {
  const { method, setMethod, total, status, mpesaPhone, setMpesaPhone, mpesaCode, setMpesaCode, stkStep,
    cashTendered, setCashTendered, cashGiven, changeDue,
    creditCustomerId, setCreditCustomerId, creditCustomer, creditConfirmed, setCreditConfirmed,
    splitMpesa, setSplitMpesa, splitCash, setSplitCash,
    bankName, setBankName, bankRef,
    canPay, error, onPay, onClose, customers } = p;
  const isProcessing = status !== "idle" && status !== "success" && status !== "failed";
  const showSuccess = status === "success";

  return (
    <>
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4">
              <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}>
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
            <p className="font-heading font-bold text-xl text-warm-900 dark:text-warm-50">Malipo Kamilika!</p>
            <p className="text-sm text-warm-400 mt-1">Payment Received</p>
            <p className="text-3xl font-heading font-extrabold text-forest-600 mt-3 tabular-nums">KSh {total.toLocaleString()}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800" style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">Malipo / Payment</h2>
          <button onClick={onClose} disabled={isProcessing}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[40px]"
            aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Amount */}
        <div className="text-center py-3">
          <p className="text-xs text-warm-400 mb-1">Kiasi / Amount Due</p>
          <p className="text-4xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {total.toLocaleString()}</p>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            { key: "mpesa", label: "M-Pesa", icon: "\uD83D\uDCB3", color: "border-[#00A650] bg-[#00A650]/10 text-[#00A650]" },
            { key: "cash", label: "Cash", icon: "\uD83D\uDCB5", color: "border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" },
            { key: "credit", label: "Credit", icon: "\uD83D\uDCB4", color: "border-savanna-400 bg-savanna-50 dark:bg-savanna-900/15 text-savanna-600" },
            { key: "bank", label: "Bank", icon: "\uD83C\uDFE6", color: "border-forest-400 bg-forest-50 dark:bg-forest-900/15 text-forest-600" },
            { key: "split", label: "Split", icon: "\u2702\uFE0F", color: "border-warm-400 bg-warm-50 dark:bg-warm-800/50 text-warm-600" },
          ]).map((m) => (
            <button key={m.key} onClick={() => { setMethod(m.key as "mpesa" | "cash" | "credit" | "bank" | "split"); }} disabled={isProcessing}
              className={`py-3 rounded-xl border-2 text-sm font-heading font-bold transition-all min-h-[48px] flex items-center justify-center gap-1.5 ${
                method === m.key ? m.color : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400"
              }`}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {/* M-Pesa Payment */}
        {method === "mpesa" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Namba ya Simu / Phone Number</label>
              <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="07XX XXX XXX"
                disabled={stkStep !== "input"}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-[#00A650] min-h-[48px] tabular-nums"
                style={{ fontSize: "16px" }} />
            </div>

            {/* STK Push simulation */}
            {stkStep === "sending" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#00A650]/10 border border-[#00A650]/30 text-center">
                <div className="w-10 h-10 rounded-full border-3 border-[#00A650] border-t-transparent animate-spin mx-auto mb-3" style={{ borderWidth: "3px" }} />
                <p className="text-sm font-medium text-[#00A650]">Tuma Ombi la Malipo...</p>
                <p className="text-xs text-warm-400 mt-1">Sending Payment Request</p>
              </motion.div>
            )}
            {stkStep === "waiting" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#00A650]/10 border border-[#00A650]/30 text-center">
                <div className="w-16 h-20 mx-auto mb-3 rounded-xl bg-warm-800 border-2 border-warm-600 p-2 flex flex-col items-center justify-center">
                  <p className="text-[8px] text-forest-400 font-bold">M-PESA</p>
                  <p className="text-[7px] text-warm-300 mt-0.5">Lipa Na</p>
                  <p className="text-[10px] text-white font-bold mt-0.5">KSh {total.toLocaleString()}</p>
                  <p className="text-[7px] text-warm-400 mt-0.5">DukaManager</p>
                </div>
                <p className="text-sm font-medium text-[#00A650]">Subiri... / Waiting...</p>
                <p className="text-xs text-warm-400 mt-1">Confirm on your phone</p>
              </motion.div>
            )}

            {stkStep === "received" && (
              <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/15 border border-forest-200/60">
                <p className="text-xs font-medium text-forest-700 dark:text-forest-400 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Malipo Yamepokelewa!
                </p>
              </div>
            )}

            {stkStep === "input" && (
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Transaction Code (optional)</label>
                <input type="text" value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  placeholder="e.g. QJK3H7F9KL"
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-[#00A650] font-mono min-h-[48px]"
                  style={{ fontSize: "16px" }} />
              </div>
            )}
          </div>
        )}

        {/* Cash Payment */}
        {method === "cash" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Amount Tendered</label>
              <input type="number" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)}
                placeholder="0" disabled={isProcessing}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-2xl font-heading font-extrabold outline-none focus:border-terracotta-500 text-center tabular-nums min-h-[56px]" />
            </div>
            {/* Denomination buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200, 500, 1000, 2000].map((denom) => (
                <button key={denom} onClick={() => setCashTendered(String((cashGiven || 0) + denom))}
                  disabled={isProcessing}
                  className="py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-sm font-bold hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all min-h-[44px] tabular-nums">
                  +{denom}
                </button>
              ))}
            </div>
            {/* Exact and Clear */}
            <div className="flex gap-2">
              <button onClick={() => setCashTendered(String(total))} disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/15 text-forest-600 text-xs font-bold min-h-[40px]">
                Exact Amount
              </button>
              <button onClick={() => setCashTendered("")} disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-900/15 text-red-500 text-xs font-bold min-h-[40px]">
                Clear
              </button>
            </div>
            {/* Change due */}
            {cashGiven > 0 && changeDue >= 0 && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/15 border border-forest-200/60 dark:border-forest-700/30">
                <p className="text-xs text-forest-600 font-medium">Chenji / Change Due</p>
                <p className="text-2xl font-heading font-extrabold text-forest-600 tabular-nums">KSh {changeDue.toLocaleString()}</p>
              </motion.div>
            )}
            {cashGiven > 0 && cashGiven < total && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/60">
                <p className="text-xs text-red-500 font-medium">Punguza / Shortfall</p>
                <p className="text-xl font-heading font-extrabold text-red-500 tabular-nums">KSh {(total - cashGiven).toLocaleString()}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Credit Payment */}
        {method === "credit" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Select Customer</label>
              <select value={creditCustomerId} onChange={(e) => setCreditCustomerId(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-savanna-500 appearance-none min-h-[48px]"
                style={{ fontSize: "16px" }}>
                <option value="">-- Select Customer --</option>
                {customers.filter((c) => c.creditLimit > 0).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - KSh {(c.creditLimit - c.creditBalance).toLocaleString()} available</option>
                ))}
              </select>
            </div>
            {creditCustomer && (
              <div className="p-3 rounded-xl border border-savanna-200/60 dark:border-savanna-700/30 bg-savanna-50/50 dark:bg-savanna-900/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{creditCustomer.name}</p>
                  <span className="text-[10px] font-mono text-warm-400">{creditCustomer.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-warm-400">Limit</p>
                    <p className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {creditCustomer.creditLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-warm-400">Used</p>
                    <p className="text-xs font-bold text-savanna-600 tabular-nums">KSh {creditCustomer.creditBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-warm-400">Available</p>
                    <p className={`text-xs font-bold tabular-nums ${creditCustomer.creditLimit - creditCustomer.creditBalance >= total ? "text-forest-600" : "text-red-500"}`}>
                      KSh {(creditCustomer.creditLimit - creditCustomer.creditBalance).toLocaleString()}
                    </p>
                  </div>
                </div>
                {creditCustomer.creditBalance + total > creditCustomer.creditLimit && (
                  <p className="text-xs text-red-500 mt-2">Credit limit exceeded!</p>
                )}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={creditConfirmed} onChange={(e) => setCreditConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded accent-savanna-500" disabled={isProcessing} />
                  <span className="text-xs text-warm-600 dark:text-warm-300">Confirm credit sale</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Split Payment */}
        {method === "split" && (
          <div className="space-y-3">
            <p className="text-xs text-warm-500 dark:text-warm-400">Allocate payment between methods</p>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#00A650]">M-Pesa</label>
                <span className="text-[10px] text-warm-400 tabular-nums">KSh {splitMpesa.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={total} step={50} value={splitMpesa}
                onChange={(e) => { const v = Number(e.target.value); setSplitMpesa(v); setSplitCash(total - v); }}
                className="w-full h-2 rounded-lg accent-[#00A650]" disabled={isProcessing} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-terracotta-600">Cash</label>
                <span className="text-[10px] text-warm-400 tabular-nums">KSh {splitCash.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={total} step={50} value={splitCash}
                onChange={(e) => { const v = Number(e.target.value); setSplitCash(v); setSplitMpesa(total - v); }}
                className="w-full h-2 rounded-lg accent-terracotta-500" disabled={isProcessing} />
            </div>
            {/* Quick splits */}
            <div className="flex gap-2">
              <button onClick={() => { const half = Math.round(total / 2 / 50) * 50; setSplitMpesa(half); setSplitCash(total - half); }}
                className="flex-1 py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-600 min-h-[36px]">50/50</button>
              <button onClick={() => { const p70 = Math.round(total * 0.7 / 50) * 50; setSplitMpesa(p70); setSplitCash(total - p70); }}
                className="flex-1 py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-600 min-h-[36px]">70/30</button>
              <button onClick={() => { setSplitMpesa(total); setSplitCash(0); }}
                className="flex-1 py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-600 min-h-[36px]">All M-Pesa</button>
            </div>
            {/* Balance check */}
            <div className={`p-3 rounded-xl border ${splitMpesa + splitCash === total ? "bg-forest-50 dark:bg-forest-900/15 border-forest-200/60" : "bg-red-50 dark:bg-red-900/15 border-red-200/60"}`}>
              <div className="flex justify-between text-sm">
                <span className="text-warm-500">Total allocated</span>
                <span className="font-bold tabular-nums">KSh {(splitMpesa + splitCash).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-warm-400">Remaining</span>
                <span className={`tabular-nums ${splitMpesa + splitCash === total ? "text-forest-600" : "text-red-500"}`}>
                  KSh {(total - splitMpesa - splitCash).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer */}
        {method === "bank" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-forest-50 dark:bg-forest-900/15 border border-forest-200/60 text-center">
              <p className="text-xs text-warm-500 mb-2">Reference Number</p>
              <p className="text-sm font-mono font-bold text-forest-600">{bankRef}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Bank</label>
              <select value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isProcessing}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none appearance-none min-h-[48px]" style={{ fontSize: "16px" }}>
                <option>Equity Bank</option><option>KCB Bank</option><option>Cooperative Bank</option>
                <option>Absa Bank</option><option>Standard Chartered</option><option>Family Bank</option>
              </select>
            </div>
            <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <p className="text-[10px] text-warm-400">Amount to transfer</p>
              <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {total.toLocaleString()}</p>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 p-4"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isProcessing} className="flex-1">Ghairi / Cancel</Button>
          <Button variant="primary" size="md" onClick={onPay} isLoading={isProcessing}
            disabled={!canPay || isProcessing}
            className={`flex-1 ${method === "mpesa" ? "bg-[#00A650] hover:bg-[#009944]" : method === "cash" ? "bg-terracotta-500 hover:bg-terracotta-600" : method === "credit" ? "bg-savanna-500 hover:bg-savanna-600" : "bg-forest-500 hover:bg-forest-600"}`}>
            {isProcessing ? "Inashughulikiwa..." : `Confirm KSh ${total.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </>
  );
}
