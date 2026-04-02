"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import type { Locale } from "@/types";
import { mobilePrimaryNav, mobileMoreItems, desktopNavItems } from "@/lib/navData";

interface MobileBottomBarProps {
  locale: Locale;
  onOpenQuickActions?: () => void;
}

export default function MobileBottomBar({ locale }: MobileBottomBarProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const isRouteActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  if (pathname === "/dashboard/pos") return null;

  const getNavIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      dashboard: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
      pos: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
      inventory: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
      more: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>,
    };
    return icons[key] || null;
  };

  const getMoreIcon = (key: string) => {
    const item = desktopNavItems.find((n) => n.key === key);
    return item?.icon || null;
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 rounded-3xl bg-white/85 dark:bg-warm-900/85 backdrop-blur-xl border border-white/20 dark:border-warm-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] px-2">
          {mobilePrimaryNav.map((item) => {
            if (item.key === "quick") {
              return (
                <button
                  key="quick"
                  onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                  className="w-14 h-14 -mt-4 rounded-2xl bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all"
                  aria-label={locale === "sw" ? "Vitendo vya Haraka" : "Quick Actions"}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    animate={{ rotate: quickMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </motion.svg>
                </button>
              );
            }

            if (item.key === "more") {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(true)}
                  className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl transition-colors ${
                    showMore ? "text-terracotta-500" : "text-warm-400"
                  }`}
                  aria-label={locale === "sw" ? "Zaidi" : "More"}
                >
                  {getNavIcon("more")}
                  <span className="text-[10px] mt-0.5 font-medium">{item.label[locale]}</span>
                </button>
              );
            }

            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl transition-colors ${
                  isActive ? "text-terracotta-500" : "text-warm-400"
                }`}
                aria-label={item.label[locale]}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.div layoutId="bottomnav-active" className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-terracotta-500" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                {getNavIcon(item.key)}
                <span className="text-[10px] mt-0.5 font-medium">{item.label[locale]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              ref={sheetRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setShowMore(false);
              }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl rounded-t-3xl border-t border-warm-200/60 dark:border-warm-700/60 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] max-h-[80vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label={locale === "sw" ? "Menyu ya Zaidi" : "More Menu"}
            >
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)}>
                <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600" />
              </div>

              <div className="px-5 pb-4">
                <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
                  {locale === "sw" ? "Menyu" : "All Sections"}
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {mobileMoreItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-colors min-h-[64px] ${
                        isRouteActive(item.href)
                          ? "bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-600"
                          : "text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-800/50"
                      }`}
                    >
                      <span className="text-xl">{getMoreIcon(item.key)}</span>
                      <span className="text-[10px] font-medium text-center leading-tight">{item.label[locale]}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-warm-200/60 dark:border-warm-700/60 pt-4">
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-heading font-bold text-sm">MN</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">Mama Njeri</p>
                      <p className="text-[10px] text-warm-400">Gikomba, Nairobi</p>
                    </div>
                    <Link href="/dashboard/settings" onClick={() => setShowMore(false)}
                      className="p-2 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 min-w-[40px] min-h-[40px] flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/20"
              onClick={() => setQuickMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl rounded-2xl border border-warm-200/60 dark:border-warm-700/60 shadow-glass-lg p-2 w-[calc(100%-2rem)] max-w-sm"
            >
              {[
                { label: { en: "New Sale", sw: "Mauzo Mapya" }, href: "/dashboard/sales" },
                { label: { en: "Add Product", sw: "Ongeza Bidhaa" }, href: "/dashboard/inventory" },
                { label: { en: "Add Customer", sw: "Ongeza Mteja" }, href: "/dashboard/customers" },
                { label: { en: "Record Expense", sw: "Rekodi Gharama" }, href: "/dashboard/expenses" },
              ].map((action, i) => (
                <Link key={i} href={action.href} onClick={() => setQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-warm-700 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors min-h-[44px]">
                  <span className="text-terracotta-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                  {action.label[locale]}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
