"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/data/salesData";
import type { Locale } from "@/types";
import Button from "@/components/ui/Button";

interface ReceiptGeneratorProps {
  transaction: Transaction | null;
  locale: Locale;
  onClose: () => void;
  onSendSMS?: () => void;
}

export default function ReceiptGenerator({ transaction, locale, onClose, onSendSMS }: ReceiptGeneratorProps) {
  if (!transaction) return null;

  return (
    <AnimatePresence>
      {transaction && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-80 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-warm-900 shadow-glass-lg"
            role="dialog" aria-modal="true" aria-label="Receipt"
          >
            <div className="p-6 font-mono text-sm">
              <div className="text-center mb-4">
                <h2 className="font-heading font-extrabold text-lg text-warm-900 dark:text-warm-50">DukaManager</h2>
                <p className="text-xs text-warm-400">Mama Njeri Groceries</p>
                <p className="text-xs text-warm-400">Gikomba, Nairobi</p>
                <p className="text-xs text-warm-400">Tel: 0712 345 678</p>
              </div>

              <div className="border-t border-dashed border-warm-300 dark:border-warm-600 my-3" />

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-warm-500">
                  <span>Receipt: {transaction.receiptNo}</span>
                  <span>{transaction.date} {transaction.time}</span>
                </div>
                <p className="text-xs text-warm-500">Customer: {transaction.customer}</p>
                <p className="text-xs text-warm-500">Cashier: {transaction.cashier}</p>
              </div>

              <div className="border-t border-dashed border-warm-300 dark:border-warm-600 my-3" />

              <div className="space-y-1.5 mb-3">
                {transaction.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-warm-900 dark:text-warm-50">
                      <span className="truncate max-w-[65%]">{item.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-warm-500">
                      <span>{item.qty} x KSh {item.price.toLocaleString()}</span>
                      <span>KSh {(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-warm-300 dark:border-warm-600 my-3" />

              <div className="space-y-1 text-warm-900 dark:text-warm-50">
                <div className="flex justify-between"><span>Subtotal</span><span>KSh {transaction.subtotal.toLocaleString()}</span></div>
                {transaction.discount > 0 && <div className="flex justify-between text-forest-600"><span>Discount</span><span>-KSh {transaction.discount.toLocaleString()}</span></div>}
                {transaction.vat > 0 && <div className="flex justify-between"><span>VAT</span><span>KSh {transaction.vat.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>TOTAL</span>
                  <span>KSh {transaction.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-warm-300 dark:border-warm-600 my-3" />

              <div className="text-xs text-warm-500 space-y-0.5">
                <p>Payment: {transaction.method.toUpperCase()}</p>
                {transaction.mpesaRef && <p>M-Pesa Ref: {transaction.mpesaRef}</p>}
                {transaction.cashTendered && <p>Cash: KSh {transaction.cashTendered.toLocaleString()}</p>}
                {transaction.changeDue && <p>Change: KSh {transaction.changeDue.toLocaleString()}</p>}
              </div>

              <div className="border-t border-dashed border-warm-300 dark:border-warm-600 my-3" />

              <div className="text-center">
                <p className="text-xs text-warm-500 font-medium">Asante kwa Kununua Hapa!</p>
                <p className="text-xs text-warm-400">Thank you for shopping with us!</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
                  {locale === "sw" ? "Funga" : "Close"}
                </Button>
                {onSendSMS && (
                  <Button variant="secondary" size="sm" onClick={onSendSMS} className="flex-1"
                    iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}>
                    SMS
                  </Button>
                )}
                <Button variant="primary" size="sm" className="flex-1"
                  iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>}>
                  Print
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
