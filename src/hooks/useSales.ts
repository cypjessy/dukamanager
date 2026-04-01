"use client";

import { useAuth } from "@/providers/AuthProvider";
import { addShopDoc, subscribeToShopDocs } from "@/lib/firebase/firestore";
import { useState, useEffect } from "react";

export interface Transaction {
  id: string;
  items: Array<Record<string, unknown>>;
  total: number;
  method: string;
  timestamp: string;
  cashierId: string;
  status: "completed" | "refunded";
  receiptCode?: string;
}

export const useSales = () => {
  const { shopId, user } = useAuth();
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShopDocs<Transaction>(shopId, "sales", (data) => {
      setSales(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const placeSale = async (transaction: Omit<Transaction, "id" | "cashierId" | "createdAt">) => {
    if (!shopId || !user) throw new Error("No active shop or user not logged in");
    
    return addShopDoc(shopId, "sales", {
      ...transaction,
      cashierId: user.uid,
    });
  };

  return {
    sales,
    loading,
    placeSale
  };
};
