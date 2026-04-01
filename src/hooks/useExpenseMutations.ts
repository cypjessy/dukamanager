"use client";

import { useState, useCallback } from "react";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/data/expenseData";

export function useExpenseMutations(initialExpenses: Expense[]) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const addExpense = useCallback((data: {
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
    const newExpense: Expense = {
      id: `EXP${Date.now().toString(36).toUpperCase()}`,
      date: data.date,
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(data.date).getDay()],
      description: data.description,
      category: data.category,
      amount: data.amount,
      type: "business",
      paymentMethod: data.paymentMethod,
      reference: data.reference || `REF${Math.floor(Math.random() * 900000 + 100000)}`,
      status: "draft",
      receiptUrl: data.receiptUrl,
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring
        ? (data.recurrenceFrequency as Expense["recurrenceFrequency"])
        : undefined,
      notes: data.notes || "",
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteExpenses = useCallback((ids: Set<string>) => {
    setExpenses((prev) => prev.filter((e) => !ids.has(e.id)));
  }, []);

  const duplicateExpense = useCallback((id: string) => {
    const original = expenses.find((e) => e.id === id);
    if (!original) return null;
    const today = new Date().toISOString().slice(0, 10);
    const duplicated: Expense = {
      ...original,
      id: `EXP${Date.now().toString(36).toUpperCase()}`,
      date: today,
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(today).getDay()],
      status: "draft",
      reference: `REF${Math.floor(Math.random() * 900000 + 100000)}`,
    };
    setExpenses((prev) => [duplicated, ...prev]);
    return duplicated;
  }, [expenses]);

  return { expenses, setExpenses, addExpense, updateExpense, deleteExpense, deleteExpenses, duplicateExpense };
}
