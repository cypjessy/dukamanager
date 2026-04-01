"use client";

import { useAuth } from "@/providers/AuthProvider";
import { addShopDoc, subscribeToShopDocs } from "@/lib/firebase/firestore";
import { useState, useEffect, useMemo } from "react";

export interface AdminPOSTransaction {
  id: string;
  items: Array<Record<string, unknown>>;
  total: number;
  method: string;
  timestamp: string;
  cashierId: string;
  status: "completed" | "refunded";
  receiptCode?: string;
  channel: "admin-pos";
}

export const useAdminPOS = () => {
  const { shopId, user } = useAuth();
  const [sales, setSales] = useState<AdminPOSTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShopDocs<AdminPOSTransaction>(shopId, "sales", (data) => {
      const adminSales = data.filter((s) => s.channel === "admin-pos");
      setSales(adminSales);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const adminSales = useMemo(() => sales, [sales]);

  const placeSale = async (transaction: Omit<AdminPOSTransaction, "id" | "cashierId" | "channel">) => {
    if (!shopId || !user) throw new Error("No active shop or user not logged in");

    return addShopDoc(shopId, "sales", {
      ...transaction,
      cashierId: user.uid,
      channel: "admin-pos",
    });
  };

  const dailyStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = adminSales.filter(
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
  }, [adminSales]);

  return {
    sales: adminSales,
    loading,
    placeSale,
    dailyStats,
  };
};
