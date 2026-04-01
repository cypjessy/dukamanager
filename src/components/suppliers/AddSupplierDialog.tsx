"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Locale } from "@/types";
import type { SupplierFormValues } from "@/lib/supplierValidations";
import {
  SUPPLIER_TYPES, PRODUCT_CATEGORIES, CONTACT_ROLES,
  DELIVERY_TERMS, PAYMENT_TERMS_OPTIONS, KENYAN_COUNTIES,
} from "@/lib/supplierValidations";
import { suppliers } from "@/data/supplierData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface AddSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: SupplierFormValues) => void;
}

const DEFAULTS: SupplierFormValues = {
  name: "", supplierType: "wholesaler", categoriesSupplied: [], regNumber: "", kraPin: "",
  contactPerson: "", contactRole: "owner", phone: "", phoneAlt: "", mpesaNumber: "",
  email: "", address: "", county: "", deliveryTerms: "next_day", paymentTerms: "cod",
  minOrderAmount: 0, notes: "",
};

const t = (locale: Locale, en: string, sw: string) => locale === "sw" ? sw : en;

export default function AddSupplierDialog({ isOpen, onClose, locale, onSave }: AddSupplierDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<SupplierFormValues>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null!);
  const screen = useResponsiveDialog();
  const { isMobile, isTablet } = screen;

  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);

  const updateField = useCallback(<K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

    if (key === "name" && typeof value === "string" && value.length > 2) {
      const existing = suppliers.find((s) => s.name.toLowerCase().includes(value.toLowerCase()));
      setDuplicateWarning(existing ? existing.name : null);
    } else if (key === "name") {
      setDuplicateWarning(null);
    }
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setData((prev) => ({
      ...prev,
      categoriesSupplied: prev.categoriesSupplied.includes(cat)
        ? prev.categoriesSupplied.filter((c) => c !== cat)
        : [...prev.categoriesSupplied, cat],
    }));
    setErrors((prev) => { const next = { ...prev }; delete next.categoriesSupplied; return next; });
  }, []);

  const validateStep = useCallback((s: 1 | 2): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!data.name.trim() || data.name.length < 2) errs.name = locale === "sw" ? "Jina linahitajika" : "Name is required";
      if (data.categoriesSupplied.length === 0) errs.categoriesSupplied = locale === "sw" ? "Chagua angalau aina moja" : "Select at least one category";
      if (data.kraPin && !/^[A-Z][0-9]{9}[A-Z]$/.test(data.kraPin)) errs.kraPin = locale === "sw" ? "KRA PIN si sahihi" : "Invalid KRA PIN format";
    }
    if (s === 2) {
      if (!data.contactPerson.trim() || data.contactPerson.length < 2) errs.contactPerson = locale === "sw" ? "Jina la mtu linahitajika" : "Contact name required";
      if (!/^(?:\+254|254|0)([7][0-9]{8})$/.test(data.phone)) errs.phone = locale === "sw" ? "Namba ya simu si sahihi" : "Enter valid Kenyan phone";
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) setCompletedSteps((prev) => new Set(prev).add(s));
    return Object.keys(errs).length === 0;
  }, [data, locale]);

  const handleNext = useCallback(() => {
    if (validateStep(1)) {
      setStep(2);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setStep(1);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    onSave(data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setData(DEFAULTS);
      setStep(1);
      setCompletedSteps(new Set());
      setDuplicateWarning(null);
      onClose();
    }, 1500);
  }, [data, validateStep, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => { setData(DEFAULTS); setStep(1); setErrors({}); setCompletedSteps(new Set()); setDuplicateWarning(null); }, 300);
    }
  }, [isSubmitting, onClose]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (isOpen && isMobile) setTimeout(() => firstInputRef.current?.focus(), 400);
    else if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 200);
  }, [isOpen, isMobile, step]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const deliveryDays = data.deliveryTerms === "same_day" ? 0 : data.deliveryTerms === "next_day" ? 1 : data.deliveryTerms === "2_3_days" ? 3 : 7;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-50"
            style={{ backgroundColor: isMobile ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)", backdropFilter: isMobile ? "blur(2px)" : "blur(8px)", WebkitBackdropFilter: isMobile ? "blur(2px)" : "blur(8px)" }}
            onClick={handleClose} />

          {isMobile ? (
            <motion.div key="supplier-dialog-mobile"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", maxHeight: "100dvh", borderRadius: "24px 24px 0 0", y: dragY, opacity: dragOpacity }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
              role="dialog" aria-modal="true" aria-label={t(locale, "Add New Supplier", "Ongeza Mtoa Huduma Mpya")}>
              <SupplierDialogContent isMobile={true} step={step} locale={locale} data={data} errors={errors}
                duplicateWarning={duplicateWarning} isSubmitting={isSubmitting} submitSuccess={submitSuccess}
                completedSteps={completedSteps} contentRef={contentRef} firstInputRef={firstInputRef}
                deliveryDays={deliveryDays} onStepChange={setStep}
                updateField={updateField} toggleCategory={toggleCategory}
                handleClose={handleClose} handleBack={handleBack} handleNext={handleNext} handleSubmit={handleSubmit} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={handleClose}>
              <motion.div key="supplier-dialog-desktop"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: isTablet ? "min(600px, calc(100vw - 32px))" : "min(720px, calc(100vw - 48px))", maxHeight: "90vh" }}
                role="dialog" aria-modal="true" aria-label={t(locale, "Add New Supplier", "Ongeza Mtoa Huduma Mpya")}>
                <SupplierDialogContent isMobile={false} step={step} locale={locale} data={data} errors={errors}
                  duplicateWarning={duplicateWarning} isSubmitting={isSubmitting} submitSuccess={submitSuccess}
                  completedSteps={completedSteps} contentRef={contentRef} firstInputRef={firstInputRef}
                  deliveryDays={deliveryDays} onStepChange={setStep}
                  updateField={updateField} toggleCategory={toggleCategory}
                  handleClose={handleClose} handleBack={handleBack} handleNext={handleNext} handleSubmit={handleSubmit} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   DIALOG CONTENT
   ============================================ */

interface ContentProps {
  isMobile: boolean;
  step: 1 | 2;
  locale: Locale;
  data: SupplierFormValues;
  errors: Record<string, string>;
  duplicateWarning: string | null;
  isSubmitting: boolean;
  submitSuccess: boolean;
  completedSteps: Set<number>;
  contentRef: React.RefObject<HTMLDivElement>;
  firstInputRef: React.RefObject<HTMLInputElement>;
  deliveryDays: number;
  onStepChange: (s: 1 | 2) => void;
  updateField: <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => void;
  toggleCategory: (cat: string) => void;
  handleClose: () => void;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: () => void;
}

function SupplierDialogContent({
  isMobile, step, locale, data, errors, duplicateWarning, isSubmitting, submitSuccess,
  completedSteps, contentRef, firstInputRef, deliveryDays, onStepChange,
  updateField, toggleCategory, handleClose, handleBack, handleNext, handleSubmit,
}: ContentProps) {
  const t_ = (en: string, sw: string) => locale === "sw" ? sw : en;

  return (
    <>
      {isMobile && (
        <div className="flex-shrink-0 flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-manipulation select-none">
          <div className="w-10 h-1.5 rounded-full bg-warm-300 dark:bg-warm-600" />
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center rounded-inherit">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4">
              <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}>
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
            <p className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{t_("Supplier Added!", "Mtoa Huduma Ameongezwa!")}</p>
            <div className="mt-4 px-6 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200/60 dark:border-warm-700/60">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{data.name}</p>
              <p className="text-xs text-warm-500">{data.contactPerson} &middot; {data.phone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 border-b border-warm-100 dark:border-warm-800"
        style={isMobile ? { padding: "8px 16px 12px", paddingTop: "max(8px, env(safe-area-inset-top, 8px))" } : { padding: "20px 20px 16px" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center text-forest-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            </div>
            <h2 className={`font-heading font-bold text-warm-900 dark:text-warm-50 ${isMobile ? "text-base" : "text-lg"}`}>
              {t_("Add New Supplier", "Ongeza Mtoa Huduma Mpya")}
            </h2>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className={`w-10 h-10 flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 active:scale-95 transition-all ${isMobile ? "rounded-full" : "rounded-lg"}`}
            aria-label={t_("Close", "Funga")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {([1, 2] as const).map((s) => {
            const isActive = s === step;
            const isDone = completedSteps.has(s);
            return (
              <div key={s} className="flex items-center flex-1">
                <button onClick={() => { if (isDone || s < step) onStepChange(s); }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                    isActive ? "bg-terracotta-500 text-white shadow-md shadow-terracotta-500/25" :
                    isDone ? "bg-forest-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-400"
                  }`}>
                  {isDone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : s}
                </button>
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${isDone ? "bg-forest-500" : "bg-warm-100 dark:bg-warm-800"}`} />
              </div>
            );
          })}
        </div>
        <p className={`text-warm-500 dark:text-warm-400 mt-2 ${isMobile ? "text-[11px]" : "text-xs"}`}>
          {step === 1 ? t_("Business Information", "Taarifa za Biashara") : t_("Contact & Terms", "Mawasiliano & Masharti")}
        </p>
      </div>

      {/* Scrollable Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain"
        style={isMobile ? { WebkitOverflowScrolling: "touch", paddingBottom: "120px" } : { scrollbarWidth: "thin", scrollbarColor: "rgba(199,91,57,0.2) transparent" }}>
        <div style={{ padding: isMobile ? "16px" : "20px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, x: 20 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 0, y: -10 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-5">

              {step === 1 && (
                <BusinessInfoStep data={data} errors={errors} locale={locale} duplicateWarning={duplicateWarning}
                  firstInputRef={firstInputRef} updateField={updateField} toggleCategory={toggleCategory} />
              )}
              {step === 2 && (
                <ContactTermsStep data={data} errors={errors} locale={locale} deliveryDays={deliveryDays}
                  updateField={updateField} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 ${isMobile ? "" : "px-5 py-4"}`}
        style={isMobile ? { padding: "12px 16px", paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" } : undefined}>
        {isMobile ? (
          <div className="flex gap-2">
            {step > 1 ? (
              <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
                iconLeft={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}
                className="flex-shrink-0 justify-center !w-[56px] !min-w-[56px]">{null}</Button>
            ) : (
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}
                className="flex-shrink-0 justify-center !w-[56px] !min-w-[56px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </Button>
            )}
            {step < 2 ? (
              <Button variant="primary" size="md" onClick={handleNext}
                iconRight={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
                className="flex-1 min-w-0">{t_("Continue", "Endelea")}</Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
                iconLeft={!isSubmitting ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}
                className="flex-1 min-w-0">{isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Supplier", "Hifadhi Mtoa Huduma")}</Button>
            )}
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            {step > 1 ? (
              <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
                iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}>
                {t_("Back", "Rudi")}
              </Button>
            ) : (
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}>{t_("Cancel", "Ghairi")}</Button>
            )}
            {step < 2 ? (
              <Button variant="primary" size="md" onClick={handleNext}
                iconRight={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}>
                {t_("Continue", "Endelea")}
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
                iconLeft={!isSubmitting ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}>
                {isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Supplier", "Hifadhi")}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
   STEP 1: BUSINESS INFORMATION
   ============================================ */

function BusinessInfoStep({
  data, errors, locale, duplicateWarning, firstInputRef, updateField, toggleCategory,
}: {
  data: SupplierFormValues;
  errors: Record<string, string>;
  locale: Locale;
  duplicateWarning: string | null;
  firstInputRef: React.RefObject<HTMLInputElement>;
  updateField: <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => void;
  toggleCategory: (cat: string) => void;
}) {
  const t_ = (en: string, sw: string) => locale === "sw" ? sw : en;

  return (
    <>
      {/* Business Name */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
          {t_("Business Name", "Jina la Biashara")} <span className="text-red-500">*</span>
        </label>
        <input ref={firstInputRef} type="text" value={data.name} onChange={(e) => updateField("name", e.target.value)}
          placeholder={t_("e.g. Bidco Africa Ltd", "mf. Bidco Africa Ltd")}
          className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 transition-colors ${
            errors.name ? "border-red-400" : "border-warm-200 dark:border-warm-700"
          }`} style={{ fontSize: "16px", minHeight: "48px" }} />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        <AnimatePresence>
          {duplicateWarning && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sunset-50 dark:bg-sunset-900/15 border border-sunset-200/60 dark:border-sunset-700/30 mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p className="text-xs text-sunset-700 dark:text-sunset-400">{t_("Similar:", "Karibu:")} <strong>{duplicateWarning}</strong></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supplier Type */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">
          {t_("Supplier Type", "Aina ya Mtoa Huduma")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUPPLIER_TYPES.map((st) => (
            <button key={st.value} onClick={() => updateField("supplierType", st.value as SupplierFormValues["supplierType"])}
              className={`py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] ${
                data.supplierType === st.value
                  ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600"
                  : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
              }`}>
              {locale === "sw" ? st.labelSw : st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Categories */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">
          {t_("Categories Supplied", "Aina za Bidhaa")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = data.categoriesSupplied.includes(cat.value);
            return (
              <button key={cat.value} onClick={() => toggleCategory(cat.value)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all min-h-[56px] ${
                  isSelected
                    ? "border-forest-400 bg-forest-50 dark:bg-forest-900/15 text-forest-600"
                    : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                }`}>
                <span className="text-lg">{categoryEmoji(cat.value)}</span>
                <span className="text-[10px] font-medium leading-tight text-center">{locale === "sw" ? cat.labelSw : cat.label}</span>
              </button>
            );
          })}
        </div>
        {errors.categoriesSupplied && <p className="text-xs text-red-500 mt-1">{errors.categoriesSupplied}</p>}
      </div>

      {/* Reg Number & KRA PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t_("Registration No.", "Nambari ya Usajili")}
          </label>
          <input type="text" value={data.regNumber || ""} onChange={(e) => updateField("regNumber", e.target.value)}
            placeholder={t_("Optional", "Si lazima")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t_("KRA PIN", "KRA PIN")}
          </label>
          <input type="text" value={data.kraPin || ""} onChange={(e) => updateField("kraPin", e.target.value.toUpperCase())}
            placeholder="P051234567A" maxLength={11}
            className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 font-mono ${
              errors.kraPin ? "border-red-400" : "border-warm-200 dark:border-warm-700"
            }`} style={{ fontSize: "16px", minHeight: "48px" }} />
          {errors.kraPin && <p className="text-xs text-red-500 mt-1">{errors.kraPin}</p>}
        </div>
      </div>
    </>
  );
}

/* ============================================
   STEP 2: CONTACT & TERMS
   ============================================ */

function ContactTermsStep({
  data, errors, locale, deliveryDays, updateField,
}: {
  data: SupplierFormValues;
  errors: Record<string, string>;
  locale: Locale;
  deliveryDays: number;
  updateField: <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => void;
}) {
  const t_ = (en: string, sw: string) => locale === "sw" ? sw : en;

  return (
    <>
      {/* Contact Person & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t_("Contact Person", "Mtu wa Mawasiliano")} <span className="text-red-500">*</span>
          </label>
          <input type="text" value={data.contactPerson} onChange={(e) => updateField("contactPerson", e.target.value)}
            placeholder={t_("Full name", "Jina kamili")}
            className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 ${
              errors.contactPerson ? "border-red-400" : "border-warm-200 dark:border-warm-700"
            }`} style={{ fontSize: "16px", minHeight: "48px" }} />
          {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Role", "Nafasi")}</label>
          <select value={data.contactRole} onChange={(e) => updateField("contactRole", e.target.value as SupplierFormValues["contactRole"])}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
            style={{ fontSize: "16px", minHeight: "48px" }}>
            {CONTACT_ROLES.map((r) => <option key={r.value} value={r.value}>{locale === "sw" ? r.labelSw : r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Phone & Alt Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
            {t_("Phone Number", "Namba ya Simu")} <span className="text-red-500">*</span>
          </label>
          <input type="tel" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="07XX XXX XXX"
            className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 ${
              errors.phone ? "border-red-400" : "border-warm-200 dark:border-warm-700"
            }`} style={{ fontSize: "16px", minHeight: "48px" }} />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Alt Phone", "Simu ya Pili")}</label>
          <input type="tel" value={data.phoneAlt || ""} onChange={(e) => updateField("phoneAlt", e.target.value)}
            placeholder={t_("Optional", "Si lazima")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
      </div>

      {/* M-Pesa & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("M-Pesa Paybill/Till", "M-Pesa Paybill/Till")}</label>
          <input type="text" value={data.mpesaNumber || ""} onChange={(e) => updateField("mpesaNumber", e.target.value)}
            placeholder={t_("Paybill or Till", "Paybill au Till")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 font-mono"
            style={{ fontSize: "16px", minHeight: "48px" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Email", "Barua Pepe")}</label>
          <input type="email" value={data.email || ""} onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@example.com"
            className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 ${
              errors.email ? "border-red-400" : "border-warm-200 dark:border-warm-700"
            }`} style={{ fontSize: "16px", minHeight: "48px" }} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Address & County */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Address", "Anwani")}</label>
          <textarea value={data.address || ""} onChange={(e) => updateField("address", e.target.value)} rows={2}
            placeholder={t_("Physical address...", "Anwani ya mahali...")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
            style={{ fontSize: "16px", minHeight: "72px" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("County", "Kaunti")}</label>
          <select value={data.county || ""} onChange={(e) => updateField("county", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
            style={{ fontSize: "16px", minHeight: "48px" }}>
            <option value="">{t_("-- Select County --", "-- Chagua Kaunti --")}</option>
            {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Delivery Terms */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">{t_("Delivery Terms", "Masharti ya Uwasilishaji")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DELIVERY_TERMS.map((dt) => (
            <button key={dt.value} onClick={() => updateField("deliveryTerms", dt.value as SupplierFormValues["deliveryTerms"])}
              className={`py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] ${
                data.deliveryTerms === dt.value
                  ? "border-forest-400 bg-forest-50 dark:bg-forest-900/15 text-forest-600"
                  : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
              }`}>
              {locale === "sw" ? dt.labelSw : dt.label}
            </button>
          ))}
        </div>
        {deliveryDays > 0 && (
          <p className="text-[11px] text-warm-400 mt-1.5 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {t_("Expected delivery in ~", "Uwasilishaji ~")}{deliveryDays} {t_("days", "siku")}
          </p>
        )}
      </div>

      {/* Payment Terms */}
      <div>
        <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">{t_("Payment Terms", "Masharti ya Malipo")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PAYMENT_TERMS_OPTIONS.map((pt) => (
            <button key={pt.value} onClick={() => updateField("paymentTerms", pt.value as SupplierFormValues["paymentTerms"])}
              className={`py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] ${
                data.paymentTerms === pt.value
                  ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600"
                  : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
              }`}>
              {locale === "sw" ? pt.labelSw : pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Order & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Min Order Amount", "Kiasi cha Chini cha Oda")}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
            <input type="number" value={data.minOrderAmount || ""} onChange={(e) => updateField("minOrderAmount", Number(e.target.value))}
              placeholder="0" min={0}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 tabular-nums"
              style={{ fontSize: "16px", minHeight: "48px" }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Notes", "Maelezo")}</label>
          <textarea value={data.notes || ""} onChange={(e) => updateField("notes", e.target.value)} rows={2}
            placeholder={t_("Special arrangements...", "Mpangalio maalum...")}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
            style={{ fontSize: "16px", minHeight: "72px" }} />
        </div>
      </div>
    </>
  );
}

/* ============================================
   HELPERS
   ============================================ */

function categoryEmoji(key: string): string {
  const map: Record<string, string> = {
    cereals: "\uD83C\uDF3E", cooking_oil: "\uD83E\uDDC2", soap: "\uD83E\uDDFC",
    beverages: "\uD83E\uDDCB", snacks: "\uD83C\uDF6A", household: "\uD83C\uDFE0",
    farming: "\uD83C\uDF31", emergency: "\uD83E\uDE7A",
  };
  return map[key] || "\uD83D\uDCE6";
}
