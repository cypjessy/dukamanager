"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExpenseCategory, PaymentMethod } from "@/data/expenseData";
import { categoryConfig } from "@/data/expenseData";
import type { Locale } from "@/types";
import { useBunnyUpload } from "@/hooks/useBunnyUpload";
import { useAuth } from "@/providers/AuthProvider";

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    description: string;
    category: ExpenseCategory;
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    vendor: string;
    reference: string;
    notes: string;
    isRecurring: boolean;
    recurrenceFrequency: string;
    receiptUrl: string;
  }) => void;
  locale: Locale;
  isMobile: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string; labelSw: string; icon: string }[] = [
  { value: "cash", label: "Cash", labelSw: "Pesa Taslimu", icon: "💵" },
  { value: "mpesa", label: "M-Pesa", labelSw: "M-Pesa", icon: "📲" },
  { value: "bank", label: "Bank Transfer", labelSw: "Benki", icon: "🏦" },
  { value: "mobile_banking", label: "Mobile Banking", labelSw: "Benki ya Simu", icon: "📱" },
];

const quickAmounts = [500, 1000, 2000, 5000, 10000];

const commonDescriptions: Record<ExpenseCategory, string[]> = {
  rent: ["Monthly shop rent", "Quarterly rent advance"],
  electricity: ["KPLC token - 50 units", "KPLC token - 100 units", "Generator fuel"],
  water: ["Nairobi Water bill", "Water jerrycan purchase"],
  salaries: ["Casual worker - loading", "Casual worker - stocking", "Security guard"],
  transport: ["Gikomba market transport", "Stock collection transport"],
  stock_purchase: ["Wholesale stock purchase", "Emergency stock run"],
  marketing: ["Business cards printing", "Social media boost"],
  repairs: ["Shelf repair", "Lock replacement"],
  licenses: ["County business permit", "Fire safety certificate"],
  fuel: ["Motorcycle fuel", "Generator diesel"],
  communication: ["Safaricom airtime", "WiFi subscription", "M-Pesa charges"],
  miscellaneous: ["Market levy", "Cleaning supplies", "Plastic bags"],
};

const recentVendors = ["Bidco Africa", "KPLC", "Nairobi Water", "Gikomba Market", "Unga Group", "Safaricom", "City County"];

export default function AddExpenseDialog({ isOpen, onClose, onSave, locale, isMobile }: AddExpenseDialogProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [vendor, setVendor] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("monthly");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { shopId } = useAuth();
  const { upload: uploadReceipt } = useBunnyUpload(shopId || undefined);
  const [categorySearch, setCategorySearch] = useState("");
  const [vendorSuggestions, setVendorSuggestions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amountRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCategory("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod("mpesa");
      setVendor("");
      setReference("");
      setNotes("");
      setIsRecurring(false);
      setRecurrenceFrequency("monthly");
      setReceiptPreview(null);
      setCategorySearch("");
      setVendorSuggestions([]);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 2 && amountRef.current) {
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, [isOpen, step]);

  const handleVendorInput = useCallback((value: string) => {
    setVendor(value);
    if (value.length > 0) {
      setVendorSuggestions(
        recentVendors.filter((v) => v.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setVendorSuggestions([]);
    }
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setReceiptFile(file);
    }
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = t("Select a category", "Chagua aina");
    if (!amount || Number(amount) <= 0) newErrors.amount = t("Enter a valid amount", "Weka kiasi sahihi");
    if (!description || description.length < 3) newErrors.description = t("Min 3 characters", "Angalau herufi 3");
    if (!date) newErrors.date = t("Date is required", "Tarehe inahitajika");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [category, amount, description, date, t]);

  const handleNext = () => {
    if (step === 1 && !category) {
      setErrors({ category: t("Select a category", "Chagua aina") });
      return;
    }
    if (step === 2 && (!amount || Number(amount) <= 0)) {
      setErrors({ amount: t("Enter a valid amount", "Weka kiasi sahihi") });
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let finalReceiptUrl = receiptPreview || "";
    if (receiptFile) {
      const result = await uploadReceipt(receiptFile, "expenses");
      if (result) finalReceiptUrl = result.cdnUrl;
    }

    onSave({
      description,
      category: category as ExpenseCategory,
      amount: Number(amount),
      paymentMethod,
      date,
      vendor,
      reference,
      notes,
      isRecurring,
      recurrenceFrequency,
      receiptUrl: finalReceiptUrl,
    });
    onClose();
  };

  const filteredCategories = Object.entries(categoryConfig).filter(
    ([, config]) =>
      !categorySearch ||
      config.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
      config.labelSw.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const catConfig = category ? categoryConfig[category as ExpenseCategory] : null;

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
            style={{ backdropFilter: "blur(16px)" }}
            onClick={onClose}
          />

          {/* Dialog container */}
          {isMobile ? (
            /* Mobile: Bottom sheet */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) onClose();
              }}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                height: "100dvh",
                borderRadius: "24px 24px 0 0",
                zIndex: 60,
              }}
              className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-warm-300 dark:bg-warm-600" />
              </div>

              <DialogHeader t={t} step={step} catConfig={catConfig} onClose={onClose} />

              <div className="flex-1 overflow-y-auto px-4 pb-28">
                <DialogContent
                  step={step}
                  category={category}
                  setCategory={setCategory}
                  amount={amount}
                  setAmount={setAmount}
                  description={description}
                  setDescription={setDescription}
                  date={date}
                  setDate={setDate}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  vendor={vendor}
                  handleVendorInput={handleVendorInput}
                  vendorSuggestions={vendorSuggestions}
                  setVendor={setVendor}
                  setVendorSuggestions={setVendorSuggestions}
                  reference={reference}
                  setReference={setReference}
                  notes={notes}
                  setNotes={setNotes}
                  isRecurring={isRecurring}
                  setIsRecurring={setIsRecurring}
                  recurrenceFrequency={recurrenceFrequency}
                  setRecurrenceFrequency={setRecurrenceFrequency}
                  receiptPreview={receiptPreview}
                  setReceiptPreview={setReceiptPreview}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  categorySearch={categorySearch}
                  setCategorySearch={setCategorySearch}
                  filteredCategories={filteredCategories}
                  quickAmounts={quickAmounts}
                  commonDescriptions={commonDescriptions}
                  paymentMethods={paymentMethods}
                  errors={errors}
                  amountRef={amountRef}
                  t={t}
                  locale={locale}
                  catConfig={catConfig}
                />
              </div>

              <DialogFooter
                step={step}
                setStep={setStep}
                handleNext={handleNext}
                handleSubmit={handleSubmit}
                onClose={onClose}
                t={t}
                isMobile
              />
            </motion.div>
          ) : (
            /* Tablet/Desktop: Centered modal */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: "min(640px, calc(100vw - 32px))", maxHeight: "85vh" }}
              >
                <DialogHeader t={t} step={step} catConfig={catConfig} onClose={onClose} />

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <DialogContent
                    step={step}
                    category={category}
                    setCategory={setCategory}
                    amount={amount}
                    setAmount={setAmount}
                    description={description}
                    setDescription={setDescription}
                    date={date}
                    setDate={setDate}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    vendor={vendor}
                    handleVendorInput={handleVendorInput}
                    vendorSuggestions={vendorSuggestions}
                    setVendor={setVendor}
                    setVendorSuggestions={setVendorSuggestions}
                    reference={reference}
                    setReference={setReference}
                    notes={notes}
                    setNotes={setNotes}
                    isRecurring={isRecurring}
                    setIsRecurring={setIsRecurring}
                    recurrenceFrequency={recurrenceFrequency}
                    setRecurrenceFrequency={setRecurrenceFrequency}
                    receiptPreview={receiptPreview}
                    setReceiptPreview={setReceiptPreview}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    categorySearch={categorySearch}
                    setCategorySearch={setCategorySearch}
                    filteredCategories={filteredCategories}
                    quickAmounts={quickAmounts}
                    commonDescriptions={commonDescriptions}
                    paymentMethods={paymentMethods}
                    errors={errors}
                    amountRef={amountRef}
                    t={t}
                    locale={locale}
                    catConfig={catConfig}
                  />
                </div>

                <DialogFooter
                  step={step}
                  setStep={setStep}
                  handleNext={handleNext}
                  handleSubmit={handleSubmit}
                  onClose={onClose}
                  t={t}
                  isMobile={false}
                />
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

function DialogHeader({ t, step, catConfig, onClose }: {
  t: (en: string, sw: string) => string;
  step: number;
  catConfig: { icon: string; label: string } | null;
  onClose: () => void;
}) {
  return (
    <div className="flex-shrink-0 px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">
              {t("Add Expense", "Ongeza Matumizi")}
            </h2>
            <p className="text-[10px] text-warm-400">
              Step {step} of 3 {catConfig ? `- ${catConfig.icon} ${catConfig.label}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              step >= s ? "bg-gradient-to-r from-terracotta-500 to-savanna-500" : "bg-warm-200 dark:bg-warm-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// FOOTER
// ============================================

function DialogFooter({ step, setStep, handleNext, handleSubmit, onClose, t, isMobile }: {
  step: number;
  setStep: (s: number) => void;
  handleNext: () => void;
  handleSubmit: () => void;
  onClose: () => void;
  t: (en: string, sw: string) => string;
  isMobile: boolean;
}) {
  return (
    <div
      className={`flex-shrink-0 border-t border-warm-200/60 dark:border-warm-700/60 px-5 py-4 flex gap-2 ${
        isMobile ? "fixed bottom-0 left-0 right-0 bg-white dark:bg-warm-900 z-10 shadow-lg" : ""
      }`}
      style={isMobile ? { paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" } : undefined}
    >
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px] active:scale-[0.98] transition-transform"
        >
          {t("Back", "Rudi")}
        </button>
      )}
      <button
        onClick={onClose}
        className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-600 dark:text-warm-300 min-h-[48px] active:scale-[0.98] transition-transform"
      >
        {t("Cancel", "Ghairi")}
      </button>
      {step < 3 ? (
        <button
          onClick={handleNext}
          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] active:scale-[0.98] transition-transform shadow-md shadow-terracotta-500/20"
        >
          {t("Continue", "Endelea")}
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-400 text-white font-heading font-bold text-sm min-h-[48px] active:scale-[0.98] transition-transform shadow-md shadow-forest-500/20"
        >
          {t("Save Expense", "Hifadhi")}
        </button>
      )}
    </div>
  );
}

// ============================================
// CONTENT
// ============================================

interface DialogContentProps {
  step: number;
  category: ExpenseCategory | "";
  setCategory: (c: ExpenseCategory) => void;
  amount: string;
  setAmount: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  vendor: string;
  handleVendorInput: (v: string) => void;
  vendorSuggestions: string[];
  setVendor: (v: string) => void;
  setVendorSuggestions: (v: string[]) => void;
  reference: string;
  setReference: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  recurrenceFrequency: string;
  setRecurrenceFrequency: (v: string) => void;
  receiptPreview: string | null;
  setReceiptPreview: (v: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categorySearch: string;
  setCategorySearch: (v: string) => void;
  filteredCategories: [string, { icon: string; label: string; labelSw: string; color: string; bgColor: string }][];
  quickAmounts: number[];
  commonDescriptions: Record<string, string[]>;
  paymentMethods: { value: PaymentMethod; label: string; labelSw: string; icon: string }[];
  errors: Record<string, string>;
  amountRef: React.RefObject<HTMLInputElement>;
  t: (en: string, sw: string) => string;
  locale: Locale;
  catConfig: { icon: string; label: string; labelSw: string; color: string; bgColor: string } | null;
}

function DialogContent(p: DialogContentProps) {
  const {
    step, category, setCategory, amount, setAmount, description, setDescription,
    date, setDate, paymentMethod, setPaymentMethod, vendor, handleVendorInput,
    vendorSuggestions, setVendor, setVendorSuggestions, reference, setReference, notes, setNotes,
    isRecurring, setIsRecurring, recurrenceFrequency, setRecurrenceFrequency,
    receiptPreview, setReceiptPreview, fileInputRef, handleFileUpload, categorySearch, setCategorySearch,
    filteredCategories, quickAmounts, commonDescriptions, paymentMethods: pmList,
    errors, amountRef, t, locale, catConfig,
  } = p;

  return (
    <div className="py-4 space-y-4">
      {/* STEP 1: Category */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Search categories */}
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder={t("Search category...", "Tafuta aina...")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[44px]"
            />
          </div>

          {/* Category grid */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-3">{t("Expense Category", "Aina ya Gharama")}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredCategories.map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key as ExpenseCategory)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[64px] justify-center ${
                    category === key
                      ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20 shadow-sm"
                      : "border-transparent bg-warm-50 dark:bg-warm-800/50 hover:bg-warm-100 dark:hover:bg-warm-800"
                  }`}
                >
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-[10px] font-medium text-warm-700 dark:text-warm-300 leading-tight text-center">
                    {locale === "sw" ? config.labelSw : config.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category}</p>}
          </div>
        </motion.div>
      )}

      {/* STEP 2: Amount & Details */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Selected category badge */}
          {catConfig && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${catConfig.bgColor} ${catConfig.color}`}>
                {catConfig.icon} {locale === "sw" ? catConfig.labelSw : catConfig.label}
              </span>
            </div>
          )}

          {/* Amount input */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Amount (KSh)", "Kiasi (KSh)")}
            </label>
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-heading font-bold text-warm-400">KSh</span>
                <input
                  ref={amountRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-40 text-4xl font-heading font-extrabold text-center bg-transparent outline-none text-warm-900 dark:text-warm-50 tabular-nums"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            {/* Quick amounts */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(String(qa))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
                    amount === String(qa)
                      ? "bg-terracotta-500 text-white"
                      : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"
                  }`}
                >
                  +{qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Description", "Maelezo")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("What was this expense for?", "Hii gharama ilikuwa ya nini?")}
              className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[70px] resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}

            {/* Quick descriptions */}
            {category && commonDescriptions[category as ExpenseCategory] && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonDescriptions[category as ExpenseCategory].map((desc) => (
                  <button
                    key={desc}
                    onClick={() => setDescription(desc)}
                    className={`px-2 py-1 rounded-lg text-[10px] min-h-[28px] transition-colors ${
                      description === desc
                        ? "bg-terracotta-500 text-white"
                        : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"
                    }`}
                  >
                    {desc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Date", "Tarehe")}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px]"
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
        </motion.div>
      )}

      {/* STEP 3: Payment & Extras */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Summary */}
          {catConfig && (
            <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{catConfig.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{description || "Expense"}</p>
                    <p className="text-[10px] text-warm-400">{date} - {locale === "sw" ? catConfig.labelSw : catConfig.label}</p>
                  </div>
                </div>
                <span className="text-lg font-heading font-extrabold text-red-500 tabular-nums">KSh {Number(amount).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Payment Method", "Njia ya Malipo")}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {pmList.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[48px] ${
                    paymentMethod === m.value
                      ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20"
                      : "border-transparent bg-warm-50 dark:bg-warm-800/50"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs font-medium text-warm-700 dark:text-warm-300">
                    {locale === "sw" ? m.labelSw : m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vendor */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Vendor / Recipient", "Mtoa Huduma")}
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => handleVendorInput(e.target.value)}
              placeholder={t("Who was paid?", "Nani alipwa?")}
              className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px]"
            />
            {vendorSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {vendorSuggestions.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setVendor(v); setVendorSuggestions([]); }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 min-h-[28px]"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reference */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Reference (optional)", "Kumbukumbu (si lazima)")}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. M-Pesa code, receipt #"
              className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px] font-mono"
            />
          </div>

          {/* Receipt upload */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Receipt", "Risiti")}
            </label>
            {receiptPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={receiptPreview} alt="Expense receipt attachment" className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => setReceiptPreview(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-xl border-2 border-dashed border-warm-300 dark:border-warm-600 text-center hover:border-terracotta-400 transition-colors min-h-[80px] flex flex-col items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 mb-1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs text-warm-500">{t("Upload Receipt", "Pakia Risiti")}</span>
                <span className="text-[10px] text-warm-400 mt-0.5">{t("Camera or file", "Kamera au faili")}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
          </div>

          {/* Recurring */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <div className={`w-10 h-6 rounded-full transition-colors ${isRecurring ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"} relative`}
                onClick={() => setIsRecurring(!isRecurring)}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isRecurring ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-warm-700 dark:text-warm-300">{t("Recurring Expense", "Gharama ya Mara kwa Mara")}</span>
            </label>
            {isRecurring && (
              <div className="mt-3 flex gap-2">
                {["daily", "weekly", "monthly", "yearly"].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setRecurrenceFrequency(freq)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[36px] capitalize transition-all ${
                      recurrenceFrequency === freq
                        ? "bg-terracotta-500 text-white"
                        : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
            <label className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2 block">
              {t("Notes (optional)", "Maelezo (si lazima)")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("Additional notes...", "Maelezo ya ziada...")}
              className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[60px] resize-none"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
