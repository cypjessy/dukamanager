"use client";

import { useAuth } from "@/providers/AuthProvider";
import { subscribeToShopDocs } from "@/lib/firebase/firestore";
import { useProducts } from "@/hooks/useProducts";
import { useState, useEffect, useCallback, useMemo } from "react";

export interface AdminSale {
  id: string;
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    price: number;
    costPrice?: number;
  }>;
  total: number;
  method: "mpesa" | "cash" | "credit" | "bank" | "split";
  timestamp: string;
  cashierId: string;
  cashierName?: string;
  cashierAvatar?: string;
  status: "completed" | "refunded" | "pending";
  receiptCode?: string;
  customerId?: string;
  customerType?: "walk-in" | "registered";
  discount?: number;
  discountReason?: string;
  channel?: "in-store" | "online" | "phone" | "whatsapp";
  profit?: number;
}

export type Period = "today" | "yesterday" | "week" | "month" | "custom";

export interface CashierMetrics {
  cashierId: string;
  cashierName: string;
  cashierAvatar: string;
  isOnline: boolean;
  shiftStart?: string;
  transactions: number;
  revenue: number;
  avgSale: number;
  refunds: number;
  voids: number;
  sevenDayTrend: number[];
  personalAvg: number;
}

export interface ProductSaleData {
  id: string;
  name: string;
  category: string;
  image?: string;
  unitsSold: number;
  revenue: number;
  stockLevel: number;
  stockStatus: "ok" | "low" | "critical" | "out";
  velocity: number;
  profitMargin: number;
  hourlyBreakdown: Record<string, number>;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
  icon: string;
}

export interface ChannelData {
  channel: string;
  volume: number;
  revenue: number;
  growthRate: number;
  avgResponseTime?: string;
}

export interface DiscountEntry {
  id: string;
  amount: number;
  reason: string;
  cashierId: string;
  cashierName: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
  saleId?: string;
}

export interface ReturnEntry {
  id: string;
  returnNo: string;
  originalSaleId: string;
  items: Array<{ name: string; qty: number; price: number; reason: string }>;
  total: number;
  method: "mpesa" | "cash" | "credit" | "bank";
  reason: "damaged" | "wrong_item" | "changed_mind" | "quality" | "other";
  cashierId: string;
  cashierName: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
}

export interface HourlyHeatmapData {
  hour: number;
  day: string;
  sales: number;
  transactions: number;
}

export interface CustomerInsight {
  newCustomers: number;
  returningCustomers: number;
  avgLifetimeValue: number;
  avgPurchaseFrequency: number;
  returnRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    totalSpent: number;
    visits: number;
    lastVisit: string;
  }>;
}

export interface InventoryImpact {
  productId: string;
  name: string;
  currentStock: number;
  soldToday: number;
  daysUntilStockout: number;
  suggestedReorder: number;
  status: "ok" | "low" | "critical" | "overstocked" | "out";
}

export interface FraudAlert {
  id: string;
  type: "high_voids" | "suspicious_discounts" | "cash_discrepancy" | "after_hours" | "multiple_refunds";
  severity: "low" | "medium" | "high";
  description: string;
  cashierId: string;
  cashierName: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface ShopConsolidation {
  shopId: string;
  shopName: string;
  todayRevenue: number;
  todayTransactions: number;
  growthRate: number;
  isActive: boolean;
}

export interface UseSalesDataReturn {
  sales: AdminSale[];
  loading: boolean;
  period: Period;
  customDateRange: { start: string; end: string } | null;
  setPeriod: (p: Period) => void;
  setCustomDateRange: (start: string, end: string) => void;
  filteredSales: AdminSale[];
  todayTotal: number;
  yesterdayTotal: number;
  trendPercent: number;
  transactionCount: number;
  totalItemsSold: number;
  avgBasketValue: number;
  totalProfit: number;
  profitMargin: number;
  activeCashiers: number;
  cashierMetrics: CashierMetrics[];
  productAnalytics: ProductSaleData[];
  paymentBreakdown: PaymentBreakdown[];
  channelData: ChannelData[];
  discounts: DiscountEntry[];
  totalDiscountAmount: number;
  returns: ReturnEntry[];
  totalReturnAmount: number;
  hourlyHeatmap: HourlyHeatmapData[];
  customerInsights: CustomerInsight;
  inventoryImpact: InventoryImpact[];
  fraudAlerts: FraudAlert[];
  shops: ShopConsolidation[];
  refreshData: () => void;
  exportPDF: () => void;
  exportExcel: () => void;
}

const AVATAR_COLORS = ["#C75B39", "#2D5A3D", "#D4A574", "#4A90D9", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];

export function useSalesData(): UseSalesDataReturn {
  const { shopId } = useAuth();
  const { products } = useProducts();
  const [sales, setSales] = useState<AdminSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("today");
  const [customDateRange, setCustomDateRangeState] = useState<{ start: string; end: string } | null>(null);
  const [cashierMap, setCashierMap] = useState<Record<string, { name: string; color: string }>>({});

  // Subscribe to sales from Firebase
  useEffect(() => {
    if (!shopId) {
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShopDocs<AdminSale>(shopId, "sales", (data) => {
      const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSales(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  // Subscribe to cashier profiles
  useEffect(() => {
    if (!shopId) return;

    const unsubscribe = subscribeToShopDocs<{
      displayName?: string;
      email?: string;
      role?: string;
      shopId?: string;
    }>(shopId, "users", (data) => {
      const map: Record<string, { name: string; color: string }> = {};
      data.forEach((u, idx) => {
        const name = u.displayName || u.email?.split("@")[0] || "Cashier";
        map[(u as Record<string, unknown>).id as string || `user_${idx}`] = {
          name,
          color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        };
      });
      setCashierMap(map);
    });

    return () => unsubscribe();
  }, [shopId]);

  // Enrich sales with cashier info from the map
  const enrichedSales = useMemo(() => {
    return sales.map((s) => {
      const info = cashierMap[s.cashierId];
      return {
        ...s,
        cashierName: s.cashierName || info?.name || "Unknown",
        cashierAvatar: info?.color || AVATAR_COLORS[0],
      };
    });
  }, [sales, cashierMap]);

  const setCustomDateRange = useCallback((start: string, end: string) => {
    setCustomDateRangeState({ start, end });
    setPeriod("custom");
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return enrichedSales.filter((s) => {
      const saleDate = new Date(s.timestamp);
      if (period === "today") return s.timestamp.slice(0, 10) === todayStr;
      if (period === "yesterday") return s.timestamp.slice(0, 10) === yesterdayStr;
      if (period === "week") return saleDate >= weekAgo;
      if (period === "month") return saleDate >= monthAgo;
      if (period === "custom" && customDateRange) {
        return saleDate >= new Date(customDateRange.start) && saleDate <= new Date(customDateRange.end + "T23:59:59");
      }
      return true;
    });
  }, [enrichedSales, period, customDateRange]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const todayTotal = useMemo(
    () => enrichedSales
      .filter((s) => s.timestamp.slice(0, 10) === todayStr && s.status === "completed")
      .reduce((sum, s) => sum + s.total, 0),
    [enrichedSales, todayStr]
  );

  const yesterdayTotal = useMemo(
    () => enrichedSales
      .filter((s) => s.timestamp.slice(0, 10) === yesterdayStr && s.status === "completed")
      .reduce((sum, s) => sum + s.total, 0),
    [enrichedSales, yesterdayStr]
  );

  const trendPercent = yesterdayTotal > 0 ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : 0;

  const transactionCount = useMemo(
    () => filteredSales.filter((s) => s.status === "completed").length,
    [filteredSales]
  );

  const totalItemsSold = useMemo(
    () => filteredSales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.items.reduce((is, it) => is + it.qty, 0), 0),
    [filteredSales]
  );

  const avgBasketValue = transactionCount > 0 ? Math.round(todayTotal / transactionCount) : 0;

  const totalProfit = useMemo(
    () => filteredSales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => {
        if (s.profit !== undefined) return sum + s.profit;
        const cost = s.items.reduce((c, it) => c + (it.costPrice || it.price * 0.7) * it.qty, 0);
        return sum + (s.total - cost);
      }, 0),
    [filteredSales]
  );

  const totalRevenue = useMemo(
    () => filteredSales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.total, 0),
    [filteredSales]
  );

  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const activeCashiers = useMemo(
    () => new Set(filteredSales.filter((s) => s.status === "completed").map((s) => s.cashierId)).size,
    [filteredSales]
  );

  // Cashier metrics from real data
  const cashierMetrics = useMemo((): CashierMetrics[] => {
    const cashierIds = new Set(filteredSales.map((s) => s.cashierId));
    const allCashierSales = enrichedSales.filter((s) => s.status === "completed");

    return Array.from(cashierIds).map((cashierId) => {
      const info = cashierMap[cashierId];
      const name = info?.name || filteredSales.find((s) => s.cashierId === cashierId)?.cashierName || cashierId;
      const color = info?.color || AVATAR_COLORS[Math.abs(hashCode(cashierId)) % AVATAR_COLORS.length];
      const cashierSales = allCashierSales.filter((s) => s.cashierId === cashierId);
      const revenue = cashierSales.reduce((sum, s) => sum + s.total, 0);
      const refunds = filteredSales.filter((s) => s.cashierId === cashierId && s.status === "refunded").length;
      const voids = filteredSales.filter((s) => s.cashierId === cashierId && s.status === "pending").length;

      const sevenDayTrend = Array.from({ length: 7 }, (_, d) => {
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - (6 - d));
        const dayStr = dayDate.toISOString().slice(0, 10);
        return enrichedSales
          .filter((s) => s.cashierId === cashierId && s.status === "completed" && s.timestamp.slice(0, 10) === dayStr)
          .reduce((sum, s) => sum + s.total, 0);
      });
      const personalAvg = sevenDayTrend.length > 0 ? Math.round(sevenDayTrend.reduce((a, b) => a + b, 0) / 7) : 0;

      return {
        cashierId,
        cashierName: name,
        cashierAvatar: color,
        isOnline: false,
        transactions: cashierSales.length,
        revenue,
        avgSale: cashierSales.length > 0 ? Math.round(revenue / cashierSales.length) : 0,
        refunds,
        voids,
        sevenDayTrend,
        personalAvg,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, enrichedSales, cashierMap]);

  // Product analytics from real data + products from Firebase
  const productAnalytics = useMemo((): ProductSaleData[] => {
    const productMap = new Map<string, ProductSaleData>();

    filteredSales.filter((s) => s.status === "completed").forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productMap.has(item.productId)) {
          const product = products.find((p) => p.id === item.productId);
          productMap.set(item.productId, {
            id: item.productId,
            name: item.name,
            category: product?.category || "General",
            unitsSold: 0,
            revenue: 0,
            stockLevel: product?.quantity ?? 0,
            stockStatus: product ? getStockStatus(product) : "ok",
            velocity: 0,
            profitMargin: 0,
            hourlyBreakdown: {},
          });
        }
        const existing = productMap.get(item.productId)!;
        existing.unitsSold += item.qty;
        existing.revenue += item.price * item.qty;
        const hour = new Date(sale.timestamp).getHours().toString();
        existing.hourlyBreakdown[hour] = (existing.hourlyBreakdown[hour] || 0) + item.qty;
      });
    });

    productMap.forEach((p) => {
      p.velocity = Math.round(p.unitsSold / Math.max(1, period === "week" ? 7 : period === "month" ? 30 : 1));
      p.profitMargin = p.revenue > 0 ? Math.round(((p.revenue * 0.3) / p.revenue) * 100) : 0;
    });

    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 20);
  }, [filteredSales, products, period]);

  // Payment breakdown
  const paymentBreakdown = useMemo((): PaymentBreakdown[] => {
    const methodCounts: Record<string, { count: number; total: number }> = {};
    filteredSales.filter((s) => s.status === "completed").forEach((s) => {
      if (!methodCounts[s.method]) methodCounts[s.method] = { count: 0, total: 0 };
      methodCounts[s.method].count++;
      methodCounts[s.method].total += s.total;
    });

    const totalMethodTotal = Object.values(methodCounts).reduce((s, m) => s + m.total, 0);
    const methodIcons: Record<string, string> = { mpesa: "📱", cash: "💵", credit: "💳", bank: "🏦", split: "🔀" };

    return Object.entries(methodCounts).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalMethodTotal > 0 ? Math.round((data.total / totalMethodTotal) * 100) : 0,
      icon: methodIcons[method] || "💰",
    })).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Channel data
  const channelData = useMemo((): ChannelData[] => {
    const channelMap: Record<string, { volume: number; revenue: number }> = {};
    filteredSales.filter((s) => s.status === "completed").forEach((s) => {
      const ch = s.channel || "in-store";
      if (!channelMap[ch]) channelMap[ch] = { volume: 0, revenue: 0 };
      channelMap[ch].volume++;
      channelMap[ch].revenue += s.total;
    });

    return Object.entries(channelMap).map(([channel, data]) => ({
      channel,
      volume: data.volume,
      revenue: data.revenue,
      growthRate: 0,
    }));
  }, [filteredSales]);

  // Discounts
  const discounts = useMemo((): DiscountEntry[] => {
    return filteredSales
      .filter((s) => s.discount && s.discount > 0)
      .map((s) => ({
        id: `disc_${s.id}`,
        amount: s.discount!,
        reason: s.discountReason || "unknown",
        cashierId: s.cashierId,
        cashierName: s.cashierName || "Unknown",
        timestamp: s.timestamp,
        approved: s.discount! < 100,
        saleId: s.id,
      }));
  }, [filteredSales]);

  const totalDiscountAmount = useMemo(
    () => discounts.reduce((s, d) => s + d.amount, 0),
    [discounts]
  );

  // Returns
  const returns = useMemo((): ReturnEntry[] => {
    return filteredSales
      .filter((s) => s.status === "refunded")
      .map((s) => ({
        id: `ret_${s.id}`,
        returnNo: `RET-${s.id.slice(-6).toUpperCase()}`,
        originalSaleId: s.id,
        items: s.items.map((it) => ({ name: it.name, qty: it.qty, price: it.price, reason: "customer_return" })),
        total: s.total,
        method: s.method === "split" ? "cash" : s.method,
        reason: "other" as ReturnEntry["reason"],
        cashierId: s.cashierId,
        cashierName: s.cashierName || "Unknown",
        timestamp: s.timestamp,
        approved: true,
      }));
  }, [filteredSales]);

  const totalReturnAmount = useMemo(
    () => returns.reduce((s, r) => s + r.total, 0),
    [returns]
  );

  // Hourly heatmap
  const hourlyHeatmap = useMemo((): HourlyHeatmapData[] => {
    const result: HourlyHeatmapData[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d = 0; d < 7; d++) {
      for (let h = 7; h <= 20; h++) {
        const matchingSales = filteredSales.filter((s) => {
          const saleDate = new Date(s.timestamp);
          return saleDate.getDay() === d && saleDate.getHours() === h && s.status === "completed";
        });
        result.push({
          hour: h,
          day: days[d],
          sales: matchingSales.reduce((sum, s) => sum + s.total, 0),
          transactions: matchingSales.length,
        });
      }
    }
    return result;
  }, [filteredSales]);

  // Customer insights
  const customerInsights = useMemo((): CustomerInsight => {
    const completedSales = filteredSales.filter((s) => s.status === "completed");
    const registeredSales = completedSales.filter((s) => s.customerType === "registered");
    const customerSalesMap = new Map<string, { total: number; count: number; lastVisit: string }>();

    completedSales.forEach((s) => {
      if (s.customerId) {
        const existing = customerSalesMap.get(s.customerId);
        if (existing) {
          existing.total += s.total;
          existing.count++;
          if (s.timestamp > existing.lastVisit) existing.lastVisit = s.timestamp;
        } else {
          customerSalesMap.set(s.customerId, { total: s.total, count: 1, lastVisit: s.timestamp });
        }
      }
    });

    const topCustomers = Array.from(customerSalesMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: "Customer",
        phone: "",
        totalSpent: data.total,
        visits: data.count,
        lastVisit: data.lastVisit.slice(0, 10),
      }));

    return {
      newCustomers: Math.floor(registeredSales.length * 0.3),
      returningCustomers: Math.floor(registeredSales.length * 0.7),
      avgLifetimeValue: registeredSales.length > 0 ? Math.round(totalRevenue / Math.max(1, registeredSales.length) * 12) : 0,
      avgPurchaseFrequency: registeredSales.length > 0 ? Math.round((registeredSales.length / Math.max(1, customerSalesMap.size)) * 10) / 10 : 0,
      returnRate: completedSales.length > 0 ? Math.round((returns.length / Math.max(1, completedSales.length + returns.length)) * 100) : 0,
      topCustomers,
    };
  }, [filteredSales, returns, totalRevenue]);

  // Inventory impact
  const inventoryImpact = useMemo((): InventoryImpact[] => {
    return productAnalytics.slice(0, 10).map((p) => ({
      productId: p.id,
      name: p.name,
      currentStock: p.stockLevel,
      soldToday: p.unitsSold,
      daysUntilStockout: p.velocity > 0 ? Math.round(p.stockLevel / p.velocity) : 999,
      suggestedReorder: p.velocity > 0 ? Math.round(p.velocity * 14) : 0,
      status: p.stockLevel === 0 ? "out" : p.stockLevel < 5 ? "critical" : p.stockLevel < 20 ? "low" : p.stockLevel > 100 ? "overstocked" : "ok",
    }));
  }, [productAnalytics]);

  // Fraud alerts
  const fraudAlerts = useMemo((): FraudAlert[] => {
    const alerts: FraudAlert[] = [];
    cashierMetrics.forEach((cm) => {
      if (cm.voids > 5) {
        alerts.push({
          id: `fraud_voids_${cm.cashierId}`,
          type: "high_voids",
          severity: cm.voids > 10 ? "high" : "medium",
          description: `${cm.cashierName} has ${cm.voids} voided transactions`,
          cashierId: cm.cashierId,
          cashierName: cm.cashierName,
          timestamp: new Date().toISOString(),
          details: { voidCount: cm.voids },
        });
      }
      if (cm.refunds > 3) {
        alerts.push({
          id: `fraud_refunds_${cm.cashierId}`,
          type: "multiple_refunds",
          severity: cm.refunds > 5 ? "high" : "medium",
          description: `${cm.cashierName} processed ${cm.refunds} refunds`,
          cashierId: cm.cashierId,
          cashierName: cm.cashierName,
          timestamp: new Date().toISOString(),
          details: { refundCount: cm.refunds },
        });
      }
    });

    if (todayTotal > 0 && totalDiscountAmount > todayTotal * 0.15) {
      alerts.push({
        id: "fraud_discounts",
        type: "suspicious_discounts",
        severity: "high",
        description: `Total discounts (${totalDiscountAmount.toLocaleString()}) exceed 15% of revenue`,
        cashierId: "system",
        cashierName: "System",
        timestamp: new Date().toISOString(),
        details: { discountAmount: totalDiscountAmount, threshold: Math.round(todayTotal * 0.15) },
      });
    }

    return alerts;
  }, [cashierMetrics, todayTotal, totalDiscountAmount]);

  // Shops (single shop for now)
  const shops = useMemo((): ShopConsolidation[] => {
    return [
      {
        shopId: shopId || "",
        shopName: "My Shop",
        todayRevenue: todayTotal,
        todayTransactions: transactionCount,
        growthRate: trendPercent,
        isActive: true,
      },
    ];
  }, [shopId, todayTotal, transactionCount, trendPercent]);

  const refreshData = useCallback(() => {
    // Data refreshes automatically via Firebase subscription
  }, []);

  const exportPDF = useCallback(() => {
    const html = `<!DOCTYPE html><html><head><title>Sales Report - ${period}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a1a;max-width:800px;margin:0 auto}
      h1{font-size:24px;margin-bottom:4px} h2{font-size:16px;margin:20px 0 10px;border-bottom:2px solid #C75B39;padding-bottom:4px}
      .sub{color:#666;font-size:12px;margin-bottom:20px}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
      .card{background:#f9f5f2;border-radius:8px;padding:12px;text-align:center}
      .card .val{font-size:20px;font-weight:700} .card .lbl{font-size:10px;color:#666;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{text-align:left;padding:6px 8px;background:#f9f5f2;font-size:10px;text-transform:uppercase;color:#666}
      td{padding:6px 8px;border-bottom:1px solid #eee}
      .pos{color:#2D5A3D} .neg{color:#C75B39}
      .brand{color:#C75B39;font-weight:700}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>Duka<span class="brand">Manager</span> Sales Report</h1>
    <p class="sub">Generated: ${new Date().toLocaleString()} | Period: ${period}</p>
    <h2>Summary</h2>
    <div class="grid">
      <div class="card"><div class="val">KSh ${todayTotal.toLocaleString()}</div><div class="lbl">Today's Sales</div></div>
      <div class="card"><div class="val ${trendPercent >= 0 ? 'pos' : 'neg'}">${trendPercent >= 0 ? '↑' : '↓'} ${Math.abs(trendPercent)}%</div><div class="lbl">vs Yesterday</div></div>
      <div class="card"><div class="val">${transactionCount}</div><div class="lbl">Transactions</div></div>
      <div class="card"><div class="val">${totalItemsSold}</div><div class="lbl">Items Sold</div></div>
      <div class="card"><div class="val">KSh ${avgBasketValue.toLocaleString()}</div><div class="lbl">Avg Basket</div></div>
      <div class="card"><div class="val">${profitMargin}%</div><div class="lbl">Profit Margin</div></div>
    </div>
    <h2>Cashier Performance</h2>
    <table><tr><th>Cashier</th><th>Revenue</th><th>Transactions</th><th>Avg Sale</th><th>Refunds</th></tr>
    ${cashierMetrics.map((c) => `<tr><td>${c.cashierName}</td><td>KSh ${c.revenue.toLocaleString()}</td><td>${c.transactions}</td><td>KSh ${c.avgSale.toLocaleString()}</td><td class="${c.refunds > 0 ? 'neg' : 'pos'}">${c.refunds}</td></tr>`).join('')}
    </table>
    <h2>Top Products</h2>
    <table><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
    ${productAnalytics.slice(0, 10).map((p) => `<tr><td>${p.name}</td><td>${p.unitsSold}</td><td>KSh ${p.revenue.toLocaleString()}</td></tr>`).join('')}
    </table>
    <h2>Payment Breakdown</h2>
    <table><tr><th>Method</th><th>Total</th><th>Count</th><th>Share</th></tr>
    ${paymentBreakdown.map((p) => `<tr><td>${p.method.toUpperCase()}</td><td>KSh ${p.total.toLocaleString()}</td><td>${p.count}</td><td>${p.percentage}%</td></tr>`).join('')}
    </table>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }, [period, todayTotal, yesterdayTotal, trendPercent, transactionCount, totalItemsSold, avgBasketValue, totalProfit, profitMargin, activeCashiers, cashierMetrics, productAnalytics, paymentBreakdown, totalDiscountAmount, discounts.length, totalReturnAmount, returns.length]);

  const exportExcel = useCallback(() => {
    const csv = [
      "Date,Time,Cashier,Items,Total,Method,Status",
      ...filteredSales.map((s) =>
        `${s.timestamp.slice(0, 10)},${s.timestamp.slice(11, 16)},${s.cashierName},${s.items.length},${s.total},${s.method},${s.status}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredSales, period]);

  return {
    sales: enrichedSales,
    loading,
    period,
    customDateRange,
    setPeriod,
    setCustomDateRange,
    filteredSales,
    todayTotal,
    yesterdayTotal,
    trendPercent,
    transactionCount,
    totalItemsSold,
    avgBasketValue,
    totalProfit,
    profitMargin,
    activeCashiers,
    cashierMetrics,
    productAnalytics,
    paymentBreakdown,
    channelData,
    discounts,
    totalDiscountAmount,
    returns,
    totalReturnAmount,
    hourlyHeatmap,
    customerInsights,
    inventoryImpact,
    fraudAlerts,
    shops,
    refreshData,
    exportPDF,
    exportExcel,
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

function getStockStatus(product: { quantity: number; reorderPoint?: number }): "ok" | "low" | "critical" | "out" {
  if (product.quantity === 0) return "out";
  if (product.quantity <= (product.reorderPoint || 10) * 0.5) return "critical";
  if (product.quantity <= (product.reorderPoint || 10)) return "low";
  return "ok";
}
