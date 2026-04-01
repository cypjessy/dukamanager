"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CashierUser } from "@/hooks/useCashierMonitoring";
import { StatusBadge } from "./StatusBadge";
import { UserActionsMenu } from "./UserActionsMenu";
import { PerformanceSparkline } from "./PerformanceSparkline";

interface UserCardProps {
  cashier: CashierUser;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: string) => void;
  isBulkMode: boolean;
}

export function UserCard({
  cashier,
  isSelected,
  onSelect,
  onAction,
  isBulkMode,
}: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleBadgeClasses = (role: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      head_cashier: { bg: "bg-terracotta-100 dark:bg-terracotta-900/30", text: "text-terracotta-700 dark:text-terracotta-400" },
      cashier: { bg: "bg-forest-100 dark:bg-forest-900/30", text: "text-forest-700 dark:text-forest-400" },
      trainee: { bg: "bg-savanna-100 dark:bg-savanna-900/30", text: "text-savanna-700 dark:text-savanna-400" },
    };
    return badges[role] || badges.cashier;
  };

  const roleBadge = getRoleBadgeClasses(cashier.role);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border transition-all duration-200 ${
        isSelected
          ? "border-terracotta-400/60 dark:border-terracotta-500/60 shadow-lg shadow-terracotta-500/10"
          : "border-warm-200/60 dark:border-warm-700/60"
      }`}
      style={{
        background: isSelected
          ? "rgba(199, 91, 57, 0.06)"
          : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="p-4">
        {/* Header row: checkbox, avatar, name, status */}
        <div className="flex items-center gap-3">
          {isBulkMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded accent-terracotta-500 flex-shrink-0"
            />
          )}

          {/* Avatar with status dot */}
          <div className="relative flex-shrink-0">
            {cashier.photoUrl ? (
              <img
                src={cashier.photoUrl}
                alt={cashier.displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-warm-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center ring-2 ring-white dark:ring-warm-800">
                <span className="text-sm font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                  {getInitials(cashier.displayName)}
                </span>
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-warm-800 ${
                cashier.onlineStatus === "online"
                  ? "bg-forest-500 animate-pulse"
                  : cashier.onlineStatus === "on_break"
                  ? "bg-sunset-500"
                  : cashier.status === "suspended"
                  ? "bg-red-500"
                  : "bg-warm-300"
              }`}
            />
          </div>

          {/* Name and role */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (!isBulkMode) {
                setIsExpanded(!isExpanded);
              } else {
                onSelect();
              }
            }}
          >
            <p className="text-base font-semibold text-warm-900 dark:text-warm-50 truncate">
              {cashier.displayName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${roleBadge.bg} ${roleBadge.text}`}
              >
                {cashier.role.replace("_", " ")}
              </span>
              <span className="text-[10px] font-mono text-warm-400 dark:text-warm-500">
                {cashier.uid.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <StatusBadge
            status={cashier.status === "suspended" ? "suspended" : cashier.onlineStatus}
            size="sm"
          />
        </div>

        {/* Device info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-200/40 dark:border-warm-700/40">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400 flex-shrink-0">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-xs text-warm-600 dark:text-warm-400">
            {cashier.deviceName || "No device assigned"}
          </span>
          {cashier.deviceName && (
            <span
              className={`w-2 h-2 rounded-full ${
                cashier.onlineStatus === "online"
                  ? "bg-forest-500"
                  : cashier.onlineStatus === "on_break"
                  ? "bg-sunset-500"
                  : "bg-warm-300"
              }`}
            />
          )}
        </div>

        {/* Key metric - today's performance */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-warm-50/60 dark:bg-warm-800/30 p-3 text-center">
            <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
              Transactions
            </p>
            <p className="text-lg font-bold text-warm-900 dark:text-warm-50 tabular-nums">
              {cashier.todayTransactions}
            </p>
          </div>
          <div className="rounded-xl bg-warm-50/60 dark:bg-warm-800/30 p-3 text-center">
            <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
              Revenue
            </p>
            <p className="text-lg font-bold text-terracotta-600 tabular-nums">
              KSh {cashier.todaySales.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 7-day trend */}
        <div className="mt-3 pt-3 border-t border-warm-200/40 dark:border-warm-700/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
              7-Day Trend
            </span>
            <PerformanceSparkline
              data={[100, 120, 90, 150, 130, 180, 160]}
              height={28}
              width={80}
            />
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && !isBulkMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-warm-200/40 dark:border-warm-700/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase">Phone</p>
                    <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{cashier.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase">National ID</p>
                    <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{cashier.nationalId || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-medium text-warm-500 dark:text-warm-400 uppercase">Email</p>
                    <p className="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">{cashier.email || "—"}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("message");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs font-semibold min-h-[48px] transition-colors hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(cashier.status === "active" ? "suspend" : "activate");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold min-h-[48px] transition-colors ${
                      cashier.status === "active"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                        : "bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900/30"
                    }`}
                  >
                    {cashier.status === "active" ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        Suspend
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Activate
                      </>
                    )}
                  </button>
                  <UserActionsMenu
                    cashier={cashier}
                    onAction={(action) => {
                      onAction(action);
                      setIsExpanded(false);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand chevron */}
        {!isBulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full mt-3 flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-warm-500 dark:text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 transition-colors min-h-[40px]"
          >
            <span>{isExpanded ? "Show less" : "View full details"}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
