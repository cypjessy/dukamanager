"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  where,
  deleteField,
} from "firebase/firestore";
import type { CashierUser, ActivityLog } from "@/hooks/useCashierMonitoring";

export interface LiveTransaction {
  id: string;
  cashierId: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  method: "mpesa" | "cash" | "credit" | "bank";
  status: "in_progress" | "completed";
  startedAt: string;
}

export interface CashDrawerState {
  cashierId: string;
  openingFloat: number;
  openingTime: string;
  currentCash: number;
  cashSales: number;
  cashRefunds: number;
  cashDrops: Array<{ amount: number; time: string; approvedBy: string }>;
  expectedBalance: number;
  actualBalance: number | null;
  variance: number;
  lastReconciled: string | null;
}

export interface HourlySalesData {
  hour: number;
  label: string;
  sales: number;
  transactions: number;
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  count: number;
  percentage: number;
  trend: number;
}

export interface SalesTarget {
  target: number;
  current: number;
  percentage: number;
  projected: number;
  status: "on_track" | "behind" | "ahead" | "exceeded";
}

export interface ShiftEvent {
  id: string;
  type: "login" | "logout" | "break_start" | "break_end" | "sale" | "refund" | "discount" | "void" | "register_open" | "register_close" | "cash_drop";
  time: string;
  details: string;
  amount?: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface BiometricStatus {
  fingerprintEnrolled: boolean;
  faceEnrolled: boolean;
  lastVerified: string | null;
}

export interface SuspiciousAlert {
  id: string;
  type: "high_void" | "discount_abuse" | "cash_discrepancy" | "rapid_transactions" | "unusual_hours";
  severity: "high" | "medium" | "low";
  message: string;
  details: string;
  timestamp: string;
}

export interface CashierTransaction {
  id: string;
  cashierId: string;
  items: Array<{ productId: string; name: string; qty: number; price: number }>;
  total: number;
  method: "mpesa" | "cash" | "credit" | "bank" | string;
  status: "completed" | "refunded" | string;
  receiptCode: string;
  timestamp: string;
  createdAt: string;
}

export interface CashierRefund {
  id: string;
  cashierId: string;
  cashierName: string;
  amount: number;
  details: string;
  timestamp: string;
  receiptCode: string;
}

export function useCashierLiveData(cashierId: string | null) {
  const { shopId } = useAuth();
  const [cashier, setCashier] = useState<CashierUser | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [liveTransaction, setLiveTransaction] = useState<LiveTransaction | null>(null);
  const [cashDrawer, setCashDrawer] = useState<CashDrawerState | null>(null);
  const [hourlySales, setHourlySales] = useState<HourlySalesData[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [salesTarget, setSalesTarget] = useState<SalesTarget | null>(null);
  const [shiftEvents, setShiftEvents] = useState<ShiftEvent[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [biometric, setBiometric] = useState<BiometricStatus>({ fingerprintEnrolled: false, faceEnrolled: false, lastVerified: null });
  const [suspiciousAlerts, setSuspiciousAlerts] = useState<SuspiciousAlert[]>([]);
  const [transactions, setTransactions] = useState<CashierTransaction[]>([]);
  const [idleTime, setIdleTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const unsubRef = useRef<(() => void)[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to cashier data
  useEffect(() => {
    if (!shopId || !cashierId) {
      setCashier(null);
      setActivityLogs([]);
      return;
    }

    setIsConnected(true);

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Subscribe to specific cashier user data
        const unsubUser = onSnapshot(doc(db, "users", cashierId), (snap) => {
          if (snap.exists()) {
            const r = snap.data();
            setCashier({
              uid: snap.id,
              displayName: r.displayName || "Cashier",
              email: r.email || "",
              phone: r.phone || "",
              nationalId: r.nationalId || "",
              role: r.role || "cashier",
              status: r.isActive !== false ? "active" : "suspended",
              onlineStatus: r.onlineStatus || "offline",
              pin: r.pin || "****",
              deviceId: r.deviceId || "",
              deviceName: r.deviceName || "",
              photoUrl: r.photoUrl || "",
              shiftStart: r.shiftStart || null,
              shiftEnd: r.shiftEnd || null,
              todayTransactions: Number(r.todayTransactions) || 0,
              todaySales: Number(r.todaySales) || 0,
              avgBasketSize: Number(r.avgBasketSize) || 0,
              errorRate: Number(r.errorRate) || 0,
              permissions: r.permissions || {},
              createdAt: r.createdAt || "",
              createdBy: r.createdBy || "",
              lastLogin: r.lastLogin || "",
              lastActivity: r.lastActivity || "",
            });
          }
        });
        unsubRef.current.push(unsubUser);

        // Subscribe to activity logs for this cashier
        const unsubLogs = onSnapshot(
          query(
            collection(db, "shops", shopId, "activityLogs"),
            where("cashierId", "==", cashierId),
            orderBy("timestamp", "desc"),
            limit(100)
          ),
          (snap) => {
            const logs: ActivityLog[] = snap.docs.map((d) => {
              const r = d.data();
              return {
                id: d.id,
                cashierId: r.cashierId || "",
                cashierName: r.cashierName || "Unknown",
                action: r.action || "error",
                details: r.details || "",
                amount: Number(r.amount) || 0,
                paymentMethod: r.paymentMethod || "",
                deviceId: r.deviceId || "",
                timestamp: r.timestamp || "",
                sessionDuration: Number(r.sessionDuration) || 0,
                anomalyFlags: r.anomalyFlags || [],
              };
            });
            setActivityLogs(logs);
          }
        );
        unsubRef.current.push(unsubLogs);

        // Subscribe to live transactions
        const unsubTxn = onSnapshot(
          query(
            collection(db, "shops", shopId, "transactions"),
            where("cashierId", "==", cashierId),
            where("status", "==", "in_progress"),
            limit(1)
          ),
          (snap) => {
            if (snap.docs.length > 0) {
              const d = snap.docs[0];
              const r = d.data();
              setLiveTransaction({
                id: d.id,
                cashierId: r.cashierId || "",
                items: r.items || [],
                total: Number(r.total) || 0,
                method: r.method || "cash",
                status: r.status || "in_progress",
                startedAt: r.startedAt || "",
              });
            } else {
              setLiveTransaction(null);
            }
          }
        );
        unsubRef.current.push(unsubTxn);

        // Subscribe to cash drawer state
        const unsubDrawer = onSnapshot(
          doc(db, "shops", shopId, "cashDrawers", cashierId),
          (snap) => {
            if (snap.exists()) {
              const r = snap.data();
              const currentCash = Number(r.currentCash) || 0;
              const expectedBalance = Number(r.expectedBalance) || 0;
              setCashDrawer({
                cashierId: snap.id,
                openingFloat: Number(r.openingFloat) || 0,
                openingTime: r.openingTime || "",
                currentCash,
                cashSales: Number(r.cashSales) || 0,
                cashRefunds: Number(r.cashRefunds) || 0,
                cashDrops: r.cashDrops || [],
                expectedBalance,
                actualBalance: r.actualBalance != null ? Number(r.actualBalance) : null,
                variance: r.actualBalance != null ? Number(r.actualBalance) - expectedBalance : 0,
                lastReconciled: r.lastReconciled || null,
              });
            } else {
              setCashDrawer(null);
            }
          }
        );
        unsubRef.current.push(unsubDrawer);

        // Subscribe to audit trail
        const unsubAudit = onSnapshot(
          query(
            collection(db, "shops", shopId, "auditTrail"),
            where("cashierId", "==", cashierId),
            orderBy("timestamp", "desc"),
            limit(50)
          ),
          (snap) => {
            const entries: AuditEntry[] = snap.docs.map((d) => {
              const r = d.data();
              return {
                id: d.id,
                action: r.action || "",
                performedBy: r.performedBy || "",
                timestamp: r.timestamp || "",
                details: r.details || "",
              };
            });
            setAuditTrail(entries);
          }
        );
        unsubRef.current.push(unsubAudit);

        // Subscribe to sales transactions for this cashier
        const unsubSales = onSnapshot(
          query(
            collection(db, "shops", shopId, "sales"),
            where("cashierId", "==", cashierId),
            orderBy("createdAt", "desc"),
            limit(200)
          ),
          (snap) => {
            const txns: CashierTransaction[] = snap.docs.map((d) => {
              const r = d.data();
              return {
                id: d.id,
                cashierId: r.cashierId || "",
                items: (r.items || []).map((i: Record<string, unknown>) => ({
                  productId: String(i.productId || ""),
                  name: String(i.name || "Unknown"),
                  qty: Number(i.qty || 0),
                  price: Number(i.price || 0),
                })),
                total: Number(r.total) || 0,
                method: r.method || "cash",
                status: r.status || "completed",
                receiptCode: r.receiptCode || "",
                timestamp: r.timestamp || r.createdAt || "",
                createdAt: r.createdAt || "",
              };
            });
            setTransactions(txns);
          }
        );
        unsubRef.current.push(unsubSales);
      } catch (err) {
        console.warn("Failed to init cashier live data:", err);
        setIsConnected(false);
      }
    };

    init();
    return () => {
      unsubRef.current.forEach((u) => u());
      unsubRef.current = [];
      setIsConnected(false);
    };
  }, [shopId, cashierId]);

  // Compute derived data from activity logs
  useEffect(() => {
    if (!activityLogs.length) return;

    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = activityLogs.filter((l) => l.timestamp?.startsWith(today));

    // Hourly sales breakdown
    const hours: HourlySalesData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, "0")}:00`,
      sales: 0,
      transactions: 0,
    }));
    todayLogs.filter((l) => l.action === "sale").forEach((log) => {
      const h = new Date(log.timestamp).getHours();
      hours[h].sales += log.amount;
      hours[h].transactions += 1;
    });
    setHourlySales(hours);

    // Payment method breakdown
    const paymentMap: Record<string, { amount: number; count: number }> = {};
    const totalSales = todayLogs.filter((l) => l.action === "sale").reduce((s, l) => s + l.amount, 0);
    todayLogs.filter((l) => l.action === "sale").forEach((log) => {
      const method = log.paymentMethod || "cash";
      if (!paymentMap[method]) paymentMap[method] = { amount: 0, count: 0 };
      paymentMap[method].amount += log.amount;
      paymentMap[method].count += 1;
    });
    const breakdown: PaymentBreakdown[] = Object.entries(paymentMap).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalSales > 0 ? Math.round((data.amount / totalSales) * 100) : 0,
      trend: Math.round((Math.random() - 0.3) * 20),
    }));
    setPaymentBreakdown(breakdown);

    // Sales target
    const target = 10000;
    const projected = hours.filter((h) => h.hour <= new Date().getHours()).reduce((s, h) => s + h.sales, 0) > 0
      ? Math.round((totalSales / (new Date().getHours() + 1)) * 12)
      : totalSales;
    setSalesTarget({
      target,
      current: totalSales,
      percentage: Math.min(100, Math.round((totalSales / target) * 100)),
      projected,
      status: totalSales >= target ? "exceeded" : projected >= target ? "on_track" : projected >= target * 0.7 ? "behind" : "behind",
    });

    // Shift events timeline
    const events: ShiftEvent[] = todayLogs.slice(0, 30).map((log) => ({
      id: log.id,
      type: log.action as ShiftEvent["type"],
      time: log.timestamp,
      details: log.details,
      amount: log.amount > 0 ? log.amount : undefined,
    }));
    setShiftEvents(events);

    // Suspicious activity detection
    const alerts: SuspiciousAlert[] = [];
    const voids = todayLogs.filter((l) => l.action === "void");
    const voidRate = cashier ? (cashier.todayTransactions > 0 ? (voids.length / cashier.todayTransactions) * 100 : 0) : 0;
    if (voidRate > 10 && (cashier?.todayTransactions || 0) >= 5) {
      alerts.push({
        id: "void-alert",
        type: "high_void",
        severity: voidRate > 25 ? "high" : "medium",
        message: `High void rate: ${voidRate.toFixed(1)}%`,
        details: `${voids.length} voids out of ${cashier?.todayTransactions} transactions`,
        timestamp: new Date().toISOString(),
      });
    }
    const discounts = todayLogs.filter((l) => l.action === "discount");
    const totalDiscounts = discounts.reduce((s, l) => s + l.amount, 0);
    if (discounts.length > 5 || totalDiscounts > totalSales * 0.15) {
      alerts.push({
        id: "discount-alert",
        type: "discount_abuse",
        severity: totalDiscounts > totalSales * 0.2 ? "high" : "medium",
        message: "Excessive discounts detected",
        details: `${discounts.length} discounts totaling KSh ${totalDiscounts.toLocaleString()}`,
        timestamp: new Date().toISOString(),
      });
    }
    if (cashier && cashier.errorRate > 5) {
      alerts.push({
        id: "error-alert",
        type: "cash_discrepancy",
        severity: cashier.errorRate > 15 ? "high" : "medium",
        message: `High error rate: ${cashier.errorRate}%`,
        details: "Error rate exceeds acceptable threshold",
        timestamp: new Date().toISOString(),
      });
    }
    setSuspiciousAlerts(alerts);
  }, [activityLogs, cashier]);

  // Idle time tracking
  useEffect(() => {
    if (!cashier || cashier.onlineStatus !== "online") {
      setIdleTime(0);
      return;
    }

    const lastActivityTime = cashier.lastActivity ? new Date(cashier.lastActivity).getTime() : Date.now();
    const updateIdle = () => {
      const now = Date.now();
      setIdleTime(Math.floor((now - lastActivityTime) / 1000));
    };

    updateIdle();
    idleTimerRef.current = setInterval(updateIdle, 30000);
    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [cashier]);

  // Biometric status (simulated based on cashier data)
  useEffect(() => {
    if (cashier) {
      setBiometric({
        fingerprintEnrolled: Boolean(cashier.deviceId),
        faceEnrolled: false,
        lastVerified: cashier.lastLogin || null,
      });
    }
  }, [cashier]);

  // Admin actions
  const lockPortal = useCallback(async () => {
    if (!shopId || !cashierId) return;
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), {
      isActive: false,
      onlineStatus: "offline",
      forceLogoutAt: new Date().toISOString(),
    });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "portal_locked",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: "Portal locked by administrator",
    });
  }, [shopId, cashierId]);

  const unlockPortal = useCallback(async () => {
    if (!shopId || !cashierId) return;
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), {
      isActive: true,
      forceLogoutAt: deleteField(),
    });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "portal_unlocked",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: "Portal unlocked by administrator",
    });
  }, [shopId, cashierId]);

  const forceLogout = useCallback(async () => {
    if (!shopId || !cashierId) return;
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), { onlineStatus: "offline", forceLogoutAt: new Date().toISOString() });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "force_logout",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: "Forced logout by administrator",
    });
  }, [shopId, cashierId]);

  const grantPermission = useCallback(async (permission: string, value: boolean) => {
    if (!shopId || !cashierId) return;
    const { db } = await import("@/lib/firebase/config");
    const currentPerms = cashier?.permissions || {};
    await updateDoc(doc(db, "users", cashierId), { permissions: { ...currentPerms, [permission]: value } });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "permission_override",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: `Permission "${permission}" ${value ? "granted" : "revoked"}`,
    });
  }, [shopId, cashierId, cashier]);

  const sendMessage = useCallback(async (message: string) => {
    if (!shopId || !cashierId || !message.trim()) return;
    const { db } = await import("@/lib/firebase/config");
    await addDoc(collection(db, "shops", shopId, "messages"), {
      cashierId,
      message: message.trim(),
      sentBy: "admin",
      sentAt: new Date().toISOString(),
      read: false,
    });
  }, [shopId, cashierId]);

  const performCashDrop = useCallback(async (amount: number) => {
    if (!shopId || !cashierId || amount <= 0) return;
    const { db } = await import("@/lib/firebase/config");
    const drawerRef = doc(db, "shops", shopId, "cashDrawers", cashierId);
    const currentDrops = cashDrawer?.cashDrops || [];
    await updateDoc(drawerRef, {
      cashDrops: [...currentDrops, { amount, time: new Date().toISOString(), approvedBy: "admin" }],
      currentCash: (cashDrawer?.currentCash || 0) - amount,
    });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "cash_drop",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: `Cash drop of KSh ${amount.toLocaleString()} to safe`,
    });
  }, [shopId, cashierId, cashDrawer]);

  const reconcileDrawer = useCallback(async (actualAmount: number) => {
    if (!shopId || !cashierId) return;
    const { db } = await import("@/lib/firebase/config");
    const expected = cashDrawer?.expectedBalance || 0;
    const variance = actualAmount - expected;
    const drawerRef = doc(db, "shops", shopId, "cashDrawers", cashierId);
    await updateDoc(drawerRef, {
      actualBalance: actualAmount,
      variance,
      lastReconciled: new Date().toISOString(),
    });
    await addDoc(collection(db, "shops", shopId, "auditTrail"), {
      cashierId,
      action: "reconciliation",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      details: `Reconciliation: Expected KSh ${expected.toLocaleString()}, Actual KSh ${actualAmount.toLocaleString()}, Variance KSh ${variance.toLocaleString()}`,
    });
  }, [shopId, cashierId, cashDrawer]);

  // Weekly and monthly sales (computed from logs)
  const weeklySales = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityLogs
      .filter((l) => l.action === "sale" && new Date(l.timestamp) >= weekAgo)
      .reduce((s, l) => s + l.amount, 0);
  }, [activityLogs]);

  const monthlySales = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return activityLogs
      .filter((l) => l.action === "sale" && new Date(l.timestamp) >= monthAgo)
      .reduce((s, l) => s + l.amount, 0);
  }, [activityLogs]);

  // Extract refunds from activity logs
  const computedRefunds = useMemo(() => {
    return activityLogs
      .filter((l) => l.action === "refund")
      .map((l) => ({
        id: l.id,
        cashierId: l.cashierId,
        cashierName: l.cashierName,
        amount: l.amount,
        details: l.details,
        timestamp: l.timestamp,
        receiptCode: "",
      }));
  }, [activityLogs]);

  return {
    cashier,
    activityLogs,
    liveTransaction,
    cashDrawer,
    hourlySales,
    paymentBreakdown,
    salesTarget,
    shiftEvents,
    auditTrail,
    biometric,
    suspiciousAlerts,
    idleTime,
    isConnected,
    weeklySales,
    monthlySales,
    transactions,
    refunds: computedRefunds,
    lockPortal,
    unlockPortal,
    forceLogout,
    grantPermission,
    sendMessage,
    performCashDrop,
    reconcileDrawer,
  };
}
