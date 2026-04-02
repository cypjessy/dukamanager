"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";
import { useAuth } from "@/providers/AuthProvider";
import { useViewport } from "@/providers/ViewportProvider";
import { useSalesFirestore } from "@/hooks/useSalesFirestore";
import { useProducts } from "@/hooks/useProducts";

interface HeaderProps {
  locale: Locale;
  onToggleSidebar: () => void;
  onOpenProductModal: () => void;
}

export default function Header({
  locale,
  onToggleSidebar,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const { transactions } = useSalesFirestore();
  const { isMobile } = useViewport();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShopSwitcher, setShowShopSwitcher] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => {
    const notifs: Array<{ id: string; title: string; message: string; time: string; read: boolean; type: string }> = [];
    const today = new Date().toISOString().slice(0, 10);

    const lowStock = products.filter((p) => p.quantity <= p.reorderPoint && p.quantity > 0);
    if (lowStock.length > 0) {
      notifs.push({
        id: "low-stock",
        title: locale === "sw" ? "Bidhaa Zinapungua" : "Low Stock Alert",
        message: `${lowStock.length} ${locale === "sw" ? "bidhaa zinahitaji kuongezwa" : "items need restocking"}`,
        time: locale === "sw" ? "Sasa hivi" : "Just now",
        read: false,
        type: "warning",
      });
    }

    const todaySales = transactions.filter((t) => t.date === today && t.status === "completed");
    if (todaySales.length > 0) {
      const todayRevenue = todaySales.reduce((s, t) => s + t.total, 0);
      notifs.push({
        id: "today-sales",
        title: locale === "sw" ? "Muhtasari wa Leo" : "Today's Summary",
        message: `${todaySales.length} ${locale === "sw" ? "miamala" : "transactions"}, KSh ${todayRevenue.toLocaleString()}`,
        time: locale === "sw" ? "Leo" : "Today",
        read: true,
        type: "info",
      });
    }

    return notifs;
  }, [products, transactions, locale]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
        setShowShopSwitcher(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   useEffect(() => {
     if (!isMobile) return;
     const mainArea = document.querySelector(".dashboard-content-scroll");
     if (!mainArea) return;
     const handleScroll = () => {
       // Scroll listener for future use if needed
     };
     mainArea.addEventListener("scroll", handleScroll, { passive: true });
     return () => mainArea.removeEventListener("scroll", handleScroll);
   }, [isMobile]);

  return (
    <header className="shrink-0 z-30 h-16 border-b border-warm-200/60border-warm-700/60 bg-white/70bg-warm-900/70 backdrop-blur-xl">
      <div className="flex items-center h-full px-4 md:px-6 gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-warm-500 hover:text-warm-700hover:text-warm-300 hover:bg-warm-100hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <span className="text-white font-heading font-extrabold text-xs">D</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-auto md:mx-0">
          <div className="relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={dt("searchPlaceholder", locale)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-warm-100/80 border border-transparent focus:border-terracotta-300 focus:bg-white outline-none text-sm text-warm-900 placeholder:text-warm-400 transition-all min-h-[44px]"
              aria-label={dt("searchPlaceholder", locale)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className="p-2.5 rounded-xl text-warm-500 hover:text-warm-700 hover:bg-warm-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle language"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-warm-500 hover:text-warm-700hover:text-warm-300 hover:bg-warm-100hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`${dt("notifications", locale)} (${unreadCount} unread)`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-sunset-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-whitering-warm-900">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-warm-200/60border-warm-700/60 bg-white/90bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden"
                  role="region"
                  aria-label={dt("notifications", locale)}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200/60border-warm-700/60">
                    <h3 className="font-heading font-bold text-sm text-warm-50">
                      {dt("notifications", locale)}
                    </h3>
                    <button className="text-xs text-terracotta-600text-terracotta-400 hover:underline min-h-[36px] flex items-center">
                      {dt("markAllRead", locale)}
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 px-4 py-3 border-b border-warm-100/60border-warm-800/60 last:border-0 transition-colors ${
                          !notif.read ? "bg-terracotta-50/50bg-terracotta-900/10" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === "stock"
                              ? "bg-sunset-100bg-sunset-900/30 text-sunset-500"
                              : notif.type === "sale"
                                ? "bg-forest-100bg-forest-900/30 text-forest-500"
                                : notif.type === "payment"
                                  ? "bg-red-100bg-red-900/30 text-red-500"
                                  : "bg-savanna-100bg-savanna-900/30 text-savanna-600"
                          }`}
                        >
                          {notif.type === "stock" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                          )}
                          {notif.type === "sale" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                          {notif.type === "payment" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                          )}
                          {notif.type === "system" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-warm-50">
                            {(notif as any).title[locale]}
                          </p>
                          <p className="text-xs text-warm-500 text-warm-400 mt-0.5 line-clamp-2">
                            {(notif as any).message[locale]}
                          </p>
                          <p className="text-[10px] text-warm-400 text-warm-500 mt-1">
                            {notif.time}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-terracotta-500 mt-2 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-warm-100hover:bg-warm-800 transition-colors min-h-[44px]"
              aria-label={dt("profile", locale)}
              aria-expanded={showProfile}
            >
              <div className="w-8 h-8 rounded-full bg-savanna-200bg-savanna-800 flex items-center justify-center">
                <span className="text-savanna-700text-savanna-300 font-heading font-bold text-xs">
                  MN
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400 hidden sm:block">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-warm-200/60border-warm-700/60 bg-white/90bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-warm-200/60border-warm-700/60">
                    <p className="text-sm font-semibold text-warm-50">
                      {(user as any)?.name}
                    </p>
                    <p className="text-xs text-warm-400">{(user as any)?.phone}</p>
                  </div>

                  <div className="border-b border-warm-200/60border-warm-700/60">
                    <button
                      onClick={() => setShowShopSwitcher(!showShopSwitcher)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-warm-600 text-warm-900-300 hover:bg-warm-50hover:bg-warm-800 transition-colors min-h-[44px]"
                    >
                      <span>{dt("switchShop", locale)}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${showShopSwitcher ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {showShopSwitcher && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 py-2 text-xs text-warm-400">
                            {locale === "sw" ? "Chagua duka" : "Select shop"}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors min-h-[44px]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {dt("logout", locale)}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
