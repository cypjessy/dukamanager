"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Locale } from "@/types";
import type { NewProductFormData, WizardStep } from "@/lib/addInventorySchema";
import { STEP_LABELS } from "@/lib/addInventorySchema";
import type { Product } from "@/data/inventoryData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";
import ProductDetailsStep from "./wizard/ProductDetailsStep";
import PricingStep from "./wizard/PricingStep";
import StockInfoStep from "./wizard/StockInfoStep";
import ReviewStep from "./wizard/ReviewStep";

interface AddInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: NewProductFormData) => void;
  initialData?: Product | null;
}

const DEFAULTS: NewProductFormData = {
  name: "", nameSw: "", category: "", unit: "", customUnit: "", sku: "",
  buyingPrice: 0, sellingPrice: 0, wholesalePrice: 0, wholesaleMinQty: 0,
  quantity: 0, reorderPoint: 0, warehouse: "", expiryDate: "", supplierId: "",
  description: "", newSupplierName: "", newSupplierPhone: "", newSupplierPaybill: "",
  confirmed: false, imageFile: undefined, imageUrl: "",
};

const t = (locale: Locale, en: string, sw: string) => locale === "sw" ? sw : en;

export default function AddInventoryDialog({ isOpen, onClose, locale, onSave, initialData }: AddInventoryDialogProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<NewProductFormData>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null!);
  const screen = useResponsiveDialog();

  const isEditMode = !!initialData;

  // Populate form with initial data for edit mode
  useEffect(() => {
    if (isOpen && initialData) {
      setData({
        name: initialData.name,
        nameSw: initialData.nameSw || "",
        category: initialData.category,
        unit: initialData.unit,
        customUnit: initialData.unitLabel.en,
        sku: initialData.sku,
        buyingPrice: initialData.buyingPrice,
        sellingPrice: initialData.sellingPrice,
        wholesalePrice: initialData.wholesalePrice,
        wholesaleMinQty: 0,
        quantity: initialData.quantity,
        reorderPoint: initialData.reorderPoint,
        warehouse: initialData.warehouse,
        expiryDate: "",
        supplierId: initialData.supplierId,
        description: initialData.description,
        newSupplierName: "",
        newSupplierPhone: "",
        newSupplierPaybill: "",
        confirmed: false,
      });
      setCompletedSteps(new Set([1, 2, 3] as WizardStep[]));
    } else if (isOpen && !initialData) {
      setData(DEFAULTS);
      setCompletedSteps(new Set());
    }
    if (isOpen) setStep(1);
  }, [isOpen, initialData]);

  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);

  const { isMobile, isTablet } = screen;

  const updateField = useCallback(<K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const validateStep = useCallback((s: WizardStep): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!data.name.trim()) errs.name = locale === "sw" ? "Jina linahitajika" : "Name is required";
      if (!data.category) errs.category = locale === "sw" ? "Chagua aina" : "Select category";
      if (!data.unit) errs.unit = locale === "sw" ? "Chagua kipimo" : "Select unit";
      if (data.unit === "other" && !data.customUnit?.trim()) errs.customUnit = locale === "sw" ? "Weka kipimo" : "Enter custom unit";
    }
    if (s === 2) {
      if (data.buyingPrice <= 0) errs.buyingPrice = locale === "sw" ? "Weka bei" : "Enter price";
      if (data.sellingPrice <= 0) errs.sellingPrice = locale === "sw" ? "Weka bei" : "Enter price";
      if (data.sellingPrice < data.buyingPrice) errs.sellingPrice = locale === "sw" ? "Bei ya kuuza ni ndogo" : "Selling price too low";
    }
    if (s === 3) {
      if (data.quantity < 0) errs.quantity = locale === "sw" ? "Idadi si sahihi" : "Invalid quantity";
      if (data.reorderPoint < 0) errs.reorderPoint = locale === "sw" ? "Si sahihi" : "Invalid";
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) setCompletedSteps((prev) => new Set(prev).add(s));
    return Object.keys(errs).length === 0;
  }, [data, locale]);

  const handleNext = useCallback(() => {
    if (validateStep(step) && step < 4) {
      setStep((step + 1) as WizardStep);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!data.confirmed) {
      setErrors({ confirmed: locale === "sw" ? "Thibitisha taarifa" : "Confirm the information" });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSave(data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setData(DEFAULTS);
      setStep(1);
      setCompletedSteps(new Set());
      onClose();
    }, 1500);
  }, [data, locale, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => {
        setData(DEFAULTS);
        setStep(1);
        setCompletedSteps(new Set());
        setErrors({});
      }, 300);
    }
  }, [isSubmitting, onClose]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
  }, [handleClose]);

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: isMobile ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)",
              backdropFilter: isMobile ? "blur(2px)" : "blur(6px)",
              WebkitBackdropFilter: isMobile ? "blur(2px)" : "blur(6px)",
            }}
            onClick={handleClose}
          />

          {isMobile ? (
            /* =========================================
               MOBILE: Bottom Sheet (framer-motion handles everything)
               ========================================= */
            <motion.div
              key="dialog-mobile"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                height: "100dvh",
                maxHeight: "100dvh",
                borderRadius: "24px 24px 0 0",
                y: dragY,
                opacity: dragOpacity,
              }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t(locale, "Add Product", "Ongeza Bidhaa")}
            >
              <DialogHeader
                isMobile={true}
                step={step}
                setStep={setStep}
                completedSteps={completedSteps}
                isSubmitting={isSubmitting}
                handleClose={handleClose}
                locale={locale}
                isEditMode={isEditMode}
              />
              <DialogContent
                isMobile={true}
                step={step}
                data={data}
                errors={errors}
                locale={locale}
                updateField={updateField}
                setStep={setStep}
                contentRef={contentRef}
              />
              <DialogFooter
                isMobile={true}
                step={step}
                isSubmitting={isSubmitting}
                handleBack={handleBack}
                handleNext={handleNext}
                handleSubmit={handleSubmit}
                handleClose={handleClose}
                locale={locale}
              />

              {/* Success Overlay */}
              <SuccessOverlay submitSuccess={submitSuccess} locale={locale} isEditMode={isEditMode} />
            </motion.div>
          ) : (
            /* =========================================
               TABLET/DESKTOP: Static centering wrapper + animated inner panel
               ========================================= */
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
              onClick={handleClose}
            >
              <motion.div
                key="dialog-desktop"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-2xl shadow-2xl ${
                  isTablet
                    ? "w-full max-w-[600px] max-h-[90vh]"
                    : "w-full max-w-[720px] max-h-[90vh]"
                }`}
                style={{
                  width: isTablet ? "min(600px, calc(100vw - 32px))" : "min(720px, calc(100vw - 48px))",
                }}
                role="dialog"
                aria-modal="true"
                aria-label={t(locale, "Add Product", "Ongeza Bidhaa")}
              >
                <DialogHeader
                  isMobile={false}
                  step={step}
                  setStep={setStep}
                  completedSteps={completedSteps}
                  isSubmitting={isSubmitting}
                  handleClose={handleClose}
                  locale={locale}
                  isEditMode={isEditMode}
                />
                <DialogContent
                  isMobile={false}
                  step={step}
                  data={data}
                  errors={errors}
                  locale={locale}
                  updateField={updateField}
                  setStep={setStep}
                  contentRef={contentRef}
                />
                <DialogFooter
                  isMobile={false}
                  step={step}
                  isSubmitting={isSubmitting}
                  handleBack={handleBack}
                  handleNext={handleNext}
                  handleSubmit={handleSubmit}
                  handleClose={handleClose}
                  locale={locale}
                />

                {/* Success Overlay */}
                <SuccessOverlay submitSuccess={submitSuccess} locale={locale} isEditMode={isEditMode} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   DIALOG HEADER
   ============================================ */

function DialogHeader({
  isMobile,
  step,
  setStep,
  completedSteps,
  isSubmitting,
  handleClose,
  locale,
  isEditMode,
}: {
  isMobile: boolean;
  step: WizardStep;
  setStep: (s: WizardStep) => void;
  completedSteps: Set<WizardStep>;
  isSubmitting: boolean;
  handleClose: () => void;
  locale: Locale;
  isEditMode?: boolean;
}) {
  return (
    <div
      className="flex-shrink-0 border-b border-warm-100 dark:border-warm-800"
      style={{
        ...(isMobile
          ? { padding: "8px 16px 8px", paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }
          : { padding: "20px 20px 12px" }
        ),
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: isMobile ? "8px" : "12px" }}>
        <h2 className={`font-heading font-bold text-warm-900 dark:text-warm-50 ${
          isMobile ? "text-base" : "text-lg"
        }`}>
          {isEditMode
            ? t(locale, "Edit Product", "Sasisha Bidhaa")
            : t(locale, "Add New Product", "Ongeza Bidhaa Mpya")
          }
        </h2>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`w-10 h-10 flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 active:scale-95 transition-all ${
            isMobile ? "rounded-full" : "rounded-lg"
          }`}
          aria-label={t(locale, "Close", "Funga")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Step Indicators */}
      {isMobile ? (
        <MobileStepDots step={step} completedSteps={completedSteps} setStep={setStep} />
      ) : (
        <DesktopStepLines step={step} completedSteps={completedSteps} setStep={setStep} />
      )}
      <p className={`text-warm-500 dark:text-warm-400 text-center ${
        isMobile ? "text-[11px] mt-1.5" : "text-xs mt-2"
      }`}>
        {locale === "sw" ? STEP_LABELS[step].labelSw : STEP_LABELS[step].label}
      </p>
    </div>
  );
}

/* ============================================
   DIALOG CONTENT (Scrollable)
   ============================================ */

function DialogContent({
  isMobile,
  step,
  data,
  errors,
  locale,
  updateField,
  setStep,
  contentRef,
}: {
  isMobile: boolean;
  step: WizardStep;
  data: NewProductFormData;
  errors: Record<string, string>;
  locale: Locale;
  updateField: <K extends keyof NewProductFormData>(key: K, value: NewProductFormData[K]) => void;
  setStep: (s: WizardStep) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={contentRef}
      className="flex-1 overflow-y-auto overscroll-contain"
      style={{
        ...(isMobile
          ? { WebkitOverflowScrolling: "touch", paddingBottom: "140px" }
          : { scrollbarWidth: "thin", scrollbarColor: "rgba(199,91,57,0.3) transparent" }
        ),
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, x: 20 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
          exit={isMobile ? { opacity: 0, y: -10 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ padding: isMobile ? "12px 16px" : "20px" }}
        >
          {step === 1 && <ProductDetailsStep data={data} errors={errors} locale={locale} onChange={updateField} />}
          {step === 2 && <PricingStep data={data} errors={errors} locale={locale} onChange={updateField} />}
          {step === 3 && <StockInfoStep data={data} errors={errors} locale={locale} onChange={updateField} />}
          {step === 4 && <ReviewStep data={data} errors={errors} locale={locale} onChange={updateField} onEditStep={setStep} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================================
   DIALOG FOOTER
   ============================================ */

function DialogFooter({
  isMobile,
  step,
  isSubmitting,
  handleBack,
  handleNext,
  handleSubmit,
  handleClose,
  locale,
}: {
  isMobile: boolean;
  step: WizardStep;
  isSubmitting: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: () => void;
  handleClose: () => void;
  locale: Locale;
}) {
  return (
    <div
      className={`flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 ${
        isMobile ? "" : "px-5 py-4"
      }`}
      style={{
        ...(isMobile
          ? {
              padding: "12px 16px",
              paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            }
          : {}
        ),
      }}
    >
      {isMobile ? (
        /* Mobile: Back/Cancel icon + full-width primary */
        <div className="flex gap-2">
          {step > 1 ? (
            <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
              iconLeft={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}
              className="flex-shrink-0 justify-center !w-[56px] !min-w-[56px]"
            >
              {null}
            </Button>
          ) : (
            <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}
              className="flex-shrink-0 justify-center !w-[56px] !min-w-[56px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" size="md" onClick={handleNext}
              iconRight={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
              className="flex-1 min-w-0">
              {t(locale, "Continue", "Endelea")}
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
              iconLeft={!isSubmitting ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}
              className="flex-1 min-w-0">
              {isSubmitting ? t(locale, "Adding...", "Inaweka...") : t(locale, "Add Product", "Weka Bidhaa")}
            </Button>
          )}
        </div>
      ) : (
        /* Desktop/Tablet: Inline row, primary right-aligned */
        <div className="flex gap-3 justify-end">
          {step > 1 ? (
            <Button variant="secondary" size="md" onClick={handleBack} disabled={isSubmitting}
              iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}>
              {t(locale, "Back", "Rudi")}
            </Button>
          ) : (
            <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}>
              {t(locale, "Cancel", "Ghairi")}
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" size="md" onClick={handleNext}
              iconRight={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}>
              {t(locale, "Continue", "Endelea")}
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
              iconLeft={!isSubmitting ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}>
              {isSubmitting ? t(locale, "Adding...", "Inaweka...") : t(locale, "Add Product", "Weka Bidhaa")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================
   SUCCESS OVERLAY
   ============================================ */

function SuccessOverlay({ submitSuccess, locale, isEditMode }: { submitSuccess: boolean; locale: Locale; isEditMode?: boolean }) {
  return (
    <AnimatePresence>
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center rounded-inherit"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4"
          >
            <motion.svg
              width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          </motion.div>
          <p className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
            {isEditMode
              ? t(locale, "Product Updated!", "Bidhaa Imesasishwa!")
              : t(locale, "Product Added!", "Bidhaa Imeongezwa!")
            }
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   MOBILE STEP DOTS
   ============================================ */

function MobileStepDots({
  step,
  completedSteps,
  setStep,
}: {
  step: WizardStep;
  completedSteps: Set<WizardStep>;
  setStep: (s: WizardStep) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      {([1, 2, 3, 4] as WizardStep[]).map((s, i) => {
        const isActive = s === step;
        const isCompleted = completedSteps.has(s);
        const isAccessible = isCompleted || s < step;
        return (
          <div key={s} className="flex items-center">
            <button
              onClick={() => { if (isAccessible) setStep(s); }}
              disabled={!isAccessible && s > step}
              className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? "w-8 h-8 bg-terracotta-500 text-white shadow-md shadow-terracotta-500/25 text-xs font-bold"
                  : isCompleted
                    ? "w-6 h-6 bg-forest-500 text-white"
                    : "w-6 h-6 bg-warm-200 dark:bg-warm-700 text-warm-400 dark:text-warm-500 text-[10px] font-medium"
              }`}
              aria-label={`Step ${s}`}
            >
              {isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              ) : s}
            </button>
            {i < 3 && (
              <div className={`w-6 sm:w-8 h-0.5 rounded-full mx-0.5 ${
                isCompleted ? "bg-forest-500" : "bg-warm-200 dark:bg-warm-700"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================
   DESKTOP/TABLET STEP LINES
   ============================================ */

function DesktopStepLines({
  step,
  completedSteps,
  setStep,
}: {
  step: WizardStep;
  completedSteps: Set<WizardStep>;
  setStep: (s: WizardStep) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4] as WizardStep[]).map((s) => {
        const isActive = s === step;
        const isCompleted = completedSteps.has(s);
        const isAccessible = isCompleted || s < step;
        return (
          <div key={s} className="flex items-center flex-1">
            <button
              onClick={() => { if (isAccessible) setStep(s); }}
              disabled={!isAccessible && s > step}
              className={`flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 w-8 h-8 text-xs font-bold ${
                isActive
                  ? "bg-terracotta-500 text-white shadow-md shadow-terracotta-500/25"
                  : isCompleted
                    ? "bg-forest-500 text-white"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-400 dark:text-warm-500"
              }`}
              aria-label={`Step ${s}`}
            >
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              ) : s}
            </button>
            {s < 4 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                isCompleted ? "bg-forest-500" : "bg-warm-100 dark:bg-warm-800"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
