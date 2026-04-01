"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocCategory } from "@/data/documentData";
import { useDocumentUpload, type UploadedFile, type OcrResult } from "@/hooks/useDocumentUpload";
import { useBunnyUpload } from "@/hooks/useBunnyUpload";
import { useAuth } from "@/providers/AuthProvider";
import type { Locale } from "@/types";

interface AddDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: DocCategory;
    description: string;
    documentNumber: string;
    issuingAuthority: string;
    issueDate: string;
    expiryDate: string;
    tags: string[];
    linkedTo: string;
    accessLevel: string;
    reminder: boolean;
    reminderDays: number;
    file: File | null;
    fileUrl?: string;
  }) => void;
  locale: Locale;
  isMobile: boolean;
}

type DocTypeOption = {
  key: string;
  label: string;
  labelSw: string;
  icon: string;
  category: DocCategory;
  color: string;
};

const docTypes: DocTypeOption[] = [
  { key: "kra_pin", label: "KRA PIN Certificate", labelSw: "Cheti cha KRA PIN", icon: "🏛️", category: "tax", color: "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20" },
  { key: "business_reg", label: "Business Registration", labelSw: "Usajili wa Biashara", icon: "📋", category: "licenses", color: "border-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  { key: "vat_cert", label: "VAT Certificate", labelSw: "Cheti cha VAT", icon: "📊", category: "tax", color: "border-sunset-500 bg-sunset-50 dark:bg-sunset-900/20" },
  { key: "supplier_contract", label: "Supplier Contract", labelSw: "Mkataba na Mtoa Huduma", icon: "📝", category: "contracts", color: "border-forest-500 bg-forest-50 dark:bg-forest-900/20" },
  { key: "employee_contract", label: "Employee Contract", labelSw: "Mkataba wa Mfanyikazi", icon: "👥", category: "employee", color: "border-savanna-500 bg-savanna-50 dark:bg-savanna-900/20" },
  { key: "receipt", label: "Receipt", labelSw: "Risiti", icon: "🧾", category: "financial", color: "border-warm-500 bg-warm-100 dark:bg-warm-800" },
  { key: "invoice", label: "Invoice", labelSw: "Ankara", icon: "📃", category: "financial", color: "border-warm-500 bg-warm-100 dark:bg-warm-800" },
  { key: "bank_statement", label: "Bank Statement", labelSw: "Taarifa ya Benki", icon: "🏦", category: "financial", color: "border-purple-500 bg-purple-50 dark:bg-purple-900/20" },
  { key: "insurance", label: "Insurance Cover", labelSw: "Bima", icon: "🛡️", category: "insurance", color: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" },
  { key: "lease", label: "Lease Agreement", labelSw: "Mkataba wa Kukodisha", icon: "🏠", category: "lease", color: "border-forest-500 bg-forest-50 dark:bg-forest-900/20" },
  { key: "other", label: "Other", labelSw: "Nyingine", icon: "📄", category: "other", color: "border-warm-400 bg-warm-50 dark:bg-warm-800" },
];

const predefinedTags = ["Financial", "Legal", "Tax", "Employment", "Property", "Supplier", "Insurance", "Compliance"];
const accessLevels = [
  { key: "private", label: "Owner Only", labelSw: "Mmiliki Pekee", icon: "🔒" },
  { key: "manager", label: "Manager View", labelSw: "Msiamamizi", icon: "🔑" },
  { key: "all_staff", label: "All Staff", labelSw: "Wafanyakazi Wote", icon: "👥" },
];
const reminderDaysOptions = [7, 14, 30, 60, 90];
const recentAuthorities = ["KRA", "Nairobi County", "CIC Insurance", "Equity Bank", "Safaricom", "NHIF", "NSSF"];

export default function AddDocumentDialog({ isOpen, onClose, onSave, locale, isMobile }: AddDocumentDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<DocTypeOption | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [linkedTo, setLinkedTo] = useState("");
  const [accessLevel, setAccessLevel] = useState("private");
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [authoritySuggestions, setAuthoritySuggestions] = useState<string[]>([]);
  const [typeSearch, setTypeSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { shopId } = useAuth();
  const { uploadedFile, ocrResult, isProcessing, processFile, simulateOcr, detectCategory, removeFile } = useDocumentUpload();
  const { upload: uploadToBunny } = useBunnyUpload(shopId || undefined);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedType(null);
      setName("");
      setDescription("");
      setDocumentNumber("");
      setIssuingAuthority("");
      setIssueDate("");
      setExpiryDate("");
      setTags([]);
      setLinkedTo("");
      setAccessLevel("private");
      setReminder(true);
      setReminderDays(30);
      setShowSuccess(false);
      setErrors({});
      removeFile();
    }
  }, [isOpen, removeFile]);

  // Auto-detect category from filename
  useEffect(() => {
    if (uploadedFile?.file && !selectedType) {
      const detected = detectCategory(uploadedFile.file.name);
      const matchingType = docTypes.find((dt) => dt.category === detected);
      if (matchingType) setSelectedType(matchingType);
      if (!name) setName(uploadedFile.file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
    }
  }, [uploadedFile, detectCategory, selectedType, name]);

  // Expiry warning
  const expiryWarning = expiryDate
    ? (() => {
        const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
        if (days < 0) return { text: t("Already expired!", "Imeisha tayari!"), color: "text-red-500" };
        if (days <= 30) return { text: t(`Expires in ${days} days`, `Inaisha baada ya siku ${days}`), color: "text-sunset-500" };
        return null;
      })()
    : null;

  // File handling
  const handleFileSelect = useCallback(
    async (file: File) => {
      await processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // Authority autocomplete
  const handleAuthorityInput = useCallback((value: string) => {
    setIssuingAuthority(value);
    if (value.length > 0) {
      setAuthoritySuggestions(recentAuthorities.filter((a) => a.toLowerCase().includes(value.toLowerCase())));
    } else {
      setAuthoritySuggestions([]);
    }
  }, []);

  // Tags
  const toggleTag = useCallback((tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  // Validation
  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!uploadedFile) e.file = t("Please upload a file", "Tafadhali pakia faili");
    if (!selectedType) e.type = t("Select document type", "Chagua aina ya hati");
    if (!name || name.length < 2) e.name = t("Name is required (min 2 chars)", "Jina linahitajika (angalau herufi 2)");
    if (!documentNumber && selectedType && ["kra_pin", "business_reg", "vat_cert"].includes(selectedType.key))
      e.documentNumber = t("Document number required for certificates", "Nambari ya hati inahitajika kwa vyeti");
    if (expiryDate && issueDate && expiryDate < issueDate)
      e.expiryDate = t("Expiry must be after issue date", "Tarehe ya mwisho lazima iwe baada ya tarehe ya kutolewa");
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [uploadedFile, selectedType, name, documentNumber, expiryDate, issueDate, t]);

  const handleNext = () => {
    if (step === 1 && !uploadedFile) {
      setErrors({ file: t("Please upload a file", "Tafadhali pakia faili") });
      return;
    }
    if (step === 2 && !selectedType) {
      setErrors({ type: t("Select document type", "Chagua aina ya hati") });
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let fileUrl = "";
    if (uploadedFile?.file) {
      const folder = selectedType?.category || "documents";
      const result = await uploadToBunny(uploadedFile.file, folder);
      if (result) fileUrl = result.cdnUrl;
    }

    onSave({
      name,
      category: selectedType?.category || "other",
      description,
      documentNumber,
      issuingAuthority,
      issueDate,
      expiryDate,
      tags,
      linkedTo,
      accessLevel,
      reminder,
      reminderDays,
      file: uploadedFile?.file || null,
      fileUrl,
    });
    setShowSuccess(true);
  };

  const filteredDocTypes = docTypes.filter(
    (dt) =>
      !typeSearch ||
      dt.label.toLowerCase().includes(typeSearch.toLowerCase()) ||
      dt.labelSw.toLowerCase().includes(typeSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: "blur(20px)" }}
            onClick={onClose}
          />

          {isMobile ? (
            /* Mobile bottom sheet */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) onClose();
              }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", borderRadius: "28px 28px 0 0", zIndex: 60 }}
              className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full bg-warm-300 dark:bg-warm-600" />
              </div>
              <DialogHeader t={t} step={step} selectedType={selectedType} uploadedFile={uploadedFile} onClose={onClose} />
              <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: "140px" }}>
                <DialogContent
                  step={step} selectedType={selectedType} setSelectedType={setSelectedType}
                  name={name} setName={setName} description={description} setDescription={setDescription}
                  documentNumber={documentNumber} setDocumentNumber={setDocumentNumber}
                  issuingAuthority={issuingAuthority} handleAuthorityInput={handleAuthorityInput}
                  authoritySuggestions={authoritySuggestions} setIssuingAuthority={setIssuingAuthority}
                  issueDate={issueDate} setIssueDate={setIssueDate} expiryDate={expiryDate} setExpiryDate={setExpiryDate}
                  tags={tags} toggleTag={toggleTag} linkedTo={linkedTo} setLinkedTo={setLinkedTo}
                  accessLevel={accessLevel} setAccessLevel={setAccessLevel}
                  reminder={reminder} setReminder={setReminder} reminderDays={reminderDays} setReminderDays={setReminderDays}
                  uploadedFile={uploadedFile} ocrResult={ocrResult} isProcessing={isProcessing}
                  isDragging={isDragging} setIsDragging={setIsDragging}
                  handleDrop={handleDrop} handleFileInput={handleFileInput} fileInputRef={fileInputRef}
                  removeFile={removeFile} simulateOcr={simulateOcr}
                  typeSearch={typeSearch} setTypeSearch={setTypeSearch} filteredDocTypes={filteredDocTypes}
                  expiryWarning={expiryWarning} errors={errors}
                  predefinedTags={predefinedTags} accessLevels={accessLevels} reminderDaysOptions={reminderDaysOptions}
                  t={t} locale={locale} showSuccess={showSuccess}
                />
              </div>
              {!showSuccess && (
                <DialogFooter step={step} setStep={setStep} handleNext={handleNext} handleSubmit={handleSubmit} onClose={onClose} t={t} isMobile />
              )}
            </motion.div>
          ) : (
            /* Desktop/Tablet centered modal */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[24px] shadow-2xl"
                style={{ width: "min(720px, calc(100vw - 32px))", maxHeight: "88vh" }}
              >
                <DialogHeader t={t} step={step} selectedType={selectedType} uploadedFile={uploadedFile} onClose={onClose} />
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <DialogContent
                    step={step} selectedType={selectedType} setSelectedType={setSelectedType}
                    name={name} setName={setName} description={description} setDescription={setDescription}
                    documentNumber={documentNumber} setDocumentNumber={setDocumentNumber}
                    issuingAuthority={issuingAuthority} handleAuthorityInput={handleAuthorityInput}
                    authoritySuggestions={authoritySuggestions} setIssuingAuthority={setIssuingAuthority}
                    issueDate={issueDate} setIssueDate={setIssueDate} expiryDate={expiryDate} setExpiryDate={setExpiryDate}
                    tags={tags} toggleTag={toggleTag} linkedTo={linkedTo} setLinkedTo={setLinkedTo}
                    accessLevel={accessLevel} setAccessLevel={setAccessLevel}
                    reminder={reminder} setReminder={setReminder} reminderDays={reminderDays} setReminderDays={setReminderDays}
                    uploadedFile={uploadedFile} ocrResult={ocrResult} isProcessing={isProcessing}
                    isDragging={isDragging} setIsDragging={setIsDragging}
                    handleDrop={handleDrop} handleFileInput={handleFileInput} fileInputRef={fileInputRef}
                    removeFile={removeFile} simulateOcr={simulateOcr}
                    typeSearch={typeSearch} setTypeSearch={setTypeSearch} filteredDocTypes={filteredDocTypes}
                    expiryWarning={expiryWarning} errors={errors}
                    predefinedTags={predefinedTags} accessLevels={accessLevels} reminderDaysOptions={reminderDaysOptions}
                    t={t} locale={locale} showSuccess={showSuccess}
                  />
                </div>
                {!showSuccess && (
                  <DialogFooter step={step} setStep={setStep} handleNext={handleNext} handleSubmit={handleSubmit} onClose={onClose} t={t} isMobile={false} />
                )}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// HEADER
// ============================================

function DialogHeader({ t, step, selectedType, uploadedFile, onClose }: {
  t: (en: string, sw: string) => string;
  step: number;
  selectedType: DocTypeOption | null;
  uploadedFile: UploadedFile | null;
  onClose: () => void;
}) {
  return (
    <div className="flex-shrink-0 px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">
              {t("Add Document", "Ongeza Hati")}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-warm-400">Step {step} of 4</p>
              {selectedType && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-600">
                  {selectedType.icon} {selectedType.label}
                </span>
              )}
              {uploadedFile?.status === "complete" && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-forest-100 dark:bg-forest-900/30 text-forest-600">
                  ✓ {(uploadedFile.file.size / 1024).toFixed(0)}KB
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? "bg-gradient-to-r from-terracotta-500 to-savanna-500" : "bg-warm-200 dark:bg-warm-700"}`} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// FOOTER
// ============================================

function DialogFooter({ step, setStep, handleNext, handleSubmit, onClose, t, isMobile }: {
  step: number; setStep: (s: number) => void; handleNext: () => void; handleSubmit: () => void;
  onClose: () => void; t: (en: string, sw: string) => string; isMobile: boolean;
}) {
  return (
    <div
      className={`flex-shrink-0 border-t border-warm-200/60 dark:border-warm-700/60 px-5 py-4 flex gap-2 ${isMobile ? "fixed bottom-0 left-0 right-0 bg-white dark:bg-warm-900 z-10 shadow-lg" : ""}`}
      style={isMobile ? { paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" } : undefined}
    >
      {step > 1 && (
        <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[52px] active:scale-[0.98] transition-transform">
          {t("Back", "Rudi")}
        </button>
      )}
      <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[52px] active:scale-[0.98] transition-transform">
        {t("Cancel", "Ghairi")}
      </button>
      {step < 4 ? (
        <button onClick={handleNext} className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[52px] active:scale-[0.98] transition-transform shadow-md shadow-terracotta-500/20">
          {t("Continue", "Endelea")}
        </button>
      ) : (
        <button onClick={handleSubmit} className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-400 text-white font-heading font-bold text-sm min-h-[52px] active:scale-[0.98] transition-transform shadow-md shadow-forest-500/20">
          {t("Save Document", "Hifadhi Hati")}
        </button>
      )}
    </div>
  );
}

// ============================================
// CONTENT
// ============================================

interface ContentProps {
  step: number; selectedType: DocTypeOption | null; setSelectedType: (t: DocTypeOption) => void;
  name: string; setName: (v: string) => void; description: string; setDescription: (v: string) => void;
  documentNumber: string; setDocumentNumber: (v: string) => void;
  issuingAuthority: string; handleAuthorityInput: (v: string) => void;
  authoritySuggestions: string[]; setIssuingAuthority: (v: string) => void;
  issueDate: string; setIssueDate: (v: string) => void; expiryDate: string; setExpiryDate: (v: string) => void;
  tags: string[]; toggleTag: (t: string) => void; linkedTo: string; setLinkedTo: (v: string) => void;
  accessLevel: string; setAccessLevel: (v: string) => void;
  reminder: boolean; setReminder: (v: boolean) => void; reminderDays: number; setReminderDays: (n: number) => void;
  uploadedFile: UploadedFile | null; ocrResult: OcrResult | null; isProcessing: boolean;
  isDragging: boolean; setIsDragging: (v: boolean) => void;
  handleDrop: (e: React.DragEvent) => void; handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>; removeFile: () => void; simulateOcr: () => void;
  typeSearch: string; setTypeSearch: (v: string) => void; filteredDocTypes: DocTypeOption[];
  expiryWarning: { text: string; color: string } | null; errors: Record<string, string>;
  predefinedTags: string[]; accessLevels: { key: string; label: string; labelSw: string; icon: string }[];
  reminderDaysOptions: number[]; t: (en: string, sw: string) => string; locale: Locale; showSuccess: boolean;
}

function DialogContent(p: ContentProps) {
  const {
    step, selectedType, setSelectedType, name, setName, description, setDescription,
    documentNumber, setDocumentNumber, issuingAuthority, handleAuthorityInput,
    authoritySuggestions, setIssuingAuthority, issueDate, setIssueDate, expiryDate, setExpiryDate,
    tags, toggleTag, linkedTo, setLinkedTo, accessLevel, setAccessLevel,
    reminder, setReminder, reminderDays, setReminderDays,
    uploadedFile, ocrResult, isProcessing, isDragging, setIsDragging,
    handleDrop, handleFileInput, fileInputRef, removeFile, simulateOcr,
    typeSearch, setTypeSearch, filteredDocTypes, expiryWarning, errors,
    predefinedTags, accessLevels, reminderDaysOptions, t, locale, showSuccess,
  } = p;

  const glassCard = "rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4";
  const glassStyle = { background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" };

  // SUCCESS VIEW
  if (showSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <p className="font-heading font-bold text-xl text-warm-900 dark:text-warm-50">{t("Document Saved!", "Hati Imehifadhiwa!")}</p>
        <p className="text-sm text-warm-400 mt-1">{name}</p>
        {selectedType && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-600 mt-2">
            {selectedType.icon} {selectedType.label}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      {/* STEP 1: Upload */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Drop zone */}
          <div
            className={`${glassCard} relative cursor-pointer transition-all ${isDragging ? "border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-900/10" : "border-dashed border-warm-300 dark:border-warm-600 hover:border-terracotta-400"}`}
            style={{ ...glassStyle, minHeight: "220px" }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center justify-center h-full py-4">
                {uploadedFile.preview ? (
                  <div className="relative mb-3">
                    <img src={uploadedFile.preview} alt={uploadedFile.file.name || "Document preview"} className="w-32 h-32 object-cover rounded-xl border border-warm-200 dark:border-warm-700" />
                    <button onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate max-w-full px-4">{uploadedFile.file.name}</p>
                <p className="text-xs text-warm-400 mt-0.5">{(uploadedFile.file.size / 1024).toFixed(0)} KB</p>

                {/* Progress bar */}
                {uploadedFile.status === "uploading" && (
                  <div className="w-full max-w-xs mt-3">
                    <div className="h-2 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-terracotta-500 to-savanna-500"
                        initial={{ width: 0 }} animate={{ width: `${uploadedFile.progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-warm-400">{uploadedFile.progress}%</span>
                      <span className="text-[10px] text-warm-400">{uploadedFile.speed}</span>
                    </div>
                  </div>
                )}
                {uploadedFile.status === "complete" && (
                  <span className="text-xs text-forest-600 font-medium mt-2">✓ {t("Upload complete", "Umefanikiwa kupakia")}</span>
                )}
                {uploadedFile.status === "error" && (
                  <span className="text-xs text-red-500 mt-2">{uploadedFile.error}</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <motion.div animate={{ y: isDragging ? -5 : 0 }} className="mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isDragging ? "text-terracotta-500" : "text-warm-400"}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </motion.div>
                <p className="text-sm font-medium text-warm-700 dark:text-warm-300 text-center">
                  {t("Drag Here or Click to Select", "Buruta Hapa au Bonyeza Kuchagua")}
                </p>
                <p className="text-xs text-warm-400 mt-1 text-center">PDF, JPG, PNG, DOC, DOCX, XLS, XLSX - {t("max 10MB", "juu 10MB")}</p>
                {errors.file && <p className="text-xs text-red-500 mt-2">{errors.file}</p>}
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" capture="environment" onChange={handleFileInput} />
          </div>

          {/* Camera button on mobile */}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200 dark:border-warm-700 flex items-center justify-center gap-2 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[52px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t("Take Photo / Scan Document", "Piga Picha / Skani Hati")}
          </button>
        </motion.div>
      )}

      {/* STEP 2: Document Type & Details */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Type search */}
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="search" value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)}
              placeholder={t("Search type...", "Tafuta aina...")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
          </div>

          {/* Document type grid */}
          <div className={glassCard} style={glassStyle}>
            <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-3">{t("Document Type", "Aina ya Hati")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredDocTypes.map((dt) => (
                <button key={dt.key} onClick={() => setSelectedType(dt)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[64px] justify-center ${selectedType?.key === dt.key ? dt.color : "border-transparent bg-warm-50 dark:bg-warm-800/50 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
                  <span className="text-xl">{dt.icon}</span>
                  <span className="text-[10px] font-medium text-warm-700 dark:text-warm-300 leading-tight text-center">
                    {locale === "sw" ? dt.labelSw : dt.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-red-500 mt-2">{errors.type}</p>}
          </div>

          {/* Name */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Document Name", "Jina la Hati")} *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("Enter document name...", "Weka jina la hati...")}
              className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-sm outline-none focus:border-terracotta-500 min-h-[48px] ${errors.name ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Document number */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Document Number / Reference", "Nambari ya Hati")}
              {selectedType && ["kra_pin", "business_reg", "vat_cert"].includes(selectedType.key) && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder={selectedType?.key === "kra_pin" ? "P051234567A" : selectedType?.key === "business_reg" ? "BN-XXXXX" : "Reference number..."}
              className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-sm outline-none focus:border-terracotta-500 min-h-[48px] font-mono ${errors.documentNumber ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`} />
            {errors.documentNumber && <p className="text-xs text-red-500 mt-1">{errors.documentNumber}</p>}
          </div>

          {/* Description */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Description", "Maelezo")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Additional context or notes...", "Maelezo ya ziada...")}
              className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[60px] resize-none" />
          </div>
        </motion.div>
      )}

      {/* STEP 3: Dates, Authority & Associations */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Issuing Authority */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Issuing Authority", "Mamlaka Inayotoa")}</label>
            <input type="text" value={issuingAuthority} onChange={(e) => handleAuthorityInput(e.target.value)}
              placeholder={t("e.g. KRA, Nairobi County...", "k.m. KRA, Kaunti ya Nairobi...")}
              className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px]" />
            {authoritySuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {authoritySuggestions.map((a) => (
                  <button key={a} onClick={() => { setIssuingAuthority(a); }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-warm-100 dark:bg-warm-800 text-warm-600 min-h-[28px]">{a}</button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className={glassCard} style={glassStyle}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-1.5 block">{t("Issue Date", "Tarehe ya Kutolewa")}</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-1.5 block">{t("Expiry Date", "Tarehe ya Mwisho")}</label>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-sm outline-none focus:border-terracotta-500 min-h-[44px] ${errors.expiryDate ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`} />
              </div>
            </div>
            {expiryWarning && <p className={`text-xs mt-2 ${expiryWarning.color}`}>⚠️ {expiryWarning.text}</p>}
            {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>}
          </div>

          {/* Tags */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Tags", "Lebo")}</label>
            <div className="flex flex-wrap gap-1.5">
              {predefinedTags.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px] transition-all ${tags.includes(tag) ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Access level */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Access Level", "Kiwango cha Ufikiaji")}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {accessLevels.map((al) => (
                <button key={al.key} onClick={() => setAccessLevel(al.key)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all min-h-[56px] justify-center ${accessLevel === al.key ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20" : "border-transparent bg-warm-50 dark:bg-warm-800/50"}`}>
                  <span className="text-lg">{al.icon}</span>
                  <span className="text-[9px] font-medium text-warm-600 dark:text-warm-300">{locale === "sw" ? al.labelSw : al.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Related entity */}
          <div className={glassCard} style={glassStyle}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">{t("Link to (optional)", "Unganisha na (si lazima)")}</label>
            <input type="text" value={linkedTo} onChange={(e) => setLinkedTo(e.target.value)}
              placeholder={t("Supplier, employee, or transaction...", "Mtoa huduma, mfanyakazi, au muamala...")}
              className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px]" />
          </div>

          {/* Reminder */}
          <div className={glassCard} style={glassStyle}>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <div className={`w-10 h-6 rounded-full transition-colors ${reminder ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"} relative`}
                onClick={() => setReminder(!reminder)}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${reminder ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-warm-700 dark:text-warm-300">{t("Expiry Reminder", "Kumbusho la Mwisho")}</span>
            </label>
            {reminder && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-warm-500">{t("Remind", "Kumbusha")}</span>
                <div className="flex gap-1">
                  {reminderDaysOptions.map((d) => (
                    <button key={d} onClick={() => setReminderDays(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium min-h-[32px] ${reminderDays === d ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500"}`}>
                      {d}d
                    </button>
                  ))}
                </div>
                <span className="text-xs text-warm-500">{t("before expiry", "kabla ya mwisho")}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* STEP 4: OCR & Review */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* OCR extraction */}
          <div className={glassCard} style={glassStyle}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider">{t("Data Extraction", "Utoaji wa Data")}</p>
              {!ocrResult && !isProcessing && uploadedFile?.preview && (
                <button onClick={simulateOcr} className="px-3 py-1.5 rounded-lg bg-forest-100 dark:bg-forest-900/30 text-forest-600 text-xs font-medium min-h-[32px]">
                  {t("Extract Text", "Toa Maandishi")}
                </button>
              )}
            </div>

            {isProcessing && (
              <div className="flex flex-col items-center py-6">
                <div className="w-10 h-10 rounded-full border-3 border-terracotta-500 border-t-transparent animate-spin mb-3" style={{ borderWidth: "3px" }} />
                <p className="text-sm text-warm-500">{t("Extracting text...", "Inatoa maandishi...")}</p>
              </div>
            )}

            {ocrResult && !isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-warm-500">{t("Confidence", "Uhakika")}:</span>
                  <div className="flex-1 h-2 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                    <div className={`h-full rounded-full ${ocrResult.confidence > 80 ? "bg-forest-500" : ocrResult.confidence > 60 ? "bg-savanna-500" : "bg-red-500"}`}
                      style={{ width: `${ocrResult.confidence}%` }} />
                  </div>
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-50">{ocrResult.confidence}%</span>
                </div>
                {Object.entries(ocrResult.fields).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-warm-100 dark:border-warm-800 last:border-0">
                    <span className="text-xs text-warm-400">{key}</span>
                    <span className="text-sm font-medium text-warm-900 dark:text-warm-50">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {!ocrResult && !isProcessing && !uploadedFile?.preview && (
              <p className="text-xs text-warm-400 text-center py-4">{t("OCR available for image uploads", "OCR inapatikana kwa picha tu")}</p>
            )}
          </div>

          {/* Summary card */}
          <div className={glassCard} style={glassStyle}>
            <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-3">{t("Summary", "Muhtasari")}</p>
            <div className="space-y-2">
              {[
                { label: t("File", "Faili"), value: uploadedFile?.file.name || "N/A" },
                { label: t("Type", "Aina"), value: selectedType ? `${selectedType.icon} ${selectedType.label}` : "N/A" },
                { label: t("Name", "Jina"), value: name || "N/A" },
                { label: t("Number", "Nambari"), value: documentNumber || "N/A" },
                { label: t("Authority", "Mamlaka"), value: issuingAuthority || "N/A" },
                { label: t("Issue", "Imetolewa"), value: issueDate || "N/A" },
                { label: t("Expiry", "Mwisho"), value: expiryDate || t("None", "Hakuna") },
                { label: t("Tags", "Lebo"), value: tags.length > 0 ? tags.join(", ") : t("None", "Hakuna") },
                { label: t("Access", "Ufikiaji"), value: accessLevels.find((a) => a.key === accessLevel)?.label || "N/A" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-warm-400">{row.label}</span>
                  <span className="text-xs font-medium text-warm-900 dark:text-warm-50 truncate max-w-[200px]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verify checkbox */}
          <label className="flex items-center gap-3 cursor-pointer min-h-[48px] px-2">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-forest-500" />
            <span className="text-sm text-warm-700 dark:text-warm-300">{t("I confirm the information is accurate", "Ninathibitisha taarifa ni sahihi")}</span>
          </label>
        </motion.div>
      )}
    </div>
  );
}
