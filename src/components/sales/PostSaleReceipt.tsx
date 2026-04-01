"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/data/salesData";
import type { Locale } from "@/types";
import { validateKenyanPhone, playBeep } from "@/hooks/useBarcodeScanner";
import {
  generateShopVerificationCode,
  buildShopReceiptSMS,
  buildShopDownloadSummary,
  downloadTextFile,
  logSMSDelivery,
  storeVerificationWithShop,
  registerShopTenant,
  type ShopTenant,
} from "@/lib/shopTenant";
import Button from "@/components/ui/Button";
import ReceiptPrinter from "./ReceiptPrinter";

interface PostSaleReceiptProps {
  transaction: Transaction | null;
  locale: Locale;
  shop: { id: string; name: string; location: string; kraPin?: string; phone?: string };
  onClose: () => void;
}

type DeliveryStatus = "idle" | "sending" | "sent" | "delivered" | "failed";
type ViewMode = "modal" | "panel";

function useViewportInfo() {
  const [info, setInfo] = useState({ width: 1024, height: 768, isDesktop: true, isLandscape: true });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setInfo({ width: w, height: h, isDesktop: w >= 1024, isLandscape: w > h });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return info;
}

export default function PostSaleReceipt({ transaction, locale, shop, onClose }: PostSaleReceiptProps) {
  const [phone, setPhone] = useState(transaction?.customerPhone || "");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [shopTenant, setShopTenant] = useState<ShopTenant | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("modal");
  const [showPrinter, setShowPrinter] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const viewport = useViewportInfo();

  // Register shop and generate verification code on mount
  useEffect(() => {
    if (transaction) {
      const tenant = registerShopTenant(shop);
      setShopTenant(tenant);
      const code = generateShopVerificationCode(tenant.verificationPrefix);
      setVerificationCode(code);
      storeVerificationWithShop(code, tenant.id, tenant.name, transaction);
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [transaction, shop]);

  // Auto-select view mode based on viewport
  useEffect(() => {
    if (viewport.width < 1024) {
      setViewMode("modal");
    } else if (viewport.isLandscape && viewport.height < 700) {
      setViewMode("panel");
    } else {
      setViewMode("modal");
    }
  }, [viewport.width, viewport.isLandscape, viewport.height]);

  const phoneValidation = validateKenyanPhone(phone);
  const smsResult = useMemo(() => {
    return transaction && shopTenant
      ? buildShopReceiptSMS(transaction, verificationCode, shopTenant.name, shopTenant.senderId)
      : { message: "", charCount: 0, smsCount: 0, estimatedCost: 0 };
  }, [transaction, shopTenant, verificationCode]);

  const handleSendSMS = useCallback(async () => {
    if (!transaction || !shopTenant) return;
    const validation = validateKenyanPhone(phone);
    if (!validation.valid) {
      setPhoneError(validation.error || "Invalid phone number");
      phoneRef.current?.focus();
      return;
    }
    setPhoneError(null);
    setDeliveryStatus("sending");
    await new Promise((r) => setTimeout(r, 1800));
    const success = Math.random() > 0.08;
    logSMSDelivery({
      shopId: shopTenant.id, shopName: shopTenant.name, senderId: shopTenant.senderId,
      phone: validation.formatted, transactionId: transaction.id, receiptNo: transaction.receiptNo,
      verificationCode, message: smsResult.message, charCount: smsResult.charCount,
      smsCount: smsResult.smsCount, cost: smsResult.estimatedCost,
      status: success ? "sent" : "failed", carrier: "safaricom",
    });
    if (success) { setDeliveryStatus("sent"); playBeep(true); setTimeout(() => setDeliveryStatus("delivered"), 2500); }
    else { setDeliveryStatus("failed"); playBeep(false); }
  }, [transaction, shopTenant, phone, verificationCode, smsResult]);

  const handleRetry = useCallback(() => { setDeliveryStatus("idle"); setTimeout(handleSendSMS, 100); }, [handleSendSMS]);
  const handleDownload = useCallback(() => {
    if (!transaction || !shopTenant) return;
    downloadTextFile(buildShopDownloadSummary(transaction, verificationCode, shopTenant), `receipt-${transaction.receiptNo}.txt`);
  }, [transaction, verificationCode, shopTenant]);
  const handlePrint = useCallback(() => { setShowPrinter(true); }, []);

  useEffect(() => {
    if (!transaction) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && e.ctrlKey && phoneValidation.valid && deliveryStatus === "idle") handleSendSMS();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [transaction, onClose, phoneValidation.valid, deliveryStatus, handleSendSMS]);

  if (!transaction || !shopTenant) return null;

  const [gradFrom, gradTo] = shopTenant.brandGradient;
  const isMobile = viewport.width < 1024;
  const isSidePanel = viewMode === "panel" && viewport.width >= 1024;

  return (
    <AnimatePresence>
      {transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 print:hidden"
            style={{ backgroundColor: isSidePanel ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose} aria-hidden="true"
          />

          {/* Success checkmark */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center print:hidden">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-forest-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Receipt Container - adapts based on screen size */}
          {isMobile ? (
            /* Mobile: Full screen */
            <motion.div
              initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 bg-white dark:bg-warm-900 flex flex-col print:hidden"
              role="dialog" aria-modal="true">
              <ReceiptContent
                transaction={transaction} locale={locale} shopTenant={shopTenant}
                verificationCode={verificationCode} smsResult={smsResult}
                phone={phone} setPhone={setPhone} phoneError={phoneError} setPhoneError={setPhoneError}
                phoneValidation={phoneValidation} phoneRef={phoneRef}
                deliveryStatus={deliveryStatus} handleSendSMS={handleSendSMS} handleRetry={handleRetry}
                handleDownload={handleDownload} handlePrint={handlePrint} onClose={onClose}
                gradFrom={gradFrom} gradTo={gradTo} isMobile={true} viewMode="modal"
                onToggleView={() => {}}
              />
            </motion.div>
          ) : isSidePanel ? (
            /* Desktop: Side Panel */
            <motion.div
              initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 bg-white dark:bg-warm-900 flex flex-col shadow-2xl print:hidden"
              style={{ width: "min(40vw, 480px)", maxWidth: "100vw" }}
              role="dialog" aria-modal="true">
              <ReceiptContent
                transaction={transaction} locale={locale} shopTenant={shopTenant}
                verificationCode={verificationCode} smsResult={smsResult}
                phone={phone} setPhone={setPhone} phoneError={phoneError} setPhoneError={setPhoneError}
                phoneValidation={phoneValidation} phoneRef={phoneRef}
                deliveryStatus={deliveryStatus} handleSendSMS={handleSendSMS} handleRetry={handleRetry}
                handleDownload={handleDownload} handlePrint={handlePrint} onClose={onClose}
                gradFrom={gradFrom} gradTo={gradTo} isMobile={false} viewMode="panel"
                onToggleView={() => setViewMode("modal")}
              />
            </motion.div>
          ) : (
            /* Desktop: Centered Modal */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:hidden" role="dialog" aria-modal="true">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{
                  width: "min(90vw, 440px)",
                  maxHeight: "calc(100vh - 48px)",
                  height: "auto",
                }}>
                <ReceiptContent
                  transaction={transaction} locale={locale} shopTenant={shopTenant}
                  verificationCode={verificationCode} smsResult={smsResult}
                  phone={phone} setPhone={setPhone} phoneError={phoneError} setPhoneError={setPhoneError}
                  phoneValidation={phoneValidation} phoneRef={phoneRef}
                  deliveryStatus={deliveryStatus} handleSendSMS={handleSendSMS} handleRetry={handleRetry}
                  handleDownload={handleDownload} handlePrint={handlePrint} onClose={onClose}
                  gradFrom={gradFrom} gradTo={gradTo} isMobile={false} viewMode="modal"
                  onToggleView={() => setViewMode("panel")}
                />
              </motion.div>
            </div>
          )}

          {/* Print view */}
          <div className="hidden print:block print:fixed print:inset-0 print:bg-white" id="receipt-content">
            <ReceiptContent
              transaction={transaction} locale={locale} shopTenant={shopTenant}
              verificationCode={verificationCode} smsResult={smsResult}
              phone="" setPhone={() => {}} phoneError={null} setPhoneError={() => {}}
              phoneValidation={{ valid: false, formatted: "" }} phoneRef={phoneRef}
              deliveryStatus="idle" handleSendSMS={() => {}} handleRetry={() => {}}
              handleDownload={() => {}} handlePrint={() => {}} onClose={() => {}}
              gradFrom={gradFrom} gradTo={gradTo} isMobile={false} viewMode="modal"
              onToggleView={() => {}}
            />
          </div>

          {/* Printer Options Modal */}
          {showPrinter && shopTenant && (
            <ReceiptPrinter
              transaction={transaction}
              shop={shopTenant}
              verificationCode={verificationCode}
              locale={locale}
              onClose={() => setShowPrinter(false)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ===== Receipt Content Component =====

interface ReceiptContentProps {
  transaction: Transaction;
  locale: Locale;
  shopTenant: ShopTenant;
  verificationCode: string;
  smsResult: { message: string; charCount: number; smsCount: number; estimatedCost: number };
  phone: string;
  setPhone: (p: string) => void;
  phoneError: string | null;
  setPhoneError: (e: string | null) => void;
  phoneValidation: { valid: boolean; formatted: string; error?: string };
  phoneRef: React.RefObject<HTMLInputElement>;
  deliveryStatus: DeliveryStatus;
  handleSendSMS: () => void;
  handleRetry: () => void;
  handleDownload: () => void;
  handlePrint: () => void;
  onClose: () => void;
  gradFrom: string;
  gradTo: string;
  isMobile: boolean;
  viewMode: ViewMode;
  onToggleView: () => void;
}

function ReceiptContent({
  transaction, locale, shopTenant, verificationCode, smsResult,
  phone, setPhone, phoneError, setPhoneError, phoneValidation, phoneRef,
  deliveryStatus, handleSendSMS, handleRetry, handleDownload, handlePrint, onClose,
  gradFrom, gradTo, isMobile, viewMode, onToggleView,
}: ReceiptContentProps) {
  return (
    <>
      {/* Scrollable receipt body */}
      <div className="flex-1 overflow-y-auto receipt-scroll receipt-content" id="receipt-content" style={{ minHeight: 0 }}>
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 text-center border-b border-warm-100 dark:border-warm-800">
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {!isMobile && viewMode === "modal" && (
              <button onClick={onToggleView}
                className="p-2 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                aria-label="Switch to panel view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </button>
            )}
            <button onClick={onClose}
              className="p-2 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
              aria-label={locale === "sw" ? "Funga" : "Close"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-lg"
            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
            {shopTenant.initials}
          </div>
          <h2 className="font-heading font-extrabold text-base text-warm-900 dark:text-warm-50">{shopTenant.name}</h2>
          <p className="text-xs text-warm-500 dark:text-warm-400">{shopTenant.location}</p>
          {shopTenant.kraPin && <p className="text-[10px] text-warm-400 mt-0.5">KRA PIN: {shopTenant.kraPin}</p>}
          <div className="mt-2">
            <span className="text-transparent bg-clip-text font-heading font-bold text-sm"
              style={{ backgroundImage: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
              {locale === "sw" ? "Risiti ya Mauzo" : "Sales Receipt"}
            </span>
          </div>
          <p className="text-[9px] text-warm-300 dark:text-warm-600 mt-0.5">Powered by DukaManager</p>
        </div>

        {/* Meta */}
        <div className="px-5 py-2.5 border-b border-warm-100 dark:border-warm-800">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <div className="flex justify-between"><span className="text-warm-400">Receipt</span><span className="font-mono font-medium text-warm-900 dark:text-warm-50">{transaction.receiptNo}</span></div>
            <div className="flex justify-between"><span className="text-warm-400">{locale === "sw" ? "Tarehe" : "Date"}</span><span className="text-warm-900 dark:text-warm-50">{transaction.date}</span></div>
            <div className="flex justify-between"><span className="text-warm-400">{locale === "sw" ? "Muda" : "Time"}</span><span className="text-warm-900 dark:text-warm-50">{transaction.time}</span></div>
            <div className="flex justify-between"><span className="text-warm-400">Cashier</span><span className="text-warm-900 dark:text-warm-50">{transaction.cashier}</span></div>
          </div>
          <div className="mt-2 rounded-lg border px-3 py-1.5 text-center"
            style={{ background: `linear-gradient(135deg, ${gradFrom}10, ${gradTo}10)`, borderColor: `${gradFrom}30` }}>
            <p className="text-[9px] text-warm-500 dark:text-warm-400 uppercase tracking-wider">Verification</p>
            <p className="font-mono font-extrabold text-base tracking-[0.15em]" style={{ color: gradFrom }}>{verificationCode}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="px-5 py-2 border-b border-warm-100 dark:border-warm-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-warm-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{transaction.customer}</p>
              {transaction.customerPhone && <p className="text-[10px] text-warm-400 tabular-nums">{transaction.customerPhone}</p>}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-2 border-b border-warm-100 dark:border-warm-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-warm-400 uppercase">
                <th className="text-left pb-1 font-medium">{locale === "sw" ? "Bidhaa" : "Item"}</th>
                <th className="text-center pb-1 font-medium">Qty</th>
                <th className="text-right pb-1 font-medium">Price</th>
                <th className="text-right pb-1 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-50 dark:divide-warm-800">
              {transaction.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-1 text-warm-900 dark:text-warm-50 max-w-[100px] truncate">{item.name}</td>
                  <td className="py-1 text-center text-warm-600 dark:text-warm-400 font-mono">{item.qty}</td>
                  <td className="py-1 text-right text-warm-600 dark:text-warm-400 font-mono tabular-nums">{item.price.toLocaleString()}</td>
                  <td className="py-1 text-right text-warm-900 dark:text-warm-50 font-mono tabular-nums font-medium">{(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financials */}
        <div className="px-5 py-2 border-b border-warm-100 dark:border-warm-800">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-warm-500 dark:text-warm-400">{locale === "sw" ? "Jumla" : "Subtotal"}</span><span className="font-mono tabular-nums text-warm-900 dark:text-warm-50">KSh {transaction.subtotal.toLocaleString()}</span></div>
            {transaction.discount > 0 && <div className="flex justify-between"><span className="text-forest-600">{locale === "sw" ? "Punguzo" : "Discount"}</span><span className="font-mono tabular-nums text-forest-600">-KSh {transaction.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between pt-1 border-t border-warm-200/60 dark:border-warm-700/60">
              <span className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50">TOTAL</span>
              <span className="text-base font-heading font-extrabold text-transparent bg-clip-text tabular-nums"
                style={{ backgroundImage: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
                KSh {transaction.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="px-5 py-2 border-b border-warm-100 dark:border-warm-800">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${transaction.method === "mpesa" ? "bg-[#00A650]" : transaction.method === "cash" ? "bg-savanna-500" : transaction.method === "credit" ? "bg-sunset-400" : "bg-forest-500"}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-warm-900 dark:text-warm-50">
                {transaction.method === "mpesa" ? "M-Pesa" : transaction.method === "cash" ? (locale === "sw" ? "Pesa" : "Cash") : transaction.method === "credit" ? (locale === "sw" ? "Mkopo" : "Credit") : "Bank"}
              </p>
              {transaction.mpesaRef && <p className="text-[10px] text-warm-400 tabular-nums">Ref: {transaction.mpesaRef}</p>}
              {transaction.cashTendered && <p className="text-[10px] text-warm-400 tabular-nums">Cash: KSh {transaction.cashTendered.toLocaleString()}{transaction.changeDue && transaction.changeDue > 0 && <span className="text-forest-600 ml-1">Chg: {transaction.changeDue.toLocaleString()}</span>}</p>}
            </div>
          </div>
        </div>

        {/* SMS Section */}
        <div className="px-5 py-3">
          <label className="block text-[10px] font-medium text-warm-500 dark:text-warm-400 mb-1 uppercase tracking-wider">
            {locale === "sw" ? "Tuma risiti kwa SMS" : "Send receipt via SMS"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 text-xs font-medium">+254</span>
            <input ref={phoneRef} type="tel"
              value={phone.startsWith("254") ? phone.slice(3) : phone.startsWith("0") ? phone.slice(1) : phone}
              onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setPhone(raw.length > 0 ? "254" + raw.slice(0, 9) : ""); setPhoneError(null); }}
              placeholder="712 345 678"
              disabled={deliveryStatus !== "idle"}
              className={`w-full pl-11 pr-9 py-2.5 rounded-lg bg-warm-50 dark:bg-warm-800/60 border text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[44px] tabular-nums ${phoneError ? "border-red-400 shake" : "border-warm-200 dark:border-warm-700"} ${deliveryStatus !== "idle" ? "opacity-60" : ""}`}
              aria-label={locale === "sw" ? "Namba ya simu" : "Phone number"} />
            {phoneValidation.valid && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></span>}
          </div>
          {phoneError && <p className="text-[10px] text-red-500 mt-0.5">{phoneError}</p>}
          <p className="text-[10px] mt-1" style={{ color: gradFrom }}>
            From: <span className="font-mono font-bold">{shopTenant.senderId}</span>
          </p>
          {phone.length >= 10 && (
            <div className="mt-2 rounded-lg bg-warm-50 dark:bg-warm-800/50 p-2">
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-medium text-warm-500 uppercase">SMS Preview</span>
                <span className="text-[9px] text-warm-400">{smsResult.charCount}/160 · ~KES {smsResult.estimatedCost.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-warm-600 dark:text-warm-300 font-mono break-all leading-relaxed">{smsResult.message}</p>
            </div>
          )}
        </div>

        {/* Delivery status */}
        <AnimatePresence>
          {deliveryStatus !== "idle" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-2">
              <div className={`rounded-lg p-2 flex items-center gap-2 text-xs ${deliveryStatus === "sending" ? "bg-savanna-50 dark:bg-savanna-900/20" : deliveryStatus === "sent" || deliveryStatus === "delivered" ? "bg-forest-50 dark:bg-forest-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                {deliveryStatus === "sending" && <><svg className="animate-spin h-4 w-4 text-savanna-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="text-savanna-700 dark:text-savanna-400 font-medium">{locale === "sw" ? "Inatuma..." : "Sending..."}</span></>}
                {deliveryStatus === "sent" && <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg><span className="text-forest-700 dark:text-forest-400 font-medium">{locale === "sw" ? "Imetumwa!" : "Sent!"}</span></>}
                {deliveryStatus === "delivered" && <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /><polyline points="17 6 6 17 3.5 14.5" /></svg><span className="text-forest-700 dark:text-forest-400 font-medium">{locale === "sw" ? "Imefikishwa" : "Delivered"}</span></>}
                {deliveryStatus === "failed" && <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg><span className="flex-1 text-red-600 dark:text-red-400 font-medium">{locale === "sw" ? "Imeshindwa" : "Failed"}</span><button onClick={handleRetry} className="text-red-600 font-bold underline">{locale === "sw" ? "Jaribu" : "Retry"}</button></>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom actions */}
      <div className="border-t border-warm-200/60 dark:border-warm-700/60 px-5 py-3 bg-white dark:bg-warm-900 flex-shrink-0 safe-area-bottom">
        <div className="flex gap-2 mb-2">
          <Button variant="primary" size="md" fullWidth isLoading={deliveryStatus === "sending"}
            disabled={!phoneValidation.valid || deliveryStatus !== "idle"} onClick={handleSendSMS}
            iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}>
            {deliveryStatus === "sending" ? (locale === "sw" ? "Inatuma..." : "Sending...") : deliveryStatus === "sent" || deliveryStatus === "delivered" ? (locale === "sw" ? "Imetumwa" : "Sent") : (locale === "sw" ? "Tuma SMS" : "Send SMS")}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownload} className="flex-1"
            iconLeft={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}>
            {locale === "sw" ? "Pakua" : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="flex-1"
            iconLeft={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>}>
            {locale === "sw" ? "Chapisha" : "Print"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1"
            iconLeft={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}>
            {locale === "sw" ? "Maliza" : "Done"}
          </Button>
        </div>
      </div>
    </>
  );
}
