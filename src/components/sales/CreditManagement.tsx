"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CreditCustomer } from "@/data/salesData";
import type { Locale } from "@/types";

interface CreditManagementProps {
  customers: CreditCustomer[];
  locale: Locale;
  onCollectPayment: (customerId: string, amount: number) => void;
}

const riskConfig = {
  low: { color: "bg-forest-500", label: "Low", labelSw: "Chini" },
  medium: { color: "bg-savanna-500", label: "Medium", labelSw: "Wastani" },
  high: { color: "bg-red-500", label: "High", labelSw: "Juu" },
};

export default function CreditManagement({ customers, locale, onCollectPayment }: CreditManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);
  const [collectAmount, setCollectAmount] = useState("");

  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Wateja" : "Customers"}</p>
          <p className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50">{customers.length}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Deni Lote" : "Total Outstanding"}</p>
          <p className="text-xl font-heading font-extrabold text-sunset-500 tabular-nums">KSh {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 col-span-2 sm:col-span-1" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Hatari" : "High Risk"}</p>
          <p className="text-xl font-heading font-extrabold text-red-500">{customers.filter((c) => c.risk === "high").length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {customers.map((customer, i) => {
          const risk = riskConfig[customer.risk];
          const usagePercent = Math.round((customer.outstanding / customer.creditLimit) * 100);
          const isSelected = selectedCustomer?.id === customer.id;

          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
            >
              <button
                onClick={() => setSelectedCustomer(isSelected ? null : customer)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[60px]"
              >
                <div className="w-10 h-10 rounded-full bg-savanna-200 dark:bg-savanna-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-savanna-700 dark:text-savanna-300 font-heading font-bold text-sm">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">{customer.name}</span>
                    <span className={`w-2 h-2 rounded-full ${risk.color}`} />
                  </div>
                  <p className="text-xs text-warm-400">{customer.phone} &middot; {customer.daysSincePayment}d since payment</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-heading font-bold text-sunset-500 tabular-nums">KSh {customer.outstanding.toLocaleString()}</p>
                  <p className="text-[10px] text-warm-400">{usagePercent}% of limit</p>
                </div>
              </button>

              {isSelected && (
                <div className="px-4 pb-4 border-t border-warm-200/30 dark:border-warm-700/30 pt-3 space-y-3">
                  <div className="h-2 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
                    <div className={`h-full rounded-full ${usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-savanna-500" : "bg-forest-500"}`} style={{ width: `${usagePercent}%` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="text-warm-400">Limit</p><p className="font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {customer.creditLimit.toLocaleString()}</p></div>
                    <div><p className="text-warm-400">Outstanding</p><p className="font-bold text-sunset-500 tabular-nums">KSh {customer.outstanding.toLocaleString()}</p></div>
                    <div><p className="text-warm-400">Available</p><p className="font-bold text-forest-600 tabular-nums">KSh {(customer.creditLimit - customer.outstanding).toLocaleString()}</p></div>
                  </div>

                  <div className="flex gap-2">
                    <input type="number" value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} placeholder="Amount"
                      className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500 min-h-[40px] tabular-nums" />
                    <button onClick={() => { onCollectPayment(customer.id, Number(collectAmount)); setCollectAmount(""); }}
                      disabled={!collectAmount || Number(collectAmount) <= 0}
                      className="px-4 py-2 rounded-xl bg-forest-500 text-white text-sm font-bold hover:bg-forest-600 transition-colors disabled:opacity-40 min-h-[40px]">
                      {locale === "sw" ? "Kusanya" : "Collect"}
                    </button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {customer.transactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <span className="text-warm-400">{t.date}</span>
                        <span className={`font-medium ${t.type === "payment" ? "text-forest-600" : "text-sunset-500"}`}>
                          {t.type === "payment" ? "+" : "-"}KSh {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
