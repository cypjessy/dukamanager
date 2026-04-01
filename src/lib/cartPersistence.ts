import type { CartItem, PersistedCart, CartRecoveryData, SaveState } from "@/types/cashier";
import { encryptData, decryptData, generateChecksum, generateId } from "./encryption";

let SESSION_KEY = "duka-cart-session";
let LOCAL_KEY = "duka-cart-local";
let LOCAL_INDEX_KEY = "duka-cart-index";
let IDB_DB_NAME = "duka-cashier-db";
let IDB_STORE_NAME = "cart-store";
let IDB_HISTORY_STORE = "cart-history";

export function setCartPersistenceScope(shopId: string, userId: string): void {
  const scope = `${shopId}_${userId}`;
  SESSION_KEY = `duka-cart-session-${scope}`;
  LOCAL_KEY = `duka-cart-local-${scope}`;
  LOCAL_INDEX_KEY = `duka-cart-index-${scope}`;
  IDB_DB_NAME = `duka-cashier-db-${scope}`;
  IDB_STORE_NAME = `cart-store-${scope}`;
  IDB_HISTORY_STORE = `cart-history-${scope}`;
}

export function resetCartPersistenceScope(): void {
  SESSION_KEY = "duka-cart-session";
  LOCAL_KEY = "duka-cart-local";
  LOCAL_INDEX_KEY = "duka-cart-index";
  IDB_DB_NAME = "duka-cashier-db";
  IDB_STORE_NAME = "cart-store";
  IDB_HISTORY_STORE = "cart-history";
}

const CART_VERSION = 1;
const LOCAL_EXPIRY_HOURS = 24;

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `sess-${generateId()}`;
  }
  return sessionId;
}

// ============================================
// IndexedDB helpers
// ============================================

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = indexedDB.open(IDB_DB_NAME, 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(IDB_HISTORY_STORE)) {
        const historyStore = db.createObjectStore(IDB_HISTORY_STORE, { keyPath: "id" });
        historyStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(storeName: string, data: PersistedCart): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function idbGetAll(storeName: string): Promise<PersistedCart[]> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => { db.close(); resolve(request.result || []); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function idbDelete(storeName: string, id: string): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ============================================
// CartPersistenceService
// ============================================

class CartPersistenceService {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private saveStateListeners: Set<(state: SaveState) => void> = new Set();
  private currentSaveState: SaveState = {
    isSaving: false,
    lastSaved: null,
    error: null,
    layer: null,
  };

  private notifyListeners() {
    this.saveStateListeners.forEach((listener) => listener(this.currentSaveState));
  }

  private updateSaveState(updates: Partial<SaveState>) {
    this.currentSaveState = { ...this.currentSaveState, ...updates };
    this.notifyListeners();
  }

  onSaveStateChange(listener: (state: SaveState) => void): () => void {
    this.saveStateListeners.add(listener);
    return () => this.saveStateListeners.delete(listener);
  }

  getSaveState(): SaveState {
    return this.currentSaveState;
  }

  createPersistedCart(items: CartItem[], customerId: string | null): PersistedCart {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + LOCAL_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    const dataStr = JSON.stringify(items);
    return {
      id: generateId(),
      version: CART_VERSION,
      items,
      customerId,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      sessionId: getSessionId(),
      checksum: generateChecksum(dataStr),
    };
  }

  // Save to sessionStorage (immediate session recovery)
  saveToSession(items: CartItem[], customerId: string | null): void {
    try {
      const cart = this.createPersistedCart(items, customerId);
      const serialized = JSON.stringify(cart);
      sessionStorage.setItem(SESSION_KEY, encryptData(serialized));
    } catch {
      // Silent fail for sessionStorage
    }
  }

  // Save to localStorage (extended persistence)
  saveToLocal(items: CartItem[], customerId: string | null): void {
    try {
      const cart = this.createPersistedCart(items, customerId);
      const serialized = JSON.stringify(cart);
      localStorage.setItem(LOCAL_KEY, encryptData(serialized));

      // Update cart index for multiple sessions
      const indexStr = localStorage.getItem(LOCAL_INDEX_KEY);
      const index: PersistedCart[] = indexStr ? JSON.parse(indexStr) : [];
      const filtered = index.filter((c) => c.sessionId !== cart.sessionId && new Date(c.expiresAt) > new Date());
      filtered.unshift(cart);
      localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch {
      // Silent fail for localStorage
    }
  }

  // Save to IndexedDB (large cart data and history)
  async saveToIndexedDB(items: CartItem[], customerId: string | null): Promise<void> {
    try {
      const cart = this.createPersistedCart(items, customerId);
      await idbPut(IDB_STORE_NAME, cart);
      await idbPut(IDB_HISTORY_STORE, { ...cart, id: `history-${cart.id}` });
    } catch {
      // Silent fail for IndexedDB
    }
  }

  // Debounced save across all layers
  saveCart(items: CartItem[], customerId: string | null): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.updateSaveState({ isSaving: true, error: null });

    this.debounceTimer = setTimeout(async () => {
      try {
        // Layer 1: sessionStorage
        this.saveToSession(items, customerId);

        // Layer 2: localStorage
        this.saveToLocal(items, customerId);

        // Layer 3: IndexedDB
        await this.saveToIndexedDB(items, customerId);

        const now = new Date().toISOString();
        this.updateSaveState({
          isSaving: false,
          lastSaved: now,
          error: null,
          layer: "indexedDB",
        });
      } catch (err) {
        this.updateSaveState({
          isSaving: false,
          error: err instanceof Error ? err.message : "Save failed",
        });
      }
    }, 500);
  }

  // Manual save (immediate, no debounce)
  async saveCartImmediate(items: CartItem[], customerId: string | null): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.updateSaveState({ isSaving: true, error: null });

    try {
      this.saveToSession(items, customerId);
      this.saveToLocal(items, customerId);
      await this.saveToIndexedDB(items, customerId);

      this.updateSaveState({
        isSaving: false,
        lastSaved: new Date().toISOString(),
        error: null,
        layer: "indexedDB",
      });
    } catch (err) {
      this.updateSaveState({
        isSaving: false,
        error: err instanceof Error ? err.message : "Save failed",
      });
    }
  }

  // Recovery: check all layers
  async recoverCart(): Promise<CartRecoveryData> {
    const emptyResult: CartRecoveryData = {
      hasRecovery: false,
      cart: null,
      source: null,
      itemCount: 0,
      totalAmount: 0,
      savedAt: "",
      isStale: false,
    };

    try {
      // Try sessionStorage first (most recent for this session)
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const decrypted = decryptData(sessionData);
          const cart: PersistedCart = JSON.parse(decrypted);
          if (cart.items && cart.items.length > 0) {
            return {
              hasRecovery: true,
              cart,
              source: "sessionStorage",
              itemCount: cart.items.reduce((s, i) => s + i.qty, 0),
              totalAmount: cart.items.reduce((s, i) => s + i.qty * i.product.sellingPrice, 0),
              savedAt: cart.updatedAt,
              isStale: this.isCartStale(cart),
            };
          }
        } catch {
          // corrupted session data
        }
      }

      // Try localStorage
      const localData = localStorage.getItem(LOCAL_KEY);
      if (localData) {
        try {
          const decrypted = decryptData(localData);
          const cart: PersistedCart = JSON.parse(decrypted);
          if (cart.items && cart.items.length > 0 && !this.isCartExpired(cart)) {
            return {
              hasRecovery: true,
              cart,
              source: "localStorage",
              itemCount: cart.items.reduce((s, i) => s + i.qty, 0),
              totalAmount: cart.items.reduce((s, i) => s + i.qty * i.product.sellingPrice, 0),
              savedAt: cart.updatedAt,
              isStale: this.isCartStale(cart),
            };
          }
        } catch {
          // corrupted local data
        }
      }

      // Try IndexedDB
      try {
        const allCarts = await idbGetAll(IDB_STORE_NAME);
        const validCart = allCarts
          .filter((c) => c.items && c.items.length > 0 && !this.isCartExpired(c))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

        if (validCart) {
          return {
            hasRecovery: true,
            cart: validCart,
            source: "indexedDB",
            itemCount: validCart.items.reduce((s, i) => s + i.qty, 0),
            totalAmount: validCart.items.reduce((s, i) => s + i.qty * i.product.sellingPrice, 0),
            savedAt: validCart.updatedAt,
            isStale: this.isCartStale(validCart),
          };
        }
      } catch {
        // IndexedDB not available
      }

      return emptyResult;
    } catch {
      return emptyResult;
    }
  }

  private isCartExpired(cart: PersistedCart): boolean {
    return new Date(cart.expiresAt) < new Date();
  }

  private isCartStale(cart: PersistedCart): boolean {
    const savedTime = new Date(cart.updatedAt).getTime();
    const now = Date.now();
    return now - savedTime > 30 * 60 * 1000; // 30 minutes
  }

  // Clear all persistence layers
  async clearAll(): Promise<void> {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOCAL_KEY);
      localStorage.removeItem(LOCAL_INDEX_KEY);

      try {
        const db = await openIDB();
        const tx = db.transaction(IDB_STORE_NAME, "readwrite");
        tx.objectStore(IDB_STORE_NAME).clear();
        tx.oncomplete = () => db.close();
      } catch {
        // IndexedDB not available
      }
    } catch {
      // Silent fail
    }
  }

  // Clear specific session
  async clearSession(cartId: string): Promise<void> {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      await idbDelete(IDB_STORE_NAME, cartId);
    } catch {
      // Silent fail
    }
  }

  // Get cart history from IndexedDB
  async getCartHistory(): Promise<PersistedCart[]> {
    try {
      const all = await idbGetAll(IDB_HISTORY_STORE);
      return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 20);
    } catch {
      return [];
    }
  }
}

// Singleton instance
let serviceInstance: CartPersistenceService | null = null;

export function getCartPersistenceService(): CartPersistenceService {
  if (!serviceInstance) {
    serviceInstance = new CartPersistenceService();
  }
  return serviceInstance;
}
