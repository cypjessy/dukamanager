import type { SyncQueueItem, ConflictItem, OfflineState, QueuePriority } from "@/types/cashier";

const QUEUE_KEY = "duka-sync-queue";
const CONFLICTS_KEY = "duka-conflicts";
const OFFLINE_TX_KEY = "duka-offline-transactions";
const CACHED_PRODUCTS_KEY = "duka-cached-products";
const CACHED_CUSTOMERS_KEY = "duka-cached-customers";
const LAST_SYNC_KEY = "duka-last-sync";
const SYNC_WINDOW_DAYS = 30;

type Listener = (state: OfflineState) => void;

class OfflineManager {
  private listeners: Set<Listener> = new Set();
  private state: OfflineState = {
    isOnline: true,
    connectionStatus: "online",
    lastOnlineAt: null,
    syncStatus: "idle",
    pendingItems: 0,
    failedItems: 0,
    conflicts: 0,
    lastSyncAt: null,
    syncProgress: 0,
  };
  private syncInProgress = false;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.state.isOnline = navigator.onLine;
      this.state.connectionStatus = navigator.onLine ? "online" : "offline";
      this.loadPersistedState();

      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  private loadPersistedState() {
    try {
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (lastSync) this.state.lastSyncAt = lastSync;

      const queue = this.getQueue();
      this.state.pendingItems = queue.filter((q) => q.status === "pending").length;
      this.state.failedItems = queue.filter((q) => q.status === "failed").length;

      const conflicts = this.getConflicts();
      this.state.conflicts = conflicts.filter((c) => c.resolution === "pending").length;
    } catch {
      // Silent fail
    }
  }

  private handleOnline() {
    this.state.isOnline = true;
    this.state.connectionStatus = "online";
    this.state.lastOnlineAt = new Date().toISOString();
    this.notify();
    this.processQueue();
  }

  private handleOffline() {
    this.state.isOnline = false;
    this.state.connectionStatus = "offline";
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  getState(): OfflineState {
    return { ...this.state };
  }

  // Queue management
  getQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncQueueItem[]) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    this.state.pendingItems = queue.filter((q) => q.status === "pending").length;
    this.state.failedItems = queue.filter((q) => q.status === "failed").length;
    this.notify();
  }

  enqueue(type: SyncQueueItem["type"], data: Record<string, unknown>, priority: QueuePriority = "normal"): string {
    const queue = this.getQueue();
    const item: SyncQueueItem = {
      id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      data,
      priority,
      retryCount: 0,
      maxRetries: priority === "critical" ? 10 : priority === "high" ? 5 : 3,
      createdAt: new Date().toISOString(),
      lastAttempt: null,
      error: null,
      status: "pending",
    };

    queue.push(item);
    this.sortQueue(queue);
    this.saveQueue(queue);

    if (this.state.isOnline) {
      this.processQueue();
    }

    return item.id;
  }

  private sortQueue(queue: SyncQueueItem[]) {
    const priorityOrder: Record<QueuePriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    queue.sort((a, b) => {
      if (a.status === "failed" && b.status !== "failed") return -1;
      if (b.status === "failed" && a.status !== "failed") return 1;
      if (a.status === "synced" && b.status !== "synced") return 1;
      if (b.status === "synced" && a.status !== "synced") return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.state.isOnline) return;
    this.syncInProgress = true;
    this.state.syncStatus = "syncing";
    this.state.syncProgress = 0;
    this.notify();

    const queue = this.getQueue();
    const pending = queue.filter((q) => q.status === "pending" || q.status === "failed");

    if (pending.length === 0) {
      this.syncInProgress = false;
      this.state.syncStatus = "success";
      this.state.syncProgress = 100;
      this.notify();
      setTimeout(() => {
        this.state.syncStatus = "idle";
        this.notify();
      }, 2000);
      return;
    }

    let processed = 0;

    for (const item of pending) {
      try {
        item.status = "processing";
        item.lastAttempt = new Date().toISOString();
        this.saveQueue(queue);

        // Simulate sync with server
        await this.simulateSync(item);

        item.status = "synced";
        item.error = null;
      } catch (err) {
        item.retryCount++;
        item.error = err instanceof Error ? err.message : "Sync failed";

        if (item.retryCount >= item.maxRetries) {
          item.status = "failed";
        } else {
          item.status = "pending";
        }
      }

      processed++;
      this.state.syncProgress = Math.round((processed / pending.length) * 100);
      this.saveQueue(queue);
      this.notify();
    }

    this.syncInProgress = false;
    const hasFailed = queue.some((q) => q.status === "failed");
    const hasPending = queue.some((q) => q.status === "pending");

    if (hasFailed) {
      this.state.syncStatus = "error";
      this.scheduleRetry();
    } else if (hasPending) {
      this.state.syncStatus = "idle";
    } else {
      this.state.syncStatus = "success";
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      this.state.lastSyncAt = new Date().toISOString();
    }

    this.state.syncProgress = 100;
    this.notify();

    setTimeout(() => {
      if (this.state.syncStatus === "success") {
        this.state.syncStatus = "idle";
        this.notify();
      }
    }, 2000);
  }

  private async simulateSync(item: SyncQueueItem): Promise<void> {
    // Real Firestore sync
    const { db } = await import("@/lib/firebase/config");
    const { addShopDoc } = await import("@/lib/firebase/firestore");

    const data = item.data;
    const shopId = data.shopId as string;

    if (!shopId) {
      // Try to get shopId from the item or skip
      throw new Error("Missing shopId for offline sync");
    }

    switch (item.type) {
      case "sale":
      case "transaction": {
        await addShopDoc(shopId, "sales", {
          items: data.items || [],
          total: data.total || 0,
          method: data.method || "cash",
          timestamp: data.timestamp || new Date().toISOString(),
          status: "completed",
          receiptCode: data.receiptCode || null,
          syncedFromOffline: true,
        });
        break;
      }
      case "refund": {
        await addShopDoc(shopId, "returns", {
          ...data,
          syncedFromOffline: true,
        });
        break;
      }
      case "inventory":
      case "inventory_update": {
        const { doc, updateDoc } = await import("firebase/firestore");
        if (data.productId) {
          const ref = doc(db, "shops", shopId, "products", data.productId as string);
          await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
        }
        break;
      }
      case "customer":
      case "customer_update": {
        await addShopDoc(shopId, "customers", {
          ...data,
          syncedFromOffline: true,
        });
        break;
      }
      default: {
        const allowedCollections = ["sales", "returns", "products", "customers", "expenses"];
        const collectionName = item.type + "s";
        if (allowedCollections.includes(collectionName)) {
          await addShopDoc(shopId, collectionName, {
            ...data,
            syncedFromOffline: true,
          });
        }
      }
    }
  }

  private scheduleRetry() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);

    // Exponential backoff: 5s, 15s, 45s, ...
    const delay = 5000 * Math.pow(3, Math.min(this.state.failedItems, 4));
    this.retryTimeout = setTimeout(() => {
      if (this.state.isOnline) {
        this.processQueue();
      }
    }, delay);
  }

  // Conflict management
  getConflicts(): ConflictItem[] {
    try {
      const data = localStorage.getItem(CONFLICTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveConflicts(conflicts: ConflictItem[]) {
    localStorage.setItem(CONFLICTS_KEY, JSON.stringify(conflicts));
    this.state.conflicts = conflicts.filter((c) => c.resolution === "pending").length;
    this.notify();
  }

  addConflict(type: ConflictItem["type"], localData: Record<string, unknown>, serverData: Record<string, unknown>, conflictFields: string[]): string {
    const conflicts = this.getConflicts();
    const item: ConflictItem = {
      id: `conf-${Date.now().toString(36)}`,
      type,
      localData,
      serverData,
      conflictFields,
      resolution: "pending",
      resolvedAt: null,
    };
    conflicts.push(item);
    this.saveConflicts(conflicts);
    this.state.syncStatus = "conflict";
    this.notify();
    return item.id;
  }

  resolveConflict(id: string, resolution: "local" | "server" | "manual") {
    const conflicts = this.getConflicts();
    const conflict = conflicts.find((c) => c.id === id);
    if (conflict) {
      conflict.resolution = resolution;
      conflict.resolvedAt = new Date().toISOString();
      this.saveConflicts(conflicts);

      if (conflicts.every((c) => c.resolution !== "pending")) {
        this.state.syncStatus = "idle";
        this.notify();
      }
    }
  }

  // Offline transactions
  getOfflineTransactions() {
    try {
      const data = localStorage.getItem(OFFLINE_TX_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveOfflineTransaction(transaction: Record<string, unknown>) {
    const txns = this.getOfflineTransactions();
    txns.push({ ...transaction, synced: false, timestamp: new Date().toISOString() });
    localStorage.setItem(OFFLINE_TX_KEY, JSON.stringify(txns));

    this.enqueue("sale", transaction, "critical");
  }

  // Cache management
  cacheProducts(products: Record<string, unknown>[]) {
    try {
      const cache = {
        data: products,
        syncedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(cache));
    } catch {
      // Silent fail
    }
  }

  getCachedProducts(): Record<string, unknown>[] | null {
    try {
      const raw = localStorage.getItem(CACHED_PRODUCTS_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (new Date(cache.expiresAt) < new Date()) return null;
      return cache.data;
    } catch {
      return null;
    }
  }

  cacheCustomers(customers: Record<string, unknown>[]) {
    try {
      const cache = {
        data: customers,
        syncedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem(CACHED_CUSTOMERS_KEY, JSON.stringify(cache));
    } catch {
      // Silent fail
    }
  }

  getCachedCustomers(): Record<string, unknown>[] | null {
    try {
      const raw = localStorage.getItem(CACHED_CUSTOMERS_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (new Date(cache.expiresAt) < new Date()) return null;
      return cache.data;
    } catch {
      return null;
    }
  }

  // Clear completed items from queue
  clearCompleted() {
    const queue = this.getQueue();
    const filtered = queue.filter((q) => q.status !== "synced");
    this.saveQueue(filtered);
  }

  destroy() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.listeners.clear();
  }
}

let managerInstance: OfflineManager | null = null;

export function getOfflineManager(): OfflineManager {
  if (!managerInstance) {
    managerInstance = new OfflineManager();
  }
  return managerInstance;
}
