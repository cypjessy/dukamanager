"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

interface ReportMetrics {
  totalRevenue: number;
  totalTransactions: number;
  avgBasket: number;
  totalExpenses: number;
  netProfit: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  mpesaPercent: number;
  cashPercent: number;
  creditPercent: number;
}

interface DailySalesPoint {
  date: string;
  revenue: number;
  transactions: number;
  mpesa: number;
  cash: number;
  credit: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

export function useReportsFirestore() {
  const { shopId } = useAuth();
  const [sales, setSales] = useState<DailySalesPoint[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalRevenue: 0, totalTransactions: 0, avgBasket: 0,
    totalExpenses: 0, netProfit: 0, totalCustomers: 0,
    totalProducts: 0, inventoryValue: 0,
    mpesaPercent: 0, cashPercent: 0, creditPercent: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  const computeReports = useCallback((salesData: Array<Record<string, unknown>>, expenseData: Array<Record<string, unknown>>, custCount: number, prodCount: number, prodValue: number) => {
    const completed = salesData.filter((s) => s.status === "completed");
    const totalRevenue = completed.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalTransactions = completed.length;
    const avgBasket = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    const totalExpenses = expenseData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const mpesaCount = completed.filter((s) => s.method === "mpesa").length;
    const cashCount = completed.filter((s) => s.method === "cash").length;
    const creditCount = completed.filter((s) => s.method === "credit").length;

    // Group sales by date
    const byDate: Record<string, DailySalesPoint> = {};
    completed.forEach((s) => {
      const date = String(s.date || "").slice(0, 10);
      if (!byDate[date]) byDate[date] = { date, revenue: 0, transactions: 0, mpesa: 0, cash: 0, credit: 0 };
      byDate[date].revenue += Number(s.total) || 0;
      byDate[date].transactions += 1;
      if (s.method === "mpesa") byDate[date].mpesa += Number(s.total) || 0;
      else if (s.method === "cash") byDate[date].cash += Number(s.total) || 0;
      else if (s.method === "credit") byDate[date].credit += Number(s.total) || 0;
    });

    // Top products from sales items
    const productTotals: Record<string, { revenue: number; quantity: number }> = {};
    completed.forEach((s) => {
      const items = (s.items as Array<{ name: string; qty: number; price: number }>) || [];
      items.forEach((item) => {
        if (!productTotals[item.name]) productTotals[item.name] = { revenue: 0, quantity: 0 };
        productTotals[item.name].revenue += (item.qty || 0) * (item.price || 0);
        productTotals[item.name].quantity += item.qty || 0;
      });
    });

    setSales(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
    setTopProducts(
      Object.entries(productTotals)
        .map(([name, data]) => ({ name, revenue: data.revenue, quantity: data.quantity }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    );
    setMetrics({
      totalRevenue,
      totalTransactions,
      avgBasket,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalCustomers: custCount,
      totalProducts: prodCount,
      inventoryValue: prodValue,
      mpesaPercent: totalTransactions > 0 ? Math.round((mpesaCount / totalTransactions) * 100) : 0,
      cashPercent: totalTransactions > 0 ? Math.round((cashCount / totalTransactions) * 100) : 0,
      creditPercent: totalTransactions > 0 ? Math.round((creditCount / totalTransactions) * 100) : 0,
    });
  }, []);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        let salesData: Array<Record<string, unknown>> = [];
        let expenseData: Array<Record<string, unknown>> = [];
        let custCount = 0;
        let prodCount = 0;
        let prodValue = 0;

        const unsubS = onSnapshot(collection(db, "shops", shopId, "sales"), (snap) => {
          salesData = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          computeReports(salesData, expenseData, custCount, prodCount, prodValue);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current.push(unsubS);

        const unsubE = onSnapshot(collection(db, "shops", shopId, "expenses"), (snap) => {
          expenseData = snap.docs.map((d) => d.data());
          computeReports(salesData, expenseData, custCount, prodCount, prodValue);
        });
        unsubRef.current.push(unsubE);

        const unsubC = onSnapshot(collection(db, "shops", shopId, "customers"), (snap) => {
          custCount = snap.size;
          computeReports(salesData, expenseData, custCount, prodCount, prodValue);
        });
        unsubRef.current.push(unsubC);

        const unsubP = onSnapshot(collection(db, "shops", shopId, "products"), (snap) => {
          prodCount = snap.size;
          prodValue = snap.docs.reduce((sum, d) => {
            const r = d.data();
            return sum + (Number(r.sellingPrice || r.price) || 0) * (Number(r.quantity || r.stock) || 0);
          }, 0);
          computeReports(salesData, expenseData, custCount, prodCount, prodValue);
        });
        unsubRef.current.push(unsubP);
      } catch (err) {
        console.warn("Failed to init reports:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId, computeReports]);

  const getDateRangeLabel = (range: DateRange): string => {
    const labels: Record<string, string> = {
      today: "Today", yesterday: "Yesterday", week: "This Week",
      last_week: "Last Week", month: "This Month", last_month: "Last Month",
      quarter: "This Quarter", ytd: "Year to Date",
    };
    return labels[range] || range;
  };

  return { sales, metrics, topProducts, loading, getDateRangeLabel };
}
