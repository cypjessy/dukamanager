"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Document, DocCategory, ViewMode } from "@/data/documentData";
import { categoryConfig, getExpiryUrgency } from "@/data/documentData";
import type { Locale } from "@/types";

interface DocumentGridProps {
  documents: Document[];
  locale: Locale;
  viewMode: ViewMode;
  searchQuery: string;
  categoryFilter: DocCategory | "all";
  onPreview: (doc: Document) => void;
}

const fileTypeIcons: Record<string, string> = {
  pdf: "\u{1F4D1}", image: "\u{1F5BC}\u{FE0F}", doc: "\u{1F4C4}", xls: "\u{1F4CA}", scan: "\u{1F4F7}",
};

export default function DocumentGrid({ documents, viewMode, searchQuery, categoryFilter, onPreview }: DocumentGridProps) {
  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = categoryFilter === "all" || d.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, searchQuery, categoryFilter]);

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((doc, i) => {
          const cat = categoryConfig[doc.category];
          const urgency = doc.expiryDate ? getExpiryUrgency(doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000) : 999) : null;
          return (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onPreview(doc)}
              className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3 cursor-pointer transition-shadow hover:shadow-md group"
              style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="w-full h-24 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition-transform">
                {fileTypeIcons[doc.fileType]}
              </div>
              <h4 className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate mb-1">{doc.name}</h4>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
                {urgency && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${urgency.color}`}>{urgency.label}</span>}
              </div>
              <p className="text-[9px] text-warm-400 mt-1">{doc.fileSize} &middot; {doc.uploadDate}</p>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-warm-400 text-sm">No documents found</div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-warm-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const cat = categoryConfig[doc.category];
              const daysUntil = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000) : null;
              const urgency = daysUntil !== null ? getExpiryUrgency(daysUntil) : null;
              return (
                <tr key={doc.id} onClick={() => onPreview(doc)}
                  className="border-b border-warm-100/60 dark:border-warm-800/60 last:border-0 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{fileTypeIcons[doc.fileType]}</span>
                      <span className="font-medium text-warm-900 dark:text-warm-50 truncate max-w-[200px]">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.color}`}>{cat.label}</span></td>
                  <td className="px-4 py-2.5 text-xs text-warm-500 tabular-nums">{doc.fileSize}</td>
                  <td className="px-4 py-2.5 text-xs text-warm-500 tabular-nums">{doc.uploadDate}</td>
                  <td className="px-4 py-2.5 text-xs text-warm-500 tabular-nums">{doc.expiryDate || "-"}</td>
                  <td className="px-4 py-2.5">{urgency && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${urgency.color}`}>{urgency.label}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-warm-100/60 dark:divide-warm-800/60">
        {filtered.map((doc) => {
          const cat = categoryConfig[doc.category];
          const daysUntil = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000) : null;
          const urgency = daysUntil !== null ? getExpiryUrgency(daysUntil) : null;
          return (
            <div key={doc.id} onClick={() => onPreview(doc)} className="flex items-center gap-3 px-4 py-3 cursor-pointer">
              <span className="text-lg">{fileTypeIcons[doc.fileType]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{doc.name}</p>
                <p className="text-[10px] text-warm-400">{cat.label} &middot; {doc.fileSize}</p>
              </div>
              {urgency && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${urgency.color}`}>{urgency.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
