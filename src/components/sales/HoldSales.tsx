"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/data/salesData";
import type { Locale } from "@/types";

interface HeldSale {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  heldAt: string;
  label: string;
}

const STORAGE_KEY = "dukamanager-held-sales";

interface Props {
  locale: Locale;
  cart: CartItem[];
  onRecall: (items: CartItem[]) => void;
  onClearCart: () => void;
}

export default function HoldSales({ locale, cart, onRecall, onClearCart }: Props) {
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHeldSales(JSON.parse(saved));
    } catch (e) { console.warn("HoldSales operation failed:", e); }
  }, []);

  // Save to localStorage
  const save = useCallback((sales: HeldSale[]) => {
    setHeldSales(sales);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sales)); } catch {}
  }, []);

  const holdSale = useCallback(() => {
    if (cart.length === 0) return;
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const now = new Date();
    const sale: HeldSale = {
      id: `HOLD-${Date.now().toString(36)}`,
      items: [...cart],
      total,
      itemCount: cart.reduce((s, i) => s + i.quantity, 0),
      heldAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label: `Sale ${heldSales.length + 1}`,
    };
    save([sale, ...heldSales]);
    onClearCart();
  }, [cart, heldSales, save, onClearCart]);

  const recallSale = useCallback((sale: HeldSale) => {
    onRecall(sale.items);
    save(heldSales.filter((s) => s.id !== sale.id));
    setIsOpen(false);
  }, [heldSales, save, onRecall]);

  const deleteSale = useCallback((id: string) => {
    save(heldSales.filter((s) => s.id !== id));
  }, [heldSales, save]);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {/* Hold button */}
        <button
          onClick={holdSale}
          disabled={cart.length === 0}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-warm-500 hover:text-warm-700 bg-warm-100/50 dark:bg-warm-800/50 hover:bg-warm-200/50 dark:hover:bg-warm-700/50 disabled:opacity-40 transition-all min-h-[28px]"
          title={t("Hold Sale", "Hifadhi Mauzo")}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
          {t("Hold", "Hifadhi")}
        </button>

        {/* Recall button */}
        {heldSales.length > 0 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-savanna-600 bg-savanna-50/50 dark:bg-savanna-900/10 hover:bg-savanna-100/50 transition-all min-h-[28px]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {t("Recall", "Rudisha")} ({heldSales.length})
          </button>
        )}
      </div>

      {/* Held sales dropdown */}
      <AnimatePresence>
        {isOpen && heldSales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="space-y-1.5 p-2 rounded-xl bg-savanna-50/50 dark:bg-savanna-900/10 border border-savanna-200/30 dark:border-savanna-700/30">
              {heldSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-warm-800/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-warm-900 dark:text-warm-50 truncate">{sale.label}</p>
                    <p className="text-[9px] text-warm-400">{sale.itemCount} items &middot; KSh {sale.total.toLocaleString()} &middot; {sale.heldAt}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => recallSale(sale)}
                      className="px-2 py-1 rounded text-[9px] font-bold bg-forest-500 text-white min-h-[24px]">
                      {t("Recall", "Rudisha")}
                    </button>
                    <button onClick={() => deleteSale(sale.id)}
                      className="p-1 rounded text-warm-400 hover:text-red-500 min-h-[24px] min-w-[24px] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
