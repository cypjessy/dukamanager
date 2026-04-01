"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OfflineState, SyncQueueItem, ConflictItem, QueuePriority } from "@/types/cashier";
import { getOfflineManager } from "@/lib/offlineManager";

export function useOfflineSync() {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    connectionStatus: "online",
    lastOnlineAt: null,
    syncStatus: "idle",
    pendingItems: 0,
    failedItems: 0,
    conflicts: 0,
    lastSyncAt: null,
    syncProgress: 0,
  });

  const [showSyncModal, setShowSyncModal] = useState(false);
  const managerRef = useRef(getOfflineManager());

  useEffect(() => {
    const manager = managerRef.current;
    const unsubscribe = manager.subscribe(setState);
    return unsubscribe;
  }, []);

  const enqueue = useCallback(
    (type: SyncQueueItem["type"], data: Record<string, unknown>, priority: QueuePriority = "normal") => {
      return managerRef.current.enqueue(type, data, priority);
    },
    []
  );

  const processQueue = useCallback(async () => {
    setShowSyncModal(true);
    await managerRef.current.processQueue();
  }, []);

  const getQueue = useCallback((): SyncQueueItem[] => {
    return managerRef.current.getQueue();
  }, []);

  const getConflicts = useCallback((): ConflictItem[] => {
    return managerRef.current.getConflicts();
  }, []);

  const resolveConflict = useCallback((id: string, resolution: "local" | "server" | "manual") => {
    managerRef.current.resolveConflict(id, resolution);
  }, []);

  const saveOfflineTransaction = useCallback((transaction: Record<string, unknown>) => {
    managerRef.current.saveOfflineTransaction(transaction);
  }, []);

  const cacheProducts = useCallback((products: Record<string, unknown>[]) => {
    managerRef.current.cacheProducts(products);
  }, []);

  const cacheCustomers = useCallback((customers: Record<string, unknown>[]) => {
    managerRef.current.cacheCustomers(customers);
  }, []);

  const getCachedProducts = useCallback(() => {
    return managerRef.current.getCachedProducts();
  }, []);

  const getCachedCustomers = useCallback(() => {
    return managerRef.current.getCachedCustomers();
  }, []);

  const clearCompleted = useCallback(() => {
    managerRef.current.clearCompleted();
  }, []);

  // Auto-process queue when coming back online
  useEffect(() => {
    if (state.isOnline && state.pendingItems > 0 && state.syncStatus === "idle") {
      const timer = setTimeout(() => {
        managerRef.current.processQueue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.isOnline, state.pendingItems, state.syncStatus]);

  return {
    state,
    showSyncModal,
    setShowSyncModal,
    enqueue,
    processQueue,
    getQueue,
    getConflicts,
    resolveConflict,
    saveOfflineTransaction,
    cacheProducts,
    cacheCustomers,
    getCachedProducts,
    getCachedCustomers,
    clearCompleted,
  };
}
