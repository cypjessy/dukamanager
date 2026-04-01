"use client";

import { useState, useCallback, useMemo } from "react";
import type { Product } from "@/data/inventoryData";
import { inventoryProducts, getStockStatus } from "@/data/inventoryData";
import type { CartItem } from "@/app/cashier/page";

export interface AISuggestion {
  id: string;
  type: "upsell" | "cross_sell" | "reorder" | "discount" | "warning" | "tip";
  title: string;
  titleSw: string;
  message: string;
  messageSw: string;
  product?: Product;
  action?: "add_to_cart" | "apply_discount" | "notify" | "view";
  priority: "high" | "medium" | "low";
  confidence: number;
}

// Frequently bought together patterns (simulated learning from sales data)
const BUY_TOGETHER_PATTERNS: Record<string, string[]> = {
  p1: ["p7", "p10"],    // Pembe Flour + Cooking Oil + Omo
  p2: ["p7", "p12"],    // Soko Ugali + Oil + Sunlight
  p6: ["p16", "p20"],   // Sugar + Tea + Milk
  p10: ["p11", "p14"],  // Omo + Dettol + Vim
  p15: ["p23", "p22"],  // Coca-Cola + Biscuits + Crisps
  p16: ["p6", "p20"],   // Tea + Sugar + Milk
  p20: ["p23", "p6"],   // Milk + Biscuits + Sugar
  p7: ["p1", "p6"],     // Oil + Flour + Sugar
  p11: ["p10", "p14"],  // Dettol + Omo + Vim
  p35: ["p36", "p37"],  // Safaricom + Airtel + Paracetamol
};

// Category affinity patterns
const CATEGORY_AFFINITY: Record<string, string[]> = {
  cereals: ["cooking_oil", "soap"],
  cooking_oil: ["cereals", "soap"],
  beverages: ["snacks", "dairy"],
  snacks: ["beverages"],
  soap: ["household"],
  dairy: ["cereals", "beverages"],
  personal: ["soap", "household"],
};

export function useAIAssistant(cart: CartItem[]) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const suggestions = useMemo((): AISuggestion[] => {
    const result: AISuggestion[] = [];
    const cartProductIds = new Set(cart.map((i) => i.product.id));
    const cartCategories = new Set(cart.map((i) => i.product.category));

    // 1. Cross-sell: frequently bought together
    for (const item of cart) {
      const related = BUY_TOGETHER_PATTERNS[item.product.id] || [];
      for (const relatedId of related) {
        if (!cartProductIds.has(relatedId)) {
          const product = inventoryProducts.find((p) => p.id === relatedId);
          if (product && getStockStatus(product) !== "out") {
            result.push({
              id: `cross_${item.product.id}_${relatedId}`,
              type: "cross_sell",
              title: `Often bought with ${item.product.name}`,
              titleSw: `Hununuliwa mara nyingi na ${item.product.nameSw}`,
              message: `${product.name} - KSh ${product.sellingPrice}`,
              messageSw: `${product.nameSw} - KSh ${product.sellingPrice}`,
              product,
              action: "add_to_cart",
              priority: "medium",
              confidence: 0.75,
            });
          }
        }
      }
    }

    // 2. Category affinity suggestions
    const cartCategoriesArray = Array.from(cartCategories);
    for (const cat of cartCategoriesArray) {
      const affinities = CATEGORY_AFFINITY[cat] || [];
      for (const affinityCat of affinities) {
        if (!cartCategories.has(affinityCat)) {
          const categoryProducts = inventoryProducts.filter(
            (p) => p.category === affinityCat && getStockStatus(p) !== "out" && !cartProductIds.has(p.id)
          );
          if (categoryProducts.length > 0) {
            const topProduct = categoryProducts.sort((a, b) => b.sellingPrice - a.sellingPrice)[0];
            const catName = topProduct.categorySw || topProduct.category;
            result.push({
              id: `cat_${cat}_${affinityCat}`,
              type: "cross_sell",
              title: `Add ${catName}?`,
              titleSw: `Ongeza ${catName}?`,
              message: `Customers often buy ${catName} with these items`,
              messageSw: `Wateja hununua ${catName} na bidhaa hizi`,
              product: topProduct,
              action: "add_to_cart",
              priority: "low",
              confidence: 0.6,
            });
          }
        }
      }
    }

    // 3. Low stock warnings for cart items
    for (const item of cart) {
      const status = getStockStatus(item.product);
      if (status === "low" || status === "critical") {
        result.push({
          id: `stock_${item.product.id}`,
          type: "warning",
          title: `Low stock: ${item.product.name}`,
          titleSw: `Stock yapungua: ${item.product.nameSw}`,
          message: `Only ${item.product.quantity} left. Consider notifying manager.`,
          messageSw: `Zimebaki ${item.product.quantity} tu. Mwambie msimamizi.`,
          priority: status === "critical" ? "high" : "medium",
          confidence: 1.0,
        });
      }
    }

    // 4. Expiring products in cart
    for (const item of cart) {
      if (item.product.expiryDate) {
        const daysUntilExpiry = Math.floor(
          (new Date(item.product.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          result.push({
            id: `expiry_${item.product.id}`,
            type: "warning",
            title: `Expiring soon: ${item.product.name}`,
            titleSw: `Muda unaisha: ${item.product.nameSw}`,
            message: `Expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""}`,
            messageSw: `Inaisha baada ya siku ${daysUntilExpiry}`,
            priority: "high",
            confidence: 1.0,
          });
        }
      }
    }

    // 5. Reorder suggestions for out-of-stock popular items
    const outOfStock = inventoryProducts.filter((p) => getStockStatus(p) === "out").slice(0, 3);
    for (const product of outOfStock) {
      result.push({
        id: `reorder_${product.id}`,
        type: "reorder",
        title: `Out of stock: ${product.name}`,
        titleSw: `Imeisha: ${product.nameSw}`,
        message: `Popular item - consider restocking`,
        messageSw: `Bidhaa maarufu - nunua zaidi`,
        product,
        action: "notify",
        priority: "low",
        confidence: 0.8,
      });
    }

    // 6. Smart discount suggestions for large carts
    if (cart.length >= 5) {
      const total = cart.reduce((s, i) => s + i.qty * i.product.sellingPrice, 0);
      if (total > 2000) {
        result.push({
          id: "bulk_discount",
          type: "discount",
          title: "Bulk purchase detected",
          titleSw: "Ununuzi mkuu umegunduliwa",
          message: `Total KSh ${total.toLocaleString()} - Consider 5% loyalty discount`,
          messageSw: `Jumla KSh ${total.toLocaleString()} - Fikiria punguzo la 5%`,
          action: "apply_discount",
          priority: "medium",
          confidence: 0.7,
        });
      }
    }

    // 7. Customer favorites tip
    if (cart.length === 0) {
      const topSellers = inventoryProducts
        .filter((p) => getStockStatus(p) !== "out")
        .sort((a, b) => b.salesVelocity - a.salesVelocity)
        .slice(0, 3);
      for (const product of topSellers) {
        result.push({
          id: `top_${product.id}`,
          type: "tip",
          title: "Top seller today",
          titleSw: "Inayouzwa sana leo",
          message: `${product.name} - selling fast`,
          messageSw: `${product.nameSw} - inauza haraka`,
          product,
          action: "add_to_cart",
          priority: "low",
          confidence: 0.5,
        });
      }
    }

    // Filter out dismissed
    return result
      .filter((s) => !dismissedSuggestions.has(s.id))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [cart, dismissedSuggestions]);

  const dismissSuggestion = useCallback((id: string) => {
    setDismissedSuggestions((prev) => new Set(Array.from(prev).concat(id)));
  }, []);

  const dismissAll = useCallback(() => {
    setDismissedSuggestions(new Set(suggestions.map((s) => s.id)));
  }, [suggestions]);

  // Smart search: enhanced product search with relevance scoring
  const smartSearch = useCallback(
    (query: string): Product[] => {
      if (!query.trim()) return inventoryProducts.filter((p) => getStockStatus(p) !== "out").slice(0, 10);

      const q = query.toLowerCase().trim();
      const words = q.split(/\s+/);

      return inventoryProducts
        .map((product) => {
          let score = 0;
          const name = product.name.toLowerCase();
          const nameSw = product.nameSw.toLowerCase();
          const sku = product.sku.toLowerCase();

          // Exact match
          if (name === q || sku === q) score += 100;
          // Starts with
          if (name.startsWith(q)) score += 50;
          if (sku.startsWith(q)) score += 45;
          // Contains
          if (name.includes(q)) score += 30;
          if (nameSw.includes(q)) score += 25;
          if (sku.includes(q)) score += 20;
          // Word matching
          for (const word of words) {
            if (word.length > 1) {
              if (name.includes(word)) score += 10;
              if (nameSw.includes(word)) score += 8;
            }
          }
          // Boost popular items
          score += product.salesVelocity * 2;
          // Boost in-stock items
          if (getStockStatus(product) !== "out") score += 5;
          // Penalize out of stock
          if (getStockStatus(product) === "out") score -= 20;

          return { product, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((x) => x.product);
    },
    []
  );

  const highPriorityCount = suggestions.filter((s) => s.priority === "high").length;
  const totalCount = suggestions.length;

  return {
    suggestions,
    highPriorityCount,
    totalCount,
    dismissSuggestion,
    dismissAll,
    smartSearch,
  };
}
