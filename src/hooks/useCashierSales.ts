"use client";

import { useAuth } from "@/providers/AuthProvider";
import { addShopDoc, subscribeToShopDocs } from "@/lib/firebase/firestore";
import { useState, useEffect, useMemo } from "react";

export interface CashierSale {
  id: string;
  items: Array<Record<string, unknown>>;
  total: number;
  method: string;
  timestamp: string;
  cashierId: string;
  status: "completed" | "refunded";
  receiptCode?: string;
  channel: "cashier-portal";
}

export const useCashierSales = () => {
  const { shopId, user } = useAuth();
  const [sales, setSales] = useState<CashierSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !user) {
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShopDocs<CashierSale>(shopId, "sales", (data) => {
      const mySales = data.filter(
        (s) => s.cashierId === user.uid && s.channel === "cashier-portal"
      );
      setSales(mySales);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId, user]);

  const mySales = useMemo(() => sales, [sales]);

  const placeSale = async (transaction: Omit<CashierSale, "id" | "cashierId" | "channel">) => {
    if (!shopId || !user) throw new Error("No active shop or user not logged in");

    return addShopDoc(shopId, "sales", {
      ...transaction,
      cashierId: user.uid,
      channel: "cashier-portal",
    });
  };

  const dailyStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = mySales.filter(
      (s) => s.timestamp && s.timestamp.slice(0, 10) === todayStr && s.status === "completed"
    );
    return {
      count: todaySales.length,
      total: todaySales.reduce((sum, s) => sum + s.total, 0),
      cash: todaySales.filter((s) => s.method === "cash").reduce((sum, s) => sum + s.total, 0),
      mpesa: todaySales.filter((s) => s.method === "mpesa").reduce((sum, s) => sum + s.total, 0),
      credit: todaySales.filter((s) => s.method === "credit").reduce((sum, s) => sum + s.total, 0),
      bank: todaySales.filter((s) => s.method === "bank").reduce((sum, s) => sum + s.total, 0),
    };
  }, [mySales]);

  return {
    sales: mySales,
    loading,
    placeSale,
    dailyStats,
  };
};
