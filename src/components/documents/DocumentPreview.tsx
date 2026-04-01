"use client";

import type { Document } from "@/data/documentData";
import { categoryConfig, getExpiryUrgency } from "@/data/documentData";
import type { Locale } from "@/types";

interface DocumentPreviewProps {
  doc: Document | null;
  locale: Locale;
  onClose: () => void;
}

const fileTypeIcons: Record<string, string> = {
  pdf: "\u{1F4D1}", image: "\u{1F5BC}\u{FE0F}", doc: "\u{1F4C4}", xls: "\u{1F4CA}", scan: "\u{1F4F7}",
};

export default function DocumentPreview({ doc, onClose }: DocumentPreviewProps) {
  if (!doc) return null;

  const cat = categoryConfig[doc.category];
  const daysUntil = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000) : null;
  const urgency = daysUntil !== null ? getExpiryUrgency(daysUntil) : null;

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{fileTypeIcons[doc.fileType]}</span>
            <div>
              <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{doc.name}</h3>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="w-full h-48 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-5xl mb-4 overflow-hidden">
          {"fileUrl" in doc && doc.fileUrl ? (
            doc.fileType === "image" ? (
              <img src={doc.fileUrl as string} alt={doc.name} className="w-full h-full object-cover" />
            ) : (
              <a href={doc.fileUrl as string} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-warm-500 hover:text-terracotta-500 transition-colors">
                <span className="text-5xl">{fileTypeIcons[doc.fileType]}</span>
                <span className="text-xs font-medium">Click to open document</span>
              </a>
            )
          ) : (
            fileTypeIcons[doc.fileType]
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-warm-400">File Size</span><span className="text-warm-900 dark:text-warm-50 font-medium">{doc.fileSize}</span></div>
          <div className="flex justify-between text-xs"><span className="text-warm-400">Uploaded</span><span className="text-warm-900 dark:text-warm-50 font-medium">{doc.uploadDate}</span></div>
          {doc.expiryDate && (
            <div className="flex justify-between text-xs">
              <span className="text-warm-400">Expires</span>
              <div className="flex items-center gap-1.5">
                <span className="text-warm-900 dark:text-warm-50 font-medium">{doc.expiryDate}</span>
                {urgency && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${urgency.color}`}>{urgency.label}</span>}
              </div>
            </div>
          )}
          <div className="flex justify-between text-xs"><span className="text-warm-400">Uploaded By</span><span className="text-warm-900 dark:text-warm-50 font-medium">{doc.uploadedBy}</span></div>
          <div className="flex justify-between text-xs"><span className="text-warm-400">Version</span><span className="text-warm-900 dark:text-warm-50 font-medium">v{doc.version}</span></div>
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {doc.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-500">{tag}</span>)}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {"fileUrl" in doc && doc.fileUrl ? (
            <a href={doc.fileUrl as string} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 text-xs font-bold min-h-[40px] flex items-center justify-center hover:bg-forest-100 dark:hover:bg-forest-900/40 transition-colors">
              Download
            </a>
          ) : (
            <button className="flex-1 py-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/20 text-forest-600 text-xs font-bold min-h-[40px] opacity-50 cursor-not-allowed">
              Download
            </button>
          )}
          <button className="flex-1 py-2.5 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 text-xs font-bold min-h-[40px]">Share</button>
          <button className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-bold min-h-[40px]">Delete</button>
        </div>
      </div>
    </div>
  );
}
