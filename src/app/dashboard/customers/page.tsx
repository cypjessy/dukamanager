"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Customer, CustomerSegment } from "@/data/customerData";
import { segmentConfig } from "@/data/customerData";
import { useCustomersFirestore } from "@/hooks/useCustomersFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import type { CustomerFormValues } from "@/lib/customerValidations";
import CustomerCard from "@/components/customers/CustomerCard";
import CustomerProfile from "@/components/customers/CustomerProfile";
import AddCustomerDialog from "@/components/customers/AddCustomerDialog";

type CustomerView = "directory" | "credit" | "loyalty";
const segments: (CustomerSegment | "all")[] = ["all", ...Object.keys(segmentConfig) as CustomerSegment[]];

export default function CustomersPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { customers, creditApplications, loading, addCustomer } = useCustomersFirestore();
  const [view, setView] = useState<CustomerView>("directory");
  const [segFilter, setSegFilter] = useState<CustomerSegment | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSeg = segFilter === "all" || c.segment === segFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.location.toLowerCase().includes(q);
      return matchSeg && matchSearch;
    });
  }, [customers, segFilter, searchQuery]);

  const activeCustomers = customers.filter((c) => c.daysSinceLastPurchase <= 30).length;
  const avgLifetime = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length) : 0;
  const newThisMonth = customers.filter((c) => c.segment === "new").length;

  const handleCall = useCallback((phone: string) => { window.location.href = `tel:${phone.replace(/\s/g, "")}`; }, []);
  const handleMessage = useCallback((whatsapp: string) => {
    const normalized = whatsapp.replace(/\s/g, "").replace(/^\+/, "");
    window.open(`https://wa.me/${normalized}`, "_blank", "noopener,noreferrer");
  }, []);

  const handleSaveCustomer = useCallback(async (data: CustomerFormValues) => {
    try {
      await addCustomer(data);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save customer:", err);
    }
  }, [addCustomer]);

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
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">{locale === "sw" ? "Wateja" : "Customers"}</h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-sm text-warm-500 dark:text-warm-400"><strong className="text-warm-900 dark:text-warm-50">{activeCustomers}</strong> {locale === "sw" ? "wateja hai" : "active"}</span>
              {avgLifetime > 0 && <span className="text-sm text-warm-500 dark:text-warm-400">Avg LTV: <strong className="text-forest-600">KSh {avgLifetime.toLocaleString()}</strong></span>}
              {newThisMonth > 0 && <span className="text-sm text-blue-600 font-medium">+{newThisMonth} {locale === "sw" ? "wateja wapya" : "new"}</span>}
              <span className="text-xs text-warm-400 bg-warm-100 dark:bg-warm-800 px-2 py-0.5 rounded-full">{customers.length}</span>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[48px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            <span className="hidden sm:inline">{locale === "sw" ? "Ongeza Mteja" : "Add Customer"}</span>
          </button>
        </div>
      </motion.div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
          {(["directory", "credit", "loyalty"] as CustomerView[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[48px] ${view === v ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
              {v === "directory" ? (locale === "sw" ? "Orodha" : "Directory") : v === "credit" ? (locale === "sw" ? "Mikopo" : "Credit") : (locale === "sw" ? "Uaminifu" : "Loyalty")}
            </button>
          ))}
        </div>
        {view === "directory" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {segments.map((seg) => (
              <button key={seg} onClick={() => setSegFilter(seg)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${segFilter === seg ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"}`}>
                {seg === "all" ? "All" : segmentConfig[seg].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "directory" && (
        <div className={`relative ${isMobile ? "mb-4" : "mb-3 flex-shrink-0"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === "sw" ? "Tafuta mteja..." : "Search customers by name, phone, location..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px]" />
        </div>
      )}

      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "directory" && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">{locale === "sw" ? "Ongeza Wateja" : "Add Your First Customer"}</h3>
                <p className="text-sm text-warm-400 mb-4">{locale === "sw" ? "Anza kwa kuongeza mteja wako" : "Start building your customer relationships"}</p>
                <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {locale === "sw" ? "Ongeza Mteja" : "Add Customer"}
                </button>
              </div>
            ) : (
              <div className={isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
                {filtered.map((customer, i) => (
                  <motion.div key={customer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <CustomerCard customer={customer} locale={locale} onClick={setSelectedCustomer} onCall={handleCall} onMessage={handleMessage} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "credit" && (
          <div className="space-y-4">
            <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
              {[
                { label: locale === "sw" ? "Wakopaji" : "Credit Customers", value: customers.filter((c) => c.creditLimit > 0).length },
                { label: locale === "sw" ? "Deni" : "Outstanding", value: `KSh ${customers.filter((c) => c.creditLimit > 0).reduce((s, c) => s + c.creditBalance, 0).toLocaleString()}`, red: true },
                { label: locale === "sw" ? "Yaliyopita" : "Overdue", value: customers.filter((c) => c.creditStatus === "overdue").length, red: true },
                { label: locale === "sw" ? "Maombi" : "Applications", value: creditApplications.filter((a) => a.status === "pending").length },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                  <p className="text-xs text-warm-500 dark:text-warm-400">{stat.label}</p>
                  <p className={`text-lg font-heading font-extrabold tabular-nums ${stat.red ? "text-red-500" : "text-warm-900 dark:text-warm-50"}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            {creditApplications.length > 0 && (
              <>
                <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 px-1">{locale === "sw" ? "Maombi ya Mkopo" : "Credit Applications"}</h3>
                {creditApplications.map((app) => (
                  <div key={app.id} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{app.customerName}</span>
                      <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {app.requestedLimit.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-warm-400">{app.incomeSource} &middot; Applied: {app.appliedDate}</p>
                    {app.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 py-2.5 rounded-lg bg-forest-500 text-white text-xs font-bold min-h-[48px]">Approve</button>
                        <button className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-xs font-bold min-h-[48px]">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {creditApplications.length === 0 && customers.filter((c) => c.creditLimit > 0).length === 0 && (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna mikopo bado" : "No credit accounts yet"}</p>
              </div>
            )}
          </div>
        )}

        {view === "loyalty" && (
          <div className="space-y-4">
            {(["platinum", "gold", "silver", "bronze"] as const).map((tierKey) => {
              const tierConfig = { platinum: { label: "Platinum", color: "text-terracotta-500" }, gold: { label: "Gold", color: "text-savanna-500" }, silver: { label: "Silver", color: "text-warm-400" }, bronze: { label: "Bronze", color: "text-warm-600" } }[tierKey];
              const tierCustomers = customers.filter((c) => c.loyaltyTier === tierKey);
              return (
                <div key={tierKey} className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-heading font-bold text-sm ${tierConfig.color}`}>{tierConfig.label}</h3>
                    <span className="text-xs text-warm-400">{tierCustomers.length} {locale === "sw" ? "wateja" : "customers"}</span>
                  </div>
                  {tierCustomers.length > 0 ? (
                    <div className="space-y-1.5">
                      {tierCustomers.map((c) => (
                        <div key={c.id} onClick={() => setSelectedCustomer(c)} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 cursor-pointer active:bg-warm-200 dark:active:bg-warm-700 transition-colors">
                          <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{c.name}</p>
                          <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">{c.loyaltyPoints} pts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-warm-400 py-3 text-center">{locale === "sw" ? "Hakuna wateja" : "No customers in this tier"}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CustomerProfile customer={selectedCustomer} locale={locale} onClose={() => setSelectedCustomer(null)} />
      <AddCustomerDialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} locale={locale} onSave={handleSaveCustomer} />
    </div>
  );
}
