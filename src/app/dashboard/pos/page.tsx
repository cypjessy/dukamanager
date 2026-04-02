"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLocale } from "@/providers/LocaleProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getStockStatus } from "@/data/inventoryData";
import { useProducts } from "@/hooks/useProducts";
import { useAdminPOS } from "@/hooks/useAdminPOS";
import { useCustomersFirestore } from "@/hooks/useCustomersFirestore";
import { useSupervisorPin } from "@/hooks/useSupervisorPin";
import { useCashierActivity } from "@/hooks/useCashierActivity";
import type { Product } from "@/data/inventoryData";
import type { Transaction as SalesTransaction } from "@/data/salesData";
import ProductBrowser from "@/components/cashier/ProductBrowser";
import ActiveCart from "@/components/cashier/ActiveCart";
import TransactionTools from "@/components/cashier/TransactionTools";
import PaymentModal from "@/components/cashier/PaymentModal";
import { ToastProvider, useToast } from "@/components/cashier/ToastProvider";
import HeldSalesDrawer from "@/components/cashier/HeldSalesDrawer";
import KeyboardShortcutsHelp from "@/components/cashier/KeyboardShortcutsHelp";
import QRScanner from "@/components/cashier/QRScanner";
import PrintReceiptModal from "@/components/cashier/PrintReceiptModal";
import CartRecoveryDialog from "@/components/cashier/CartRecoveryDialog";
import AutoSaveIndicator from "@/components/cashier/AutoSaveIndicator";
import RefundModal from "@/components/cashier/RefundModal";
import RefundWorkflow from "@/components/cashier/RefundWorkflow";
import OfflineBanner from "@/components/cashier/OfflineBanner";
import SyncBadge from "@/components/cashier/SyncBadge";
import SyncProgressModal from "@/components/cashier/SyncProgressModal";
import { useCartRecovery } from "@/hooks/useCartRecovery";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePersistentScanner } from "@/hooks/usePersistentScanner";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import AIAssistantPanel from "@/components/cashier/AIAssistantPanel";
import ScannerStatusIndicator from "@/components/cashier/ScannerStatusIndicator";
import type { CartItem as PersistedCartItem } from "@/types/cashier";

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  discountType: "percent" | "fixed";
}

export interface HeldSale {
  id: string;
  items: CartItem[];
  customerId: string | null;
  total: number;
  heldAt: string;
}

type ActiveTab = "products" | "cart" | "tools";

function AdminPOSInner() {
  const { locale, toggleLocale } = useLocale();
  const { profile, shopId, currentShop } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("cart");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [showHeldDrawer, setShowHeldDrawer] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash" | "credit" | "bank" | "split">("mpesa");
  const [currentReceiptCode, setCurrentReceiptCode] = useState("");
  const { sales, placeSale, dailyStats } = useAdminPOS();
  const { products } = useProducts();
  const { customers: firestoreCustomers } = useCustomersFirestore();
  const { pin: supervisorPinValue } = useSupervisorPin();
  const [shiftStart] = useState(new Date().toISOString());
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    id: string; method: string; total: number; receiptCode: string;
    items: CartItem[]; customerPhone: string | null;
  } | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const recentSales = useMemo<SalesTransaction[]>(() => {
    return sales.map((s) => {
      const ts = s.timestamp ? new Date(s.timestamp) : new Date();
      return {
        id: s.id,
        receiptNo: `RCP-${s.id.slice(-6).toUpperCase()}`,
        customer: "Walk-in Customer",
        customerPhone: "",
        items: (s.items || []).map((item) => ({
          productId: String(item.productId || ""),
          name: String(item.name || "Unknown"),
          qty: Number(item.qty || item.quantity || 0),
          price: Number(item.price || 0),
        })),
        subtotal: s.total,
        vat: 0,
        discount: 0,
        total: s.total,
        method: (s.method as SalesTransaction["method"]) || "cash",
        status: s.status === "refunded" ? "refunded" as const : "completed" as const,
        cashier: s.cashierId || "",
        date: ts.toISOString().slice(0, 10),
        time: ts.toTimeString().slice(0, 5),
      };
    });
  }, [sales]);

  const refundProducts = useMemo(() => {
    return products.map((p) => ({ id: p.id, name: p.name, stock: p.quantity, sku: p.sku, sellingPrice: p.sellingPrice }));
  }, [products]);

  // Cart persistence hook
  const {
    recoveryData,
    showRecoveryDialog,
    setShowRecoveryDialog,
    saveState,
    saveCart,
    saveCartManual,
    resumeCart,
    discardRecovery,
    clearPersistedCart,
  } = useCartRecovery();

  // Offline sync hook
  const {
    state: offlineState,
    enqueue: enqueueSync,
    processQueue,
    getQueue,
    getConflicts,
    resolveConflict,
    clearCompleted,
    saveOfflineTransaction,
  } = useOfflineSync();

  // Cart state with recovery support
  const [cart, setCart] = useState<CartItem[]>([]);

  // Restore cart from recovery
  useEffect(() => {
    if (recoveryData?.hasRecovery && recoveryData.cart) {
      // Cart will be restored via the resumeCart callback
    }
  }, [recoveryData]);

  // Persist cart on changes
  useEffect(() => {
    if (cart.length > 0) {
      saveCart(cart as unknown as PersistedCartItem[], selectedCustomerId);
    }
  }, [cart, selectedCustomerId, saveCart]);

  // Persist held sales
  useEffect(() => {
    try {
      sessionStorage.setItem("duka-admin-pos-held", JSON.stringify(heldSales));
    } catch (e) { console.warn("Operation failed:", e); }
  }, [heldSales]);

  // Load held sales on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("duka-admin-pos-held");
      if (saved) setHeldSales(JSON.parse(saved));
    } catch (e) { console.warn("Operation failed:", e); }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + i.qty * i.product.sellingPrice * (1 - (i.discountType === "percent" ? i.discount / 100 : 0)),
        0
      ),
    [cart]
  );
  const discountTotal = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + (i.discountType === "fixed" ? i.discount * i.qty : i.qty * i.product.sellingPrice * i.discount / 100),
        0
      ),
    [cart]
  );
  const grandTotal = subtotal - discountTotal;

  const addToCart = useCallback(
    (product: Product) => {
      const inCart = cart.find((i) => i.product.id === product.id);
      const currentQty = inCart ? inCart.qty : 0;
      const status = getStockStatus(product);

      if (status === "out") {
        toast.addToast("Hakuna Stock! Bidhaa hii imeisha", "error");
        return;
      }
      if (currentQty + 1 > product.quantity) {
        toast.addToast(`Stock imepungua! Zipo ${product.quantity} tu`, "warning");
        return;
      }

      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        return [...prev, { product, qty: 1, discount: 0, discountType: "fixed" }];
      });

      if (status === "low" || status === "critical") {
        toast.addToast(`Bidhaa Imewekwa - Stock yapungua (${product.quantity} left)`, "warning");
      } else {
        toast.addToast("Bidhaa Imewekwa!", "success", 1500);
      }

      if (window.innerWidth < 768) setActiveTab("cart");
    },
    [cart, toast]
  );

  // Ref for addToCart to use in scanner callback
  const addToCartRef = useRef(addToCart);
  useEffect(() => {
    addToCartRef.current = addToCart;
  }, [addToCart]);

  // Persistent barcode scanner - always listening
  const {
    isActive: scannerActive,
    toggleActive: toggleScanner,
    lastScan,
    scanCount,
    scannerConnected,
  } = usePersistentScanner({
    onProductFound: useCallback(
      (product: Product) => {
        addToCartRef.current(product);
        toast.addToast(`Scanned: ${product.name}`, "success", 1500);
      },
      [toast]
    ),
    onNotFound: useCallback(
      (code: string) => {
        toast.addToast(`Not found: ${code}`, "warning", 2000);
      },
      [toast]
    ),
    enabled: true,
  });

  // AI Assistant for smart suggestions
  const {
    suggestions: aiSuggestions,
    highPriorityCount: aiHighPriority,
    totalCount: aiTotalCount,
    dismissSuggestion: dismissAiSuggestion,
    dismissAll: dismissAllAi,
  } = useAIAssistant(cart);

  // Activity tracking for admin POS
  const { logSale, logRefund } = useCashierActivity();

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
        toast.addToast("Bidhaa Imeondolewa", "info", 1500);
      } else {
        const item = cart.find((i) => i.product.id === productId);
        if (item && qty > item.product.quantity) {
          toast.addToast(`Stock imepungua! Zipo ${item.product.quantity} tu`, "warning");
          return;
        }
        setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)));
      }
    },
    [cart, toast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      toast.addToast("Bidhaa Imeondolewa", "info", 1500);
    },
    [toast]
  );

  const holdSale = useCallback(() => {
    if (cart.length === 0) return;
    const sale: HeldSale = {
      id: `H-${Date.now().toString(36).toUpperCase()}`,
      items: [...cart],
      customerId: selectedCustomerId,
      total: grandTotal,
      heldAt: new Date().toISOString(),
    };
    setHeldSales((prev) => [sale, ...prev]);
    setCart([]);
    setSelectedCustomerId(null);
    toast.addToast("Ombi Limehifadhiwa!", "success");
  }, [cart, selectedCustomerId, grandTotal, toast]);

  const resumeSale = useCallback(
    (sale: HeldSale) => {
      setCart(sale.items);
      setSelectedCustomerId(sale.customerId);
      setHeldSales((prev) => prev.filter((s) => s.id !== sale.id));
      setShowHeldDrawer(false);
      setActiveTab("cart");
      toast.addToast("Ombi Limerudishwa!", "success", 1500);
    },
    [toast]
  );

  const deleteHeldSale = useCallback(
    (id: string) => {
      setHeldSales((prev) => prev.filter((s) => s.id !== id));
      toast.addToast("Ombi Limefutwa", "info", 1500);
    },
    [toast]
  );

  const handlePaymentComplete = useCallback(
    async (method: string, _amount: number) => {
      const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      const receiptCode = currentReceiptCode || `DM${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
      const selectedCustomer = firestoreCustomers.find(c => c.id === selectedCustomerId);
      const cartSnapshot = [...cart];

      setLastTransaction({
        id: txnId, method, total: grandTotal, receiptCode,
        items: cartSnapshot, customerPhone: selectedCustomer?.phone || null,
      });

      if (offlineState.isOnline) {
        try {
          await placeSale({
            items: cart.map(i => ({ productId: i.product.id, name: i.product.name, qty: i.qty, price: i.product.sellingPrice })),
            total: grandTotal,
            method,
            timestamp: new Date().toISOString(),
            status: "completed",
            receiptCode,
          });
          logSale({
            total: grandTotal,
            method,
            itemCount: cart.reduce((s, i) => s + i.qty, 0),
            receiptCode,
          });

          if (selectedCustomer?.phone) {
            fetch("/api/sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "receipt",
                to: selectedCustomer.phone,
                shopName: currentShop.name,
                amount: grandTotal,
                receiptId: receiptCode,
              }),
            }).catch(() => {});
          }
        } catch (e) {
          console.error("Failed to place sale in firestore", e);
        }
      } else {
        saveOfflineTransaction({
          id: txnId,
          shopId,
          items: cart.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            qty: i.qty,
            price: i.product.sellingPrice,
          })),
          total: grandTotal,
          method,
          customerId: selectedCustomerId,
          receiptCode,
        });
        toast.addToast("Sale saved offline - will sync when online", "warning");
      }

      setCart([]);
      setSelectedCustomerId(null);
      setShowPaymentModal(false);
      clearPersistedCart();
      toast.addToast("Malipo Kamilika!", "success");
      setShowPrintReceipt(true);
    },
    [grandTotal, toast, cart, selectedCustomerId, offlineState.isOnline, saveOfflineTransaction, clearPersistedCart, placeSale, firestoreCustomers, currentReceiptCode, logSale, currentShop.name, shopId]
  );

  const handleRefundComplete = useCallback(
    (refund: Record<string, unknown>) => {
      enqueueSync("refund", refund, "high");
      logRefund({
        amount: Number(refund.total) || 0,
        details: `Return ${refund.returnNo}`,
      });
      toast.addToast(`Return ${refund.returnNo} processed!`, "success");
      if (!offlineState.isOnline) {
        toast.addToast("Return saved offline - will sync when online", "warning");
      }
    },
    [enqueueSync, toast, offlineState.isOnline, logRefund]
  );

  const handleResumeRecovery = useCallback(() => {
    const recovered = resumeCart();
    if (recovered) {
      setCart(recovered.items as CartItem[]);
      setSelectedCustomerId(recovered.customerId);
      toast.addToast("Cart restored!", "success");
    }
  }, [resumeCart, toast]);

  const handleQRScan = useCallback(
    (product: Product) => {
      addToCart(product);
      setShowQRScanner(false);
    },
    [addToCart]
  );

  const openPayment = useCallback(
    (method: "mpesa" | "cash" | "credit" | "bank" | "split") => {
      if (cart.length === 0) {
        toast.addToast("Kikapu ni tupu!", "warning");
        return;
      }
      const code = `DM${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
      setCurrentReceiptCode(code);
      setPaymentMethod(method);
      setShowPaymentModal(true);
    },
    [cart.length, toast]
  );

  const handleManualSave = useCallback(() => {
    saveCartManual(cart as unknown as PersistedCartItem[], selectedCustomerId);
    toast.addToast("Cart saved! (Hifadhiwa)", "success", 1500);
  }, [cart, selectedCustomerId, saveCartManual, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setShowShortcutsHelp((p) => !p);
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") {
        setCart([]);
        setShowPaymentModal(false);
        setShowHeldDrawer(false);
        setShowShortcutsHelp(false);
        setShowRefundModal(false);
      }
      if (e.key === "F1") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      }
      if (e.key === "F2") {
        e.preventDefault();
        setCart([]);
        setSelectedCustomerId(null);
        toast.addToast("Mauzo Mapya!", "info", 1500);
      }
      if (e.key === "F3") {
        e.preventDefault();
        holdSale();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (lastTransaction) setShowPrintReceipt(true);
      }
      if (e.key === "F5") {
        e.preventDefault();
        openPayment("mpesa");
      }
      if (e.key === "F6") {
        e.preventDefault();
        openPayment("cash");
      }
      if (e.key === "F7") {
        e.preventDefault();
        holdSale();
      }
      if (e.key === "F8") {
        e.preventDefault();
        setShowRefundModal(true);
      }
      if (e.key === "Enter" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        openPayment("mpesa");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [holdSale, openPayment, toast, lastTransaction]);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-warm-50 dark:bg-warm-900 overflow-hidden rounded-xl">
      {/* Offline Banner */}
      <OfflineBanner
        isOnline={offlineState.isOnline}
        connectionStatus={offlineState.connectionStatus}
        pendingItems={offlineState.pendingItems}
        lastOnlineAt={offlineState.lastOnlineAt}
      />

      {/* Top bar */}
      <div className="flex-shrink-0 bg-white dark:bg-warm-800 border-b border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between px-2 sm:px-4 z-30" style={{ minHeight: "48px" }}>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <h1 className="font-heading font-extrabold text-sm sm:text-base text-warm-900 dark:text-warm-50">
            Duka<span className="text-terracotta-500">Manager</span>
            <span className="text-[10px] font-medium text-warm-400 ml-2 hidden sm:inline">
              {t("POS", "POS")}
            </span>
          </h1>
          {heldSales.length > 0 && (
            <button
              onClick={() => setShowHeldDrawer(true)}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-savanna-50 dark:bg-savanna-900/15 text-savanna-600 text-[10px] font-medium min-h-[28px]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span className="hidden sm:inline">{heldSales.length} parked</span>
              <span className="sm:hidden">{heldSales.length}</span>
            </button>
          )}
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-forest-50 dark:bg-forest-900/15 text-forest-600 text-[10px] font-medium min-h-[28px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" rx="0.5" />
              <rect x="18" y="14" width="3" height="3" rx="0.5" />
              <rect x="14" y="18" width="3" height="3" rx="0.5" />
              <rect x="18" y="18" width="3" height="3" rx="0.5" />
            </svg>
            <span className="hidden sm:inline">{t("Scan", "Skani")}</span>
          </button>
          {/* Persistent scanner status - desktop only */}
          <div className="hidden sm:block">
            <ScannerStatusIndicator
              isActive={scannerActive}
              isConnected={scannerConnected}
              scanCount={scanCount}
              lastScanCode={lastScan?.code || null}
              onToggle={toggleScanner}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Auto-save indicator - desktop only */}
          <div className="hidden sm:block">
            <AutoSaveIndicator
              saveState={saveState}
              onManualSave={handleManualSave}
              hasItems={cart.length > 0}
            />
          </div>

          {/* Sync badge - desktop only */}
          <div className="hidden sm:block">
            <SyncBadge
              pendingItems={offlineState.pendingItems}
              failedItems={offlineState.failedItems}
              conflicts={offlineState.conflicts}
              syncStatus={offlineState.syncStatus}
              onClick={() => setShowSyncModal(true)}
            />
          </div>

          {/* Online status dot on mobile / full badge on desktop */}
          <div
            className={`w-7 h-7 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-lg flex items-center justify-center sm:justify-start min-h-[28px] ${
              offlineState.isOnline
                ? "bg-forest-50 dark:bg-forest-900/15"
                : "bg-red-50 dark:bg-red-900/15"
            }`}
            title={offlineState.isOnline ? t("Online", "Mtandaoni") : t("Offline", "Nje ya Mtandao")}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              offlineState.isOnline ? "bg-forest-500 animate-pulse" : "bg-red-500"
            }`} />
            <span className={`hidden sm:inline text-[10px] font-medium ${
              offlineState.isOnline ? "text-forest-600" : "text-red-500"
            }`}>
              {offlineState.isOnline ? t("Online", "Mtandaoni") : t("Offline", "Nje ya Mtandao")}
            </span>
          </div>
          <button
            onClick={toggleLocale}
            className="w-7 h-7 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-lg text-[10px] font-bold bg-warm-100 text-warm-600 min-h-[28px] flex items-center justify-center"
          >
            {locale === "en" ? "SW" : "EN"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            title={t("Back to Dashboard", "Rudi kwenye Dashibodi")}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-terracotta-500 hover:bg-terracotta-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <div className="w-[40%] border-r border-warm-200/60 dark:border-warm-700/60 flex flex-col min-h-0">
          <ProductBrowser
            products={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
            cart={cart}
            onUpdateQty={updateQty}
          />
        </div>
        <div className="w-[35%] border-r border-warm-200/60 dark:border-warm-700/60 flex flex-col min-h-0">
          <ActiveCart
            cart={cart}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            subtotal={subtotal}
            grandTotal={grandTotal}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            onPayment={openPayment}
            customers={firestoreCustomers}
          />
        </div>
        <div className="w-[25%] flex flex-col min-h-0">
          <TransactionTools
            dailySales={dailyStats}
            heldSales={heldSales}
            onResumeSale={resumeSale}
            onHoldSale={holdSale}
            shiftStart={shiftStart}
            cartCount={cart.length}
            onShowHeldDrawer={() => setShowHeldDrawer(true)}
            cashierName={profile?.displayName || profile?.email?.split("@")[0] || "Admin"}
            onClockOut={() => router.push("/dashboard")}
            onReprint={() => { if (lastTransaction) setShowPrintReceipt(true); else toast.addToast("Hakuna risiti ya kuchapisha", "info", 2000); }}
          />
          {/* Refund workflow in tools panel */}
          <div className="flex-shrink-0 p-3 border-t border-warm-200/60 dark:border-warm-700/60">
            <RefundWorkflow locale={locale} onOpenRefund={() => setShowRefundModal(true)} />
          </div>
          {/* AI Assistant */}
          <AIAssistantPanel
            suggestions={aiSuggestions}
            highPriorityCount={aiHighPriority}
            totalCount={aiTotalCount}
            onApplySuggestion={(s) => {
              if (s.product) addToCart(s.product);
              dismissAiSuggestion(s.id);
            }}
            onDismiss={dismissAiSuggestion}
            onDismissAll={dismissAllAi}
          />
        </div>
      </div>

      {/* Tablet: 2-column layout */}
      <div className="hidden md:flex lg:hidden flex-1 min-h-0">
        <div className="w-[55%] border-r border-warm-200/60 dark:border-warm-700/60 flex flex-col min-h-0">
          <ProductBrowser
            products={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
            cart={cart}
            onUpdateQty={updateQty}
          />
        </div>
        <div className="w-[45%] flex flex-col min-h-0">
          <ActiveCart
            cart={cart}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            subtotal={subtotal}
            grandTotal={grandTotal}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            onPayment={openPayment}
            customers={firestoreCustomers}
          />
        </div>
      </div>

      {/* Mobile: Tab-based layout */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0">
          {activeTab === "products" && (
            <ProductBrowser
              products={filteredProducts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onAddToCart={addToCart}
              cart={cart}
              onUpdateQty={updateQty}
            />
          )}
          {activeTab === "cart" && (
            <ActiveCart
              cart={cart}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              subtotal={subtotal}
              grandTotal={grandTotal}
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={setSelectedCustomerId}
              onPayment={openPayment}
              customers={firestoreCustomers}
            />
          )}
          {activeTab === "tools" && (
            <div className="flex flex-col h-full min-h-0 overflow-y-auto">
              <TransactionTools
                dailySales={dailyStats}
                heldSales={heldSales}
                onResumeSale={resumeSale}
                onHoldSale={holdSale}
                shiftStart={shiftStart}
                cartCount={cart.length}
                onShowHeldDrawer={() => setShowHeldDrawer(true)}
                cashierName={profile?.displayName || profile?.email?.split("@")[0] || "Admin"}
                onClockOut={() => router.push("/dashboard")}
                onReprint={() => { if (lastTransaction) setShowPrintReceipt(true); else toast.addToast("Hakuna risiti ya kuchapisha", "info", 2000); }}
              />
              <div className="flex-shrink-0 p-3 border-t border-warm-200/60 dark:border-warm-700/60">
                <RefundWorkflow locale={locale} onOpenRefund={() => setShowRefundModal(true)} />
              </div>
              <AIAssistantPanel
                suggestions={aiSuggestions}
                highPriorityCount={aiHighPriority}
                totalCount={aiTotalCount}
                onApplySuggestion={(s) => {
                  if (s.product) addToCart(s.product);
                  dismissAiSuggestion(s.id);
                }}
                onDismiss={dismissAiSuggestion}
                onDismissAll={dismissAllAi}
              />
            </div>
          )}
        </div>
        {/* Bottom tab bar */}
        <div
          className="flex-shrink-0 w-full bg-white dark:bg-warm-800 border-t border-warm-200/60 dark:border-warm-700/60 flex items-center justify-around z-30"
          style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))", minHeight: "56px" }}
        >
          {(["products", "cart", "tools"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all min-w-0 flex-1 relative ${
                activeTab === tab
                  ? "text-terracotta-600"
                  : "text-warm-400"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="adminPOSTab"
                  className="absolute inset-0 bg-terracotta-50 dark:bg-terracotta-900/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                {tab === "products" && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                )}
                {tab === "cart" && (
                  <div className="relative">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {cart.length > 0 && (
                      <motion.span
                        key={cart.length}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[8px] font-bold flex items-center justify-center"
                      >
                        {cart.length}
                      </motion.span>
                    )}
                  </div>
                )}
                {tab === "tools" && (
                  <div className="relative">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    {heldSales.length > 0 && (
                      <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-savanna-500 text-white text-[7px] font-bold flex items-center justify-center">
                        {heldSales.length}
                      </span>
                    )}
                  </div>
                )}
              </span>
              <span className="relative z-10 text-[10px] font-semibold capitalize max-w-[60px] truncate leading-tight">
                {tab === "cart"
                  ? t("Cart", "Kikapu") + (cart.length > 0 ? ` (${cart.length})` : "")
                  : tab === "tools"
                  ? t("Tools", "Zana")
                  : t("Products", "Bidhaa")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={grandTotal}
        onPaymentComplete={handlePaymentComplete}
        method={paymentMethod}
        customers={firestoreCustomers}
        shopId={shopId || undefined}
        receiptCode={currentReceiptCode}
      />

      {/* Held Sales Drawer */}
      <HeldSalesDrawer
        isOpen={showHeldDrawer}
        onClose={() => setShowHeldDrawer(false)}
        heldSales={heldSales}
        onResume={resumeSale}
        onDelete={deleteHeldSale}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />

      {/* QR Scanner */}
      <QRScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} onScanResult={handleQRScan} />

      {/* Print Receipt */}
      {lastTransaction && (
        <PrintReceiptModal
          isOpen={showPrintReceipt}
          onClose={() => setShowPrintReceipt(false)}
          cartItems={lastTransaction.items}
          total={lastTransaction.total}
          paymentMethod={lastTransaction.method}
          transactionId={lastTransaction.id}
          receiptCode={lastTransaction.receiptCode}
          customerPhone={lastTransaction.customerPhone}
        />
      )}

      {/* Cart Recovery Dialog */}
      <CartRecoveryDialog
        isOpen={showRecoveryDialog}
        recoveryData={recoveryData!}
        onResume={handleResumeRecovery}
        onDiscard={discardRecovery}
        onClose={() => setShowRecoveryDialog(false)}
      />

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onRefundComplete={handleRefundComplete}
        recentSales={recentSales}
        products={refundProducts}
        shopSupervisorPin={supervisorPinValue ?? undefined}
        skipPinValidation
      />

      {/* Sync Progress Modal */}
      <SyncProgressModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncStatus={offlineState.syncStatus}
        progress={offlineState.syncProgress}
        pendingItems={offlineState.pendingItems}
        failedItems={offlineState.failedItems}
        conflicts={offlineState.conflicts}
        lastSyncAt={offlineState.lastSyncAt}
        onSyncNow={processQueue}
        onClearCompleted={clearCompleted}
        getQueue={getQueue}
        getConflicts={getConflicts}
        onResolveConflict={resolveConflict}
      />
    </div>
  );
}

export default function AdminPOSPage() {
  return (
    <ToastProvider>
      <AdminPOSInner />
    </ToastProvider>
  );
}
