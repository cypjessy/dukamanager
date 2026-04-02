"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useDeveloperData } from "@/hooks/useDeveloperData";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { subscriptionPlans } from "@/data/developerData";
import type { InvoiceStatus } from "@/data/developerData";
import toast from "react-hot-toast";

interface FirestoreInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  status: InvoiceStatus;
  period: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  mpesaCode?: string;
  createdAt?: string;
}

export default function DeveloperBillingPage() {
  const { locale } = useLocale();
  const { shops, loading } = useDeveloperData();
  const [invoices, setInvoices] = useState<FirestoreInvoice[]>([]);
  const [_invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | InvoiceStatus>("all");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<FirestoreInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [page, setPage] = useState(1);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<FirestoreInvoice | null>(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const pageSize = 8;
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const invoicesSnap = await getDocs(query(collection(db, "invoices"), orderBy("dueDate", "desc")));
      const invoiceList: FirestoreInvoice[] = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreInvoice));
      setInvoices(invoiceList);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const allInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      const matchesFilter = invoiceFilter === "all" || inv.status === invoiceFilter;
      const matchesSearch = !searchInvoice || inv.tenantName.toLowerCase().includes(searchInvoice.toLowerCase()) || inv.id.toLowerCase().includes(searchInvoice.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allInvoices, invoiceFilter, searchInvoice]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((page - 1) * pageSize, page * pageSize);

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const totalRevenue = totalPaid + totalPending + totalOverdue;

  const revenueByPlan = useMemo(() => {
    return subscriptionPlans.map(plan => {
      const planShops = shops.filter(s => s.subscription === plan.tier);
      const revenue = planShops.reduce((sum, s) => sum + s.monthlyRevenue, 0);
      return { ...plan, shopCount: planShops.length, revenue };
    });
  }, [shops]);

  const topRevenueShops = useMemo(() => {
    return [...shops].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 5);
  }, [shops]);

  const paymentMethodDist = useMemo(() => {
    const dist: Record<string, number> = { mpesa: 0, card: 0, bank: 0, other: 0 };
    invoices.forEach(inv => {
      if (inv.paymentMethod) dist[inv.paymentMethod] = (dist[inv.paymentMethod] || 0) + 1;
      else if (inv.status !== "paid") dist.other++;
    });
    return dist;
  }, []);

  const overdueAlerts = useMemo(() => {
    return invoices.filter(i => i.status === "overdue");
  }, []);

  const handleMarkAsPaid = async () => {
    if (!markPaidInvoice) return;
    try {
      await updateDoc(doc(db, "invoices", markPaidInvoice.id), {
        status: "paid",
        paidAt: new Date().toISOString().split("T")[0],
        paymentMethod: "mpesa",
        mpesaCode: mpesaCode || markPaidInvoice.mpesaCode || "",
        updatedAt: new Date().toISOString(),
      });
      setInvoices(prev => prev.map(inv => inv.id === markPaidInvoice.id ? { ...inv, status: "paid" as const, paidAt: new Date().toISOString().split("T")[0], paymentMethod: "mpesa" } : inv));
      toast.success(t(`Invoice ${markPaidInvoice.id} marked as paid`, `Ankara ${markPaidInvoice.id} imewekwa kama imelipwa`));
    } catch (_err) {
      toast.error(t("Failed to update invoice", "Imeshindwa kusasisha ankara"));
    }
    setShowMarkPaidModal(false);
    setMarkPaidInvoice(null);
    setMpesaCode("");
  };

  const handleSendReminder = async (inv: FirestoreInvoice) => {
    try {
      await updateDoc(doc(db, "invoices", inv.id), {
        reminderSentAt: new Date().toISOString(),
        reminderCount: (inv as { reminderCount?: number }).reminderCount ? (inv as { reminderCount?: number }).reminderCount! + 1 : 1,
      });
      toast.success(t(`Reminder sent to ${inv.tenantName}`, `Kumbusho limetumwa kwa ${inv.tenantName}`));
    } catch (_err) {
      toast.error(t("Failed to send reminder", "Imeshindwa kutuma kumbusho"));
    }
  };

  const exportCSV = () => {
    const headers = ["Invoice", "Shop", "Period", "Amount", "Status", "Payment Method", "Due Date", "Paid At", "M-Pesa Code"];
    const rows = filteredInvoices.map(inv => [inv.id, inv.tenantName, inv.period, inv.amount, inv.status, inv.paymentMethod || "N/A", inv.dueDate, inv.paidAt || "N/A", inv.mpesaCode || "N/A"]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("Export downloaded", "Usafirishaji umepakuliwa"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-xl border-2 border-terracotta-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
            {t("Billing & Subscriptions", "Malipo na Mipango")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("Manage platform revenue and shop subscriptions", "Simamia mapato ya platform na mipango ya maduka")}
          </p>
        </div>
        <button onClick={exportCSV} className="self-start px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
          {t("Export CSV", "Safirisha CSV")}
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("Total Revenue", "Mapato Yote"), value: `KSh ${totalRevenue.toLocaleString()}`, color: "text-terracotta-500", bg: "bg-terracotta-50 dark:bg-terracotta-900/10" },
          { label: t("Collected", "Imekusanywa"), value: `KSh ${totalPaid.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
          { label: t("Pending", "Inasubiri"), value: `KSh ${totalPending.toLocaleString()}`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
          { label: t("Overdue", "Imechelewa"), value: `KSh ${totalOverdue.toLocaleString()}`, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5 ${s.bg}`}>
            <p className="text-xs text-warm-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            {s.label !== t("Total Revenue", "Mapato Yote") && totalRevenue > 0 && (
              <p className="text-[10px] text-warm-400 mt-1">{Math.round((parseFloat(s.value.replace(/[^0-9.-]+/g,"")) || 0) / totalRevenue * 100)}% {t("of total", "ya jumla")}</p>
            )}
          </div>
        ))}
      </div>

      {/* Overdue Alerts */}
      {overdueAlerts.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="font-heading font-bold text-sm text-red-700 dark:text-red-400">{t("Overdue Invoices Require Attention", "Ankara Zilizochelewa Zinahitaji Uangalizi")}</h3>
          </div>
          <div className="space-y-2">
            {overdueAlerts.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-warm-900/50">
                <div>
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{inv.tenantName}</p>
                  <p className="text-xs text-warm-400">{inv.period} • {t("Due", "Inatakiwa")}: {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600">KSh {inv.amount.toLocaleString()}</span>
                  <button onClick={() => handleSendReminder(inv)} className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                    {t("Send Reminder", "Tuma Kumbusho")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
          {t("Revenue by Plan", "Mapato kwa Mpango")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {revenueByPlan.map(plan => (
            <div key={plan.tier} className={`rounded-xl border p-4 ${
              plan.popular ? "border-terracotta-300 dark:border-terracotta-700 bg-terracotta-50 dark:bg-terracotta-900/10" : "border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800/30"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{plan.name}</h4>
                {plan.popular && <span className="px-2 py-0.5 rounded-full bg-terracotta-500 text-white text-[9px] font-bold">{t("Popular", "Maarufu")}</span>}
              </div>
              <p className="text-xl font-bold text-warm-900 dark:text-warm-50 mb-1">
                {plan.price > 0 ? `KSh ${plan.price.toLocaleString()}` : t("Free", "Bure")}
                {plan.price > 0 && <span className="text-xs font-normal text-warm-400">/mo</span>}
              </p>
              <div className="flex items-center justify-between text-xs text-warm-400">
                <span>{plan.shopCount} {t("shops", "maduka")}</span>
                <span>{t("Revenue", "Mapato")}: KSh {plan.revenue.toLocaleString()}</span>
              </div>
              <div className="mt-3 space-y-1">
                {plan.features.slice(0, 4).map(f => (
                  <li key={f} className="text-[11px] text-warm-600 dark:text-warm-400 flex items-center gap-1.5 list-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Revenue Shops + Payment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Revenue Shops */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Top Revenue Shops", "Maduka Bora ya Mapato")}
          </h3>
          <div className="space-y-3">
            {topRevenueShops.map((shop, i) => {
              const maxRev = topRevenueShops[0]?.monthlyRevenue || 1;
              const pct = Math.round((shop.monthlyRevenue / maxRev) * 100);
              return (
                <div key={shop.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-warm-700 dark:text-warm-300">
                      <span className="text-warm-400 mr-1">#{i + 1}</span>{shop.name}
                    </span>
                    <span className="text-xs font-bold text-warm-900 dark:text-warm-50">KSh {shop.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
            {t("Payment Methods", "Njia za Malipo")}
          </h3>
          <div className="space-y-4">
            {Object.entries(paymentMethodDist).map(([method, count]) => {
              const total = invoices.length;
              const pct = Math.round((count / total) * 100);
              const colors: Record<string, string> = { mpesa: "bg-emerald-500", card: "bg-blue-500", bank: "bg-amber-500", other: "bg-warm-400" };
              const labels: Record<string, string> = { mpesa: "M-Pesa", card: "Card", bank: "Bank", other: "Unpaid/Other" };
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{labels[method]}</span>
                    <span className="text-xs text-warm-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${colors[method]}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
            {t("Invoices", "Ankara")} ({filteredInvoices.length})
          </h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("Search invoices...", "Tafuta ankara...")}
              value={searchInvoice}
              onChange={(e) => { setSearchInvoice(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none sm:w-48 px-3 py-2 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-xs text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
            <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full sm:w-auto -webkit-overflow-scrolling-touch" style={{ scrollbarWidth: "none" }}>
              {(["all", "paid", "pending", "overdue", "failed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setInvoiceFilter(f); setPage(1); }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 min-h-[36px] ${
                    invoiceFilter === f ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Invoice", "Ankara")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Shop", "Duka")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Period", "Muda")}</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Amount", "Kiasi")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Method", "Njia")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Due", "Tarehe")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Status", "Hali")}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-400 uppercase">{t("Actions", "Vitendo")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-warm-100 dark:border-warm-800/50 hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-xs font-mono text-warm-900 dark:text-warm-50">{inv.id}</td>
                  <td className="py-2.5 px-3 text-xs text-warm-600 dark:text-warm-400">{inv.tenantName}</td>
                  <td className="py-2.5 px-3 text-xs text-warm-500">{inv.period}</td>
                  <td className="py-2.5 px-3 text-right text-xs font-medium text-warm-900 dark:text-warm-50">KSh {inv.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-xs text-warm-500 capitalize">{inv.paymentMethod || "-"}</td>
                  <td className="py-2.5 px-3 text-xs text-warm-500">{inv.dueDate}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                      inv.status === "pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                      inv.status === "overdue" ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-600"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} className="px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600 text-[10px] font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                        {t("View", "Angalia")}
                      </button>
                      {(inv.status === "pending" || inv.status === "overdue") && (
                        <>
                          <button onClick={() => handleSendReminder(inv)} className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 text-[10px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                            {t("Remind", "Kumbusha")}
                          </button>
                          <button onClick={() => { setMarkPaidInvoice(inv); setShowMarkPaidModal(true); }} className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                            {t("Mark Paid", "Weka Imelipwa")}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-warm-400">{t("No invoices match your filters", "Hakuna ankara inayolingana na vichujio vyako")}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-warm-400">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredInvoices.length)} {t("of", "ya")} {filteredInvoices.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                {t("Prev", "Iliyopita")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                {t("Next", "Inayofuata")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInvoiceModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-warm-900 dark:text-warm-50">{selectedInvoice.id}</h2>
                  <p className="text-sm text-warm-400">{selectedInvoice.tenantName}</p>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
                  <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <p className="text-[10px] text-warm-400 uppercase">{t("Amount", "Kiasi")}</p>
                    <p className="text-lg font-bold text-warm-900 dark:text-warm-50">KSh {selectedInvoice.amount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <p className="text-[10px] text-warm-400 uppercase">{t("Status", "Hali")}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedInvoice.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                      selectedInvoice.status === "pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                      selectedInvoice.status === "overdue" ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-600"
                    }`}>{selectedInvoice.status}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Period", "Muda")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{selectedInvoice.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Due Date", "Tarehe ya Mwisho")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{selectedInvoice.dueDate}</span>
                  </div>
                  {selectedInvoice.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-warm-400">{t("Paid On", "Imelipwa")}</span>
                      <span className="text-emerald-600 font-medium">{selectedInvoice.paidAt}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Payment Method", "Njia ya Malipo")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium capitalize">{selectedInvoice.paymentMethod || t("Not set", "Haijawekwa")}</span>
                  </div>
                  {selectedInvoice.mpesaCode && (
                    <div className="flex justify-between">
                      <span className="text-warm-400">{t("M-Pesa Code", "Msimbo wa M-Pesa")}</span>
                      <span className="font-mono font-bold text-warm-900 dark:text-warm-50">{selectedInvoice.mpesaCode}</span>
                    </div>
                  )}
                </div>
                {(selectedInvoice.status === "pending" || selectedInvoice.status === "overdue") && (
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => { handleSendReminder(selectedInvoice); }} className="flex-1 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors">
                      {t("Send Reminder", "Tuma Kumbusho")}
                    </button>
                    <button onClick={() => { setShowInvoiceModal(false); setMarkPaidInvoice(selectedInvoice); setShowMarkPaidModal(true); }} className="flex-1 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">
                      {t("Mark as Paid", "Weka kama Imelipwa")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark as Paid Modal */}
      <AnimatePresence>
        {showMarkPaidModal && markPaidInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMarkPaidModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-warm-200/60 dark:border-warm-700/60">
                <h2 className="text-lg font-heading font-bold text-warm-900 dark:text-warm-50">{t("Mark Invoice as Paid", "Weka Ankara kama Imelipwa")}</h2>
                <p className="text-sm text-warm-400 mt-0.5">{markPaidInvoice.tenantName} • KSh {markPaidInvoice.amount.toLocaleString()}</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-warm-600 dark:text-warm-400 mb-1.5">{t("M-Pesa Confirmation Code (optional)", "Msimbo wa Uhakikisho wa M-Pesa (hiari)")}</label>
                  <input
                    type="text"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QJK7X9M2NP"
                    className="w-full px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowMarkPaidModal(false)} className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                    {t("Cancel", "Ghairi")}
                  </button>
                  <button onClick={handleMarkAsPaid} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                    {t("Confirm Payment", "Thibitisha Malipo")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
