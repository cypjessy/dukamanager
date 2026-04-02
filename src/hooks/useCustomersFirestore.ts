"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import type { Customer, CreditApplication } from "@/data/customerData";
import type { CustomerFormValues } from "@/lib/customerValidations";

export function useCustomersFirestore() {
  const { shopId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditApplications, setCreditApplications] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!shopId) { setLoading(false); setCustomers([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Subscribe to customers
        const custCol = collection(db, "shops", shopId, "customers");
        const unsubCust = onSnapshot(custCol, (snap) => {
          const data: Customer[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              customerId: r.customerId || `CUS-${d.id.slice(-4).toUpperCase()}`,
              name: r.name || "",
              nickname: r.nickname || r.name || "",
              phone: r.phone || "",
              phoneAlt: r.phoneAlt || "",
              whatsapp: r.whatsapp || r.phone?.replace(/\s/g, "") || "",
              email: r.email || "",
              location: r.location || "",
              segment: r.segment || "regular",
              loyaltyTier: r.loyaltyTier || "bronze",
              loyaltyPoints: Number(r.loyaltyPoints) || 0,
              customerSince: r.customerSince || r.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              lastPurchase: r.lastPurchase || r.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              daysSinceLastPurchase: Number(r.daysSinceLastPurchase) || 0,
              totalSpent: Number(r.totalSpent) || 0,
              transactionCount: Number(r.transactionCount) || 0,
              avgBasketSize: Number(r.avgBasketSize) || 0,
              creditLimit: Number(r.creditLimit) || 0,
              creditBalance: Number(r.outstanding || r.creditBalance) || 0,
              creditStatus: r.creditStatus || "good",
              preferredPayment: r.preferredPayment || "mpesa",
              notes: r.notes || "",
              monthlySpending: r.monthlySpending || [0, 0, 0, 0, 0, 0],
              favoriteCategories: r.favoriteCategories || [],
            };
          });
          setCustomers(data);
          setLoading(false);
        }, (err) => { console.warn("Customers subscription error:", err); setLoading(false); });
        unsubRef.current.push(unsubCust);

        // Subscribe to credit applications
        const appCol = collection(db, "shops", shopId, "creditApplications");
        const unsubApps = onSnapshot(appCol, (snap) => {
          const apps: CreditApplication[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              customerId: r.customerId || "",
              customerName: r.customerName || "",
              requestedLimit: Number(r.requestedLimit) || 0,
              incomeSource: r.incomeSource || "",
              references: r.references || "",
              status: r.status || "pending",
              appliedDate: r.appliedDate || r.createdAt?.slice(0, 10) || "",
            };
          });
          setCreditApplications(apps);
        });
        unsubRef.current.push(unsubApps);
      } catch (err) {
        console.warn("Failed to init customers:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId]);

  const addCustomer = useCallback(async (data: CustomerFormValues) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date().toISOString();
    const docData: Record<string, unknown> = {
      name: data.name,
      nickname: (data as Record<string, unknown>).nickname || data.name,
      phone: data.phone,
      phoneAlt: data.phoneAlt || "",
      whatsapp: (data as Record<string, unknown>).whatsapp || data.phone?.replace(/\s/g, "") || "",
      email: data.email || "",
      location: (data as Record<string, unknown>).location || "",
      segment: (data as Record<string, unknown>).segment || "new",
      loyaltyTier: "bronze",
      loyaltyPoints: 0,
      customerSince: now.slice(0, 10),
      lastPurchase: now.slice(0, 10),
      daysSinceLastPurchase: 0,
      totalSpent: 0,
      transactionCount: 0,
      avgBasketSize: 0,
      creditLimit: Number(data.creditLimit) || 0,
      outstanding: 0,
      creditStatus: "good",
      preferredPayment: data.preferredPayment || "mpesa",
      notes: data.notes || "",
      monthlySpending: [0, 0, 0, 0, 0, 0],
      favoriteCategories: [],
      createdAt: now,
    };
    return addDoc(collection(db, "shops", shopId, "customers"), docData);
  }, [shopId]);

  const updateCustomer = useCallback(async (customerId: string, data: Partial<Customer>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) clean[k] = v;
    }
    return updateDoc(doc(db, "shops", shopId, "customers", customerId), clean);
  }, [shopId]);

  const deleteCustomer = useCallback(async (customerId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return deleteDoc(doc(db, "shops", shopId, "customers", customerId));
  }, [shopId]);

  return { customers, creditApplications, loading, addCustomer, updateCustomer, deleteCustomer };
}
