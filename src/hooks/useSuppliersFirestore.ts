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
import type { Supplier, PurchaseOrder, SupplierPayable } from "@/data/supplierData";
import { supplierCategories } from "@/data/supplierData";
import type { SupplierFormValues } from "@/lib/supplierValidations";

export function useSuppliersFirestore() {
  const { shopId } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payables, setPayables] = useState<SupplierPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!shopId) { setLoading(false); setSuppliers([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Suppliers
        const unsubS = onSnapshot(collection(db, "shops", shopId, "suppliers"), (snap) => {
          const data: Supplier[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              name: r.name || "",
              contactPerson: r.contactPerson || "",
              phone: r.phone || "",
              whatsapp: r.whatsapp || r.phone?.replace(/\s/g, "") || "",
              email: r.email || "",
              location: r.location || "",
              region: r.region || "",
              distance: Number(r.distance) || 0,
              category: r.category || "wholesaler",
              paymentTerms: r.paymentTerms || "cod",
              kraPin: r.kraPin || "",
              bankName: r.bankName || "",
              bankAccount: r.bankAccount || "",
              mpesaPaybill: r.mpesaPaybill || "",
              mpesaTill: r.mpesaTill || "",
              avgDeliveryDays: Number(r.avgDeliveryDays) || 3,
              rating: Number(r.rating) || 4,
              isActive: r.isActive !== false,
              createdAt: r.createdAt || new Date().toISOString(),
            };
          });
          setSuppliers(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current.push(unsubS);

        // Purchase orders
        const unsubO = onSnapshot(collection(db, "shops", shopId, "purchaseOrders"), (snap) => {
          const orders: PurchaseOrder[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              supplierId: r.supplierId || "",
              supplierName: r.supplierName || "",
              items: r.items || [],
              subtotal: Number(r.subtotal) || 0,
              transportCost: Number(r.transportCost) || 0,
              total: Number(r.total) || 0,
              status: r.status || "pending",
              paymentTerms: r.paymentTerms || "cod",
              orderDate: r.orderDate || r.createdAt?.slice(0, 10) || "",
              expectedDelivery: r.expectedDelivery || "",
              actualDelivery: r.actualDelivery,
              notes: r.notes || "",
            };
          });
          setPurchaseOrders(orders);
        });
        unsubRef.current.push(unsubO);

        // Payables
        const unsubP = onSnapshot(collection(db, "shops", shopId, "payables"), (snap) => {
          const pbs: SupplierPayable[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              supplierId: r.supplierId || "",
              supplierName: r.supplierName || "",
              orderId: r.orderId || "",
              amount: Number(r.amount) || 0,
              paid: Number(r.paid) || 0,
              balance: Number(r.balance) || 0,
              dueDate: r.dueDate || "",
              daysOverdue: Number(r.daysOverdue) || 0,
            };
          });
          setPayables(pbs);
        });
        unsubRef.current.push(unsubP);
      } catch (err) {
        console.warn("Failed to init suppliers:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId]);

  const addSupplier = useCallback(async (data: SupplierFormValues) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date().toISOString();
    const supplierData: Record<string, unknown> = {
      name: data.name,
      contactPerson: data.contactPerson || "",
      phone: data.phone || "",
      whatsapp: (data as Record<string, unknown>).whatsapp || data.phone?.replace(/\s/g, "") || "",
      email: data.email || "",
      location: (data as Record<string, unknown>).location || "",
      region: (data as Record<string, unknown>).region || "",
      distance: Number((data as Record<string, unknown>).distance) || 0,
      category: (data as Record<string, unknown>).category || "wholesaler",
      paymentTerms: data.paymentTerms || "cod",
      kraPin: (data as Record<string, unknown>).kraPin || "",
      bankName: (data as Record<string, unknown>).bankName || "",
      bankAccount: (data as Record<string, unknown>).bankAccount || "",
      mpesaPaybill: (data as Record<string, unknown>).mpesaPaybill || "",
      mpesaTill: (data as Record<string, unknown>).mpesaTill || "",
      avgDeliveryDays: Number((data as Record<string, unknown>).avgDeliveryDays) || 3,
      rating: 4,
      isActive: true,
      createdAt: now,
    };
    return addDoc(collection(db, "shops", shopId, "suppliers"), supplierData);
  }, [shopId]);

  const updateSupplier = useCallback(async (supplierId: string, data: Partial<Supplier>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) { if (v !== undefined) clean[k] = v; }
    return updateDoc(doc(db, "shops", shopId, "suppliers", supplierId), clean);
  }, [shopId]);

  const deleteSupplier = useCallback(async (supplierId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return deleteDoc(doc(db, "shops", shopId, "suppliers", supplierId));
  }, [shopId]);

  const createOrder = useCallback(async (
    supplier: Supplier,
    items: { name: string; qty: number; unitPrice: number }[],
    transportCost: number,
    notes: string
  ) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const total = subtotal + transportCost;
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(expected.getDate() + (supplier.avgDeliveryDays || 3));

    return addDoc(collection(db, "shops", shopId, "purchaseOrders"), {
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: items.map((i) => ({ ...i, productId: "" })),
      subtotal,
      transportCost,
      total,
      status: "pending",
      paymentTerms: supplier.paymentTerms,
      orderDate: now.toISOString().slice(0, 10),
      expectedDelivery: expected.toISOString().slice(0, 10),
      notes: notes || "",
      createdAt: now.toISOString(),
    });
  }, [shopId]);

  return { suppliers, purchaseOrders, payables, loading, addSupplier, updateSupplier, deleteSupplier, createOrder, supplierCategories };
}
