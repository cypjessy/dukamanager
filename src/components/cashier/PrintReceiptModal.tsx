"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/app/cashier/page";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import { usePrinter } from "@/hooks/usePrinter";
import Button from "@/components/ui/Button";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  paymentMethod: string;
  transactionId: string;
  receiptCode: string;
  customerPhone?: string | null;
  customerName?: string;
  shopName?: string;
}

type ReceiptMode = "print" | "sms";
type SmsStatus = "idle" | "sending" | "sent" | "error";

export default function PrintReceiptModal({ isOpen, onClose, cartItems, total, paymentMethod, transactionId, receiptCode, customerPhone, customerName, shopName: propShopName }: PrintReceiptModalProps) {
  const printer = usePrinter();
  const [mode, setMode] = useState<ReceiptMode>("print");
  const [smsPhone, setSmsPhone] = useState(customerPhone || "");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [shopName, setShopName] = useState(propShopName || "");
  const { isMobile } = useResponsiveDialog();

  // Auto-switch to SMS if printer not supported on mobile
  useEffect(() => {
    if (isOpen && isMobile && !printer.isSupported) {
      setMode("sms");
    }
  }, [isOpen, isMobile, printer.isSupported]);

  // Update phone when customer changes
  useEffect(() => {
    if (customerPhone) setSmsPhone(customerPhone);
  }, [customerPhone]);

  const handleConnect = useCallback(async () => {
    await printer.connect();
  }, [printer]);

  const handlePrint = useCallback(async () => {
    const name = shopName || "Your Shop";
    const w = 48;
    const sep = "-".repeat(w);
    const center = (t: string) => " ".repeat(Math.max(0, Math.floor((w - t.length) / 2))) + t;
    const row = (l: string, r: string) => l + " ".repeat(Math.max(1, w - l.length - r.length)) + r;

    const lines: string[] = [];
    lines.push(`**CENTER****BOLD**${name.toUpperCase()}**`);
    lines.push(center(new Date().toLocaleString("en-KE")));
    lines.push(sep);
    lines.push(`**BOLD**${row("Code:", receiptCode)}**`);
    lines.push(row("Ref:", transactionId));
    if (customerName) lines.push(row("Customer:", customerName));
    lines.push(row("Payment:", paymentMethod.toUpperCase()));
    lines.push(sep);

    for (const item of cartItems) {
      const itemName = item.product.name.length > w - 8 ? item.product.name.slice(0, w - 11) + "..." : item.product.name;
      lines.push(itemName);
      lines.push(row(`${item.qty} x KSh ${item.product.sellingPrice.toLocaleString()}`, `KSh ${(item.qty * item.product.sellingPrice).toLocaleString()}`));
    }

    lines.push(sep);
    lines.push(`**BOLD**${row("TOTAL:", `KSh ${total.toLocaleString()}`)}**`);
    lines.push(sep);
    lines.push("");
    lines.push("**CENTER**Asante kwa kununua!");
    lines.push(`**CENTER**Code: ${receiptCode}`);
    lines.push("");
    lines.push("---CUT---");

    await printer.print(lines);
  }, [printer, shopName, receiptCode, transactionId, customerName, cartItems, total, paymentMethod]);

  const smsBody = useMemo(() => {
    const name = shopName || "DukaManager";
    const lines: string[] = [];
    lines.push(`${name} - Receipt`);
    lines.push(`Code: ${receiptCode}`);
    lines.push(`Date: ${new Date().toLocaleDateString("en-KE")}`);
    lines.push(`Ref: ${transactionId.slice(-8)}`);
    lines.push("---");
    for (const item of cartItems) {
      lines.push(`${item.product.name} x${item.qty} - KSh ${(item.qty * item.product.sellingPrice).toLocaleString()}`);
    }
    lines.push("---");
    lines.push(`TOTAL: KSh ${total.toLocaleString()}`);
    lines.push(`Payment: ${paymentMethod.toUpperCase()}`);
    lines.push("");
    lines.push(`Code ${receiptCode} ni ya kuthibitisha na kurejesha bidhaa.`);
    lines.push("Keep this code for returns.");
    lines.push(`Asante! - ${name}`);
    return lines.join("\n");
  }, [shopName, receiptCode, transactionId, cartItems, total, paymentMethod]);

  const handleSendSms = useCallback(() => {
    if (!smsPhone) return;
    setSmsStatus("sending");
    fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "receipt",
        to: smsPhone,
        shopName: shopName || "DukaManager",
        amount: total,
        receiptId: receiptCode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSmsStatus("sent");
        } else {
          setSmsStatus("error");
        }
      })
      .catch(() => setSmsStatus("error"));
  }, [smsPhone, shopName, total, receiptCode]);

  const handleClose = useCallback(() => {
    setMode("print");
    setSmsStatus("idle");
    setSmsPhone(customerPhone || "");
    onClose();
  }, [onClose, customerPhone]);

  if (!isOpen) return null;

  const statusConfig = {
    disconnected: { color: "bg-warm-300", label: "Disconnected" },
    detecting: { color: "bg-savanna-500 animate-pulse", label: "Detecting..." },
    connecting: { color: "bg-savanna-500 animate-pulse", label: "Connecting..." },
    connected: { color: "bg-forest-500", label: printer.deviceName || "Connected" },
    printing: { color: "bg-[#00A650] animate-pulse", label: "Printing..." },
    error: { color: "bg-red-500", label: printer.error || "Error" },
  } as Record<string, { color: string; label: string }>;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          {isMobile ? (
            <motion.div key="receipt-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", borderRadius: "24px 24px 0 0" }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden">
              <ReceiptContent
                mode={mode} setMode={setMode} printerStatus={printer.status} statusConfig={statusConfig}
                cartItems={cartItems} total={total} paymentMethod={paymentMethod} transactionId={transactionId}
                receiptCode={receiptCode} shopName={shopName} setShopName={setShopName}
                smsPhone={smsPhone} setSmsPhone={setSmsPhone} smsStatus={smsStatus} smsBody={smsBody}
                isPrinterSupported={printer.isSupported} customerName={customerName}
                onConnect={handleConnect} onPrint={handlePrint} onSendSms={handleSendSms} onClose={handleClose}
              />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
              <motion.div key="receipt-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: "min(440px, calc(100vw - 32px))", maxHeight: "92vh" }}>
                <ReceiptContent
                  mode={mode} setMode={setMode} printerStatus={printer.status} statusConfig={statusConfig}
                  cartItems={cartItems} total={total} paymentMethod={paymentMethod} transactionId={transactionId}
                  receiptCode={receiptCode} shopName={shopName} setShopName={setShopName}
                  smsPhone={smsPhone} setSmsPhone={setSmsPhone} smsStatus={smsStatus} smsBody={smsBody}
                  isPrinterSupported={printer.isSupported} customerName={customerName}
                  onConnect={handleConnect} onPrint={handlePrint} onSendSms={handleSendSms} onClose={handleClose}
                />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   RECEIPT CONTENT
   ============================================ */

interface ReceiptContentProps {
  mode: ReceiptMode; setMode: (m: ReceiptMode) => void;
  printerStatus: string; statusConfig: Record<string, { color: string; label: string }>;
  cartItems: CartItem[]; total: number; paymentMethod: string; transactionId: string;
  receiptCode: string; shopName: string; setShopName: (n: string) => void;
  smsPhone: string; setSmsPhone: (p: string) => void; smsStatus: SmsStatus; smsBody: string;
  isPrinterSupported: boolean; customerName?: string;
  onConnect: () => void; onPrint: () => void; onSendSms: () => void; onClose: () => void;
}

function ReceiptContent(p: ReceiptContentProps) {
  const { mode, setMode, printerStatus, statusConfig, cartItems, total, paymentMethod, transactionId,
    receiptCode, shopName, setShopName, smsPhone, setSmsPhone, smsStatus, smsBody,
    isPrinterSupported, customerName, onConnect, onPrint, onSendSms, onClose } = p;

  const isPrinting = printerStatus === "printing";

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800"
        style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === "sms" ? "bg-forest-50 dark:bg-forest-900/20 text-forest-600" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
              {mode === "sms" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">
                {mode === "sms" ? "SMS Receipt" : "Print Receipt"}
              </h2>
              {mode === "print" && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${statusConfig[printerStatus]?.color || "bg-warm-300"}`} />
                  <span className="text-[10px] text-warm-400">{statusConfig[printerStatus]?.label || printerStatus}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
            aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1.5 mt-3 bg-warm-100 dark:bg-warm-800 rounded-xl p-1">
          <button onClick={() => setMode("print")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "print" ? "bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 shadow-sm" : "text-warm-500"
            }`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <button onClick={() => setMode("sms")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "sms" ? "bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 shadow-sm" : "text-warm-500"
            }`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            SMS
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Receipt code banner */}
        <div className="rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200/60 dark:border-terracotta-800/40 p-3">
          <p className="text-[10px] font-medium text-terracotta-600 dark:text-terracotta-400 mb-0.5">Receipt Code</p>
          <p className="font-heading font-extrabold text-xl text-terracotta-600 dark:text-terracotta-400 tracking-wider tabular-nums">{receiptCode}</p>
          <p className="text-[9px] text-warm-400 mt-0.5">Use this code for returns &amp; verification</p>
        </div>

        {mode === "print" ? (
          <>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Shop Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                style={{ fontSize: "16px" }} />
            </div>

            {!isPrinterSupported && (
              <div className="p-3 rounded-xl bg-savanna-50 dark:bg-savanna-900/15 border border-savanna-200/60">
                <p className="text-xs text-savanna-600 font-medium">Web Serial not available</p>
                <p className="text-[10px] text-warm-400 mt-0.5">Use Chrome or Edge browser. Connect printer via USB and click Connect.</p>
              </div>
            )}

            <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)" }}>
              <div className="px-3 py-2 bg-warm-50 dark:bg-warm-800/30 border-b border-warm-100 dark:border-warm-800">
                <p className="text-[10px] font-medium text-warm-400">Receipt Preview</p>
              </div>
              <div className="p-3 font-mono text-[10px] leading-relaxed text-warm-800 dark:text-warm-200 bg-white dark:bg-warm-800/50 overflow-x-auto max-h-[200px] overflow-y-auto">
                <pre className="whitespace-pre">{generateReceiptLines(cartItems, total, paymentMethod, transactionId, receiptCode, customerName, shopName || "Your Shop").join("\n")}</pre>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Customer Phone</label>
              <input type="tel" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                style={{ fontSize: "16px" }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Shop Name (optional)</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Mama Njeri Duka"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
                style={{ fontSize: "16px" }} />
            </div>
            <div className="rounded-xl border border-forest-200/60 dark:border-forest-800/40 overflow-hidden bg-forest-50/50 dark:bg-forest-900/10">
              <div className="px-3 py-2 bg-forest-50 dark:bg-forest-900/20 border-b border-forest-200/60 dark:border-forest-800/40">
                <p className="text-[10px] font-medium text-forest-600 dark:text-forest-400">SMS Preview</p>
              </div>
              <div className="p-3 text-[11px] leading-relaxed text-warm-700 dark:text-warm-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {smsBody}
              </div>
            </div>
            {smsStatus === "sent" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 text-xs font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                SMS app opened! Send the message to complete.
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 p-4 space-y-2"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}>
        {mode === "print" ? (
          <>
            {printerStatus === "disconnected" ? (
              <div className="space-y-2">
                <Button variant="secondary" size="md" onClick={onConnect} className="w-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                  Connect Printer (USB)
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-warm-400">Skip</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Skip</Button>
                <Button variant="primary" size="md" onClick={onPrint} isLoading={isPrinting}
                  className="flex-1" disabled={printerStatus !== "connected"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                    <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {isPrinting ? "Printing..." : "Print Receipt"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Skip</Button>
            <Button variant="primary" size="md" onClick={onSendSms} isLoading={smsStatus === "sending"}
              className="flex-1" disabled={!smsPhone || smsStatus === "sent"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {smsStatus === "sent" ? "Sent!" : "Send SMS"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
   RECEIPT LINE GENERATOR
   ============================================ */

function generateReceiptLines(
  items: CartItem[], total: number, paymentMethod: string,
  transactionId: string, receiptCode: string,
  customerName: string | undefined, shopName: string,
): string[] {
  const w = 48;
  const sep = "-".repeat(w);
  const lines: string[] = [];
  const center = (t: string) => " ".repeat(Math.max(0, Math.floor((w - t.length) / 2))) + t;
  const row = (l: string, r: string) => l + " ".repeat(Math.max(1, w - l.length - r.length)) + r;

  lines.push(center(shopName.toUpperCase()));
  lines.push(center(new Date().toLocaleString("en-KE")));
  lines.push(sep);
  lines.push(row("Code:", receiptCode));
  lines.push(row("Ref:", transactionId));
  if (customerName) lines.push(row("Customer:", customerName.slice(0, w - 10)));
  lines.push(row("Payment:", paymentMethod.toUpperCase()));
  lines.push(sep);
  for (const item of items) {
    const name = item.product.name.length > w - 8 ? item.product.name.slice(0, w - 11) + "..." : item.product.name;
    lines.push(name);
    lines.push(row(`${item.qty} x KSh ${item.product.sellingPrice.toLocaleString()}`, `KSh ${(item.qty * item.product.sellingPrice).toLocaleString()}`));
  }
  lines.push(sep);
  lines.push(row("TOTAL:", `KSh ${total.toLocaleString()}`));
  lines.push(sep);
  lines.push("");
  lines.push(center("Asante kwa kununua!"));
  lines.push(center("Thank you for shopping!"));
  lines.push("");
  lines.push(center(`Code: ${receiptCode}`));
  lines.push(center("Keep this code for returns"));
  lines.push("");
  lines.push(center("Powered by DukaManager"));
  return lines;
}
