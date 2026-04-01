"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ShopTenant, TenantStatus, SubscriptionTier, ShopHealthAlert, ShopActivity } from "@/data/developerData";

export interface PlatformMetrics {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  totalUsers: number;
  activeUsers: number;
  newShopsThisMonth: number;
  churnRate: number;
}

export function useDeveloperData() {
  const [shops, setShops] = useState<ShopTenant[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalShops: 0, activeShops: 0, totalRevenue: 0,
    monthlyRevenue: 0, totalTransactions: 0, totalUsers: 0,
    activeUsers: 0, newShopsThisMonth: 0, churnRate: 0,
  });
  const [alerts, setAlerts] = useState<ShopHealthAlert[]>([]);
  const [activities, setActivities] = useState<ShopActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllShops = useCallback(async () => {
    try {
      const shopsSnap = await getDocs(collection(db, "shops"));
      const usersSnap = await getDocs(collection(db, "users"));
      const usersByShop: Record<string, any[]> = {};
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (!usersByShop[data.shopId]) usersByShop[data.shopId] = [];
        usersByShop[data.shopId].push(data);
      });

      let totalRevenue = 0;
      let totalTransactions = 0;
      let activeCount = 0;
      let totalUsers = 0;
      let activeUsers = 0;
      const now = new Date();
      let newThisMonth = 0;

      const tenants: ShopTenant[] = shopsSnap.docs.map((shopDoc) => {
        const shopData = shopDoc.data();
        const shopId = shopDoc.id;
        const shopUsers = usersByShop[shopId] || [];
        const usersCount = shopUsers.length;
        totalUsers += usersCount;
        activeUsers += shopUsers.filter((u) => u.isActive !== false).length;

        const created = new Date(shopData.createdAt || 0);
        if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) {
          newThisMonth++;
        }

        return {
          id: shopId,
          name: shopData.shopName || "Unknown Shop",
          slug: shopId,
          location: shopData.location || "",
          county: shopData.county || "",
          owner: shopData.ownerName || shopUsers[0]?.displayName || "Unknown",
          phone: shopData.phone || shopUsers[0]?.phone || "",
          email: shopUsers[0]?.email || "",
          logo: null,
          status: (shopData.status || "active") as TenantStatus,
          subscription: (shopData.plan || "free") as SubscriptionTier,
          createdAt: shopData.createdAt || "",
          lastActive: shopData.lastActive || "",
          transactionCount: shopData.transactionCount || 0,
          monthlyRevenue: shopData.monthlyRevenue || 0,
          dailyTransactions: shopData.dailyTransactions || [],
          productCount: shopData.productCount || 0,
          customerCount: shopData.customerCount || 0,
          activeUsers: shopUsers.filter((u) => u.isActive !== false).length,
          kraCompliant: shopData.kraCompliant || false,
          mpesaConfigured: shopData.mpesaConfigured || false,
          settings: {
            currency: "KES",
            taxRate: 16,
            mpesaTill: "",
            receiptFooter: "",
            categories: [],
            notifications: { sms: false, email: false, whatsapp: false },
          },
        };
      });

      tenants.forEach((t) => {
        totalRevenue += t.monthlyRevenue;
        totalTransactions += t.transactionCount;
        if (t.status === "active") activeCount++;
      });

      setShops(tenants);
      setMetrics({
        totalShops: tenants.length,
        activeShops: activeCount,
        totalRevenue,
        monthlyRevenue: totalRevenue,
        totalTransactions,
        totalUsers,
        activeUsers,
        newShopsThisMonth: newThisMonth,
        churnRate: tenants.length > 0 ? Math.round((tenants.filter((t) => t.status === "suspended").length / tenants.length) * 100) : 0,
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      setError(err instanceof Error ? err.message : "Failed to load shops");
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const generated: ShopHealthAlert[] = [];
      for (const shop of shops) {
        if (!shop.mpesaConfigured && shop.status === "active") {
          generated.push({
            id: `alert-${shop.id}-mpesa`,
            tenantId: shop.id,
            tenantName: shop.name,
            type: "mpesa_unconfigured",
            severity: "warning",
            message: "M-Pesa not configured",
            createdAt: new Date().toISOString(),
            resolved: false,
          });
        }
        if (shop.status === "suspended") {
          generated.push({
            id: `alert-${shop.id}-sub`,
            tenantId: shop.id,
            tenantName: shop.name,
            type: "subscription_expiring",
            severity: "critical",
            message: "Shop suspended",
            createdAt: new Date().toISOString(),
            resolved: false,
          });
        }
      }
      setAlerts(generated);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  }, [shops]);

  const fetchActivities = useCallback(async () => {
    try {
      const allActivities: ShopActivity[] = [];
      for (const shop of shops.slice(0, 10)) {
        try {
          const snap = await getDocs(collection(db, "shops", shop.id, "activityLogs"));
          snap.docs.slice(0, 5).forEach((doc) => {
            const data = doc.data();
            allActivities.push({
              id: doc.id,
              tenantId: shop.id,
              type: (data.type || "settings") as ShopActivity["type"],
              description: data.description || "Activity recorded",
              user: data.user || "Unknown",
              timestamp: data.timestamp || new Date().toISOString(),
            });
          });
        } catch {
          // Skip shops without activity logs
        }
      }
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities.slice(0, 50));
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  }, [shops]);

  const updateShopStatus = useCallback(async (shopId: string, status: TenantStatus) => {
    try {
      await updateDoc(doc(db, "shops", shopId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, status } : s))
      );
    } catch (err) {
      console.error("Failed to update shop status:", err);
      throw err;
    }
  }, []);

  const updateShopPlan = useCallback(async (shopId: string, plan: SubscriptionTier) => {
    try {
      await updateDoc(doc(db, "shops", shopId), {
        plan,
        updatedAt: new Date().toISOString(),
      });
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, subscription: plan } : s))
      );
    } catch (err) {
      console.error("Failed to update shop plan:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAllShops();
  }, [fetchAllShops]);

  useEffect(() => {
    if (shops.length > 0) {
      fetchAlerts();
      fetchActivities();
    }
  }, [shops, fetchAlerts, fetchActivities]);

  return {
    shops,
    metrics,
    alerts,
    activities,
    loading,
    error,
    updateShopStatus,
    updateShopPlan,
    refresh: fetchAllShops,
  };
}
