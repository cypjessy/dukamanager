"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import type { ReturnRequest, ReturnItem } from "@/data/returnData";
import { reasonConfig, statusConfig } from "@/data/returnData";

export function useReturnsFirestore() {
  const { shopId } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)>();

  useEffect(() => {
    if (!shopId) { setLoading(false); setReturns([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const unsub = onSnapshot(collection(db, "shops", shopId, "returns"), (snap) => {
          const data: ReturnRequest[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              returnNo: r.returnNo || `RET-${d.id.slice(-4).toUpperCase()}`,
              type: r.type || "customer",
              originalReceipt: r.originalReceipt || "",
              customerName: r.customerName || "",
              customerPhone: r.customerPhone || "",
              items: (r.items || []).map((i: Record<string, unknown>) => ({
                productName: String(i.productName || ""),
                sku: String(i.sku || ""),
                quantity: Number(i.quantity) || 0,
                unitPrice: Number(i.unitPrice) || 0,
                total: Number(i.total) || 0,
              })) as ReturnItem[],
              totalValue: Number(r.totalValue) || 0,
              reason: r.reason || "changed_mind",
              reasonNote: r.reasonNote || "",
              condition: r.condition || "sellable",
              refundMethod: r.refundMethod || "cash",
              refundAmount: Number(r.refundAmount) || 0,
              status: r.status || "pending",
              approvedBy: r.approvedBy || "",
              processedDate: r.processedDate || "",
              createdDate: r.createdDate || r.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            };
          });
          setReturns(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current = unsub;
      } catch (err) {
        console.warn("Failed to init returns:", err);
        setLoading(false);
      }
    };

    init();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [shopId]);

  const processReturn = useCallback(async (data: Partial<ReturnRequest>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date();
    const returnNo = `RET-${now.getTime().toString(36).toUpperCase().slice(-5)}`;
    return addDoc(collection(db, "shops", shopId, "returns"), {
      returnNo,
      type: data.type || "customer",
      originalReceipt: data.originalReceipt || "",
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      items: data.items || [],
      totalValue: Number(data.totalValue) || 0,
      reason: data.reason || "changed_mind",
      reasonNote: data.reasonNote || "",
      condition: data.condition || "sellable",
      refundMethod: data.refundMethod || "cash",
      refundAmount: Number(data.refundAmount) || 0,
      status: "pending",
      approvedBy: "",
      processedDate: "",
      createdDate: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
    });
  }, [shopId]);

  const updateReturnStatus = useCallback(async (id: string, status: ReturnRequest["status"], approvedBy?: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const updates: Record<string, unknown> = { status };
    if (approvedBy) updates.approvedBy = approvedBy;
    if (status === "completed" || status === "approved") updates.processedDate = new Date().toISOString().slice(0, 10);
    return updateDoc(doc(db, "shops", shopId, "returns", id), updates);
  }, [shopId]);

  // Computed stats
  const today = new Date().toISOString().slice(0, 10);
  const todayReturns = returns.filter((r) => r.createdDate === today).reduce((s, r) => s + r.totalValue, 0);
  const pendingCount = returns.filter((r) => r.status === "pending" || r.status === "processing").length;
  const completedReturns = returns.filter((r) => r.status === "completed");
  const totalRefunds = completedReturns.filter((r) => r.type === "customer").reduce((s, r) => s + r.refundAmount, 0);
  const returnRate = returns.length > 0 ? Math.round((returns.filter((r) => r.status !== "rejected").length / Math.max(returns.length, 1)) * 100) : 0;

  return {
    returns,
    loading,
    processReturn,
    updateReturnStatus,
    todayReturns,
    pendingCount,
    totalRefunds,
    returnRate,
    reasonConfig,
    statusConfig,
  };
}
