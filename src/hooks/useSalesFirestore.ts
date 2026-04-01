"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import type { PaymentMethod, CartItem, Transaction, CreditCustomer } from "@/data/salesData";

export interface ProductForSale {
  id: string;
  name: string;
  nameSw: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

export function useSalesFirestore() {
  const { shopId, profile } = useAuth();
  const [products, setProducts] = useState<ProductForSale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Subscribe to products from Firestore
  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    const loadProducts = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const colRef = collection(db, "shops", shopId, "products");
        const q = query(colRef, orderBy("createdAt", "desc"));

        const unsub = onSnapshot(q, (snapshot) => {
          const prods: ProductForSale[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name || "",
              nameSw: data.nameSw || data.name || "",
              sku: data.sku || d.id.slice(-6).toUpperCase(),
              price: data.sellingPrice || data.price || 0,
              stock: data.quantity || data.stock || 0,
              category: data.category || data.categorySw || "Other",
            };
          }).filter((p) => p.stock > 0);
          setProducts(prods);
          setLoading(false);
        }, (err) => {
          console.warn("Products subscription error:", err);
          setLoading(false);
        });

        unsubscribersRef.current.push(unsub);
      } catch (err) {
        console.warn("Failed to load products:", err);
        setLoading(false);
      }
    };

    loadProducts();
    return () => { unsubscribersRef.current.forEach((u) => u()); unsubscribersRef.current = []; };
  }, [shopId]);

  // Subscribe to transactions from Firestore
  useEffect(() => {
    if (!shopId) return;

    const loadTransactions = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const colRef = collection(db, "shops", shopId, "sales");
        const q = query(colRef, orderBy("createdAt", "desc"), limit(200));

        const unsub = onSnapshot(q, (snapshot) => {
          const txns: Transaction[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              receiptNo: data.receiptNo || d.id.slice(-6),
              customer: data.customer || "Walk-in Customer",
              customerPhone: data.customerPhone,
              items: data.items || [],
              subtotal: data.subtotal || 0,
              vat: data.vat || 0,
              discount: data.discount || 0,
              total: data.total || 0,
              method: data.method || "cash",
              cashTendered: data.cashTendered,
              changeDue: data.changeDue,
              mpesaRef: data.mpesaRef,
              bankRef: data.bankRef,
              creditRef: data.creditRef,
              status: data.status || "completed",
              cashier: data.cashier || "Staff",
              date: data.date || (data.createdAt ? data.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
              time: data.time || (data.createdAt ? data.createdAt.slice(11, 16) : new Date().toTimeString().slice(0, 5)),
            };
          });
          setTransactions(txns);
        }, (err) => {
          console.warn("Transactions subscription error:", err);
        });

        unsubscribersRef.current.push(unsub);
      } catch (err) {
        console.warn("Failed to load transactions:", err);
      }
    };

    loadTransactions();
  }, [shopId]);

  // Load credit customers from Firestore
  useEffect(() => {
    if (!shopId) return;

    const loadCustomers = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const colRef = collection(db, "shops", shopId, "customers");
        const q = query(colRef, where("outstanding", ">", 0));

        const unsub = onSnapshot(q, (snapshot) => {
          const customers: CreditCustomer[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name || "Customer",
              phone: data.phone || "",
              creditLimit: data.creditLimit || 5000,
              outstanding: data.outstanding || 0,
              daysSincePayment: data.daysSincePayment || 0,
              risk: data.risk || "low",
              transactions: data.transactions || [],
            };
          });
          setCreditCustomers(customers);
        });

        unsubscribersRef.current.push(unsub);
      } catch (err) {
        console.warn("Failed to load customers:", err);
      }
    };

    loadCustomers();
  }, [shopId]);

  // Process a sale - save to Firestore
  const processSale = useCallback(async (
    cart: CartItem[],
    method: PaymentMethod,
    details: Record<string, string | number>
  ): Promise<Transaction> => {
    if (!shopId) throw new Error("No shop ID");

    const { db } = await import("@/lib/firebase/config");

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = Number(details.discount) || 0;
    const vat = Number(details.vat) || 0;
    const total = subtotal + vat - discount;

    const now = new Date();
    const txnCounter = transactions.length + 1;

    const saleData: Record<string, unknown> = {
      customer: method === "credit"
        ? creditCustomers.find((c) => c.id === details.customerId)?.name || "Credit Customer"
        : "Walk-in Customer",
      customerPhone: method === "credit"
        ? creditCustomers.find((c) => c.id === details.customerId)?.phone
        : undefined,
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        qty: c.quantity,
        price: c.price,
      })),
      subtotal,
      vat,
      discount,
      total,
      method,
      cashTendered: method === "cash" ? Number(details.cashTendered) : undefined,
      changeDue: method === "cash" ? Number(details.cashTendered) - total : undefined,
      mpesaRef: method === "mpesa" ? `RJK${Math.floor(Math.random() * 900000) + 100000}` : undefined,
      bankRef: method === "bank" ? String(details.reference) : undefined,
      creditRef: method === "credit" ? `CRD${Date.now().toString(36).toUpperCase()}` : undefined,
      status: "completed",
      cashier: profile?.displayName || profile?.email || "Staff",
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      receiptNo: `RCP${String(txnCounter).padStart(5, "0")}`,
      createdAt: now.toISOString(),
    };

    // Save sale to Firestore
    const docRef = await addDoc(collection(db, "shops", shopId, "sales"), saleData);

    // Update product stock in Firestore
    for (const item of cart) {
      try {
        const productRef = doc(db, "shops", shopId, "products", item.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().quantity || productSnap.data().stock || 0;
          await updateDoc(productRef, {
            quantity: Math.max(0, currentStock - item.quantity),
            lastSold: now.toISOString(),
          });
        }
      } catch (stockErr) {
        console.warn(`Failed to update stock for ${item.productId}:`, stockErr);
      }
    }

    // If credit sale, update customer outstanding
    if (method === "credit" && details.customerId) {
      try {
        const customerRef = doc(db, "shops", shopId, "customers", String(details.customerId));
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          const currentOutstanding = customerSnap.data().outstanding || 0;
          await updateDoc(customerRef, {
            outstanding: currentOutstanding + total,
            daysSincePayment: 0,
            lastCreditDate: now.toISOString(),
          });
        }
      } catch (custErr) {
        console.warn("Failed to update customer:", custErr);
      }
    }

    const newTxn: Transaction = {
      id: docRef.id,
      receiptNo: saleData.receiptNo as string,
      customer: saleData.customer as string,
      customerPhone: saleData.customerPhone as string | undefined,
      items: saleData.items as Transaction["items"],
      subtotal,
      vat,
      discount,
      total,
      method,
      cashTendered: saleData.cashTendered as number | undefined,
      changeDue: saleData.changeDue as number | undefined,
      mpesaRef: saleData.mpesaRef as string | undefined,
      bankRef: saleData.bankRef as string | undefined,
      creditRef: saleData.creditRef as string | undefined,
      status: "completed",
      cashier: saleData.cashier as string,
      date: saleData.date as string,
      time: saleData.time as string,
    };

    return newTxn;
  }, [shopId, transactions.length, creditCustomers, profile]);

  // Get today's total
  const getTodayTotal = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    return transactions
      .filter((t) => t.date === today && t.status === "completed")
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  return {
    products,
    transactions,
    creditCustomers,
    loading,
    processSale,
    getTodayTotal,
  };
}
