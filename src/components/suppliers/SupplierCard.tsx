"use client";

import { motion } from "framer-motion";
import type { Supplier } from "@/data/supplierData";
import { paymentTermLabels } from "@/data/supplierData";
import type { Locale } from "@/types";

interface SupplierCardProps {
  supplier: Supplier;
  locale: Locale;
  onClick: (supplier: Supplier) => void;
  onCall: (phone: string) => void;
  onNewOrder: (supplier: Supplier) => void;
}

const categoryColors: Record<string, string> = {
  wholesaler: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400",
  distributor: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  manufacturer: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400",
  farmer: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400",
  importer: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400",
};

export default function SupplierCard({ supplier, locale, onClick, onCall, onNewOrder }: SupplierCardProps) {
  const terms = paymentTermLabels[supplier.paymentTerms];
  const initials = supplier.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 cursor-pointer transition-shadow hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
      onClick={() => onClick(supplier)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-heading font-extrabold text-sm">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 truncate">{supplier.name}</h3>
          <p className="text-xs text-warm-500 dark:text-warm-400 truncate">{supplier.contactPerson}</p>
        </div>
        {supplier.rating >= 4.5 && (
          <span className="text-xs font-bold text-savanna-600 bg-savanna-100 dark:bg-savanna-900/30 px-1.5 py-0.5 rounded flex-shrink-0">
            {supplier.rating}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${categoryColors[supplier.category]}`}>
          {locale === "sw"
            ? { wholesaler: "Jumla", distributor: "Msambazaji", manufacturer: "Mzalishaji", farmer: "Mkulima", importer: "Muagizaji" }[supplier.category]
            : supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${terms.color}`}>
          {locale === "sw" ? terms.labelSw : terms.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          <span className="truncate">{supplier.location}</span>
          <span className="ml-auto text-warm-400 tabular-nums">{supplier.distance}km</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" /></svg>
          <span>{supplier.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span>{locale === "sw" ? "Utoaji siku" : "Delivery"}: {supplier.avgDeliveryDays === 0 ? (locale === "sw" ? "Siku hiyo hiyo" : "Same day") : `${supplier.avgDeliveryDays} days`}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-warm-200/30 dark:border-warm-700/30">
        <button onClick={(e) => { e.stopPropagation(); onCall(supplier.phone); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 dark:text-forest-400 text-xs font-medium hover:bg-forest-100 dark:hover:bg-forest-900/30 transition-colors min-h-[36px]"
          aria-label={`Call ${supplier.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /></svg>
          {locale === "sw" ? "Piga" : "Call"}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onNewOrder(supplier); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs font-medium hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 transition-colors min-h-[36px]"
          aria-label={`New order from ${supplier.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {locale === "sw" ? "Agiza" : "Order"}
        </button>
      </div>
    </motion.div>
  );
}
