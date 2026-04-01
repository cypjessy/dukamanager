"use client";

import { motion } from "framer-motion";
import type { Customer } from "@/data/customerData";
import { segmentConfig, loyaltyTierConfig } from "@/data/customerData";
import type { Locale } from "@/types";

interface CustomerCardProps {
  customer: Customer;
  locale: Locale;
  onClick: (customer: Customer) => void;
  onCall: (phone: string) => void;
  onMessage: (phone: string) => void;
}

export default function CustomerCard({ customer, locale, onClick, onCall, onMessage }: CustomerCardProps) {
  const seg = segmentConfig[customer.segment];
  const tier = loyaltyTierConfig[customer.loyaltyTier];
  const initials = customer.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

  return (
    <motion.div whileHover={{ y: -3 }} onClick={() => onClick(customer)}
      className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 cursor-pointer transition-shadow hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${seg.bgGradient} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-heading font-extrabold text-sm">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">
            {customer.name}
            {customer.nickname !== customer.name && <span className="text-warm-400 font-normal ml-1">&quot;{customer.nickname}&quot;</span>}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${seg.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-").replace("-600", "-100").replace("-400", "-900/30")} ${seg.color}`}>
              {seg.label}
            </span>
            <span className={`text-[10px] font-medium ${tier.color}`}>{tier.label}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /></svg>
          <span>{customer.phone}</span>
          <span className="text-[#00A650] ml-0.5">WhatsApp</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          <span className="truncate">{customer.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <span>Since {customer.customerSince.slice(0, 7)}</span>
          <span className="ml-auto text-warm-400 tabular-nums">{customer.daysSinceLastPurchase}d ago</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] text-warm-400">Lifetime</p>
          <p className="text-sm font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums">KSh {customer.totalSpent.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-warm-400">{customer.loyaltyPoints} pts</p>
          <div className="w-16 h-1.5 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
            <div className="h-full rounded-full bg-savanna-500" style={{ width: `${Math.min((customer.loyaltyPoints / 5000) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {customer.creditLimit > 0 && (
        <div className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg mb-3 ${
          customer.creditStatus === "overdue" ? "bg-red-50 dark:bg-red-900/10" : customer.creditStatus === "warning" ? "bg-savanna-50 dark:bg-savanna-900/10" : "bg-forest-50 dark:bg-forest-900/10"
        }`}>
          <span className="text-[10px] text-warm-500">Credit</span>
          <span className={`text-xs font-bold tabular-nums ${
            customer.creditStatus === "overdue" ? "text-red-500" : customer.creditStatus === "warning" ? "text-savanna-600" : "text-forest-600"
          }`}>
            KSh {customer.creditBalance.toLocaleString()} / {customer.creditLimit.toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-warm-200/30 dark:border-warm-700/30">
        <button onClick={(e) => { e.stopPropagation(); onCall(customer.phone); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 text-xs font-medium hover:bg-forest-100 transition-colors min-h-[36px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /></svg>
          {locale === "sw" ? "Piga" : "Call"}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMessage(customer.whatsapp); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#00A650]/10 text-[#00A650] text-xs font-medium hover:bg-[#00A650]/20 transition-colors min-h-[36px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.522 5.857L.058 23.708l5.994-1.574A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.886 0-3.685-.513-5.212-1.404l-.373-.222-3.956 1.039 1.057-3.863-.243-.393A9.77 9.77 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12s-4.398 9.818-9.818 9.818z" /></svg>
          WhatsApp
        </button>
      </div>
    </motion.div>
  );
}
