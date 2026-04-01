"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export interface CashierUser {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  nationalId: string;
  role: "cashier" | "head_cashier" | "trainee";
  status: "active" | "suspended" | "offline";
  onlineStatus: "online" | "offline" | "on_break";
  pin: string;
  deviceId: string;
  deviceName: string;
  photoUrl: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  todayTransactions: number;
  todaySales: number;
  avgBasketSize: number;
  errorRate: number;
  permissions: CashierPermissions;
  createdAt: string;
  createdBy: string;
  lastLogin: string;
  lastActivity: string;
}

export interface CashierPermissions {
  processSales: boolean;
  applyDiscounts: boolean;
  maxDiscountPercent: number;
  handleRefunds: boolean;
  viewReports: boolean;
  manageInventory: boolean;
  openCloseRegister: boolean;
  voidTransactions: boolean;
}

export interface ActivityLog {
  id: string;
  cashierId: string;
  cashierName: string;
  action: "login" | "logout" | "sale" | "refund" | "discount" | "void" | "break_start" | "break_end" | "register_open" | "register_close" | "cash_drop" | "error";
  details: string;
  amount: number;
  paymentMethod: string;
  deviceId: string;
  timestamp: string;
  sessionDuration: number;
  anomalyFlags: string[];
}

const defaultPermissions: CashierPermissions = {
  processSales: true,
  applyDiscounts: true,
  maxDiscountPercent: 10,
  handleRefunds: false,
  viewReports: false,
  manageInventory: false,
  openCloseRegister: true,
  voidTransactions: false,
};

export function useCashierMonitoring() {
  const { shopId } = useAuth();
  const [cashiers, setCashiers] = useState<CashierUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!shopId) { setLoading(false); setCashiers([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Subscribe to users with cashier roles
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
          const data: CashierUser[] = [];
          snap.docs.forEach((d) => {
            const r = d.data();
            if (r.role === "cashier" || r.role === "head_cashier" || r.role === "trainee" || r.role === "manager") {
              data.push({
                uid: d.id,
                displayName: r.displayName || r.email?.split("@")[0] || "Cashier",
                email: r.email || "",
                phone: r.phone || "",
                nationalId: r.nationalId || "",
                role: r.role === "manager" ? "head_cashier" : (r.role || "cashier"),
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
                permissions: { ...defaultPermissions, ...(r.permissions || {}) },
                createdAt: r.createdAt || new Date().toISOString(),
                createdBy: r.createdBy || "",
                lastLogin: r.lastLogin || "",
                lastActivity: r.lastActivity || "",
              });
            }
          });
          setCashiers(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current.push(unsubUsers);

        // Subscribe to activity logs
        const unsubLogs = onSnapshot(
          query(collection(db, "shops", shopId, "activityLogs"), orderBy("timestamp", "desc"), limit(200)),
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
                timestamp: r.timestamp || r.createdAt || "",
                sessionDuration: Number(r.sessionDuration) || 0,
                anomalyFlags: r.anomalyFlags || [],
              };
            });
            setActivityLogs(logs);
          }
        );
        unsubRef.current.push(unsubLogs);
      } catch (err) {
        console.warn("Failed to init cashier monitoring:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId]);

  const addCashier = useCallback(async (data: {
    displayName: string;
    email: string;
    phone: string;
    nationalId: string;
    role: "cashier" | "head_cashier" | "trainee";
    pin: string;
    permissions: CashierPermissions;
    password: string;
  }) => {
    if (!shopId) throw new Error("No active shop");
    if (!data.email) throw new Error("Email is required");
    if (!data.password || data.password.length < 6) throw new Error("Password must be at least 6 characters");

    // Create auth account via secondary app
    const secondaryAppName = `cashier-${Date.now()}`;
    const { app: mainApp } = await import("@/lib/firebase/config");
    const { initializeApp: initApp, deleteApp } = await import("firebase/app");
    const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");
    const { setDoc: setFirestoreDoc } = await import("firebase/firestore");

    const secondaryApp = initApp(mainApp.options, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);

      const { db } = await import("@/lib/firebase/config");
      await setFirestoreDoc(doc(db, "users", cred.user.uid), {
        email: data.email,
        shopId,
        role: data.role,
        displayName: data.displayName,
        phone: data.phone,
        nationalId: data.nationalId,
        pin: data.pin,
        permissions: data.permissions,
        isActive: true,
        onlineStatus: "offline",
        todayTransactions: 0,
        todaySales: 0,
        avgBasketSize: 0,
        errorRate: 0,
        createdBy: "",
        createdAt: new Date().toISOString(),
      });

      // Log the creation
      await addDoc(collection(db, "shops", shopId, "activityLogs"), {
        cashierId: cred.user.uid,
        cashierName: "System",
        action: "login",
        details: `Cashier account created: ${data.displayName} (${data.role})`,
        amount: 0,
        timestamp: new Date().toISOString(),
      });

      return cred.user.uid;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create cashier account";
      throw new Error(message);
    } finally {
      await deleteApp(secondaryApp);
    }
  }, [shopId]);

  const updateCashierPermissions = useCallback(async (cashierId: string, permissions: Partial<CashierPermissions>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), { permissions });
  }, [shopId]);

  const suspendCashier = useCallback(async (cashierId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), { isActive: false, onlineStatus: "offline" });
  }, [shopId]);

  const activateCashier = useCallback(async (cashierId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    await updateDoc(doc(db, "users", cashierId), { isActive: true });
  }, [shopId]);

  const logActivity = useCallback(async (log: Omit<ActivityLog, "id">) => {
    if (!shopId) return;
    const { db } = await import("@/lib/firebase/config");
    await addDoc(collection(db, "shops", shopId, "activityLogs"), {
      ...log,
      timestamp: new Date().toISOString(),
    });
  }, [shopId]);

  // Computed stats
  const onlineCashiers = cashiers.filter((c) => c.onlineStatus === "online");
  const onBreakCashiers = cashiers.filter((c) => c.onlineStatus === "on_break");
  const todayTotalTransactions = cashiers.reduce((s, c) => s + c.todayTransactions, 0);
  const todayTotalSales = cashiers.reduce((s, c) => s + c.todaySales, 0);
  const avgTransactionsPerCashier = onlineCashiers.length > 0 ? Math.round(todayTotalTransactions / onlineCashiers.length) : 0;
  const anomalies = activityLogs.filter((l) => l.anomalyFlags.length > 0);

  return {
    cashiers,
    activityLogs,
    loading,
    addCashier,
    updateCashierPermissions,
    suspendCashier,
    activateCashier,
    logActivity,
    onlineCashiers,
    onBreakCashiers,
    todayTotalTransactions,
    todayTotalSales,
    avgTransactionsPerCashier,
    anomalies,
    defaultPermissions,
  };
}
