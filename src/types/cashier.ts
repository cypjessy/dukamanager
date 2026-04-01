import type { Product } from "@/data/inventoryData";

// ============================================
// CART PERSISTENCE TYPES
// ============================================

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  discountType: "percent" | "fixed";
}

export interface PersistedCart {
  id: string;
  version: number;
  items: CartItem[];
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  sessionId: string;
  checksum: string;
}

export interface CartRecoveryData {
  hasRecovery: boolean;
  cart: PersistedCart | null;
  source: "sessionStorage" | "localStorage" | "indexedDB" | null;
  itemCount: number;
  totalAmount: number;
  savedAt: string;
  isStale: boolean;
}

export type StorageLayer = "sessionStorage" | "localStorage" | "indexedDB";

export interface SaveState {
  isSaving: boolean;
  lastSaved: string | null;
  error: string | null;
  layer: StorageLayer | null;
}

// ============================================
// REFUND & RETURN TYPES
// ============================================

export type RefundType = "full" | "partial" | "exchange" | "store_credit";
export type ReturnCondition = "damaged" | "wrong_item" | "expired" | "changed_mind" | "quality_issue";
export type RefundMethod = "original" | "store_credit" | "cash" | "mpesa";

export interface RefundItem {
  productId: string;
  productName: string;
  sku: string;
  originalQty: number;
  returnQty: number;
  unitPrice: number;
  totalRefund: number;
  selected: boolean;
  condition: ReturnCondition | "";
}

export interface RefundRequest {
  id: string;
  returnNo: string;
  originalTransactionId: string;
  receiptNo: string;
  refundType: RefundType;
  items: RefundItem[];
  exchangeItems?: { productId: string; productName: string; qty: number; price: number }[];
  customerName: string;
  customerPhone: string;
  reason: string;
  condition: ReturnCondition;
  refundMethod: RefundMethod;
  refundAmount: number;
  exchangeDifference?: number;
  supervisorPin: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  processedAt: string;
  processedBy: string;
  returnAuthNo: string;
}

export interface ReturnPolicy {
  maxDaysForReturn: number;
  requiresReceipt: boolean;
  supervisorPinRequired: boolean;
  allowedConditions: ReturnCondition[];
  refundMethods: RefundMethod[];
  restockDamaged: boolean;
  restockExpired: boolean;
}

export interface RefundValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RefundAnalytics {
  totalReturns: number;
  totalRefundAmount: number;
  byReason: Record<ReturnCondition, number>;
  byType: Record<RefundType, number>;
  returnRate: number;
  avgRefundAmount: number;
}

// ============================================
// OFFLINE MODE TYPES
// ============================================

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "conflict";
export type ConnectionStatus = "online" | "offline" | "reconnecting";
export type QueuePriority = "critical" | "high" | "normal" | "low";

export interface SyncQueueItem {
  id: string;
  type: "transaction" | "sale" | "refund" | "inventory" | "inventory_update" | "customer" | "customer_update" | "analytics";
  data: Record<string, unknown>;
  priority: QueuePriority;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttempt: string | null;
  error: string | null;
  status: "pending" | "processing" | "failed" | "synced";
}

export interface ConflictItem {
  id: string;
  type: "product" | "customer" | "transaction";
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  conflictFields: string[];
  resolution: "pending" | "local" | "server" | "manual";
  resolvedAt: string | null;
}

export interface OfflineState {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  lastOnlineAt: string | null;
  syncStatus: SyncStatus;
  pendingItems: number;
  failedItems: number;
  conflicts: number;
  lastSyncAt: string | null;
  syncProgress: number;
}

export interface CachedCatalog {
  products: Product[];
  customers: Record<string, unknown>[];
  lastSyncedAt: string;
  expiresAt: string;
}

export interface OfflineTransaction {
  id: string;
  localId: string;
  items: CartItem[];
  total: number;
  method: string;
  customerId: string | null;
  timestamp: string;
  synced: boolean;
  syncError: string | null;
}

// ============================================
// HELD SALE (reused from page)
// ============================================

export interface HeldSale {
  id: string;
  items: CartItem[];
  customerId: string | null;
  total: number;
  heldAt: string;
}
