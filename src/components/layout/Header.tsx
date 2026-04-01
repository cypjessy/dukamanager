"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
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
  const { user, currentShop, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { products } = useProducts();
  const { transactions } = useSalesFirestore();
  const { isMobile } = useViewport();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShopSwitcher, setShowShopSwitcher] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
      setScrolled(mainArea.scrollTop > 8);
    };
    mainArea.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainArea.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  if (isMobile) {
    return (
      <header
          className={`shrink-0 z-30 sticky top-0 transition-all duration-200 bg-white/85 dark:bg-warm-950/90 ${
            scrolled
              ? "shadow-md bg-white/95 dark:bg-warm-950/95"
              : "shadow-none"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            className={`flex items-center justify-between px-4 ${
              scrolled ? "h-14" : "h-[60px]"
            } transition-all duration-200`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-heading font-extrabold text-sm">
                  {currentShop.name?.charAt(0)?.toUpperCase() || "D"}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-warm-900 dark:text-warm-50 truncate leading-tight">
                  {currentShop.name || "DukaManager"}
                </h1>
                <p className="text-[11px] text-warm-400 dark:text-warm-500 truncate leading-tight">
                  {locale === "sw" ? "Jukwaa la Usimamizi" : "Admin Portal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 hover:bg-warm-100/80 dark:hover:bg-warm-800/80 active:scale-95 transition-all"
                  aria-label={`${dt("notifications", locale)} (${unreadCount} unread)`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white dark:ring-warm-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-[calc(100vw-2rem)] max-w-80 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 shadow-glass-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200/60 dark:border-warm-700/60">
                        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
                          {dt("notifications", locale)}
                        </h3>
                        {unreadCount > 0 && (
                          <button className="text-xs text-terracotta-600 dark:text-terracotta-400 font-medium min-h-[36px] flex items-center">
                            {dt("markAllRead", locale)}
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-warm-400 text-center py-8">
                            {locale === "sw" ? "Hakuna arifa" : "No notifications"}
                          </p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`flex gap-3 px-4 py-3 border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 ${
                                !notif.read ? "bg-terracotta-50/50 dark:bg-terracotta-900/10" : ""
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                notif.type === "warning"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                              }`}>
                                {notif.type === "warning" ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{notif.title}</p>
                                <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-warm-400 dark:text-warm-500 mt-1">{notif.time}</p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-terracotta-500 mt-2 flex-shrink-0" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-warm-100/80 dark:hover:bg-warm-800/80 active:scale-95 transition-all ml-0.5"
                  aria-label={dt("profile", locale)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-heading font-bold text-[11px]">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-64 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white dark:bg-warm-900 shadow-glass-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-warm-200/60 dark:border-warm-700/60">
                        <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">
                          {user?.name}
                        </p>
                        <p className="text-xs text-warm-400">{user?.phone}</p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={toggleTheme}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[44px]"
                        >
                          {theme === "dark" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="5" />
                              <line x1="12" y1="1" x2="12" y2="3" />
                              <line x1="12" y1="21" x2="12" y2="23" />
                              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                              <line x1="1" y1="12" x2="3" y2="12" />
                              <line x1="21" y1="12" x2="23" y2="12" />
                              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                          )}
                          <span>{theme === "dark" ? (locale === "sw" ? "Hali ya Mwanga" : "Light Mode") : (locale === "sw" ? "Hali ya Giza" : "Dark Mode")}</span>
                        </button>

                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
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

  return (
    <header className="shrink-0 z-30 h-16 border-b border-warm-200/60 dark:border-warm-700/60 bg-white/70 dark:bg-warm-900/70 backdrop-blur-xl">
      <div className="flex items-center h-full px-4 md:px-6 gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-warm-100/80 dark:bg-warm-800/80 border border-transparent focus:border-terracotta-300 dark:focus:border-terracotta-600 focus:bg-white dark:focus:bg-warm-800 outline-none text-sm text-warm-900 dark:text-warm-100 placeholder:text-warm-400 transition-all min-h-[44px]"
              aria-label={dt("searchPlaceholder", locale)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`${dt("notifications", locale)} (${unreadCount} unread)`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-sunset-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-warm-900">
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
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden"
                  role="region"
                  aria-label={dt("notifications", locale)}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200/60 dark:border-warm-700/60">
                    <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">
                      {dt("notifications", locale)}
                    </h3>
                    <button className="text-xs text-terracotta-600 dark:text-terracotta-400 hover:underline min-h-[36px] flex items-center">
                      {dt("markAllRead", locale)}
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 px-4 py-3 border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 transition-colors ${
                          !notif.read ? "bg-terracotta-50/50 dark:bg-terracotta-900/10" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === "stock"
                              ? "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-500"
                              : notif.type === "sale"
                                ? "bg-forest-100 dark:bg-forest-900/30 text-forest-500"
                                : notif.type === "payment"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                  : "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600"
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
                          <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">
                            {notif.title[locale]}
                          </p>
                          <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 line-clamp-2">
                            {notif.message[locale]}
                          </p>
                          <p className="text-[10px] text-warm-400 dark:text-warm-500 mt-1">
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
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[44px]"
              aria-label={dt("profile", locale)}
              aria-expanded={showProfile}
            >
              <div className="w-8 h-8 rounded-full bg-savanna-200 dark:bg-savanna-800 flex items-center justify-center">
                <span className="text-savanna-700 dark:text-savanna-300 font-heading font-bold text-xs">
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
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-warm-200/60 dark:border-warm-700/60">
                    <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">
                      {user?.name}
                    </p>
                    <p className="text-xs text-warm-400">{user?.phone}</p>
                  </div>

                  <div className="border-b border-warm-200/60 dark:border-warm-700/60">
                    <button
                      onClick={() => setShowShopSwitcher(!showShopSwitcher)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[44px]"
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
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
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
