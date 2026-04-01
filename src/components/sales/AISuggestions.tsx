"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface Product {
  id: string;
  name: string;
  nameSw: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem {
  productId: string;
  name: string;
}

interface Props {
  locale: Locale;
  cart: CartItem[];
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function AISuggestions({ locale, cart, products, onAddProduct }: Props) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const generateSuggestions = useCallback(() => {
    if (cart.length === 0) {
      // No cart items - suggest popular/low-stock items
      const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 15).slice(0, 3);
      const random = products.filter((p) => p.stock > 0).sort(() => Math.random() - 0.5).slice(0, 2);
      setSuggestions([...new Map([...lowStock, ...random].map((p) => [p.id, p])).values()].slice(0, 4));
      return;
    }

    const cartIds = new Set(cart.map((c) => c.productId));
    const cartProducts = products.filter((p) => cartIds.has(p.id));
    const cartCategories = new Set(cartProducts.map((p) => p.category));

    // Suggest items from same categories not in cart
    const sameCategory = products.filter((p) => !cartIds.has(p.id) && cartCategories.has(p.category) && p.stock > 0);

    // Suggest items frequently bought together (simulated - same category)
    const complementary: Product[] = [];
    for (const cat of cartCategories) {
      const catProducts = products.filter((p) => p.category === cat && !cartIds.has(p.id) && p.stock > 0);
      complementary.push(...catProducts.slice(0, 2));
    }

    const all = [...new Map([...sameCategory, ...complementary].map((p) => [p.id, p])).values()];
    setSuggestions(all.slice(0, 5));
  }, [cart, products]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-terracotta-500 hover:text-terracotta-600 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          <line x1="9" y1="21" x2="15" y2="21" />
        </svg>
        <span>{locale === "sw" ? "Mapendekezo ya AI" : "AI Suggestions"}</span>
        <span className="text-[9px] bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 px-1.5 py-0.5 rounded-full">{suggestions.length}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onAddProduct(p)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-terracotta-50/50 dark:bg-terracotta-900/10 border border-terracotta-200/30 dark:border-terracotta-700/30 hover:bg-terracotta-100/50 active:scale-95 transition-all min-h-[32px]"
                >
                  <div className="w-5 h-5 rounded bg-terracotta-100 dark:bg-terracotta-800 flex items-center justify-center text-[7px] font-mono text-terracotta-500">
                    {p.sku.slice(-2)}
                  </div>
                  <span className="text-[10px] font-medium text-warm-800 dark:text-warm-200 truncate max-w-[55px]">{p.name}</span>
                  <span className="text-[9px] text-terracotta-500 tabular-nums whitespace-nowrap">{p.price}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
