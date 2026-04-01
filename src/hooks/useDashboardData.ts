"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { getStockStatus } from "@/data/inventoryData";
import type { Product } from "@/data/inventoryData";

interface DailySales {
  day: string;
  date: string;
  revenue: number;
  mpesa: number;
  cash: number;
}

interface DashboardTransaction {
  id: string;
  customer: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  method: string;
  status: string;
  time: string;
  cashier: string;
}

interface DashboardMetrics {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueChange: number;
  lowStockCount: number;
  lowStockItems: Product[];
  pendingOrders: number;
  activeCustomers: number;
  totalProducts: number;
  todayTransactions: number;
}

export function useDashboardData() {
  const { shopId } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 0, yesterdayRevenue: 0, revenueChange: 0,
    lowStockCount: 0, lowStockItems: [], pendingOrders: 0,
    activeCustomers: 0, totalProducts: 0, todayTransactions: 0,
  });
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  const computeMetrics = useCallback((
    sales: Array<Record<string, unknown>>,
    products: Array<Record<string, unknown> & { id: string }>,
    customers: Array<Record<string, unknown>>,
    orders: Array<Record<string, unknown>>
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const getDateKey = (s: Record<string, unknown>): string => {
      const ts = s.timestamp || s.createdAt || s.date;
      if (!ts) return "";
      const str = String(ts);
      if (str.length >= 10) return str.slice(0, 10);
      return "";
    };

    const todaySales = sales.filter((s) => getDateKey(s) === today && s.status === "completed");
    const yesterdaySales = sales.filter((s) => getDateKey(s) === yesterday && s.status === "completed");

    const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const revenueChange = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

    // Low stock from products
    const productItems: Product[] = products.map((p) => ({
      id: p.id,
      name: p.name || "",
      nameSw: p.nameSw || "",
      sku: p.sku || "",
      category: p.category || "",
      categorySw: p.categorySw || "",
      unit: (p.unit || "pieces") as Product["unit"],
      unitLabel: p.unitLabel || { en: "", sw: "" },
      quantity: Number(p.quantity) || 0,
      reorderPoint: Number(p.reorderPoint || p.minStock) || 10,
      buyingPrice: Number(p.buyingPrice) || 0,
      sellingPrice: Number(p.sellingPrice) || 0,
      wholesalePrice: Number(p.wholesalePrice) || 0,
      supplierId: p.supplierId || "",
      lastRestocked: p.lastRestocked || "",
      expiryDate: p.expiryDate,
      description: p.description || "",
      salesVelocity: Number(p.salesVelocity) || 1,
      warehouse: p.warehouse || "",
      createdAt: p.createdAt || "",
    }));
    const lowStockItems = productItems.filter((p) => {
      const status = getStockStatus(p);
      return status === "low" || status === "critical" || status === "out";
    }).slice(0, 8);

    // Pending orders
    const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

    // Active customers (purchased this month)
    const thisMonth = today.slice(0, 7);
    const activeCustomers = customers.filter((c) => {
      const lastPurchase = String(c.lastPurchase || "");
      return lastPurchase.startsWith(thisMonth);
    }).length;

    // Daily sales for chart (last 7 days)
    const dailyData: DailySales[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      const daySales = sales.filter((s) => getDateKey(s) === dateKey && s.status === "completed");
      dailyData.push({
        day: dayName,
        date: dateKey,
        revenue: daySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0),
        mpesa: daySales.filter((s) => s.method === "mpesa").reduce((sum, s) => sum + (Number(s.total) || 0), 0),
        cash: daySales.filter((s) => s.method === "cash").reduce((sum, s) => sum + (Number(s.total) || 0), 0),
      });
    }

    // Recent transactions - map from actual Firestore fields
    const recentTxns: DashboardTransaction[] = sales
      .filter((s) => s.status === "completed")
      .slice(0, 10)
      .map((s) => {
        const ts = s.timestamp || s.createdAt;
        let timeStr = "";
        if (ts) {
          const d = new Date(String(ts));
          timeStr = d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
        }
        return {
          id: String(s.id || ""),
          customer: String(s.customerName || s.customer || "Walk-in"),
          items: (s.items as Array<{ name: string; qty: number; price: number }>) || [],
          total: Number(s.total) || 0,
          method: String(s.method || "cash"),
          status: String(s.status || "completed"),
          time: timeStr,
          cashier: String(s.cashierName || s.cashier || s.cashierId || ""),
        };
      });

    setMetrics({
      todayRevenue,
      yesterdayRevenue,
      revenueChange,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      pendingOrders,
      activeCustomers: activeCustomers || customers.length,
      totalProducts: products.length,
      todayTransactions: todaySales.length,
    });
    setDailySales(dailyData);
    setRecentTransactions(recentTxns);
  }, []);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        let salesData: Array<Record<string, unknown>> = [];
        let productsData: Array<Record<string, unknown> & { id: string }> = [];
        let customersData: Array<Record<string, unknown>> = [];
        let ordersData: Array<Record<string, unknown>> = [];

        const update = () => computeMetrics(salesData, productsData, customersData, ordersData);

        // Sales
        const unsubSales = onSnapshot(
          query(collection(db, "shops", shopId, "sales"), orderBy("createdAt", "desc"), limit(200)),
          (snap) => {
            salesData = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
            update();
            setLoading(false);
          }, () => setLoading(false));
        unsubRef.current.push(unsubSales);

        // Products
        const unsubProducts = onSnapshot(collection(db, "shops", shopId, "products"), (snap) => {
          productsData = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          update();
        });
        unsubRef.current.push(unsubProducts);

        // Customers
        const unsubCustomers = onSnapshot(collection(db, "shops", shopId, "customers"), (snap) => {
          customersData = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          update();
        });
        unsubRef.current.push(unsubCustomers);

        // Purchase orders
        const unsubOrders = onSnapshot(collection(db, "shops", shopId, "purchaseOrders"), (snap) => {
          ordersData = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          update();
        });
        unsubRef.current.push(unsubOrders);
      } catch (err) {
        console.warn("Failed to init dashboard:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId, computeMetrics]);

  return { metrics, dailySales, recentTransactions, loading };
}
