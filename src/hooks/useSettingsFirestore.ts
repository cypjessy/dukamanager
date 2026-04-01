"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

export interface ShopSettings {
  shopName: string;
  shopCategory: string;
  currency: string;
  timezone: string;
  kraPin: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  receiptHeader: string;
  receiptFooter: string;
}

export interface PaymentSettings {
  acceptedMethods: string[];
  mpesaEnabled: boolean;
  cashEnabled: boolean;
  cardEnabled: boolean;
  bankEnabled: boolean;
  creditEnabled: boolean;
  mpesaPaybill: string;
  mpesaTill: string;
  mpesaConsumerKey: string;
  mpesaConsumerSecret: string;
  mpesaPasskey: string;
  mpesaShortcode: string;
  mpesaEnvironment: "sandbox" | "production";
  vatEnabled: boolean;
  vatRate: number;
}

export interface NotificationSettings {
  lowStockAlert: boolean;
  lowStockThreshold: number;
  dailySummary: boolean;
  paymentAlerts: boolean;
  expiryAlerts: boolean;
  customerBirthday: boolean;
}

export function useSettingsFirestore() {
  const { shopId } = useAuth();
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    shopName: "", shopCategory: "", currency: "KSh", timezone: "Africa/Nairobi",
    kraPin: "", businessType: "", phone: "", email: "", address: "",
    receiptHeader: "", receiptFooter: "Thank you for shopping with us!",
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    acceptedMethods: ["mpesa", "cash"],
    mpesaEnabled: true, cashEnabled: true, cardEnabled: false,
    bankEnabled: false, creditEnabled: false,
    mpesaPaybill: "", mpesaTill: "",
    mpesaConsumerKey: "", mpesaConsumerSecret: "",
    mpesaPasskey: "", mpesaShortcode: "",
    mpesaEnvironment: "sandbox",
    vatEnabled: false, vatRate: 16,
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlert: true, lowStockThreshold: 10,
    dailySummary: true, paymentAlerts: true,
    expiryAlerts: true, customerBirthday: false,
  });
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Subscribe to shop document
        const unsubShop = onSnapshot(doc(db, "shops", shopId), (snap) => {
          if (snap.exists()) {
            const r = snap.data();
            setShopSettings((prev) => ({
              ...prev,
              shopName: r.shopName || "",
              shopCategory: r.category || "",
              currency: r.currency || "KSh",
              timezone: r.timezone || "Africa/Nairobi",
            }));
          }
        });
        unsubRef.current.push(unsubShop);

        // Subscribe to shop settings
        const unsubSettings = onSnapshot(doc(db, "shops", shopId, "settings", "general"), (snap) => {
          if (snap.exists()) {
            const r = snap.data();
            setShopSettings({
              shopName: r.shopName || "",
              shopCategory: r.shopCategory || "",
              currency: r.currency || "KSh",
              timezone: r.timezone || "Africa/Nairobi",
              kraPin: r.kraPin || "",
              businessType: r.businessType || "",
              phone: r.phone || "",
              email: r.email || "",
              address: r.address || "",
              receiptHeader: r.receiptHeader || "",
              receiptFooter: r.receiptFooter || "Thank you for shopping with us!",
            });
          }
        });
        unsubRef.current.push(unsubSettings);

        // Subscribe to payment settings
        const unsubPay = onSnapshot(doc(db, "shops", shopId, "settings", "payments"), (snap) => {
          if (snap.exists()) {
            const r = snap.data();
            setPaymentSettings({
              acceptedMethods: r.acceptedMethods || ["mpesa", "cash"],
              mpesaEnabled: r.mpesaEnabled !== false,
              cashEnabled: r.cashEnabled !== false,
              cardEnabled: r.cardEnabled || false,
              bankEnabled: r.bankEnabled || false,
              creditEnabled: r.creditEnabled || false,
              mpesaPaybill: r.mpesaPaybill || "",
              mpesaTill: r.mpesaTill || "",
              mpesaConsumerKey: r.mpesaConsumerKey || "",
              mpesaConsumerSecret: r.mpesaConsumerSecret || "",
              mpesaPasskey: r.mpesaPasskey || "",
              mpesaShortcode: r.mpesaShortcode || "",
              mpesaEnvironment: r.mpesaEnvironment || "sandbox",
              vatEnabled: r.vatEnabled || false,
              vatRate: Number(r.vatRate) || 16,
            });
          }
        });
        unsubRef.current.push(unsubPay);

        // Subscribe to notification settings
        const unsubNotif = onSnapshot(doc(db, "shops", shopId, "settings", "notifications"), (snap) => {
          if (snap.exists()) {
            const r = snap.data();
            setNotificationSettings({
              lowStockAlert: r.lowStockAlert !== false,
              lowStockThreshold: Number(r.lowStockThreshold) || 10,
              dailySummary: r.dailySummary !== false,
              paymentAlerts: r.paymentAlerts !== false,
              expiryAlerts: r.expiryAlerts !== false,
              customerBirthday: r.customerBirthday || false,
            });
          }
        });
        unsubRef.current.push(unsubNotif);

        setLoading(false);
      } catch (err) {
        console.warn("Failed to init settings:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId]);

  const saveShopSettings = useCallback(async (data: Partial<ShopSettings>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await setDoc(doc(db, "shops", shopId, "settings", "general"), {
      ...shopSettings, ...data, updatedAt: new Date().toISOString(),
    }, { merge: true });
    // Also update the main shop doc name
    if (data.shopName) {
      await updateDoc(doc(db, "shops", shopId), { shopName: data.shopName });
    }
  }, [shopId, shopSettings]);

  const savePaymentSettings = useCallback(async (data: Partial<PaymentSettings>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await setDoc(doc(db, "shops", shopId, "settings", "payments"), {
      ...paymentSettings, ...data, updatedAt: new Date().toISOString(),
    }, { merge: true });
    setPaymentSettings((prev) => ({ ...prev, ...data }));
  }, [shopId, paymentSettings]);

  const saveNotificationSettings = useCallback(async (data: Partial<NotificationSettings>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await setDoc(doc(db, "shops", shopId, "settings", "notifications"), {
      ...notificationSettings, ...data, updatedAt: new Date().toISOString(),
    }, { merge: true });
    setNotificationSettings((prev) => ({ ...prev, ...data }));
  }, [shopId, notificationSettings]);

  return {
    shopSettings,
    paymentSettings,
    notificationSettings,
    loading,
    saveShopSettings,
    savePaymentSettings,
    saveNotificationSettings,
  };
}
