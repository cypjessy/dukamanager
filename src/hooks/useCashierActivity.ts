"use client";

import { useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";

export function useCashierActivity() {
  const { shopId, user, profile } = useAuth();
  const lastActivityRef = useRef(Date.now());

  const writeActivityLog = useCallback(async (data: {
    action: string;
    details: string;
    amount?: number;
    paymentMethod?: string;
  }) => {
    if (!shopId || !user) return;
    try {
      const { db } = await import("@/lib/firebase/config");
      const { addDoc, collection } = await import("firebase/firestore");
      await addDoc(collection(db, "shops", shopId, "activityLogs"), {
        cashierId: user.uid,
        cashierName: profile?.displayName || profile?.email?.split("@")[0] || "Cashier",
        action: data.action,
        details: data.details,
        amount: data.amount || 0,
        paymentMethod: data.paymentMethod || "",
        deviceId: "",
        timestamp: new Date().toISOString(),
        sessionDuration: 0,
        anomalyFlags: [],
      });
    } catch (e) {
      console.warn("Failed to write activity log:", e);
    }
  }, [shopId, user, profile]);

  const updateUserDoc = useCallback(async (data: Record<string, unknown>) => {
    if (!user) return;
    try {
      const { db } = await import("@/lib/firebase/config");
      const { updateDoc, doc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", user.uid), data);
    } catch (e) {
      console.warn("Failed to update user doc:", e);
    }
  }, [user]);

  const logLogin = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    await Promise.all([
      writeActivityLog({ action: "login", details: "Shift started" }),
      updateUserDoc({
        onlineStatus: "online",
        shiftStart: now,
        lastLogin: now,
        lastActivity: now,
      }),
    ]);
  }, [user, writeActivityLog, updateUserDoc]);

  const logSale = useCallback(async (data: {
    total: number;
    method: string;
    itemCount: number;
    receiptCode?: string;
  }) => {
    if (!user || !shopId) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    await writeActivityLog({
      action: "sale",
      details: `${data.itemCount} item(s) - ${data.receiptCode || "N/A"}`,
      amount: data.total,
      paymentMethod: data.method,
    });

    try {
      const { db } = await import("@/lib/firebase/config");
      const { getDoc, doc, updateDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let todayTransactions = 1;
      let todaySales = data.total;
      let totalItems = data.itemCount;

      if (userSnap.exists()) {
        const r = userSnap.data();
        const lastDate = r.lastSaleDate || "";
        if (lastDate === today) {
          todayTransactions = (Number(r.todayTransactions) || 0) + 1;
          todaySales = (Number(r.todaySales) || 0) + data.total;
          totalItems = (Number(r.totalItemsToday) || 0) + data.itemCount;
        }
      }

      await updateDoc(userRef, {
        todayTransactions,
        todaySales,
        avgBasketSize: todayTransactions > 0 ? Math.round(todaySales / todayTransactions) : 0,
        totalItemsToday: totalItems,
        lastSaleDate: today,
        lastActivity: now,
      });
    } catch (e) {
      console.warn("Failed to update user stats on sale:", e);
    }

    // Update cash drawer
    try {
      const { db } = await import("@/lib/firebase/config");
      const { getDoc, doc, updateDoc, setDoc } = await import("firebase/firestore");
      const drawerRef = doc(db, "shops", shopId, "cashDrawers", user.uid);
      const drawerSnap = await getDoc(drawerRef);

      if (data.method === "cash") {
        if (drawerSnap.exists()) {
          const d = drawerSnap.data();
          const newCashSales = (Number(d.cashSales) || 0) + data.total;
          const newCurrentCash = (Number(d.currentCash) || 0) + data.total;
          await updateDoc(drawerRef, {
            cashSales: newCashSales,
            currentCash: newCurrentCash,
            expectedBalance: (Number(d.openingFloat) || 0) + newCashSales - (Number(d.cashRefunds) || 0) - (d.cashDrops || []).reduce((s: number, c: { amount: number }) => s + c.amount, 0),
          });
        } else {
          await setDoc(drawerRef, {
            openingFloat: 0,
            openingTime: now,
            currentCash: data.total,
            cashSales: data.total,
            cashRefunds: 0,
            cashDrops: [],
            expectedBalance: data.total,
            actualBalance: null,
            lastReconciled: null,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to update cash drawer on sale:", e);
    }
  }, [user, shopId, writeActivityLog]);

  const logRefund = useCallback(async (data: { amount: number; details: string }) => {
    await writeActivityLog({ action: "refund", details: data.details, amount: data.amount });
    await updateUserDoc({ lastActivity: new Date().toISOString() });
  }, [writeActivityLog, updateUserDoc]);

  const logRegisterOpen = useCallback(async (float: number) => {
    if (!shopId || !user) return;
    const now = new Date().toISOString();
    await Promise.all([
      writeActivityLog({ action: "register_open", details: `Register opened with KSh ${float.toLocaleString()} float` }),
      updateUserDoc({ lastActivity: now }),
      (async () => {
        try {
          const { db } = await import("@/lib/firebase/config");
          const { setDoc, doc } = await import("firebase/firestore");
          await setDoc(doc(db, "shops", shopId, "cashDrawers", user.uid), {
            openingFloat: float,
            openingTime: now,
            currentCash: float,
            cashSales: 0,
            cashRefunds: 0,
            cashDrops: [],
            expectedBalance: float,
            actualBalance: null,
            lastReconciled: null,
          });
        } catch (e) {
          console.warn("Failed to init cash drawer:", e);
        }
      })(),
    ]);
  }, [shopId, user, writeActivityLog, updateUserDoc]);

  const logRegisterClose = useCallback(async () => {
    await writeActivityLog({ action: "register_close", details: "Register closed" });
    await updateUserDoc({ lastActivity: new Date().toISOString() });
  }, [writeActivityLog, updateUserDoc]);

  const logLogout = useCallback(async () => {
    const now = new Date().toISOString();
    await Promise.all([
      writeActivityLog({ action: "logout", details: "Shift ended" }),
      updateUserDoc({
        onlineStatus: "offline",
        shiftEnd: now,
        lastActivity: now,
      }),
    ]);
  }, [writeActivityLog, updateUserDoc]);

  const updateActivity = useCallback(async () => {
    const now = Date.now();
    if (now - lastActivityRef.current > 30000) {
      lastActivityRef.current = now;
      await updateUserDoc({ lastActivity: new Date().toISOString() });
    }
  }, [updateUserDoc]);

  return {
    logLogin,
    logSale,
    logRefund,
    logRegisterOpen,
    logRegisterClose,
    logLogout,
    updateActivity,
    writeActivityLog,
  };
}
