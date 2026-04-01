"use client";

import { motion } from "framer-motion";
import type { SupplierPayable } from "@/data/supplierData";
import type { Locale } from "@/types";

interface PaymentManagementProps {
  payables: SupplierPayable[];
  locale: Locale;
}

export default function PaymentManagement({ payables, locale }: PaymentManagementProps) {
  const totalPayable = payables.reduce((s, p) => s + p.balance, 0);
  const overdue = payables.filter((p) => p.daysOverdue > 0);
  const overdueAmount = overdue.reduce((s, p) => s + p.balance, 0);

  const agingBuckets = [
    { label: locale === "sw" ? "Sasa" : "Current", labelSw: "Sasa", amount: payables.filter((p) => p.daysOverdue === 0).reduce((s, p) => s + p.balance, 0), color: "bg-forest-500" },
    { label: "1-7 days", labelSw: "Siku 1-7", amount: payables.filter((p) => p.daysOverdue > 0 && p.daysOverdue <= 7).reduce((s, p) => s + p.balance, 0), color: "bg-savanna-500" },
    { label: "8-30 days", labelSw: "Siku 8-30", amount: payables.filter((p) => p.daysOverdue > 7 && p.daysOverdue <= 30).reduce((s, p) => s + p.balance, 0), color: "bg-sunset-400" },
    { label: "30+ days", labelSw: "Siku 30+", amount: payables.filter((p) => p.daysOverdue > 30).reduce((s, p) => s + p.balance, 0), color: "bg-red-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Deni Lote" : "Total Payable"}</p>
          <p className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {totalPayable.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-red-200/60 dark:border-red-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Yamechelewa" : "Overdue"}</p>
          <p className="text-xl font-heading font-extrabold text-red-500 tabular-nums">KSh {overdueAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">Invoices</p>
          <p className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50">{payables.length}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">Overdue Invoices</p>
          <p className="text-xl font-heading font-extrabold text-red-500">{overdue.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Umri wa Deni" : "Aging Analysis"}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {agingBuckets.map((bucket) => (
            <div key={bucket.label} className="text-center">
              <div className={`h-2 rounded-full ${bucket.color} mb-1.5`} style={{ opacity: bucket.amount > 0 ? 1 : 0.2 }} />
              <p className="text-[10px] text-warm-400">{locale === "sw" ? bucket.labelSw : bucket.label}</p>
              <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">
                {bucket.amount > 0 ? `KSh ${(bucket.amount / 1000).toFixed(1)}k` : "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {payables.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-4 ${p.daysOverdue > 7 ? "border-red-300 dark:border-red-700" : p.daysOverdue > 0 ? "border-savanna-300 dark:border-savanna-700" : "border-warm-200/60 dark:border-warm-700/60"}`}
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{p.supplierName}</span>
              <span className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {p.balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-warm-400">
              <span>{p.orderId} &middot; Due: {p.dueDate}</span>
              {p.daysOverdue > 0 && (
                <span className={`font-bold ${p.daysOverdue > 7 ? "text-red-500" : "text-savanna-600"}`}>
                  {p.daysOverdue}d overdue
                </span>
              )}
              {p.paid > 0 && <span className="text-forest-600">Paid: KSh {p.paid.toLocaleString()}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
