"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Customer } from "@/data/customerData";
import { segmentConfig, loyaltyTierConfig, sampleTransactions } from "@/data/customerData";
import type { Locale } from "@/types";

interface CustomerProfileProps {
  customer: Customer | null;
  locale: Locale;
  onClose: () => void;
}

type ProfileTab = "analytics" | "transactions" | "credit" | "loyalty" | "notes";

const tabs: { key: ProfileTab; label: string; labelSw: string }[] = [
  { key: "analytics", label: "Analytics", labelSw: "Takwimu" },
  { key: "transactions", label: "History", labelSw: "Historia" },
  { key: "credit", label: "Credit", labelSw: "Mkopo" },
  { key: "loyalty", label: "Loyalty", labelSw: "Uaminifu" },
  { key: "notes", label: "Notes", labelSw: "Maelezo" },
];

export default function CustomerProfile({ customer, locale, onClose }: CustomerProfileProps) {
  const [tab, setTab] = useState<ProfileTab>("analytics");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!customer) return null;

  const seg = segmentConfig[customer.segment];
  const tier = loyaltyTierConfig[customer.loyaltyTier];
  const initials = customer.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  const custTransactions = sampleTransactions.filter((t) => t.customerId === customer.id);

  const spendingData = customer.monthlySpending.map((s, i) => ({
    month: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
    amount: s,
  }));

  const paymentBreakdown = [
    { name: "M-Pesa", value: Math.round(customer.totalSpent * 0.65), color: "#00A650" },
    { name: "Cash", value: Math.round(customer.totalSpent * 0.2), color: "#D4A574" },
    { name: "Credit", value: Math.round(customer.totalSpent * 0.15), color: "#E85D04" },
  ];

  const nextTierPoints = customer.loyaltyTier === "platinum" ? 5000 : customer.loyaltyTier === "gold" ? 5000 : customer.loyaltyTier === "silver" ? 2000 : 500;
  const progressPct = Math.min((customer.loyaltyPoints / nextTierPoints) * 100, 100);

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <motion.div
          ref={dialogRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-glass-lg overflow-y-auto"
          role="dialog" aria-modal="true" aria-label={`${customer.name} profile`}>
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-warm-900/90 backdrop-blur-sm border-b border-warm-200/60 dark:border-warm-700/60">
            <div className="flex items-center gap-3 px-5 py-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${seg.bgGradient} flex items-center justify-center`}>
                <span className="text-white font-heading font-extrabold text-sm">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">{customer.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${seg.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-").replace("-600", "-100").replace("-400", "-900/30")} ${seg.color}`}>{seg.label}</span>
                  <span className={`text-[10px] font-medium ${tier.color}`}>{tier.label} &middot; {customer.loyaltyPoints} pts</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex px-5 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-h-[36px] ${tab === t.key ? "border-terracotta-500 text-terracotta-600" : "border-transparent text-warm-400"}`}>
                  {locale === "sw" ? t.labelSw : t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {tab === "analytics" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Total Spent</p>
                    <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {(customer.totalSpent / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Visits</p>
                    <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{customer.transactionCount}</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Avg Basket</p>
                    <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {customer.avgBasketSize}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-4">
                  <p className="text-xs font-medium text-warm-500 mb-2">Spending Trend (6 months)</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingData} margin={{ left: -20, right: 0, top: 5, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9a958a" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9a958a" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => [`KSh ${Number(v).toLocaleString()}`, ""]} />
                        <Line type="monotone" dataKey="amount" stroke="#C75B39" strokeWidth={2} dot={{ r: 3, fill: "#C75B39" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-1">Payment Methods</p>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={18} outerRadius={32} paddingAngle={2} dataKey="value">
                            {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {paymentBreakdown.map((p) => (
                        <span key={p.name} className="text-[8px] flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />{p.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3">
                    <p className="text-[10px] text-warm-400 mb-1">Favorites</p>
                    {customer.favoriteCategories.map((cat) => (
                      <span key={cat} className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300 mr-1 mb-1">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "transactions" && (
              <div className="space-y-2">
                {custTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <div>
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{txn.receiptNo}</p>
                      <p className="text-[10px] text-warm-400">{txn.date} &middot; {txn.items} items &middot; <span className={txn.method === "mpesa" ? "text-[#00A650]" : txn.method === "credit" ? "text-sunset-500" : ""}>{txn.method}</span></p>
                    </div>
                    <span className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {txn.amount.toLocaleString()}</span>
                  </div>
                ))}
                {custTransactions.length === 0 && <p className="text-sm text-warm-400 text-center py-6">No transactions</p>}
              </div>
            )}

            {tab === "credit" && (
              <div className="space-y-4">
                {customer.creditLimit > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                        <p className="text-[10px] text-warm-400">Limit</p>
                        <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {customer.creditLimit.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                        <p className="text-[10px] text-warm-400">Balance</p>
                        <p className={`text-sm font-heading font-extrabold tabular-nums ${customer.creditStatus === "overdue" ? "text-red-500" : customer.creditStatus === "warning" ? "text-savanna-600" : "text-forest-600"}`}>KSh {customer.creditBalance.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                        <p className="text-[10px] text-warm-400">Available</p>
                        <p className="text-sm font-heading font-extrabold text-forest-600 tabular-nums">KSh {(customer.creditLimit - customer.creditBalance).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
                      <div className={`h-full rounded-full ${customer.creditBalance / customer.creditLimit > 0.8 ? "bg-red-500" : "bg-forest-500"}`} style={{ width: `${(customer.creditBalance / customer.creditLimit) * 100}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-xs font-bold min-h-[40px]">Record Payment</button>
                      <button className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-bold min-h-[40px]">Statement</button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-warm-400 mb-3">No credit account</p>
                    <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white text-xs font-bold min-h-[40px]">Apply for Credit</button>
                  </div>
                )}
              </div>
            )}

            {tab === "loyalty" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-4 text-center">
                  <p className={`text-2xl font-heading font-extrabold ${tier.color} mb-1`}>{tier.label}</p>
                  <p className="text-sm text-warm-500 tabular-nums">{customer.loyaltyPoints} points</p>
                  <p className="text-[10px] text-warm-400 mt-1">{tier.benefits}</p>
                  {customer.loyaltyTier !== "platinum" && (
                    <div className="mt-3">
                      <div className="h-2 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-savanna-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="text-[10px] text-warm-400">{nextTierPoints - customer.loyaltyPoints} points to next tier</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "notes" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-4">
                  <p className="text-[10px] text-warm-400 mb-1">Shop Notes</p>
                  <p className="text-sm text-warm-900 dark:text-warm-50 leading-relaxed">{customer.notes || "No notes yet"}</p>
                </div>
                <textarea placeholder={locale === "sw" ? "Ongeza maelezo..." : "Add notes..."}
                  className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[80px] resize-none" />
                <button className="w-full py-2.5 rounded-xl bg-terracotta-500 text-white font-heading font-bold text-sm min-h-[40px]">
                  {locale === "sw" ? "Hifadhi" : "Save Notes"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
