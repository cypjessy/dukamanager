"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Supplier, SupplierCategory } from "@/data/supplierData";
import { useSuppliersFirestore } from "@/hooks/useSuppliersFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { dt } from "@/lib/dashboardTranslations";
import SupplierCard from "@/components/suppliers/SupplierCard";
import SupplierProfile from "@/components/suppliers/SupplierProfile";
import AddSupplierDialog from "@/components/suppliers/AddSupplierDialog";
import CreateOrderDialog from "@/components/suppliers/CreateOrderDialog";
import SupplierAnalytics from "@/components/suppliers/SupplierAnalytics";
import PaymentManagement from "@/components/suppliers/PaymentManagement";
import type { SupplierFormValues } from "@/lib/supplierValidations";

type SuppliersView = "directory" | "analytics" | "payments";

export default function SuppliersPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { suppliers, payables, loading, addSupplier, createOrder, supplierCategories } = useSuppliersFirestore();
  const [view, setView] = useState<SuppliersView>("directory");
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | "all">("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState<Supplier | null>(null);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return suppliers;
    return suppliers.filter((s) => s.category === categoryFilter);
  }, [suppliers, categoryFilter]);

  const totalPayables = useMemo(() => payables.reduce((s, p) => s + p.balance, 0), [payables]);

  const handleSupplierClick = useCallback((supplier: Supplier) => setSelectedSupplier(supplier), []);
  const handleCall = useCallback((phone: string) => { window.location.href = `tel:${phone.replace(/\s/g, "")}`; }, []);

  const handleNewOrder = useCallback((supplier: Supplier) => {
    setOrderSupplier(supplier);
    setShowOrderForm(true);
    setSelectedSupplier(null);
  }, []);

  const handleSaveSupplier = useCallback(async (data: SupplierFormValues) => {
    try {
      await addSupplier(data);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save supplier:", err);
    }
  }, [addSupplier]);

  const handleOrderSubmit = useCallback(async (order: Record<string, unknown>) => {
    if (!orderSupplier) return;
    try {
      const items = (order.items as { name: string; qty: number; unitPrice: number }[]) || [];
      const transportCost = Number(order.transportCost) || 0;
      const notes = String(order.notes || "");
      await createOrder(orderSupplier, items, transportCost, notes);
      setShowOrderForm(false);
      setOrderSupplier(null);
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  }, [orderSupplier, createOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{locale === "sw" ? "Inapakia..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {dt("suppliers", locale)}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {suppliers.length} {locale === "sw" ? "watoa huduma" : "suppliers"}
              {totalPayables > 0 && <span> &middot; <strong className="text-red-500">KSh {totalPayables.toLocaleString()}</strong> {locale === "sw" ? "deni" : "payable"}</span>}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[40px] flex-shrink-0 self-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span className="hidden sm:inline">{locale === "sw" ? "Ongeza" : "Add Supplier"}</span>
          </button>
        </div>
      </motion.div>

      <div className={`flex flex-col gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        {/* Main tabs - Directory/Analytics/Payments */}
        <div className="flex items-stretch gap-1 p-1 rounded-2xl bg-warm-100 dark:bg-warm-800">
          {([
            { key: "directory", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", label: "Directory", labelSw: "Orodha" },
            { key: "analytics", icon: "M18 20V10M12 20V4M6 20v-6", label: "Analytics", labelSw: "Takwimu" },
            { key: "payments", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", label: "Payments", labelSw: "Malipo" },
          ] as { key: SuppliersView; icon: string; label: string; labelSw: string }[]).map((tab) => (
            <button key={tab.key} onClick={() => setView(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                view === tab.key
                  ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50"
                  : "text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300"
              }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{locale === "sw" ? tab.labelSw : tab.label}</span>
              <span className="sm:hidden text-xs">{locale === "sw" ? tab.labelSw.slice(0,3) : tab.label.slice(0,3)}</span>
            </button>
          ))}
        </div>

        {/* Category filter - only show for directory */}
        {view === "directory" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <button onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[28px] flex-shrink-0 ${categoryFilter === "all" ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"}`}>
              All
            </button>
            {supplierCategories.map((cat) => (
              <button key={cat.key} onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[28px] flex-shrink-0 ${categoryFilter === cat.key ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"}`}>
                {locale === "sw" ? cat.labelSw : cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "directory" && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">
                  {locale === "sw" ? "Ongeza Mtoa Huduma wa Kwanza" : "Add Your First Supplier"}
                </h3>
                <p className="text-sm text-warm-400 mb-4 max-w-xs mx-auto">
                  {locale === "sw" ? "Anza kwa kuongeza wasambazaji wako wa bidhaa" : "Start by adding your product suppliers and distributors"}
                </p>
                <button onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[44px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {locale === "sw" ? "Ongeza Mtoa Huduma" : "Add Supplier"}
                </button>
              </div>
            ) : (
              <div className={isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
                {filtered.map((supplier, i) => (
                  <motion.div key={supplier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <SupplierCard supplier={supplier} locale={locale} onClick={handleSupplierClick} onCall={handleCall} onNewOrder={handleNewOrder} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "analytics" && <SupplierAnalytics suppliers={suppliers} locale={locale} />}
        {view === "payments" && <PaymentManagement payables={payables} locale={locale} />}
      </div>

      <SupplierProfile supplier={selectedSupplier} locale={locale} onClose={() => setSelectedSupplier(null)} onNewOrder={handleNewOrder} />
      <AddSupplierDialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} locale={locale} onSave={handleSaveSupplier} />
      <CreateOrderDialog isOpen={showOrderForm} onClose={() => { setShowOrderForm(false); setOrderSupplier(null); }} initialSupplier={orderSupplier} onSubmit={handleOrderSubmit} />
    </div>
  );
}
