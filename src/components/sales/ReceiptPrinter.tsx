"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/data/salesData";
import type { Locale } from "@/types";
import type { PaperSize } from "@/lib/printManager";
import type { ShopTenant } from "@/lib/shopTenant";
import { usePrint } from "@/hooks/usePrint";

interface ReceiptPrinterProps {
  transaction: Transaction | null;
  shop: ShopTenant;
  verificationCode: string;
  locale: Locale;
  onClose: () => void;
}

type PrintView = "options" | "connecting";

export default function ReceiptPrinter({ transaction, shop, verificationCode, locale, onClose }: ReceiptPrinterProps) {
  const [view, setView] = useState<PrintView>("options");
  const {
    status, method, paperSize, setPaperSize,
    connectedPrinter, error,
    printQuick, printBrowser, printPDF, shareReceipt,
    connectPrinter, disconnectPrinter, reset,
  } = usePrint({ transaction: transaction!, shop, verificationCode });

  const handleConnect = useCallback(async (type: "serial" | "usb") => {
    setView("connecting");
    await connectPrinter(type);
    setView("options");
  }, [connectPrinter]);

  if (!transaction) return null;

  const isPrinting = status === "printing";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-warm-900 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">
              {locale === "sw" ? "Chaguo za Printi" : "Print Options"}
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Printer Status */}
          <div className="px-5 pb-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
              connectedPrinter ? "bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400" : "bg-warm-50 dark:bg-warm-800/50 text-warm-500 dark:text-warm-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${connectedPrinter ? "bg-forest-500" : "bg-warm-300"}`} />
              {connectedPrinter ? (
                <span>{connectedPrinter.name} — {locale === "sw" ? "Imeunganishwa" : "Connected"}</span>
              ) : (
                <span>{locale === "sw" ? "Hakuna printa" : "No printer connected"}</span>
              )}
              {connectedPrinter && (
                <button onClick={disconnectPrinter} className="ml-auto text-forest-500 underline min-h-[24px]">
                  {locale === "sw" ? "Tenganisha" : "Disconnect"}
                </button>
              )}
            </div>
          </div>

          {/* Success / Error Feedback */}
          <AnimatePresence>
            {(isSuccess || isError) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                  isSuccess ? "bg-forest-50 dark:bg-forest-900/20 text-forest-700" : "bg-red-50 dark:bg-red-900/20 text-red-600"
                }`}>
                  {isSuccess ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>{method === "thermal" ? "Printed to thermal" : method === "pdf" ? "PDF downloaded" : "Printed"}</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /></svg>{error}</>
                  )}
                  <button onClick={reset} className="ml-auto underline min-h-[24px]">{locale === "sw" ? "Sawa" : "OK"}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {view === "options" ? (
            <>
              {/* Print Methods */}
              <div className="px-5 pb-4 space-y-2">
                <PrintOption
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>}
                  title={locale === "sw" ? "Print Haraka" : "Quick Print"}
                  desc={connectedPrinter ? (locale === "sw" ? "Printa ya mafuta" : "Connected thermal printer") : (locale === "sw" ? "Printa ya kawaida" : "Default printer via browser")}
                  onClick={printQuick}
                  disabled={isPrinting}
                  loading={isPrinting && method === "thermal"}
                />

                <PrintOption
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                  title={locale === "sw" ? "Print Kawaida" : "Standard Print"}
                  desc={locale === "sw" ? "Chagua ukubwa wa karatasi" : "Choose paper size & printer"}
                  onClick={printBrowser}
                  disabled={isPrinting}
                  loading={isPrinting && method === "browser"}
                  extra={
                    <div className="flex gap-1 mt-1">
                      {(["80mm", "a4", "letter"] as PaperSize[]).map((size) => (
                        <button key={size} onClick={(e) => { e.stopPropagation(); setPaperSize(size); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors min-h-[24px] ${
                            paperSize === size ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"
                          }`}>
                          {size.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  }
                />

                <PrintOption
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
                  title={locale === "sw" ? "Pakua PDF" : "PDF Download"}
                  desc={locale === "sw" ? "Kwa WhatsApp, barua pepe" : "For sharing via WhatsApp, email"}
                  onClick={printPDF}
                  disabled={isPrinting}
                  loading={isPrinting && method === "pdf"}
                />

                <PrintOption
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>}
                  title={locale === "sw" ? "Shiriki" : "Share"}
                  desc={locale === "sw" ? "Shiriki kwa simu au nakili" : "Share or copy to clipboard"}
                  onClick={shareReceipt}
                  disabled={isPrinting}
                  loading={isPrinting && method === "share"}
                />
              </div>

              {/* Connect Printer */}
              {!connectedPrinter && (
                <div className="px-5 pb-4">
                  <p className="text-[10px] text-warm-400 uppercase tracking-wider mb-2">
                    {locale === "sw" ? "Unganisha Printa" : "Connect Printer"}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleConnect("serial")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-xs font-medium text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[44px]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                      USB/Serial
                    </button>
                    <button onClick={() => handleConnect("usb")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-xs font-medium text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[44px]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" /></svg>
                      Bluetooth
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Connecting state */
            <div className="px-5 py-8 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-terracotta-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <p className="text-sm text-warm-600 dark:text-warm-300 font-medium">{locale === "sw" ? "Inaunganisha..." : "Connecting..."}</p>
              <p className="text-xs text-warm-400 mt-1">{locale === "sw" ? "Chagua printa kutoka kwenye orodha" : "Select your printer from the device list"}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-warm-100 dark:border-warm-800 bg-warm-50/50 dark:bg-warm-800/30">
            <p className="text-[10px] text-warm-400 text-center">
              {transaction.receiptNo} &middot; KSh {transaction.total.toLocaleString()} &middot; {transaction.date}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PrintOption({
  icon, title, desc, onClick, disabled, loading, extra,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/40 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors text-left disabled:opacity-50 min-h-[56px]">
      <div className="w-9 h-9 rounded-lg bg-white dark:bg-warm-700 flex items-center justify-center text-terracotta-500 flex-shrink-0 shadow-sm">
        {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{title}</p>
        <p className="text-xs text-warm-400">{desc}</p>
        {extra}
      </div>
    </button>
  );
}
