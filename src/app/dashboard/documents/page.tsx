"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Document, DocCategory, ViewMode } from "@/data/documentData";
import { useDocumentsFirestore } from "@/hooks/useDocumentsFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import DocumentGrid from "@/components/documents/DocumentGrid";
import DocumentPreview from "@/components/documents/DocumentPreview";
import AddDocumentDialog from "@/components/documents/AddDocumentDialog";
import LicenseTracker from "@/components/documents/LicenseTracker";

type DocView = "documents" | "compliance" | "contracts";

export default function DocumentsPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const { documents, loading, addDocument, expiringDocs, expiredDocs, complianceScore, categoryConfig } = useDocumentsFirestore();
  const [view, setView] = useState<DocView>("documents");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [catFilter, setCatFilter] = useState<DocCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categories: (DocCategory | "all")[] = useMemo(
    () => ["all", ...Object.keys(categoryConfig) as DocCategory[]],
    [categoryConfig]
  );

  const totalDocs = documents.length;

  const handleSaveDocument = useCallback(async (data: {
    name: string; category: DocCategory; description: string; documentNumber: string;
    issuingAuthority: string; issueDate: string; expiryDate: string; tags: string[];
    linkedTo: string; accessLevel: string; reminder: boolean; reminderDays: number; file: File | null;
  }) => {
    setUploading(true);
    try {
      await addDocument(data);
      setShowAddDialog(false);
    } catch (err) {
      console.error("Failed to save document:", err);
    } finally {
      setUploading(false);
    }
  }, [addDocument]);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{t("Loading...", "Inapakia...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {t("Documents & Records", "Hati na Rekodi")}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {totalDocs} {t("documents", "hati")} &middot; {expiringDocs} {t("expiring", "zinaisha")} &middot; {expiredDocs} {t("expired", "zimeisha")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${complianceScore >= 80 ? "bg-forest-50 dark:bg-forest-900/10" : complianceScore >= 60 ? "bg-savanna-50 dark:bg-savanna-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
              <span className="text-xs font-bold text-warm-900 dark:text-warm-50">{t("Compliance", "Ufuataji")}:</span>
              <span className={`text-sm font-heading font-extrabold ${complianceScore >= 80 ? "text-forest-600" : complianceScore >= 60 ? "text-savanna-600" : "text-red-500"}`}>{complianceScore}%</span>
            </div>
            <button onClick={() => setShowAddDialog(true)} disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[48px] disabled:opacity-50">
              {uploading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
              <span className="hidden sm:inline">{uploading ? t("Uploading...", "Inapakia...") : t("Add Document", "Ongeza Hati")}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* View tabs */}
      <div className={`flex flex-wrap gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
          {(["documents", "compliance", "contracts"] as DocView[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[32px] ${view === v ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
              {v === "documents" ? t("Documents", "Hati") : v === "compliance" ? t("Compliance", "Kufuata Sheria") : t("Contracts", "Mikataba")}
            </button>
          ))}
        </div>

        {view === "documents" && (
          <>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[28px] ${catFilter === cat ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"}`}>
                  {cat === "all" ? "All" : `${categoryConfig[cat]?.icon || "📄"} ${categoryConfig[cat]?.label || cat}`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center ${viewMode === "grid" ? "bg-white dark:bg-warm-700 shadow-sm" : "text-warm-400"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center ${viewMode === "list" ? "bg-white dark:bg-warm-700 shadow-sm" : "text-warm-400"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Search */}
      {view === "documents" && (
        <div className={`relative ${isMobile ? "mb-4" : "mb-3 flex-shrink-0"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search documents by name or tags...", "Tafuta hati kwa jina au lebo...")}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[40px]" />
        </div>
      )}

      {/* Content */}
      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "documents" && (
          <DocumentGrid documents={documents} locale={locale} viewMode={viewMode} searchQuery={searchQuery} categoryFilter={catFilter} onPreview={setSelectedDoc} />
        )}
        {view === "compliance" && <LicenseTracker documents={documents} locale={locale} />}
        {view === "contracts" && <LicenseTracker documents={documents.filter((d) => d.category === "contracts" || d.category === "lease")} locale={locale} />}
      </div>

      {/* Preview */}
      {selectedDoc && <DocumentPreview doc={selectedDoc} locale={locale} onClose={() => setSelectedDoc(null)} />}

      {/* Add Document Dialog */}
      <AddDocumentDialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} onSave={handleSaveDocument} locale={locale} isMobile={isMobile} />
    </div>
  );
}
