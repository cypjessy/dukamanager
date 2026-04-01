"use client";

import { useMemo } from "react";
import type { Document } from "@/data/documentData";
import type { Locale } from "@/types";

interface Props {
  documents: Document[];
  locale: Locale;
}

export default function LicenseTracker({ documents, locale }: Props) {
  const expiringDocs = useMemo(() =>
    documents
      .filter((d) => d.expiryDate)
      .sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }),
    [documents]
  );

  const getUrgency = (days: number) => {
    if (days < 0) return { label: "Expired", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" };
    if (days <= 7) return { label: `${days}d`, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" };
    if (days <= 30) return { label: `${days}d`, color: "text-savanna-600", bg: "bg-savanna-50 dark:bg-savanna-900/10" };
    return { label: `${days}d`, color: "text-forest-600", bg: "bg-warm-50 dark:bg-warm-800/50" };
  };

  const contracts = documents.filter((d) => d.category === "contracts" || d.category === "lease");
  const licenses = documents.filter((d) => d.category === "licenses" || d.category === "tax" || d.category === "insurance");

  return (
    <div className="space-y-4">
      {/* Licenses & Certificates */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Leseni na Vyeti" : "Licenses & Certificates"}
        </h3>
        {licenses.length > 0 ? (
          <div className="space-y-2">
            {licenses.map((doc) => {
              const daysUntil = doc.expiryDate
                ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000)
                : null;
              const urgency = daysUntil !== null ? getUrgency(daysUntil) : null;
              return (
                <div key={doc.id} className={`flex items-center justify-between py-3 px-3 rounded-xl ${urgency?.bg || "bg-warm-50 dark:bg-warm-800/50"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{doc.name}</p>
                    <p className="text-[10px] text-warm-400">
                      {doc.expiryDate ? `Expires: ${doc.expiryDate}` : "No expiry"}
                      {doc.description && ` · ${doc.description}`}
                    </p>
                  </div>
                  {urgency && (
                    <span className={`text-xs font-bold ${urgency.color} px-2 py-0.5 rounded`}>
                      {urgency.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna leseni" : "No licenses tracked"}</p>
        )}
      </div>

      {/* Contracts */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">
          {locale === "sw" ? "Mikataba" : "Contracts & Agreements"}
        </h3>
        {contracts.length > 0 ? (
          <div className="space-y-2">
            {contracts.map((doc) => {
              const daysUntil = doc.expiryDate
                ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000)
                : null;
              const urgency = daysUntil !== null ? getUrgency(daysUntil) : null;
              return (
                <div key={doc.id} className={`flex items-center justify-between py-3 px-3 rounded-xl ${urgency?.bg || "bg-warm-50 dark:bg-warm-800/50"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{doc.name}</p>
                    <p className="text-[10px] text-warm-400">
                      {doc.expiryDate ? `Ends: ${doc.expiryDate}` : "Ongoing"}
                      {doc.linkedTo && ` · ${doc.linkedTo}`}
                    </p>
                  </div>
                  {urgency && (
                    <span className={`text-xs font-bold ${urgency.color} px-2 py-0.5 rounded`}>
                      {urgency.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna mikataba" : "No contracts tracked"}</p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{licenses.length + contracts.length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Jumla" : "Total"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-red-500">{expiringDocs.filter((d) => d.status === "expired").length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Zimeisha" : "Expired"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-savanna-600">{expiringDocs.filter((d) => d.status === "expiring_soon").length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Zinaisha" : "Expiring"}</p>
          </div>
          <div className="p-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 text-center">
            <p className="text-lg font-heading font-extrabold text-forest-600">{expiringDocs.filter((d) => d.status === "valid").length}</p>
            <p className="text-[10px] text-warm-500 font-medium">{locale === "sw" ? "Halali" : "Valid"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
