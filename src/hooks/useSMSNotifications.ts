import { useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useSettingsFirestore } from "./useSettingsFirestore";
import type { Product } from "@/data/inventoryData";

export function useLowStockAlert(products: Product[]) {
  const { shopId } = useAuth();
  const { notificationSettings } = useSettingsFirestore();

  const sendLowStockSMS = useCallback(async (items: { name: string; qty: number }[]) => {
    if (!shopId || items.length === 0) return;
    
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "low-stock", to: "0748132692", itemName: `${items.length} items`, quantity: items.reduce((s, i) => s + i.qty, 0) }),
      });
    } catch (error) {
      console.error("Failed to send low stock SMS:", error);
    }
  }, [shopId]);

  const checkLowStock = useCallback(async () => {
    if (!notificationSettings.lowStockAlert || products.length === 0) return;

    const threshold = notificationSettings.lowStockThreshold || 10;
    const lowStockItems = products.filter(p => p.quantity <= (p.reorderPoint || threshold));

    if (lowStockItems.length > 0) {
      const critical = lowStockItems.filter(p => p.quantity <= (p.reorderPoint || threshold) * 0.5);
      if (critical.length > 0) {
        await sendLowStockSMS(critical.map(p => ({ name: p.name, qty: p.quantity })));
      }
    }
  }, [products, notificationSettings, sendLowStockSMS]);

  useEffect(() => {
    checkLowStock();
  }, [checkLowStock]);

  return { checkLowStock };
}

export function useCustomerWelcome(phone: string, name: string, shopName: string) {
  const sendWelcome = useCallback(async () => {
    if (!phone) return;
    
    const message = `Welcome to ${shopName}! Thank you for registering. You'll receive updates on promotions and your loyalty points.`;
    
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message, type: "default" }),
      });
    } catch (error) {
      console.error("Failed to send welcome SMS:", error);
    }
  }, [phone, shopName]);

  return { sendWelcome };
}

export function useExpenseNotification(amount: number, category: string, shopName: string) {
  const sendExpenseAlert = useCallback(async () => {
    const message = `EXPENSE RECORDED: KSh ${amount.toLocaleString()} for ${category} at ${shopName}`;
    
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "0748132692", message, type: "default" }),
      });
    } catch (error) {
      console.error("Failed to send expense SMS:", error);
    }
  }, [amount, category, shopName]);

  return { sendExpenseAlert };
}