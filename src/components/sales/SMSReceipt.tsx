"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/data/salesData";
import type { Locale } from "@/types";
import { validateKenyanPhone, playBeep } from "@/hooks/useBarcodeScanner";
import Button from "@/components/ui/Button";

interface SMSReceiptProps {
  transaction: Transaction | null;
  locale: Locale;
  prefilledPhone?: string;
  onClose: () => void;
}

type DeliveryStatus = "idle" | "sending" | "sent" | "delivered" | "failed";

export default function SMSReceipt({ transaction, locale, prefilledPhone = "", onClose }: SMSReceiptProps) {
  const [phone, setPhone] = useState(prefilledPhone);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const phoneValidation = validateKenyanPhone(phone);
  const charCount = buildSMS(transaction).length;
  const smsCount = Math.ceil(charCount / 160);

  const handleSend = useCallback(async () => {
    if (!transaction) return;

    const validation = validateKenyanPhone(phone);
    if (!validation.valid) {
      setPhoneError(validation.error || "Invalid phone number");
      return;
    }
    setPhoneError(null);
    setDeliveryStatus("sending");

    // Simulate Africa's Talking API call
    await new Promise((r) => setTimeout(r, 1500));

    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    if (success) {
      setDeliveryStatus("sent");
      playBeep(true);
      setTimeout(() => setDeliveryStatus("delivered"), 2000);
    } else {
      setDeliveryStatus("failed");
      playBeep(false);
    }
  }, [transaction, phone]);

  const handleRetry = useCallback(() => {
    setDeliveryStatus("idle");
    handleSend();
  }, [handleSend]);

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {transaction && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-96 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-warm-900 shadow-glass-lg"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "sw" ? "Tuma risiti kwa SMS" : "Send receipt via SMS"}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                  {locale === "sw" ? "Tuma Risiti" : "Send Receipt"}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 min-w-[40px] min-h-[40px] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Receipt summary */}
              <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-warm-500 dark:text-warm-400">{transaction.receiptNo}</span>
                  <span className="text-xs text-warm-500 dark:text-warm-400">{transaction.date} {transaction.time}</span>
                </div>
                <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                  KSh {transaction.total.toLocaleString()}
                </p>
                <p className="text-xs text-warm-400 mt-0.5">
                  {transaction.items.length} {locale === "sw" ? "bidhaa" : "items"} &middot; {transaction.method.toUpperCase()}
                </p>
              </div>

              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">
                  {locale === "sw" ? "Namba ya Simu" : "Phone Number"}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }}
                    placeholder="0712 345 678"
                    disabled={deliveryStatus === "sending" || deliveryStatus === "sent" || deliveryStatus === "delivered"}
                    className={`w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px] tabular-nums ${
                      phoneError ? "border-red-400 dark:border-red-600" : "border-warm-200 dark:border-warm-700"
                    } ${deliveryStatus === "sending" || deliveryStatus === "sent" || deliveryStatus === "delivered" ? "opacity-60" : ""}`}
                    aria-label={locale === "sw" ? "Namba ya simu" : "Phone number"}
                  />
                  {phoneValidation.valid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                  )}
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
                <p className="text-xs text-warm-400 mt-1">
                  {locale === "sw" ? "Format: 0712 345 678 au 254..." : "Format: 0712 345 678 or 254..."}
                </p>
              </div>

              {/* SMS preview */}
              <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-warm-600 dark:text-warm-300">
                    {locale === "sw" ? "Hakiki SMS" : "SMS Preview"}
                  </span>
                  <span className="text-xs text-warm-400">{charCount}/160 ({smsCount} SMS)</span>
                </div>
                <p className="text-xs text-warm-500 dark:text-warm-400 leading-relaxed font-mono">
                  {buildSMS(transaction)}
                </p>
                <p className="text-xs text-warm-400 mt-2">
                  {locale === "sw" ? "Gharama takriban" : "Approx cost"}: KES {(smsCount * 0.50).toFixed(2)}
                </p>
              </div>

              {/* Delivery status */}
              {deliveryStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${
                    deliveryStatus === "sending" ? "bg-savanna-50 dark:bg-savanna-900/20" :
                    deliveryStatus === "sent" || deliveryStatus === "delivered" ? "bg-forest-50 dark:bg-forest-900/20" :
                    "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  {deliveryStatus === "sending" && (
                    <>
                      <svg className="animate-spin h-5 w-5 text-savanna-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      <span className="text-sm text-savanna-700 dark:text-savanna-400">{locale === "sw" ? "Inatuma..." : "Sending..."}</span>
                    </>
                  )}
                  {deliveryStatus === "sent" && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      <span className="text-sm text-forest-700 dark:text-forest-400">{locale === "sw" ? "Imetumwa!" : "Sent!"}</span>
                    </>
                  )}
                  {deliveryStatus === "delivered" && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2"><polyline points="20 6 9 17 4 12" /><polyline points="17 6 6 17 3.5 14.5" /></svg>
                      <span className="text-sm text-forest-700 dark:text-forest-400">{locale === "sw" ? "Imefikishwa" : "Delivered"}</span>
                    </>
                  )}
                  {deliveryStatus === "failed" && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      <div className="flex-1">
                        <span className="text-sm text-red-600 dark:text-red-400">{locale === "sw" ? "Imeshindwa" : "Failed"}</span>
                      </div>
                      <button onClick={handleRetry} className="text-xs text-red-600 font-bold underline min-h-[32px]">
                        {locale === "sw" ? "Jaribu" : "Retry"}
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
                  {deliveryStatus === "delivered" || deliveryStatus === "sent"
                    ? (locale === "sw" ? "Funga" : "Done")
                    : (locale === "sw" ? "Ruka" : "Skip")}
                </Button>
                {deliveryStatus === "idle" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSend}
                    disabled={!phoneValidation.valid}
                    className="flex-1"
                    iconLeft={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    }
                  >
                    {locale === "sw" ? "Tuma SMS" : "Send SMS"}
                  </Button>
                )}
              </div>

              <p className="text-center text-xs text-warm-400 mt-3">
                {locale === "sw"
                  ? "Risiti inatumwa kwa SMS tu — hakuna WhatsApp au barua pepe"
                  : "Receipt sent via SMS only — no WhatsApp or email"}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function buildSMS(transaction: Transaction | null): string {
  if (!transaction) return "";
  const items = transaction.items.map((i) => `${i.name} x${i.qty}`).join(", ");
  return `DukaManager Receipt ${transaction.receiptNo}\n${items}\nTotal: KES ${transaction.total.toLocaleString()}\n${transaction.date} ${transaction.time}\nAsante!`;
}
