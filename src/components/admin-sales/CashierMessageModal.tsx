"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface CashierMessageModalProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  cashierName: string;
  onSend: (cashierId: string, message: string) => void;
}

const t = (en: string, sw: string, locale: Locale) => locale === "sw" ? sw : en;

export default function CashierMessageModal({ locale, isOpen, onClose, cashierName, onSend }: CashierMessageModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      onSend("", message);
      setMessage("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-2xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-warm-900 dark:text-warm-50">
                  {t("Message", "Ujumbe", locale)} {cashierName}
                </h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("Type your message...", "Andika ujumbe wako...", locale)}
                className="w-full h-32 p-3 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 text-sm text-warm-900 dark:text-warm-50 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors"
                >
                  {t("Cancel", "Ghairi", locale)}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? t("Sending...", "Inatuma...", locale) : t("Send", "Tuma", locale)}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
