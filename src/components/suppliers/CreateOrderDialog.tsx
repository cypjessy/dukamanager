"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Supplier, SupplierProduct, PaymentTerms } from "@/data/supplierData";
import { suppliers, supplierProducts, paymentTermLabels } from "@/data/supplierData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialSupplier?: Supplier | null;
  onSubmit: (order: Record<string, unknown>) => void;
}

type OrderStep = 1 | 2 | 3;

interface CartItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  unit: string;
}

const t = (en: string, sw: string) => sw;

const DELIVERY_LABELS: Record<string, { label: string; labelSw: string }> = {
  "0": { label: "Same Day", labelSw: "Siku hiyo hiyo" },
  "1": { label: "Next Day", labelSw: "Siku ya Pili" },
  "2": { label: "2 Days", labelSw: "Siku 2" },
  "3": { label: "3 Days", labelSw: "Siku 3" },
  "4": { label: "4 Days", labelSw: "Siku 4" },
  "5": { label: "5 Days", labelSw: "Siku 5" },
  "6": { label: "6 Days", labelSw: "Siku 6" },
  "7": { label: "Weekly", labelSw: "Kila Wiki" },
};
void DELIVERY_LABELS;

export default function CreateOrderDialog({ isOpen, onClose, initialSupplier, onSubmit }: CreateOrderDialogProps) {
  const [step, setStep] = useState<OrderStep>(1);
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplier?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [transportCost, setTransportCost] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentTerms>("cod");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [smsStatus, setSmsStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [showCart, setShowCart] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null!);
  const screen = useResponsiveDialog();
  const { isMobile, isTablet } = screen;

  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const availableProducts = supplierProducts.filter((p) => p.supplierId === selectedSupplierId && p.available);
  const filteredProducts = searchQuery
    ? availableProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableProducts;

  const filteredSuppliers = supplierSearch
    ? suppliers.filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase()))
    : suppliers;

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const total = subtotal + transportCost;
  const orderRef = `PO-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  useEffect(() => {
    if (initialSupplier) {
      setSelectedSupplierId(initialSupplier.id);
      setPaymentMethod(initialSupplier.paymentTerms);
    }
  }, [initialSupplier]);

  useEffect(() => {
    if (isOpen && !initialSupplier) {
      setStep(1);
      setItems([]);
      setSmsStatus("idle");
    } else if (isOpen && initialSupplier) {
      setStep(2);
    }
  }, [isOpen, initialSupplier]);

  const addItem = useCallback((product: SupplierProduct) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, qty: 1, unitPrice: product.lastPurchasePrice, unit: product.unit }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i));
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && !selectedSupplierId) return;
    if (step === 2 && items.length === 0) return;
    setStep((step + 1) as OrderStep);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, selectedSupplierId, items.length]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((step - 1) as OrderStep);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSmsStatus("sending");
    await new Promise((r) => setTimeout(r, 1500));
    setSmsStatus("sent");
    onSubmit({ supplierId: selectedSupplierId, items, transportCost, total, deliveryDate, paymentMethod, notes, orderRef });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setItems([]);
      setStep(1);
      setSelectedSupplierId("");
      onClose();
    }, 2000);
  }, [selectedSupplierId, items, transportCost, total, deliveryDate, paymentMethod, notes, orderRef, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => { setItems([]); setStep(1); setSmsStatus("idle"); setNotes(""); setTransportCost(0); }, 300);
    }
  }, [isSubmitting, onClose]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
  }, [handleClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-50"
            style={{ backgroundColor: isMobile ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)", backdropFilter: isMobile ? "blur(2px)" : "blur(10px)", WebkitBackdropFilter: isMobile ? "blur(2px)" : "blur(10px)" }}
            onClick={handleClose} />

          {isMobile ? (
            <motion.div key="order-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", maxHeight: "100dvh", borderRadius: "28px 28px 0 0", y: dragY, opacity: dragOpacity }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
              role="dialog" aria-modal="true" aria-label="Create New Order">
              <OrderContent isMobile={true} step={step} setStep={setStep} selectedSupplier={selectedSupplier}
                selectedSupplierId={selectedSupplierId} setSelectedSupplierId={setSelectedSupplierId}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                supplierSearch={supplierSearch} setSupplierSearch={setSupplierSearch}
                items={items} addItem={addItem} updateQty={updateQty} removeItem={removeItem}
                transportCost={transportCost} setTransportCost={setTransportCost}
                deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                notes={notes} setNotes={setNotes} showCart={showCart} setShowCart={setShowCart}
                subtotal={subtotal} total={total} orderRef={orderRef}
                isSubmitting={isSubmitting} submitSuccess={submitSuccess} smsStatus={smsStatus}
                contentRef={contentRef}
                filteredProducts={filteredProducts} filteredSuppliers={filteredSuppliers} availableProducts={availableProducts}
                handleNext={handleNext} handleBack={handleBack} handleSubmit={handleSubmit} handleClose={handleClose} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={handleClose}>
              <motion.div key="order-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden shadow-2xl"
                style={{ width: isTablet ? "min(720px, calc(100vw - 32px))" : "min(900px, calc(100vw - 48px))", maxHeight: "92vh", borderRadius: "24px" }}
                role="dialog" aria-modal="true" aria-label="Create New Order">
                <OrderContent isMobile={false} step={step} setStep={setStep} selectedSupplier={selectedSupplier}
                  selectedSupplierId={selectedSupplierId} setSelectedSupplierId={setSelectedSupplierId}
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  supplierSearch={supplierSearch} setSupplierSearch={setSupplierSearch}
                  items={items} addItem={addItem} updateQty={updateQty} removeItem={removeItem}
                  transportCost={transportCost} setTransportCost={setTransportCost}
                  deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate}
                  paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                  notes={notes} setNotes={setNotes} showCart={showCart} setShowCart={setShowCart}
                  subtotal={subtotal} total={total} orderRef={orderRef}
                  isSubmitting={isSubmitting} submitSuccess={submitSuccess} smsStatus={smsStatus}
                  contentRef={contentRef}
                  filteredProducts={filteredProducts} filteredSuppliers={filteredSuppliers} availableProducts={availableProducts}
                  handleNext={handleNext} handleBack={handleBack} handleSubmit={handleSubmit} handleClose={handleClose} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   ORDER CONTENT
   ============================================ */

interface OrderContentProps {
  isMobile: boolean;
  step: OrderStep;
  setStep: (s: OrderStep) => void;
  selectedSupplier: Supplier | undefined;
  selectedSupplierId: string;
  setSelectedSupplierId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  supplierSearch: string;
  setSupplierSearch: (q: string) => void;
  items: CartItem[];
  addItem: (p: SupplierProduct) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  transportCost: number;
  setTransportCost: (n: number) => void;
  deliveryDate: string;
  setDeliveryDate: (d: string) => void;
  paymentMethod: PaymentTerms;
  setPaymentMethod: (p: PaymentTerms) => void;
  notes: string;
  setNotes: (n: string) => void;
  showCart: boolean;
  setShowCart: (b: boolean) => void;
  subtotal: number;
  total: number;
  orderRef: string;
  isSubmitting: boolean;
  submitSuccess: boolean;
  smsStatus: "idle" | "sending" | "sent" | "failed";
  contentRef: React.RefObject<HTMLDivElement>;
  filteredProducts: SupplierProduct[];
  filteredSuppliers: Supplier[];
  availableProducts: SupplierProduct[];
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
  handleClose: () => void;
}

function OrderContent(p: OrderContentProps) {
  const { isMobile, step, items, total, orderRef, isSubmitting, submitSuccess, showCart, setShowCart, handleClose, handleBack, handleNext, handleSubmit, contentRef } = p;
  const totalPadding = isMobile ? "140px" : "0px";

  return (
    <>
      {isMobile && (
        <div className="flex-shrink-0 flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-manipulation select-none">
          <div className="w-10 h-1.5 rounded-full bg-warm-300 dark:bg-warm-600" />
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center">
            <motion.div initial={{ x: 0, y: 0 }} animate={{ x: [0, 100, 200], y: [0, -50, -100], opacity: [1, 1, 0] }}
              transition={{ duration: 1.2 }} className="mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
            </motion.div>
            <p className="font-heading font-bold text-xl text-warm-900 dark:text-warm-50">Order Imetumwa!</p>
            <p className="text-sm text-warm-400 mt-1">Order {orderRef} sent to supplier</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 border-b border-warm-100 dark:border-warm-800"
        style={isMobile ? { padding: "8px 16px 12px", paddingTop: "max(8px, env(safe-area-inset-top, 8px))" } : { padding: "20px 20px 16px" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center text-forest-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            </div>
            <div>
              <h2 className={`font-heading font-bold text-warm-900 dark:text-warm-50 ${isMobile ? "text-base" : "text-lg"}`}>Create New Order</h2>
              <p className="text-[10px] text-warm-400 font-mono">{orderRef}</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className={`w-10 h-10 flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 active:scale-95 transition-all ${isMobile ? "rounded-full" : "rounded-lg"}`}
            aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {([1, 2, 3] as OrderStep[]).map((s) => {
            const isActive = s === step;
            const isDone = s < step;
            const labels = ["Select Supplier", "Add Items", "Review & Send"];
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold flex-shrink-0 transition-all ${isActive ? "bg-terracotta-500 text-white" : isDone ? "bg-forest-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-400"}`}>
                  {isDone ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : s}
                </div>
                {!isMobile && <span className={`text-[10px] ml-1.5 font-medium ${isActive ? "text-terracotta-600" : "text-warm-400"}`}>{labels[s - 1]}</span>}
                {s < 3 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${isDone ? "bg-forest-500" : "bg-warm-100 dark:bg-warm-800"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain"
        style={isMobile ? { WebkitOverflowScrolling: "touch", paddingBottom: totalPadding } : { scrollbarWidth: "thin", scrollbarColor: "rgba(199,91,57,0.2) transparent" }}>
        <div style={{ padding: isMobile ? "16px" : "20px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, x: 20 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 0, y: -10 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}>
              {step === 1 && <Step1Supplier {...p} />}
              {step === 2 && <Step2Items {...p} />}
              {step === 3 && <Step3Review {...p} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cart bar for step 2 on mobile */}
      {step === 2 && items.length > 0 && isMobile && (
        <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 px-4 py-2">
          <button onClick={() => setShowCart(!showCart)} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center">{items.length}</span>
              <span className="text-sm font-medium text-warm-900 dark:text-warm-50">View Cart</span>
            </div>
            <span className="text-sm font-heading font-extrabold text-terracotta-600 tabular-nums">KSh {total.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 ${isMobile ? "" : "px-5 py-4"}`}
        style={isMobile ? { padding: "12px 16px", paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" } : undefined}>
        {/* Totals */}
        {items.length > 0 && (
          <div className={`flex items-center justify-between mb-3 ${isMobile ? "text-sm" : "text-sm"}`}>
            <span className="text-warm-500">{items.length} items</span>
            <span className="font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {total.toLocaleString()}</span>
          </div>
        )}
        {isMobile ? (
          <div className="flex gap-2">
            {step > 1 ? (
              <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
                iconLeft={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}
                className="flex-shrink-0 !w-[56px] !min-w-[56px] justify-center">{null}</Button>
            ) : (
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}
                className="flex-shrink-0 !w-[56px] !min-w-[56px] justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </Button>
            )}
            {step < 3 ? (
              <Button variant="primary" size="md" onClick={handleNext} disabled={step === 1 ? !p.selectedSupplierId : items.length === 0}
                iconRight={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
                className="flex-1 min-w-0">{t("Continue", "Endelea")}</Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting} disabled={items.length === 0}
                iconLeft={!isSubmitting ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> : undefined}
                className="flex-1 min-w-0">{isSubmitting ? t("Sending...", "Inatuma...") : t("Send Order", "Tuma Agizo")}</Button>
            )}
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            {step > 1 ? (
              <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
                iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}>{t("Back", "Rudi")}</Button>
            ) : (
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}>{t("Cancel", "Ghairi")}</Button>
            )}
            {step < 3 ? (
              <Button variant="primary" size="md" onClick={handleNext} disabled={step === 1 ? !p.selectedSupplierId : items.length === 0}
                iconRight={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}>{t("Continue", "Endelea")}</Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting} disabled={items.length === 0}
                iconLeft={!isSubmitting ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> : undefined}>{isSubmitting ? t("Sending...", "Inatuma...") : t("Send Order", "Tuma Agizo")}</Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
   STEP 1: SELECT SUPPLIER
   ============================================ */

function Step1Supplier({ selectedSupplierId, setSelectedSupplierId, supplierSearch, setSupplierSearch, filteredSuppliers, setPaymentMethod }: OrderContentProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="search" value={supplierSearch} onChange={(e) => setSupplierSearch(e.target.value)} placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500" style={{ fontSize: "16px", minHeight: "48px" }} />
      </div>
      <div className="space-y-2">
        {filteredSuppliers.map((s) => {
          const isSelected = s.id === selectedSupplierId;
          const terms = paymentTermLabels[s.paymentTerms];
          const initials = s.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
          return (
            <button key={s.id} onClick={() => { setSelectedSupplierId(s.id); setPaymentMethod(s.paymentTerms); }}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15" : "border-warm-200 dark:border-warm-700 hover:border-warm-300"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-heading font-bold text-xs">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 truncate">{s.name}</p>
                  <p className="text-xs text-warm-400 truncate">{s.contactPerson} &middot; {s.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${terms.color}`}>{terms.label}</span>
                  <span className="text-[9px] text-warm-400">{s.avgDeliveryDays === 0 ? "Same day" : `${s.avgDeliveryDays}d`}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================
   STEP 2: ADD ITEMS
   ============================================ */

function Step2Items({ selectedSupplier, searchQuery, setSearchQuery, filteredProducts, items, addItem, updateQty, removeItem, showCart, subtotal, transportCost, setTransportCost, isMobile }: OrderContentProps) {
  return (
    <div className="space-y-4">
      {/* Supplier info */}
      {selectedSupplier && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">{selectedSupplier.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{selectedSupplier.name}</p>
            <p className="text-[10px] text-warm-400">{selectedSupplier.phone}</p>
          </div>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${paymentTermLabels[selectedSupplier.paymentTerms].color}`}>
            {paymentTermLabels[selectedSupplier.paymentTerms].label}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500" style={{ fontSize: "16px", minHeight: "48px" }} />
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredProducts.map((product) => {
          const inCart = items.find((i) => i.productId === product.id);
          return (
            <div key={product.id} className={`p-3 rounded-xl border transition-all ${inCart ? "border-terracotta-400 bg-terracotta-50/50 dark:bg-terracotta-900/10" : "border-warm-200/60 dark:border-warm-700/60"}`}
              style={{ background: inCart ? undefined : "rgba(255,255,255,0.5)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-warm-400 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{product.name}</p>
                  <p className="text-xs text-warm-400 tabular-nums">KSh {product.lastPurchasePrice} / {product.unit}</p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateQty(product.id, inCart.qty - 1)} className="w-8 h-8 rounded-lg bg-warm-200 dark:bg-warm-700 text-sm font-bold flex items-center justify-center active:scale-90" aria-label="Decrease">-</button>
                    <span className="text-sm font-bold text-warm-900 dark:text-warm-50 tabular-nums min-w-[1.5rem] text-center">{inCart.qty}</span>
                    <button onClick={() => updateQty(product.id, inCart.qty + 1)} className="w-8 h-8 rounded-lg bg-terracotta-500 text-white text-sm font-bold flex items-center justify-center active:scale-90" aria-label="Increase">+</button>
                  </div>
                ) : (
                  <button onClick={() => addItem(product)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-500 hover:bg-terracotta-100 flex items-center justify-center active:scale-90 transition-all"
                    aria-label={`Add ${product.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-8 text-center text-warm-400 text-sm">No products available</div>
        )}
      </div>

      {/* Cart expanded */}
      <AnimatePresence>
        {showCart && items.length > 0 && isMobile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.5)" }}>
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium text-warm-500 mb-2">Cart ({items.length} items)</p>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 py-2 border-b border-warm-100 dark:border-warm-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{item.name}</p>
                    <p className="text-[10px] text-warm-400 tabular-nums">{item.qty} x KSh {item.unitPrice}</p>
                  </div>
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {(item.qty * item.unitPrice).toLocaleString()}</span>
                  <button onClick={() => removeItem(item.productId)} className="p-1 text-warm-400 hover:text-red-500" aria-label="Remove">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-warm-200 dark:border-warm-700">
                <span className="text-xs font-medium text-warm-500">Subtotal</span>
                <span className="text-sm font-heading font-extrabold text-terracotta-600 tabular-nums">KSh {subtotal.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transport cost */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Transport Cost (KSh)</label>
        <input type="number" value={transportCost || ""} onChange={(e) => setTransportCost(Number(e.target.value) || 0)} placeholder="0"
          className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 tabular-nums"
          style={{ fontSize: "16px", minHeight: "48px" }} />
      </div>
    </div>
  );
}

/* ============================================
   STEP 3: REVIEW & SEND
   ============================================ */

function Step3Review({ selectedSupplier, items, subtotal, total, transportCost, deliveryDate, setDeliveryDate, paymentMethod, setPaymentMethod, notes, setNotes, orderRef, smsStatus }: OrderContentProps) {
  const terms = selectedSupplier ? paymentTermLabels[selectedSupplier.paymentTerms] : null;
  const smsMessage = selectedSupplier ? `Order ${orderRef}\nFrom: Duka Manager\nItems:\n${items.map((i) => `- ${i.name}: ${i.qty} ${i.unit} @ KSh ${i.unitPrice}`).join("\n")}\nTotal: KSh ${total.toLocaleString()}${deliveryDate ? `\nDelivery: ${deliveryDate}` : ""}${notes ? `\nNotes: ${notes}` : ""}` : "";

  return (
    <div className="space-y-4">
      {/* Supplier card */}
      {selectedSupplier && (
        <div className="p-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60" style={{ background: "rgba(255,255,255,0.5)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{selectedSupplier.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 truncate">{selectedSupplier.name}</p>
              <p className="text-xs text-warm-400">{selectedSupplier.contactPerson} &middot; {selectedSupplier.phone}</p>
            </div>
            {terms && <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${terms.color}`}>{terms.label}</span>}
          </div>
        </div>
      )}

      {/* Delivery date & payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Delivery Date</label>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentTerms)}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 appearance-none"
            style={{ fontSize: "16px", minHeight: "48px" }}>
            {(Object.keys(paymentTermLabels) as PaymentTerms[]).map((k) => (
              <option key={k} value={k}>{paymentTermLabels[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
        <div className="px-3 py-2 bg-warm-50/80 dark:bg-warm-800/30 border-b border-warm-100 dark:border-warm-800">
          <p className="text-xs font-medium text-warm-500">Order Items</p>
        </div>
        <div className="divide-y divide-warm-100 dark:divide-warm-800">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[10px] text-warm-400 font-mono flex-shrink-0">
                {item.qty}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{item.name}</p>
                <p className="text-[10px] text-warm-400 tabular-nums">{item.qty} x KSh {item.unitPrice}</p>
              </div>
              <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {(item.qty * item.unitPrice).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-xl bg-terracotta-50/50 dark:bg-terracotta-900/10 border border-terracotta-200/40 dark:border-terracotta-700/20 p-4 space-y-2">
        <div className="flex justify-between text-xs text-warm-600 dark:text-warm-300">
          <span>Subtotal</span><span className="tabular-nums">KSh {subtotal.toLocaleString()}</span>
        </div>
        {transportCost > 0 && (
          <div className="flex justify-between text-xs text-warm-600 dark:text-warm-300">
            <span>Transport</span><span className="tabular-nums">KSh {transportCost.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 pt-2 border-t border-terracotta-200/50 dark:border-terracotta-700/30">
          <span>TOTAL</span><span className="tabular-nums">KSh {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Special Instructions</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Delivery notes, quality requirements..."
          className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 resize-none"
          style={{ fontSize: "16px", minHeight: "72px" }} />
      </div>

      {/* SMS Preview */}
      {selectedSupplier && (
        <div className="rounded-xl border border-forest-200/60 dark:border-forest-700/30 bg-forest-50/50 dark:bg-forest-900/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /></svg>
            <span className="text-xs font-medium text-forest-700 dark:text-forest-400">SMS to {selectedSupplier.phone}</span>
            {smsStatus === "sending" && <span className="text-[10px] text-savanna-600 animate-pulse">Sending...</span>}
            {smsStatus === "sent" && <span className="text-[10px] text-forest-600">Sent</span>}
          </div>
          <p className="text-[10px] text-warm-500 font-mono whitespace-pre-line leading-relaxed bg-white dark:bg-warm-800/50 rounded-lg p-2 max-h-32 overflow-y-auto">{smsMessage}</p>
        </div>
      )}
    </div>
  );
}
