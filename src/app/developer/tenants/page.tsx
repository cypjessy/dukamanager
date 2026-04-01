"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { useDeveloperData } from "@/hooks/useDeveloperData";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ShopTenant, TenantStatus, SubscriptionTier, TenantUser, Invoice, ShopActivity } from "@/data/developerData";
import toast from "react-hot-toast";

type ViewMode = "grid" | "table";
type SortField = "name" | "revenue" | "createdAt" | "lastActive";
type SortDirection = "asc" | "desc";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DeveloperTenantsPage() {
  const { locale } = useLocale();
  const { shops, loading, updateShopStatus, updateShopPlan, activities: allActivities } = useDeveloperData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TenantStatus>("all");
  const [planFilter, setPlanFilter] = useState<"all" | SubscriptionTier>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedShop, setSelectedShop] = useState<ShopTenant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"details" | "users" | "activity" | "billing">("details");
  const [modalUsers, setModalUsers] = useState<TenantUser[]>([]);
  const [modalInvoices, setModalInvoices] = useState<Invoice[]>([]);
  const [modalActivities, setModalActivities] = useState<ShopActivity[]>([]);
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;

  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  const counties = useMemo(() => {
    const unique = Array.from(new Set(shops.map(s => s.county).filter(Boolean)));
    return unique.sort();
  }, [shops]);

  const filtered = useMemo(() => {
    let result = shops.filter((s) => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesPlan = planFilter === "all" || s.subscription === planFilter;
      const matchesCounty = countyFilter === "all" || s.county === countyFilter;
      return matchesSearch && matchesStatus && matchesPlan && matchesCounty;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "revenue") cmp = a.monthlyRevenue - b.monthlyRevenue;
      else if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "lastActive") cmp = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [shops, search, statusFilter, planFilter, countyFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openShopDetails = async (shop: ShopTenant) => {
    setSelectedShop(shop);
    setShowModal(true);
    setModalTab("details");
    setModalActivities(allActivities.filter(a => a.tenantId === shop.id));
    try {
      const invoicesSnap = await getDocs(query(collection(db, "invoices"), orderBy("dueDate", "desc")));
      const shopInvoices: Invoice[] = invoicesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Invoice))
        .filter(i => i.tenantId === shop.id);
      setModalInvoices(shopInvoices);
    } catch {
      setModalInvoices([]);
    }
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const users: TenantUser[] = [];
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.shopId === shop.id) {
          users.push({
            id: doc.id,
            name: data.displayName || "Unknown",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "viewer",
            tenantId: shop.id,
            lastActive: data.lastActive || "",
            isActive: data.isActive !== false,
          });
        }
      });
      setModalUsers(users);
    } catch {
      setModalUsers([]);
    }
  };

  const handleStatusChange = async (shopId: string, status: TenantStatus) => {
    await updateShopStatus(shopId, status);
    setSelectedShop(prev => prev && prev.id === shopId ? { ...prev, status } : prev);
    toast.success(t("Status updated", "Hali imesasishwa"));
  };

  const handlePlanChange = async (shopId: string, plan: SubscriptionTier) => {
    await updateShopPlan(shopId, plan);
    setSelectedShop(prev => prev && prev.id === shopId ? { ...prev, subscription: plan } : prev);
    toast.success(t("Plan updated", "Mpango umesasishwa"));
  };

  const toggleSelect = (id: string) => {
    setSelectedShops(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedShops.size === paginated.length) {
      setSelectedShops(new Set());
    } else {
      setSelectedShops(new Set(paginated.map(s => s.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedShops.size === 0) return;
    const action = bulkAction.split(":")[0];
    const value = bulkAction.split(":")[1];
    for (const id of Array.from(selectedShops)) {
      if (action === "status") await updateShopStatus(id, value as TenantStatus);
      if (action === "plan") await updateShopPlan(id, value as SubscriptionTier);
    }
    toast.success(t(`Applied to ${selectedShops.size} shops`, `Imetumika kwa maduka ${selectedShops.size}`));
    setSelectedShops(new Set());
    setBulkAction("");
  };

  const exportCSV = () => {
    const headers = ["Name", "Owner", "Location", "County", "Status", "Plan", "Revenue", "Users", "M-Pesa", "KRA", "Created"];
    const rows = filtered.map(s => [s.name, s.owner, s.location, s.county, s.status, s.subscription, s.monthlyRevenue, s.activeUsers, s.mpesaConfigured ? "Yes" : "No", s.kraCompliant ? "Yes" : "No", s.createdAt]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shops-export-${new Date().toISOString().split("T")[0]}.csv`;
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
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-terracotta-600 via-terracotta-500 to-savanna-500 text-white rounded-b-3xl shadow-lg -mx-3 -mt-3 px-4 pt-4 pb-5 md:rounded-none md:shadow-none md:bg-transparent md:text-warm-900 md:dark:text-warm-50 md:p-0 md:-mx-0 md:-mt-0">
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <p className="text-white/70 text-xs font-medium">{t("Shop Management", "Usimamizi wa Maduka")}</p>
            <p className="text-2xl font-heading font-extrabold">{shops.length}</p>
            <p className="text-white/80 text-xs">{t("Shops", "Maduka")}</p>
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-heading font-bold text-warm-900 dark:text-warm-50">
              {t("Shop Management", "Usimamizi wa Maduka")}
            </h1>
            <p className="text-sm text-warm-400 mt-1">
              {t("Manage all registered shops on the platform", "Simamia maduka yote yaliyosajiliwa kwenye platform")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm md:bg-warm-100 md:dark:bg-warm-800 md:text-warm-600 md:dark:text-warm-300 text-white hover:bg-white/30 md:hover:bg-warm-200 md:dark:hover:bg-warm-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>
            <span className="hidden md:inline-block px-3 py-1.5 rounded-xl bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600 text-sm font-bold">
              {shops.length} {t("Shops", "Maduka")}
            </span>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <input
            type="text"
            placeholder={t("Search shops or owners...", "Tafuta maduka au wamiliki...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t("Search shops or owners...", "Tafuta maduka au wamiliki...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Status", "Hali Zote")}</option>
          <option value="active">{t("Active", "Hai")}</option>
          <option value="trial">{t("Trial", "Jaribio")}</option>
          <option value="pending">{t("Pending", "Inasubiri")}</option>
          <option value="suspended">{t("Suspended", "Imesimamishwa")}</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Plans", "Mipango Yote")}</option>
          <option value="free">{t("Free", "Bure")}</option>
          <option value="growth">{t("Growth", "Ukuaji")}</option>
          <option value="enterprise">{t("Enterprise", "Enterprise")}</option>
        </select>
        <select
          value={countyFilter}
          onChange={(e) => { setCountyFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Counties", "Kaunti Zote")}</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={`${sortField}:${sortDirection}`}
          onChange={(e) => { const [f, d] = e.target.value.split(":"); setSortField(f as SortField); setSortDirection(d as SortDirection); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="name:asc">{t("Sort: Name A-Z", "Panga: Jina A-Z")}</option>
          <option value="name:desc">{t("Sort: Name Z-A", "Panga: Jina Z-A")}</option>
          <option value="revenue:desc">{t("Sort: Revenue High-Low", "Panga: Mapato Juu-Chini")}</option>
          <option value="revenue:asc">{t("Sort: Revenue Low-High", "Panga: Mapato Chini-Juu")}</option>
          <option value="createdAt:desc">{t("Sort: Newest First", "Panga: Mpya Kwanza")}</option>
          <option value="createdAt:asc">{t("Sort: Oldest First", "Panga: Zamani Kwanza")}</option>
          <option value="lastActive:desc">{t("Sort: Recently Active", "Panga: Shughuli Mpya")}</option>
        </select>
        <div className="flex rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
            {t("Grid", "Gridi")}
          </button>
          <button onClick={() => setViewMode("table")} className={`px-3 py-2.5 text-xs font-medium transition-colors ${viewMode === "table" ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
            {t("Table", "Jedwali")}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedShops.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800">
          <span className="text-sm text-terracotta-600 font-medium">{selectedShops.size} {t("selected", "imechaguliwa")}</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="px-3 py-1.5 rounded-lg border border-terracotta-200 dark:border-terracotta-700 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50">
            <option value="">{t("Bulk action...", "Kitendo cha wingi...")}</option>
            <option value="status:active">{t("Set Active", "Weka Hai")}</option>
            <option value="status:suspended">{t("Set Suspended", "Weka Imesimamishwa")}</option>
            <option value="status:trial">{t("Set Trial", "Weka Jaribio")}</option>
            <option value="plan:free">{t("Set Free Plan", "Weka Mpango Bure")}</option>
            <option value="plan:growth">{t("Set Growth Plan", "Weka Mpango Ukuaji")}</option>
            <option value="plan:enterprise">{t("Set Enterprise Plan", "Weka Mpango Enterprise")}</option>
          </select>
          <button onClick={handleBulkAction} disabled={!bulkAction} className="px-3 py-1.5 rounded-lg bg-terracotta-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-terracotta-600 transition-colors">
            {t("Apply", "Tumia")}
          </button>
          <button onClick={() => setSelectedShops(new Set())} className="px-3 py-1.5 rounded-lg text-warm-500 text-sm hover:text-warm-700 dark:hover:text-warm-300 transition-colors">
            {t("Clear", "Futa")}
          </button>
        </motion.div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((shop) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-white dark:bg-warm-900 p-5 hover:shadow-lg transition-all ${selectedShops.has(shop.id) ? "border-terracotta-500 ring-2 ring-terracotta-500/20" : "border-warm-200/60 dark:border-warm-700/60"}`}
            >
              <div className="flex items-start gap-2 mb-3">
                <input type="checkbox" checked={selectedShops.has(shop.id)} onChange={() => toggleSelect(shop.id)} className="mt-1 rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">{shop.name}</h3>
                  <p className="text-xs text-warm-400 mt-0.5">{shop.location}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                  shop.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                  shop.status === "trial" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                  shop.status === "pending" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                  "bg-red-100 dark:bg-red-900/20 text-red-600"
                }`}>
                  {shop.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-warm-400 uppercase">{t("Owner", "Mmiliki")}</p>
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{shop.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] text-warm-400 uppercase">{t("Plan", "Mpango")}</p>
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50 capitalize">{shop.subscription}</p>
                </div>
                <div>
                  <p className="text-[10px] text-warm-400 uppercase">{t("Revenue", "Mapato")}</p>
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50">KSh {shop.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-warm-400 uppercase">{t("Users", "Watumiaji")}</p>
                  <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{shop.activeUsers}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3 text-[10px] text-warm-400">
                <span>{shop.productCount} {t("products", "bidhaa")}</span>
                <span className="mx-1">•</span>
                <span>{shop.customerCount} {t("customers", "wateja")}</span>
                <span className="mx-1">•</span>
                <span>{shop.transactionCount.toLocaleString()} {t("txns", "muamala")}</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => openShopDetails(shop)} className="flex-1 py-2 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                  {t("View Details", "Angalia Maelezo")}
                </button>
                <span className={`w-2 h-2 rounded-full ${shop.mpesaConfigured ? "bg-emerald-500" : "bg-red-500"}`} title={shop.mpesaConfigured ? "M-Pesa configured" : "M-Pesa not configured"} />
                <span className={`w-2 h-2 rounded-full ${shop.kraCompliant ? "bg-emerald-500" : "bg-red-500"}`} title={shop.kraCompliant ? "KRA compliant" : "KRA not compliant"} />
              </div>

              <p className="text-[10px] text-warm-400 mt-2 text-right">{t("Last active", "Shughuli ya mwisho")}: {formatRelativeTime(shop.lastActive)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 dark:bg-warm-800/50 border-b border-warm-200/60 dark:border-warm-700/60">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selectedShops.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Shop", "Duka")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Owner", "Mmiliki")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("County", "Kaunti")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Status", "Hali")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Plan", "Mpango")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Revenue", "Mapato")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Users", "Watumiaji")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("M-Pesa", "M-Pesa")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("KRA", "KRA")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Last Active", "Shughuli")}</th>
                  <th className="px-4 py-3 text-left font-medium text-warm-500 dark:text-warm-400">{t("Actions", "Vitendo")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-warm-800">
                {paginated.map((shop) => (
                  <tr key={shop.id} className={`hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors ${selectedShops.has(shop.id) ? "bg-terracotta-50 dark:bg-terracotta-900/10" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedShops.has(shop.id)} onChange={() => toggleSelect(shop.id)} className="rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-warm-900 dark:text-warm-50">{shop.name}</p>
                      <p className="text-xs text-warm-400">{shop.location}</p>
                    </td>
                    <td className="px-4 py-3 text-warm-700 dark:text-warm-300">{shop.owner}</td>
                    <td className="px-4 py-3 text-warm-700 dark:text-warm-300">{shop.county || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        shop.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                        shop.status === "trial" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                        shop.status === "pending" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                        "bg-red-100 dark:bg-red-900/20 text-red-600"
                      }`}>{shop.status}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-warm-700 dark:text-warm-300">{shop.subscription}</td>
                    <td className="px-4 py-3 font-medium text-warm-900 dark:text-warm-50">KSh {shop.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-warm-700 dark:text-warm-300">{shop.activeUsers}</td>
                    <td className="px-4 py-3"><span className={`w-2 h-2 rounded-full inline-block ${shop.mpesaConfigured ? "bg-emerald-500" : "bg-red-500"}`} /></td>
                    <td className="px-4 py-3"><span className={`w-2 h-2 rounded-full inline-block ${shop.kraCompliant ? "bg-emerald-500" : "bg-red-500"}`} /></td>
                    <td className="px-4 py-3 text-xs text-warm-400">{formatRelativeTime(shop.lastActive)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openShopDetails(shop)} className="px-3 py-1.5 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                        {t("View", "Angalia")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-400">
            {t("Showing", "Inaonyesha")} {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} {t("of", "ya")} {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
              {t("Previous", "Iliyopita")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
              {t("Next", "Inayofuata")}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-warm-400">{t("No shops match your filters", "Hakuna maduka yanayolingana na vichujio vyako")}</p>
        </div>
      )}

      {/* Shop Details Modal */}
      <AnimatePresence>
        {showModal && selectedShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600 mx-auto mt-3 mb-2 md:hidden" />
              {/* Modal Header */}
              <div className="p-5 border-b border-warm-200/60 dark:border-warm-700/60 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-heading font-bold text-warm-900 dark:text-warm-50">{selectedShop.name}</h2>
                  <p className="text-sm text-warm-400 mt-0.5">{selectedShop.location} • {selectedShop.county}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedShop.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                      selectedShop.status === "trial" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                      selectedShop.status === "pending" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                      "bg-red-100 dark:bg-red-900/20 text-red-600"
                    }`}>{selectedShop.status}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600 capitalize">{selectedShop.subscription}</span>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
                  <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-warm-200/60 dark:border-warm-700/60 px-5">
                {[
                  { key: "details" as const, label: t("Details", "Maelezo") },
                  { key: "users" as const, label: t("Users", "Watumiaji") },
                  { key: "activity" as const, label: t("Activity", "Shughuli") },
                  { key: "billing" as const, label: t("Billing", "Bili") },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setModalTab(tab.key)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${modalTab === tab.key ? "border-terracotta-500 text-terracotta-600" : "border-transparent text-warm-500 hover:text-warm-700 dark:hover:text-warm-300"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                {/* Details Tab */}
                {modalTab === "details" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: t("Revenue", "Mapato"), value: `KSh ${selectedShop.monthlyRevenue.toLocaleString()}` },
                        { label: t("Transactions", "Muamala"), value: selectedShop.transactionCount.toLocaleString() },
                        { label: t("Products", "Bidhaa"), value: selectedShop.productCount.toString() },
                        { label: t("Customers", "Wateja"), value: selectedShop.customerCount.toString() },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                          <p className="text-xs text-warm-400 uppercase">{stat.label}</p>
                          <p className="text-lg font-bold text-warm-900 dark:text-warm-50 mt-1">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Contact Info */}
                    <div className="p-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50 mb-3">{t("Owner Contact", "Mawasiliano ya Mmiliki")}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-warm-700 dark:text-warm-300"><span className="font-medium">{t("Name", "Jina")}:</span> {selectedShop.owner}</p>
                        <div className="flex items-center gap-3">
                          <a href={`tel:${selectedShop.phone}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {selectedShop.phone || t("N/A", "N/A")}
                          </a>
                          <a href={`mailto:${selectedShop.email}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {selectedShop.email || t("N/A", "N/A")}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="p-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50 mb-3">{t("Configuration", "Usanidi")}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${selectedShop.mpesaConfigured ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className="text-sm text-warm-700 dark:text-warm-300">M-Pesa: {selectedShop.mpesaConfigured ? t("Configured", "Imesanidiwa") : t("Not Configured", "Haijasanidiwa")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${selectedShop.kraCompliant ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className="text-sm text-warm-700 dark:text-warm-300">KRA: {selectedShop.kraCompliant ? t("Compliant", "Inafuata") : t("Not Compliant", "Haifuati")}</span>
                        </div>
                      </div>
                      {selectedShop.settings.mpesaTill && (
                        <p className="text-sm text-warm-600 dark:text-warm-400 mt-2">M-Pesa Till: <span className="font-mono font-bold">{selectedShop.settings.mpesaTill}</span></p>
                      )}
                      <p className="text-sm text-warm-600 dark:text-warm-400 mt-1">Tax Rate: {selectedShop.settings.taxRate}%</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                      <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50 mb-3">{t("Quick Actions", "Vitendo vya Haraka")}</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-warm-400 uppercase mb-1.5">{t("Change Status", "Badilisha Hali")}</p>
                          <div className="flex flex-wrap gap-1">
                            {(["active", "trial", "pending", "suspended"] as TenantStatus[]).map((s) => (
                              <button key={s} onClick={() => handleStatusChange(selectedShop.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedShop.status === s ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-600"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-warm-400 uppercase mb-1.5">{t("Change Plan", "Badilisha Mpango")}</p>
                          <div className="flex flex-wrap gap-1">
                            {(["free", "growth", "enterprise"] as SubscriptionTier[]).map((p) => (
                              <button key={p} onClick={() => handlePlanChange(selectedShop.id, p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedShop.subscription === p ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-600"}`}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-warm-400">
                      <span>{t("Created", "Iliundwa")}: {selectedShop.createdAt}</span>
                      <span>{t("Last Active", "Shughuli ya Mwisho")}: {formatRelativeTime(selectedShop.lastActive)}</span>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {modalTab === "users" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50">{modalUsers.length} {t("Users", "Watumiaji")}</h3>
                    </div>
                    {modalUsers.length === 0 ? (
                      <p className="text-sm text-warm-400 text-center py-8">{t("No users found", "Hakuna watumiaji walioonekana")}</p>
                    ) : (
                      <div className="space-y-2">
                        {modalUsers.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                            <div>
                              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{user.name}</p>
                              <p className="text-xs text-warm-400">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${user.role === "owner" ? "bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600" : user.role === "manager" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" : user.role === "cashier" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-warm-100 dark:bg-warm-700 text-warm-600"}`}>{user.role}</span>
                              <span className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} title={user.isActive ? "Active" : "Inactive"} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {modalTab === "activity" && (
                  <div>
                    <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50 mb-4">{t("Recent Activity", "Shughuli za Hivi Karibuni")}</h3>
                    {modalActivities.length === 0 ? (
                      <p className="text-sm text-warm-400 text-center py-8">{t("No activity recorded", "Hakuna shughuli iliyorekodiwa")}</p>
                    ) : (
                      <div className="space-y-3">
                        {modalActivities.map(activity => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.type === "transaction" ? "bg-emerald-500" : activity.type === "login" ? "bg-blue-500" : activity.type === "payment" ? "bg-terracotta-500" : activity.type === "user_added" ? "bg-amber-500" : "bg-warm-400"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-warm-900 dark:text-warm-50">{activity.description}</p>
                              <p className="text-xs text-warm-400 mt-0.5">{activity.user} • {formatRelativeTime(activity.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Billing Tab */}
                {modalTab === "billing" && (
                  <div>
                    <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50 mb-4">{t("Invoice History", "Historia ya Bili")}</h3>
                    {modalInvoices.length === 0 ? (
                      <p className="text-sm text-warm-400 text-center py-8">{t("No invoices found", "Hakuna bili ilioonekana")}</p>
                    ) : (
                      <div className="space-y-2">
                        {modalInvoices.map(inv => (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                            <div>
                              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{inv.period}</p>
                              <p className="text-xs text-warm-400">{t("Due", "Inatakiwa")}: {inv.dueDate}{inv.paidAt && ` • ${t("Paid", "Imelipwa")}: ${inv.paidAt}`}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-warm-900 dark:text-warm-50">KSh {inv.amount.toLocaleString()}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : inv.status === "pending" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-red-100 dark:bg-red-900/20 text-red-600"}`}>{inv.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
