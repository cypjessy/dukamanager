"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/LocaleProvider";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserRole } from "@/data/developerData";
import toast from "react-hot-toast";

type ViewMode = "grid" | "table";
type SortField = "name" | "createdAt" | "role";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";

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

export default function DeveloperUsersPage() {
  const { locale } = useLocale();
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ uid: string; action: string } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const t = (en: string, sw: string) => locale === "sw" ? sw : en;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnap, shopsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "shops")),
        ]);
        const allUsers: any[] = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allShops: any[] = shopsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        allUsers.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setUsers(allUsers);
        setShops(allShops);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const shopMap = useMemo(() => {
    const map: Record<string, string> = {};
    shops.forEach(s => { map[s.id] = s.shopName || s.name || s.id; });
    return map;
  }, [shops]);

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch = !search || (u.email || "").toLowerCase().includes(search.toLowerCase()) || (u.displayName || "").toLowerCase().includes(search.toLowerCase()) || (u.phone || "").includes(search);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const isActive = u.isActive !== false;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && isActive) || (statusFilter === "inactive" && !isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = (a.displayName || a.email || "").localeCompare(b.displayName || b.email || "");
      else if (sortField === "role") cmp = (a.role || "").localeCompare(b.role || "");
      else if (sortField === "createdAt") cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive !== false).length;
    const inactive = total - active;
    const byRole: Record<string, number> = {};
    users.forEach(u => { byRole[u.role || "unknown"] = (byRole[u.role || "unknown"] || 0) + 1; });
    return { total, active, inactive, byRole };
  }, [users]);

  const toggleStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", uid), { isActive: !currentStatus, updatedAt: new Date().toISOString() });
      setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, isActive: !currentStatus } : u));
      toast.success(t(`User ${!currentStatus ? "activated" : "deactivated"}`, `Mtumiaji ${!currentStatus ? "amewashwa" : "amezimwa"}`));
    } catch (err) {
      console.error("Failed to update user status:", err);
      toast.error(t("Failed to update user", "Imeshindwa kusasisha mtumiaji"));
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { uid, action } = confirmAction;
    const user = users.find(u => u.id === uid);
    if (!user) return;

    if (action === "toggle") {
      await toggleStatus(uid, user.isActive !== false);
    } else if (action === "forceLogout") {
      try {
        await updateDoc(doc(db, "users", uid), { forceLogout: true, forceLogoutAt: new Date().toISOString() });
        toast.success(t("User logged out", "Mtumiaji ametolewa nje"));
      } catch (err) {
        toast.error(t("Failed to logout user", "Imeshindwa kumtoa mtumiaji"));
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginated.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginated.map(u => u.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;
    for (const id of Array.from(selectedUsers)) {
      const user = users.find(u => u.id === id);
      if (user && bulkAction === "activate" && user.isActive === false) {
        await toggleStatus(id, false);
      } else if (user && bulkAction === "deactivate" && user.isActive !== false) {
        await toggleStatus(id, true);
      }
    }
    setSelectedUsers(new Set());
    setBulkAction("");
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Shop", "Status", "Email Verified", "Created", "Last Active"];
    const rows = filtered.map(u => [
      u.displayName || "", u.email || "", u.phone || "", u.role || "",
      shopMap[u.shopId] || u.shopId || "", u.isActive !== false ? "Active" : "Inactive",
      u.emailVerified ? "Yes" : "No", u.createdAt || "", u.lastActive || ""
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
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
            {t("User Management", "Usimamizi wa Watumiaji")}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {t("All users across the platform", "Watumiaji wote kwenye platform")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
            {t("Export CSV", "Safirisha CSV")}
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600 text-sm font-bold">
            {users.length} {t("Users", "Watumiaji")}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Total", "Jumla")}</p>
          <p className="text-2xl font-bold text-warm-900 dark:text-warm-50">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-emerald-50 dark:bg-emerald-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Active", "Hai")}</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          {stats.total > 0 && <p className="text-[10px] text-warm-400 mt-1">{Math.round(stats.active / stats.total * 100)}%</p>}
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-red-50 dark:bg-red-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Inactive", "Si Hai")}</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          {stats.total > 0 && <p className="text-[10px] text-warm-400 mt-1">{Math.round(stats.inactive / stats.total * 100)}%</p>}
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-terracotta-50 dark:bg-terracotta-900/10 p-5">
          <p className="text-xs text-warm-400 mb-1">{t("Top Role", "Nyadhifa Bora")}</p>
          <p className="text-lg font-bold text-terracotta-600 capitalize">
            {Object.entries(stats.byRole).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t("Search users by name, email, or phone...", "Tafuta watumiaji kwa jina, barua pepe, au simu...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Roles", "Nyadhifa Zote")}</option>
          <option value="developer">{t("Developer", "Msanidi")}</option>
          <option value="owner">{t("Owner", "Mmiliki")}</option>
          <option value="manager">{t("Manager", "Meneja")}</option>
          <option value="cashier">{t("Cashier", "Mhasibu")}</option>
          <option value="viewer">{t("Viewer", "Mtazamaji")}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="all">{t("All Status", "Hali Zote")}</option>
          <option value="active">{t("Active", "Hai")}</option>
          <option value="inactive">{t("Inactive", "Si Hai")}</option>
        </select>
        <select
          value={`${sortField}:${sortDirection}`}
          onChange={(e) => { const [f, d] = e.target.value.split(":"); setSortField(f as SortField); setSortDirection(d as SortDirection); }}
          className="px-3 py-2.5 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
        >
          <option value="createdAt:desc">{t("Sort: Newest", "Panga: Mpya")}</option>
          <option value="createdAt:asc">{t("Sort: Oldest", "Panga: Zamani")}</option>
          <option value="name:asc">{t("Sort: Name A-Z", "Panga: Jina A-Z")}</option>
          <option value="name:desc">{t("Sort: Name Z-A", "Panga: Jina Z-A")}</option>
          <option value="role:asc">{t("Sort: Role", "Panga: Nyadhifa")}</option>
        </select>
        <div className="flex rounded-xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden">
          <button onClick={() => setViewMode("table")} className={`px-3 py-2.5 text-xs font-medium transition-colors ${viewMode === "table" ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
            {t("Table", "Jedwali")}
          </button>
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-terracotta-500 text-white" : "bg-white dark:bg-warm-900 text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
            {t("Grid", "Gridi")}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800">
          <span className="text-sm text-terracotta-600 font-medium">{selectedUsers.size} {t("selected", "imechaguliwa")}</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="px-3 py-1.5 rounded-lg border border-terracotta-200 dark:border-terracotta-700 bg-white dark:bg-warm-900 text-sm text-warm-900 dark:text-warm-50">
            <option value="">{t("Bulk action...", "Kitendo cha wingi...")}</option>
            <option value="activate">{t("Activate", "Washa")}</option>
            <option value="deactivate">{t("Deactivate", "Zima")}</option>
          </select>
          <button onClick={handleBulkAction} disabled={!bulkAction} className="px-3 py-1.5 rounded-lg bg-terracotta-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-terracotta-600 transition-colors">
            {t("Apply", "Tumia")}
          </button>
          <button onClick={() => setSelectedUsers(new Set())} className="px-3 py-1.5 rounded-lg text-warm-500 text-sm hover:text-warm-700 dark:hover:text-warm-300 transition-colors">
            {t("Clear", "Futa")}
          </button>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50 dark:bg-warm-800/50">
                  <th className="text-left py-3 px-4">
                    <input type="checkbox" checked={selectedUsers.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("User", "Mtumiaji")}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Role", "Nyadhifa")}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Shop", "Duka")}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Status", "Hali")}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Last Active", "Shughuli")}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Created", "Iliundwa")}</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-warm-400 uppercase">{t("Actions", "Vitendo")}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => (
                  <tr key={user.id} className={`border-t border-warm-100 dark:border-warm-800/50 hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors ${selectedUsers.has(user.id) ? "bg-terracotta-50 dark:bg-terracotta-900/10" : ""}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-[9px]">{(user.displayName || user.email || "U").slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate">{user.displayName || user.email}</p>
                          <p className="text-[10px] text-warm-400 truncate">{user.email}{user.phone && ` • ${user.phone}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                        user.role === "developer" ? "bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600" :
                        user.role === "owner" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                        user.role === "manager" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                        user.role === "cashier" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                        "bg-warm-100 dark:bg-warm-800 text-warm-500"
                      }`}>
                        {user.role || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-warm-500 truncate max-w-[150px]">{shopMap[user.shopId] || user.shopId?.slice(0, 12) + "..." || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.isActive !== false ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-100 dark:bg-red-900/20 text-red-600"
                        }`}>
                          {user.isActive !== false ? t("Active", "Hai") : t("Inactive", "Si Hai")}
                        </span>
                        {user.emailVerified === false && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-600" title="Email not verified">!</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-warm-400">{formatRelativeTime(user.lastActive || user.updatedAt || "")}</td>
                    <td className="py-3 px-4 text-xs text-warm-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600 text-[10px] font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                          {t("View", "Angalia")}
                        </button>
                        <button onClick={() => { setConfirmAction({ uid: user.id, action: "toggle" }); setShowConfirmModal(true); }} className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          user.isActive !== false ? "bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100" : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 hover:bg-emerald-100"
                        }`}>
                          {user.isActive !== false ? t("Deactivate", "Zima") : t("Activate", "Washa")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-white dark:bg-warm-900 p-5 hover:shadow-lg transition-all ${selectedUsers.has(user.id) ? "border-terracotta-500 ring-2 ring-terracotta-500/20" : "border-warm-200/60 dark:border-warm-700/60"}`}
            >
              <div className="flex items-start gap-2 mb-3">
                <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="mt-1 rounded border-warm-300 dark:border-warm-600 text-terracotta-500 focus:ring-terracotta-500" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{(user.displayName || user.email || "U").slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-warm-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                  user.role === "developer" ? "bg-terracotta-100 dark:bg-terracotta-900/20 text-terracotta-600" :
                  user.role === "owner" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" :
                  user.role === "manager" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600" :
                  user.role === "cashier" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" :
                  "bg-warm-100 dark:bg-warm-800 text-warm-500"
                }`}>{user.role || "-"}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.isActive !== false ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-100 dark:bg-red-900/20 text-red-600"
                }`}>{user.isActive !== false ? t("Active", "Hai") : t("Inactive", "Si Hai")}</span>
                {user.emailVerified === false && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-600" title="Email not verified">!</span>
                )}
              </div>
              <div className="space-y-1 text-xs text-warm-400 mb-3">
                {user.phone && <p className="truncate">📞 {user.phone}</p>}
                <p className="truncate">{t("Shop", "Duka")}: {shopMap[user.shopId] || user.shopId?.slice(0, 16) + "..." || "-"}</p>
                <p>{t("Last active", "Shughuli ya mwisho")}: {formatRelativeTime(user.lastActive || user.updatedAt || "")}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="flex-1 py-2 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                  {t("View", "Angalia")}
                </button>
                <button onClick={() => { setConfirmAction({ uid: user.id, action: "toggle" }); setShowConfirmModal(true); }} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  user.isActive !== false ? "bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100" : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 hover:bg-emerald-100"
                }`}>
                  {user.isActive !== false ? "⏻" : "⏽"}
                </button>
              </div>
            </motion.div>
          ))}
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
          <p className="text-sm text-warm-400">{t("No users match your filters", "Hakuna watumiaji wanaolingana na vichujio vyako")}</p>
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUserModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{(selectedUser.displayName || selectedUser.email || "U").slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-warm-900 dark:text-warm-50">{selectedUser.displayName || selectedUser.email}</h2>
                    <p className="text-sm text-warm-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowUserModal(false)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
                  <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <p className="text-[10px] text-warm-400 uppercase">{t("Role", "Nyadhifa")}</p>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 capitalize mt-1">{selectedUser.role || "-"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <p className="text-[10px] text-warm-400 uppercase">{t("Status", "Hali")}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedUser.isActive !== false ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-100 dark:bg-red-900/20 text-red-600"
                    }`}>{selectedUser.isActive !== false ? t("Active", "Hai") : t("Inactive", "Si Hai")}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {selectedUser.phone && (
                    <div className="flex justify-between">
                      <span className="text-warm-400">{t("Phone", "Simu")}</span>
                      <a href={`tel:${selectedUser.phone}`} className="text-terracotta-600 font-medium hover:underline">{selectedUser.phone}</a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Shop", "Duka")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{shopMap[selectedUser.shopId] || selectedUser.shopId || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Email Verified", "Barua Imethibitishwa")}</span>
                    <span className={`font-medium ${selectedUser.emailVerified !== false ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedUser.emailVerified !== false ? t("Yes", "Ndiyo") : t("No", "Hapana")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Last Active", "Shughuli ya Mwisho")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{formatRelativeTime(selectedUser.lastActive || selectedUser.updatedAt || "")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-400">{t("Created", "Iliundwa")}</span>
                    <span className="text-warm-700 dark:text-warm-300 font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => { setShowUserModal(false); setConfirmAction({ uid: selectedUser.id, action: "toggle" }); setShowConfirmModal(true); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selectedUser.isActive !== false ? "bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-200"
                  }`}>
                    {selectedUser.isActive !== false ? t("Deactivate User", "Zima Mtumiaji") : t("Activate User", "Washa Mtumiaji")}
                  </button>
                  <button onClick={() => { setConfirmAction({ uid: selectedUser.id, action: "forceLogout" }); setShowConfirmModal(true); }} className="flex-1 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors">
                    {t("Force Logout", "Toa Nje kwa Nguvu")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-warm-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-5">
                <h3 className="text-lg font-heading font-bold text-warm-900 dark:text-warm-50 mb-2">
                  {confirmAction.action === "forceLogout" ? t("Force Logout User?", "Mtoe Mtumiaji Nje kwa Nguvu?") :
                   confirmAction.action === "toggle" && users.find(u => u.id === confirmAction.uid)?.isActive !== false ?
                   t("Deactivate User?", "Zima Mtumiaji?") : t("Activate User?", "Washa Mtumiaji?")}
                </h3>
                <p className="text-sm text-warm-400">
                  {confirmAction.action === "forceLogout" ? t("This will immediately log the user out of all sessions.", "Hii itamtoa mtumiaji kwenye vikao vyote mara moja.") :
                   users.find(u => u.id === confirmAction.uid)?.isActive !== false ?
                   t("The user will no longer be able to access the platform.", "Mtumiaji hataweza tena kufikia platform.") :
                   t("The user will regain access to the platform.", "Mtumiaji atapata upya ufikiaji wa platform.")}
                </p>
              </div>
              <div className="px-5 pb-5 flex items-center gap-2">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-sm font-medium hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                  {t("Cancel", "Ghairi")}
                </button>
                <button onClick={handleConfirmAction} className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                  confirmAction.action === "forceLogout" ? "bg-amber-500 hover:bg-amber-600" :
                  users.find(u => u.id === confirmAction.uid)?.isActive !== false ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
                }`}>
                  {t("Confirm", "Thibitisha")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
