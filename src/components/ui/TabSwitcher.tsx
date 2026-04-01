"use client";

import { motion } from "framer-motion";
import type { Locale, TabItem } from "@/types";

interface TabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: "pill" | "vertical" | "bottom";
  locale?: Locale;
  className?: string;
}

const springTransition = { type: "spring" as const, stiffness: 500, damping: 30 };

function PillTabSwitcher({ tabs, activeTab, onTabChange, locale = "en", className = "" }: TabSwitcherProps) {
  return (
    <div
      className={`relative flex items-center gap-0.5 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 overflow-x-auto hide-scrollbar snap-x snap-mandatory md:overflow-visible ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const label = locale === "sw" && tab.labelSw ? tab.labelSw : tab.label;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 min-h-[36px] snap-start touch-manipulation ${
              isActive
                ? "text-transparent bg-clip-text bg-gradient-to-r from-terracotta-500 to-savanna-500"
                : "text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="pill-indicator"
                className="absolute inset-0 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg"
                transition={springTransition}
                style={{ zIndex: -1 }}
              />
            )}
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className={isActive ? "font-semibold" : ""}>{label}</span>
            {tab.badge && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sunset-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sunset-500" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function VerticalTabSwitcher({ tabs, activeTab, onTabChange, locale = "en", className = "" }: TabSwitcherProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`} role="tablist" aria-orientation="vertical">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const label = locale === "sw" && tab.labelSw ? tab.labelSw : tab.label;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={`relative flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-150 min-h-[48px] touch-manipulation ${
              isActive
                ? "text-terracotta-600 dark:text-terracotta-400 bg-terracotta-50/50 dark:bg-terracotta-900/10"
                : "text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-800/50 hover:text-warm-900 dark:hover:text-warm-100"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="vertical-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-terracotta-500 to-savanna-500"
                transition={springTransition}
                style={{ boxShadow: "0 0 8px rgba(199, 91, 57, 0.4)" }}
              />
            )}
            {tab.icon && (
              <span className={`flex-shrink-0 transition-colors ${isActive ? "text-terracotta-500" : "text-warm-400"}`}>
                {tab.icon}
              </span>
            )}
            <span className="flex-1 min-w-0">{label}</span>
            {tab.badge && (
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sunset-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sunset-500" />
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "text-terracotta-400 rotate-0" : "text-warm-300 -rotate-90"}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function BottomBarTabSwitcher({ tabs, activeTab, onTabChange, locale = "en", className = "" }: TabSwitcherProps) {
  return (
    <nav
      className={`fixed bottom-4 left-4 right-4 z-40 safe-area-bottom ${className}`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-around h-16 rounded-2xl bg-white/85 dark:bg-warm-900/85 backdrop-blur-xl border border-white/20 dark:border-warm-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] px-2">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const label = locale === "sw" && tab.labelSw ? tab.labelSw : tab.label;
          const isCenter = index === Math.floor(tabs.length / 2);

          if (isCenter) {
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="relative -mt-4 w-14 h-14 rounded-full bg-gradient-to-br from-terracotta-500 to-savanna-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all touch-manipulation"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.icon || (
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    animate={{ rotate: isActive ? 45 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </motion.svg>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl transition-colors touch-manipulation ${
                isActive ? "text-savanna-600 dark:text-savanna-400" : "text-warm-400 dark:text-warm-500 active:text-warm-600"
              }`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-dot"
                  className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-terracotta-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="flex-shrink-0">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium leading-none">{label}</span>
              {tab.badge && (
                <span className="absolute top-0.5 right-1/4 w-4 h-4 rounded-full bg-sunset-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {typeof tab.badge === "number" ? tab.badge : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function TabSwitcher({ tabs, activeTab, onTabChange, variant = "pill", locale = "en", className = "" }: TabSwitcherProps) {
  switch (variant) {
    case "vertical":
      return <VerticalTabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} locale={locale} className={className} />;
    case "bottom":
      return <BottomBarTabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} locale={locale} className={className} />;
    default:
      return <PillTabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} locale={locale} className={className} />;
  }
}
