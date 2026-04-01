"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CashierUser } from "@/hooks/useCashierMonitoring";
import { StatusBadge } from "./StatusBadge";
import { PerformanceSparkline } from "./PerformanceSparkline";
import { UserActionsMenu } from "./UserActionsMenu";

interface UserTableProps {
  cashiers: CashierUser[];
  onCashierSelect: (cashier: CashierUser) => void;
  onCashierAction: (cashier: CashierUser, action: string) => void;
  isBulkMode: boolean;
  bulkSelection: Set<string>;
  onToggleBulkSelect: (cashierId: string) => void;
  onSelectAll?: () => void;
}

export function UserTable({
  cashiers,
  onCashierSelect,
  onCashierAction,
  isBulkMode,
  bulkSelection,
  onToggleBulkSelect,
  onSelectAll,
}: UserTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
    const badge = badges[role] || badges.cashier;
    return `${badge.bg} ${badge.text}`;
  };

  const allSelected = cashiers.length > 0 && cashiers.every((c) => bulkSelection.has(c.uid));

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-warm-200/60 dark:border-warm-700/60 bg-warm-50/50 dark:bg-warm-800/30">
              {isBulkMode && (
                <th className="w-12 text-left py-3.5 px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded accent-terracotta-500"
                  />
                </th>
              )}
              <th className="w-14 text-left text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Photo
              </th>
              <th className="min-w-[140px] text-left text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Name & Role
              </th>
              <th className="w-24 text-left text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Employee ID
              </th>
              <th className="w-28 text-left text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Device
              </th>
              <th className="w-24 text-center text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Status
              </th>
              <th className="w-28 text-center text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Today&apos;s Metrics
              </th>
              <th className="w-24 text-center text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                7-Day Trend
              </th>
              <th className="w-14 text-center text-[10px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 py-3.5 px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {cashiers.map((cashier) => {
                const isSelected = bulkSelection.has(cashier.uid);
                const isHovered = hoveredRow === cashier.uid;
                const isExpanded = expandedRow === cashier.uid;

                return (
                  <motion.tr
                    key={cashier.uid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`group border-b border-warm-100/60 dark:border-warm-800/40 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-terracotta-50/60 dark:bg-terracotta-900/20"
                        : isHovered
                        ? "bg-warm-50/80 dark:bg-warm-800/40"
                        : "hover:bg-warm-50/40 dark:hover:bg-warm-800/20"
                    }`}
                    onClick={() => {
                      if (isBulkMode) {
                        onToggleBulkSelect(cashier.uid);
                      } else {
                        onCashierSelect(cashier);
                      }
                    }}
                    onMouseEnter={() => setHoveredRow(cashier.uid)}
                    onMouseLeave={() => setHoveredRow(null)}
                    layout
                  >
                    {isBulkMode && (
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleBulkSelect(cashier.uid);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-terracotta-500"
                        />
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <div className="relative flex-shrink-0">
                        {cashier.photoUrl ? (
                          <img
                            src={cashier.photoUrl}
                            alt={cashier.displayName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-warm-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-200 to-savanna-200 dark:from-terracotta-800 dark:to-savanna-800 flex items-center justify-center ring-2 ring-white dark:ring-warm-800">
                            <span className="text-xs font-heading font-bold text-terracotta-700 dark:text-terracotta-300">
                              {getInitials(cashier.displayName)}
                            </span>
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-warm-800 ${
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
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">
                          {cashier.displayName}
                        </p>
                        <span
                          className={`inline-flex w-fit text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${getRoleBadgeClasses(
                            cashier.role
                          )}`}
                        >
                          {cashier.role.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-mono font-medium text-warm-600 dark:text-warm-400 bg-warm-100/60 dark:bg-warm-800/40 px-2 py-1 rounded-md">
                        {cashier.uid.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cashier.deviceName
                              ? cashier.onlineStatus === "online"
                                ? "bg-forest-500"
                                : cashier.onlineStatus === "on_break"
                                ? "bg-sunset-500"
                                : "bg-warm-300"
                              : "bg-warm-200 dark:bg-warm-700"
                          }`}
                        />
                        <span className="text-xs text-warm-700 dark:text-warm-300">
                          {cashier.deviceName || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge
                        status={cashier.status === "suspended" ? "suspended" : cashier.onlineStatus}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                          {cashier.todayTransactions}
                        </span>
                        <span className="text-[10px] text-warm-500 dark:text-warm-400 tabular-nums">
                          KSh {cashier.todaySales.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <PerformanceSparkline
                        data={[100, 120, 90, 150, 130, 180, 160]}
                        height={24}
                        width={64}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center"
                      >
                        <UserActionsMenu
                          cashier={cashier}
                          onAction={(action) => onCashierAction(cashier, action)}
                          isTableView
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {cashiers.length === 0 && (
              <tr>
                <td colSpan={isBulkMode ? 10 : 9} className="px-4 py-12 text-center text-warm-500 dark:text-warm-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-warm-100 dark:bg-warm-800/50 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">No cashiers match the current filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
