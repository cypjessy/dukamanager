"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { dt } from "@/lib/dashboardTranslations";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { useDashboardData } from "@/hooks/useDashboardData";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import toast from "react-hot-toast";

type QuickAction = "pos" | "product" | "customer" | "report" | "expense" | "supplier";
type Note = { id: string; text: string; done: boolean; createdAt: string };

interface DashboardActivity {
  id: string;
  type: "sale" | "inventory" | "user" | "payment";
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

interface CashierStatus {
  id: string;
  name: string;
  role: string;
  onDuty: boolean;
  todaySales: number;
  shiftStart: string;
}

interface Notification {
  id: string;
  type: "alert" | "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function DashboardPage() {
  const { locale } = useLocale();
  const { currentShop, shopId, user, profile } = useAuth();
  const { isMobile } = useViewport();
  const router = useRouter();
  const { metrics, dailySales, recentTransactions, loading } = useDashboardData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showShopSwitcher, setShowShopSwitcher] = useState(false);
  const [userShops, setUserShops] = useState<Array<{ id: string; name: string }>>([]);
  const [cashiers, setCashiers] = useState<CashierStatus[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; nameSw: string; sold: number; revenue: number }>>([]);
  const [inventoryHealth, setInventoryHealth] = useState({ score: 0, inStock: 0, lowStock: 0, outOfStock: 0, total: 0 });
  const noteInputRef = useRef<HTMLInputElement>(null);

  const dailyTarget = 50000;
  const targetPercent = dailyTarget > 0 ? Math.min(Math.round((metrics.todayRevenue / dailyTarget) * 100), 100) : 0;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!shopId) return;

    const fetchData = async () => {
      try {
        const [usersSnap, salesSnap] = await Promise.all([
          getDocs(query(collection(db, "shops", shopId, "users"), limit(50))),
          getDocs(query(collection(db, "shops", shopId, "sales"), orderBy("createdAt", "desc"), limit(100))),
        ]);

        const cashierList: CashierStatus[] = [];
        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.role === "cashier" || data.role === "manager") {
            const todaySales = salesSnap.docs
              .filter(s => { const d = s.data(); return d.cashierId === doc.id || d.cashierName === data.displayName; })
              .reduce((sum, s) => sum + (Number(s.data().total) || 0), 0);
            cashierList.push({
              id: doc.id,
              name: data.displayName || data.email || "Unknown",
              role: data.role,
              onDuty: data.isActive !== false,
              todaySales,
              shiftStart: data.lastLogin || "",
            });
          }
        });
        setCashiers(cashierList);

        const productSales: Record<string, { name: string; nameSw: string; sold: number; revenue: number }> = {};
        salesSnap.docs.forEach(s => {
          const data = s.data();
          if (data.status === "completed" && Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              const key = item.productId || item.name;
              if (!productSales[key]) productSales[key] = { name: item.name || "Unknown", nameSw: item.nameSw || item.name || "Unknown", sold: 0, revenue: 0 };
              productSales[key].sold += item.qty || 1;
              productSales[key].revenue += (item.price || 0) * (item.qty || 1);
            });
          }
        });
        const sorted = Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 5);
        setTopProducts(sorted);

        const recentActivities: DashboardActivity[] = [];
        salesSnap.docs.slice(0, 8).forEach(s => {
          const data = s.data();
          const ts = data.createdAt || data.timestamp;
          const time = ts ? new Date(String(ts)).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) : "";
          recentActivities.push({
            id: s.id,
            type: "sale",
            description: `${dt("todaysSales", locale)}: KSh ${(Number(data.total) || 0).toLocaleString()} (${data.method || "cash"})`,
            time,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            color: "bg-emerald-500",
          });
        });

        if (metrics.lowStockItems.length > 0) {
          recentActivities.push({
            id: "low-stock-alert",
            type: "inventory",
            description: `${metrics.lowStockCount} ${dt("lowStock", locale)} items need restocking`,
            time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
            color: "bg-amber-500",
          });
        }

        setActivities(recentActivities.slice(0, 10));

        const notifs: Notification[] = [];
        if (metrics.lowStockCount > 0) {
          notifs.push({ id: "n1", type: "warning", title: dt("lowStock", locale), message: `${metrics.lowStockCount} ${locale === "sw" ? "bidhaa zina mahitaji ya kuongezwa" : "items need restocking"}`, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }), read: false });
        }
        if (metrics.pendingOrders > 0) {
          notifs.push({ id: "n2", type: "info", title: dt("pendingOrders", locale), message: `${metrics.pendingOrders} ${locale === "sw" ? "maagizo yanasubiri" : "orders pending"}`, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }), read: false });
        }
        if (metrics.todayRevenue > dailyTarget) {
          notifs.push({ id: "n3", type: "success", title: locale === "sw" ? "Lengo limefikika!" : "Target reached!", message: locale === "sw" ? `Umepata KSh ${metrics.todayRevenue.toLocaleString()} leo` : `You've earned KSh ${metrics.todayRevenue.toLocaleString()} today`, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }), read: false });
        }
        notifs.push({ id: "n4", type: "info", title: locale === "sw" ? "Karibu" : "Welcome", message: `${locale === "sw" ? "Habari" : "Hello"} ${profile?.displayName || user?.email?.split("@")[0] || "User"}!`, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }), read: true });
        setNotifications(notifs);

        const savedNotes = localStorage.getItem(`dashboard-notes-${shopId}`);
        if (savedNotes) setNotes(JSON.parse(savedNotes));

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [shopId, metrics.lowStockCount, metrics.lowStockItems, metrics.pendingOrders, metrics.todayRevenue, locale, profile, user]);

  useEffect(() => {
    if (shopId && notes.length > 0) {
      localStorage.setItem(`dashboard-notes-${shopId}`, JSON.stringify(notes));
    }
  }, [notes, shopId]);

  useEffect(() => {
    const fetchUserShops = async () => {
      try {
        const shopsSnap = await getDocs(collection(db, "shops"));
        const shops = shopsSnap.docs.map(d => ({ id: d.id, name: d.data().shopName || d.data().name || d.id }));
        setUserShops(shops);
      } catch {
        setUserShops([{ id: shopId || "", name: currentShop.name }]);
      }
    };
    fetchUserShops();
  }, [shopId, currentShop.name]);

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: Date.now().toString(), text: newNote.trim(), done: false, createdAt: new Date().toISOString() }, ...prev]);
    setNewNote("");
    setShowNoteInput(false);
  };

  const toggleNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, done: !n.done } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const quickActions: { key: QuickAction; label: string; labelSw: string; icon: React.ReactNode; color: string; route: string }[] = [
    { key: "pos", label: "Open POS", labelSw: "Fungua POS", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>, color: "bg-violet-500", route: "/dashboard/pos" },
    { key: "product", label: "Add Product", labelSw: "Ongeza Bidhaa", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>, color: "bg-emerald-500", route: "/dashboard/inventory" },
    { key: "customer", label: "New Customer", labelSw: "Mteja Mpya", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>, color: "bg-blue-500", route: "/dashboard/customers" },
    { key: "report", label: "View Reports", labelSw: "Angalia Ripoti", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, color: "bg-amber-500", route: "/dashboard/reports" },
    { key: "expense", label: "Add Expense", labelSw: "Ongeza Gharama", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, color: "bg-red-500", route: "/dashboard/expenses" },
    { key: "supplier", label: "Suppliers", labelSw: "Wasambazaji", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>, color: "bg-savanna-500", route: "/dashboard/suppliers" },
  ];

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
      {isMobile ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-terracotta-500 dark:text-terracotta-400 mb-0.5">
                {new Date().toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-KE", { weekday: "long", day: "numeric", month: "short" })}
              </p>
              <h1 className="font-heading text-xl font-extrabold text-warm-900 dark:text-warm-50">
                {locale === "sw" ? "Habari, " : "Hey, "}{(profile?.displayName || user?.email?.split("@")[0] || "User").split(" ")[0]}
              </h1>
            </div>
            {userShops.length > 1 && (
              <button onClick={() => setShowShopSwitcher(!showShopSwitcher)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 text-xs font-medium text-warm-600 dark:text-warm-300 active:scale-95 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                {currentShop.name}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            )}
          </div>

          {metrics.todayTransactions > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-warm-400 dark:text-warm-500">
                {metrics.todayTransactions} {locale === "sw" ? "miamala leo" : "transactions today"}
              </p>
            </div>
          )}

          <AnimatePresence>
            {showShopSwitcher && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-4 right-4 top-16 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 shadow-glass-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-warm-200/60 dark:border-warm-700/60">
                  <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50">{locale === "sw" ? "Badilisha Duka" : "Switch Shop"}</h3>
                </div>
                {userShops.map(shop => (
                  <button key={shop.id} onClick={() => { toast(locale === "sw" ? `Umehamisha kwa ${shop.name}` : `Switched to ${shop.name}`); setShowShopSwitcher(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors flex items-center gap-3 min-h-[44px] ${shop.id === shopId ? "text-terracotta-600 dark:text-terracotta-400 font-medium" : "text-warm-700 dark:text-warm-300"}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${shop.id === shopId ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`} />
                    <span className="truncate">{shop.name}</span>
                    {shop.id === shopId && <span className="ml-auto text-[10px] text-terracotta-500">{locale === "sw" ? "Sasa" : "Current"}</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4 page-section-fixed">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
                  {dt("dashboard", locale)}
                </h1>
                {userShops.length > 1 && (
                  <button onClick={() => setShowShopSwitcher(!showShopSwitcher)} className="px-2 py-1 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors flex items-center gap-1">
                    {currentShop.name}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
                {currentShop.name}
                {metrics.todayTransactions > 0 && <span> &middot; {metrics.todayTransactions} {locale === "sw" ? "miamala leo" : "transactions today"}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { markAllRead(); setShowNotifications(!showNotifications); }} className="relative p-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-500 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Notifications Dropdown - Desktop only */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-4 sm:right-8 top-16 w-80 max-h-80 overflow-y-auto rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 shadow-xl z-50">
                <div className="p-3 border-b border-warm-200/60 dark:border-warm-700/60 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50">{locale === "sw" ? "Arifa" : "Notifications"}</h3>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] text-violet-500 hover:text-violet-600">{locale === "sw" ? "Weka zote zimesomwa" : "Mark all read"}</button>}
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna arifa" : "No notifications"}</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b border-warm-100 dark:border-warm-800/50 last:border-0 ${!n.read ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}>
                      <div className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "alert" ? "bg-red-500" : n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{n.title}</p>
                          <p className="text-[10px] text-warm-400 mt-0.5">{n.message}</p>
                          <p className="text-[9px] text-warm-300 dark:text-warm-600 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shop Switcher Dropdown - Desktop only */}
          <AnimatePresence>
            {showShopSwitcher && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 top-16 w-64 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-warm-200/60 dark:border-warm-700/60">
                  <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50">{locale === "sw" ? "Badilisha Duka" : "Switch Shop"}</h3>
                </div>
                {userShops.map(shop => (
                  <button key={shop.id} onClick={() => { toast(locale === "sw" ? `Umehamisha kwa ${shop.name}` : `Switched to ${shop.name}`); setShowShopSwitcher(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors flex items-center gap-2 ${shop.id === shopId ? "text-violet-600 font-medium" : "text-warm-700 dark:text-warm-300"}`}>
                    <span className={`w-2 h-2 rounded-full ${shop.id === shopId ? "bg-violet-500" : "bg-warm-300 dark:bg-warm-600"}`} />
                    {shop.name}
                    {shop.id === shopId && <span className="ml-auto text-[10px] text-violet-500">{locale === "sw" ? "Sasa" : "Current"}</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 page-section-fixed">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickActions.map(action => (
            <button key={action.key} onClick={() => router.push(action.route)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-warm-900 border border-warm-200/60 dark:border-warm-700/60 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
              <div className={`w-9 h-9 rounded-lg ${action.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-[10px] font-medium text-warm-600 dark:text-warm-400 text-center leading-tight">{locale === "sw" ? action.labelSw : action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Daily Target Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4 page-section-fixed">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-warm-900 dark:text-warm-50">{locale === "sw" ? "Lengo la Leo" : "Today's Target"}</h3>
            <span className={`text-sm font-bold ${targetPercent >= 100 ? "text-emerald-500" : targetPercent >= 50 ? "text-amber-500" : "text-red-500"}`}>
              {targetPercent}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${targetPercent}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${targetPercent >= 100 ? "bg-emerald-500" : targetPercent >= 50 ? "bg-amber-500" : "bg-red-500"}`} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-warm-400">
            <span>KSh {metrics.todayRevenue.toLocaleString()}</span>
            <span>KSh {dailyTarget.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 page-section-fixed">
        <MetricCard title={dt("todaysSales", locale)} value={`KSh ${metrics.todayRevenue.toLocaleString()}`} change={metrics.revenueChange} changeLabel={dt("fromYesterday", locale)} color="terracotta" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
        <MetricCard title={dt("lowStock", locale)} value={metrics.lowStockCount.toString()} change={metrics.lowStockCount > 0 ? -100 : 0} changeLabel={dt("actionRequired", locale)} color="sunset" urgent={metrics.lowStockCount > 0} icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} />
        <MetricCard title={dt("pendingOrders", locale)} value={metrics.pendingOrders.toString()} change={0} changeLabel={dt("awaitingDelivery", locale)} color="savanna" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} />
        <MetricCard title={dt("activeCustomers", locale)} value={metrics.activeCustomers.toString()} change={0} changeLabel={dt("todayVsYesterday", locale)} color="forest" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
      </div>

      {/* Main Content Grid */}
      {isMobile ? (
        <div className="space-y-4">
          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Bidhaa Bora" : "Top Products"}</h3>
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-warm-400 w-4">{i + 1}</span>
                      <span className="text-sm text-warm-700 dark:text-warm-300">{locale === "sw" ? p.nameSw : p.name}</span>
                    </div>
                    <span className="text-xs font-medium text-warm-500">{p.sold} sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cashiers on Duty */}
          {cashiers.length > 0 && (
            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Wahusika Leo" : "Staff On Duty"}</h3>
              <div className="space-y-2">
                {cashiers.map(c => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${c.onDuty ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className="text-sm text-warm-700 dark:text-warm-300">{c.name}</span>
                      <span className="text-[10px] text-warm-400 capitalize">{c.role}</span>
                    </div>
                    <span className="text-xs font-medium text-warm-500">KSh {c.todaySales.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <SalesChart locale={locale} dailySales={dailySales} />
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{dt("lowStock", locale)}</h3>
            <div className="space-y-3">
              {metrics.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 py-2 border-b border-warm-100/60 dark:border-warm-800/60 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{locale === "sw" ? item.nameSw : item.name}</p>
                    <p className="text-xs text-warm-400 dark:text-warm-500">{item.category}</p>
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">{item.quantity} {dt("units", locale)}</span>
                </div>
              ))}
              {metrics.lowStockItems.length === 0 && <p className="text-sm text-warm-400 text-center py-4">{dt("noData", locale)}</p>}
            </div>
          </div>

          {/* Activity Feed */}
          {activities.length > 0 && (
            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Shughuli za Hivi Karibuni" : "Recent Activity"}</h3>
              <div className="space-y-2">
                {activities.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-lg ${a.color}/10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={a.color.replace("bg-", "text-")}>{a.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-warm-700 dark:text-warm-300">{a.description}</p>
                      <p className="text-[10px] text-warm-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Notes */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{locale === "sw" ? "Vikumbusho" : "Quick Notes"}</h3>
              <button onClick={() => setShowNoteInput(!showNoteInput)} className="p-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/20 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
            {showNoteInput && (
              <div className="flex gap-2 mb-3">
                <input ref={noteInputRef} type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder={locale === "sw" ? "Andika kumbusho..." : "Add a note..."} className="flex-1 px-3 py-2 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-xs text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
                <button onClick={addNote} className="px-3 py-2 rounded-xl bg-terracotta-500 text-white text-xs font-medium hover:bg-terracotta-600 transition-colors">{locale === "sw" ? "Ongeza" : "Add"}</button>
              </div>
            )}
            {notes.length === 0 ? (
              <p className="text-xs text-warm-400 text-center py-2">{locale === "sw" ? "Hakuna vikumbusho" : "No notes yet"}</p>
            ) : (
              <div className="space-y-1.5">
                {notes.slice(0, 5).map(n => (
                  <div key={n.id} className="flex items-center gap-2">
                    <button onClick={() => toggleNote(n.id)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${n.done ? "bg-terracotta-500 border-terracotta-500" : "border-warm-300 dark:border-warm-600"}`}>
                      {n.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>
                    <span className={`flex-1 text-xs ${n.done ? "line-through text-warm-400" : "text-warm-700 dark:text-warm-300"}`}>{n.text}</span>
                    <button onClick={() => deleteNote(n.id)} className="text-warm-300 hover:text-red-500 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <RecentTransactions locale={locale} transactions={recentTransactions} />
          </div>
          </div>
      ) : (
        <>
          {/* Chart + Low Stock + Top Products */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4 page-section-fixed">
            <div className="xl:col-span-2 min-h-0">
              <SalesChart locale={locale} dailySales={dailySales} />
            </div>
            <div className="flex flex-col min-h-0 overflow-hidden space-y-4">
              {/* Low Stock */}
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 flex flex-col min-h-0 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
                <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3 flex-shrink-0">{dt("lowStock", locale)}</h3>
                <div className="flex-1 overflow-y-auto scroll-container space-y-2.5">
                  {metrics.lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{locale === "sw" ? item.nameSw : item.name}</p>
                        <p className="text-xs text-warm-400 dark:text-warm-500">{item.category}</p>
                      </div>
                      <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">{item.quantity} {dt("units", locale)}</span>
                    </div>
                  ))}
                  {metrics.lowStockItems.length === 0 && <p className="text-sm text-warm-400 text-center py-4">{dt("noData", locale)}</p>}
                </div>
              </div>

              {/* Top Products */}
              {topProducts.length > 0 && (
                <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4">
                  <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Bidhaa Bora" : "Top Products"}</h3>
                  <div className="space-y-2">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-warm-400 w-4">{i + 1}</span>
                          <span className="text-sm text-warm-700 dark:text-warm-300 truncate max-w-[120px]">{locale === "sw" ? p.nameSw : p.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-warm-500">{p.sold} sold</span>
                          <span className="text-xs font-medium text-warm-900 dark:text-warm-50">KSh {p.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed + Cashiers + Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 page-section-fixed">
            {/* Recent Activity */}
            <div className="lg:col-span-1 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4">
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Shughuli za Hivi Karibuni" : "Recent Activity"}</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-xs text-warm-400 text-center py-4">{locale === "sw" ? "Hakuna shughuli" : "No activity"}</p>
                ) : (
                  activities.slice(0, 6).map(a => (
                    <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors">
                      <div className={`w-7 h-7 rounded-lg ${a.color}/10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={a.color.replace("bg-", "text-")}>{a.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-warm-700 dark:text-warm-300">{a.description}</p>
                        <p className="text-[10px] text-warm-400">{a.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cashiers on Duty */}
            <div className="lg:col-span-1 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4">
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Wahusika Leo" : "Staff On Duty"}</h3>
              {cashiers.length === 0 ? (
                <p className="text-xs text-warm-400 text-center py-4">{locale === "sw" ? "Hakuna wahusika" : "No staff"}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cashiers.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold text-[9px]">{c.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-warm-900 dark:text-warm-50">{c.name}</p>
                          <p className="text-[10px] text-warm-400 capitalize">{c.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`w-2 h-2 rounded-full inline-block ${c.onDuty ? "bg-emerald-500" : "bg-red-500"}`} title={c.onDuty ? "On duty" : "Off duty"} />
                        <p className="text-xs font-medium text-warm-900 dark:text-warm-50 mt-1">KSh {c.todaySales.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Notes */}
            <div className="lg:col-span-1 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{locale === "sw" ? "Vikumbusho" : "Quick Notes"}</h3>
                <button onClick={() => setShowNoteInput(!showNoteInput)} className="p-1 rounded-lg bg-violet-50 dark:bg-violet-900/10 text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>
              {showNoteInput && (
                <div className="flex gap-2 mb-3">
                  <input ref={noteInputRef} type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder={locale === "sw" ? "Andika kumbusho..." : "Add a note..."} className="flex-1 px-3 py-2 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800 text-xs text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <button onClick={addNote} className="px-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors">{locale === "sw" ? "Ongeza" : "Add"}</button>
                </div>
              )}
              {notes.length === 0 ? (
                <p className="text-xs text-warm-400 text-center py-4">{locale === "sw" ? "Hakuna vikumbusho" : "No notes yet"}</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {notes.slice(0, 8).map(n => (
                    <div key={n.id} className="flex items-center gap-2">
                      <button onClick={() => toggleNote(n.id)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${n.done ? "bg-violet-500 border-violet-500" : "border-warm-300 dark:border-warm-600"}`}>
                        {n.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </button>
                      <span className={`flex-1 text-xs ${n.done ? "line-through text-warm-400" : "text-warm-700 dark:text-warm-300"}`}>{n.text}</span>
                      <button onClick={() => deleteNote(n.id)} className="text-warm-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-4 flex-1 min-h-0 overflow-hidden page-section-fixed">
            <RecentTransactions locale={locale} transactions={recentTransactions} />
          </div>
        </>
      )}
    </div>
  );
}
