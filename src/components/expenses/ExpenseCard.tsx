"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { Expense, PaymentMethod } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";

interface ExpenseCardProps {
  expense: Expense;
  isSelected: boolean;
  isSelectionMode: boolean;
  onSelect: (id: string) => void;
  onEdit: (expense: Expense) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (expense: Expense) => void;
}

const methodIcons: Record<PaymentMethod, string> = {
  cash: "💵", mpesa: "📲", bank: "🏦", mobile_banking: "📱",
};

const statusConfig = {
  draft: { label: "Draft", color: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300" },
  pending: { label: "Pending", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700" },
  approved: { label: "Approved", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700" },
  rejected: { label: "Rejected", color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  reimbursed: { label: "Reimbursed", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600" },
};

export default function ExpenseCard({
  expense,
  isSelected,
  isSelectionMode,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onViewDetails,
}: ExpenseCardProps) {
  const [isExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [-150, 0], ["#2D5A3D", "#2D5A3D00"]);
  const bgRight = useTransform(x, [0, 150], ["#DC262600", "#DC2626"]);

  const cat = categoryConfig[expense.category];
  const status = statusConfig[expense.status];

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -100) {
        // Swipe left: edit & duplicate
        setShowActions(true);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      } else if (info.offset.x > 100) {
        // Swipe right: delete
        onDelete(expense.id);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    },
    [expense.id, onDelete, x]
  );

  const handleTap = () => {
    if (isSelectionMode) {
      onSelect(expense.id);
    } else {
      onViewDetails(expense);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe background indicators */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-start pl-4 rounded-l-xl"
        style={{ background: bgLeft }}
      >
        <div className="flex items-center gap-2 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-xs font-medium">Edit</span>
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-4 rounded-r-xl"
        style={{ background: bgRight }}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="text-xs font-medium">Delete</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={handleTap}
        className="relative rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3.5 cursor-pointer active:scale-[0.99] transition-transform"
        whileTap={{ scale: 0.99 }}
        layout
      >
        {/* Selection checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isSelected ? "border-terracotta-500 bg-terracotta-500" : "border-warm-300 dark:border-warm-600"
              }`}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bgColor}`}>
              <span className="text-base">{cat.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">
                {expense.description}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-warm-400">{expense.date}</span>
                <span className="text-[10px] text-warm-300">|</span>
                <span className="text-[10px] text-warm-400">{expense.dayOfWeek}</span>
                <span className="text-[10px] text-warm-300">|</span>
                <span className="text-[10px]">{methodIcons[expense.paymentMethod]}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-heading font-extrabold text-red-500 tabular-nums">
              -KSh {expense.amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${cat.bgColor} ${cat.color}`}>
            {cat.label}
          </span>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${status.color}`}>
            {status.label}
          </span>
          {expense.isRecurring && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-forest-100 dark:bg-forest-900/30 text-forest-600">
              🔄 {expense.recurrenceFrequency}
            </span>
          )}
          {expense.receiptUrl && (
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600 hover:bg-savanna-200 dark:hover:bg-savanna-900/50 transition-colors inline-flex items-center gap-0.5"
            >
              📄 Receipt
            </a>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-2 pt-2 border-t border-warm-200/60 dark:border-warm-700/60 space-y-1"
          >
            {expense.reference && (
              <p className="text-[10px] text-warm-400">Ref: <span className="font-mono">{expense.reference}</span></p>
            )}
            {expense.notes && <p className="text-[10px] text-warm-400">Notes: {expense.notes}</p>}
          </motion.div>
        )}
      </motion.div>

      {/* Quick actions overlay */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-warm-900/80 dark:bg-warm-900/90 rounded-xl flex items-center justify-center gap-4 z-10"
          onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(expense); setShowActions(false); }}
            className="w-12 h-12 rounded-xl bg-terracotta-500 text-white flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(expense.id); setShowActions(false); }}
            className="w-12 h-12 rounded-xl bg-forest-500 text-white flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
}
