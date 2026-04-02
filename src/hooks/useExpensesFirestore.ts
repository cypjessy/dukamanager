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
import type { Expense, ExpenseCategory, PaymentMethod } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";

export function useExpensesFirestore() {
  const { shopId } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)>();

  useEffect(() => {
    if (!shopId) { setLoading(false); setExpenses([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const unsub = onSnapshot(collection(db, "shops", shopId, "expenses"), (snap) => {
          const data: Expense[] = snap.docs.map((d) => {
            const r = d.data();
            const date = r.date || r.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);
            return {
              id: d.id,
              date,
              dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(date + "T00:00:00").getDay()],
              description: r.description || "",
              category: r.category || "miscellaneous",
              amount: Number(r.amount) || 0,
              type: r.type || "business",
              paymentMethod: r.paymentMethod || "cash",
              reference: r.reference || "",
              status: r.status || "draft",
              receiptUrl: r.receiptUrl,
              isRecurring: r.isRecurring || false,
              recurrenceFrequency: r.recurrenceFrequency,
              approvedBy: r.approvedBy,
              rejectionReason: r.rejectionReason,
              notes: r.notes || "",
            };
          });
          setExpenses(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current = unsub;
      } catch (err) {
        console.warn("Failed to init expenses:", err);
        setLoading(false);
      }
    };

    init();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [shopId]);

  const addExpense = useCallback(async (data: {
    description: string;
    category: ExpenseCategory;
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    vendor?: string;
    reference?: string;
    notes?: string;
    isRecurring: boolean;
    recurrenceFrequency?: string;
    receiptUrl?: string;
  }) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date().toISOString();
    return addDoc(collection(db, "shops", shopId, "expenses"), {
      description: data.description,
      category: data.category,
      amount: Number(data.amount) || 0,
      type: "business",
      paymentMethod: data.paymentMethod,
      date: data.date,
      reference: data.reference || `REF${Date.now().toString(36).toUpperCase()}`,
      status: "draft",
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : undefined,
      vendor: data.vendor || "",
      notes: data.notes || "",
      receiptUrl: data.receiptUrl,
      createdAt: now,
    });
  }, [shopId]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) { if (v !== undefined) clean[k] = v; }
    return updateDoc(doc(db, "shops", shopId, "expenses", id), clean);
  }, [shopId]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return deleteDoc(doc(db, "shops", shopId, "expenses", id));
  }, [shopId]);

  const deleteExpenses = useCallback(async (ids: Set<string>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    for (const id of Array.from(ids)) {
      await deleteDoc(doc(db, "shops", shopId, "expenses", id));
    }
  }, [shopId]);

  const duplicateExpense = useCallback(async (id: string) => {
    const original = expenses.find((e) => e.id === id);
    if (!original || !shopId) return null;
    const { db } = await import("@/lib/firebase/config");
    const today = new Date().toISOString().slice(0, 10);
    return addDoc(collection(db, "shops", shopId, "expenses"), {
      description: original.description,
      category: original.category,
      amount: original.amount,
      type: original.type,
      paymentMethod: original.paymentMethod,
      date: today,
      reference: `REF${Date.now().toString(36).toUpperCase()}`,
      status: "draft",
      isRecurring: original.isRecurring,
      recurrenceFrequency: original.recurrenceFrequency,
      notes: original.notes,
      createdAt: new Date().toISOString(),
    });
  }, [shopId, expenses]);

  return { expenses, loading, addExpense, updateExpense, deleteExpense, deleteExpenses, duplicateExpense, categoryConfig };
}
