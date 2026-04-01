"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Locale } from "@/types";
import type { CustomerFormValues } from "@/lib/customerValidations";
import { customerFormSchema, REFERRAL_SOURCES, KENYAN_WARDS } from "@/lib/customerValidations";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import { sampleCustomers } from "@/data/customerData";
import Button from "@/components/ui/Button";

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: CustomerFormValues) => void;
}

const DEFAULTS: CustomerFormValues = {
  name: "", nameSw: "", phone: "", phoneAlt: "", email: "",
  customerType: "regular", creditLimit: 0,
  address: "", landmark: "", ward: "",
  notes: "", referralSource: "", enrollLoyalty: false,
  preferredPayment: "mpesa",
};

const t = (locale: Locale, en: string, sw: string) => locale === "sw" ? sw : en;

export default function AddCustomerDialog({ isOpen, onClose, locale, onSave }: AddCustomerDialogProps) {
  const [data, setData] = useState<CustomerFormValues>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const screen = useResponsiveDialog();
  const { isMobile, isTablet } = screen;
  const firstInputRef = useRef<HTMLInputElement>(null!);

  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);

  const updateField = useCallback(<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

    if (key === "phone" && typeof value === "string") {
      const normalized = value.replace(/\s/g, "");
      const existing = sampleCustomers.find((c) => c.phone.replace(/\s/g, "").endsWith(normalized.slice(-9)));
      setDuplicateWarning(existing ? existing.name : null);
    }
  }, []);

  const formatPhone = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("254")) return digits.slice(0, 12);
    if (digits.startsWith("0")) return digits.slice(0, 10);
    return digits.slice(0, 10);
  }, []);

  const getNetwork = useCallback((phone: string) => {
    const d = phone.replace(/\D/g, "");
    const prefix = d.startsWith("254") ? d.slice(3, 6) : d.startsWith("0") ? d.slice(1, 4) : d.slice(0, 3);
    if (["700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "757", "758", "759", "768", "769"].includes(prefix)) return "Safaricom";
    if (["730", "731", "732", "733", "734", "735", "736", "737", "738", "739", "750", "751", "752", "753", "754", "755", "756"].includes(prefix)) return "Airtel";
    if (["770", "771", "772", "773", "774", "775", "776", "777", "778", "779"].includes(prefix)) return "Telkom";
    return null;
  }, []);

  const validate = useCallback((): boolean => {
    const result = customerFormSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") errs[key] = issue.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }, [data]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    onSave(data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setData(DEFAULTS);
      setDuplicateWarning(null);
      onClose();
    }, 1500);
  }, [data, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => { setData(DEFAULTS); setErrors({}); setDuplicateWarning(null); }, 300);
    }
  }, [isSubmitting, onClose]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (isOpen && isMobile) setTimeout(() => firstInputRef.current?.focus(), 400);
    else if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 200);
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const network = getNetwork(data.phone);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: isMobile ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)",
              backdropFilter: isMobile ? "blur(2px)" : "blur(8px)",
              WebkitBackdropFilter: isMobile ? "blur(2px)" : "blur(8px)",
            }}
            onClick={handleClose}
          />

          {isMobile ? (
            /* Mobile Bottom Sheet */
            <motion.div
              key="customer-dialog-mobile"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0,
                height: "100dvh", maxHeight: "100dvh",
                borderRadius: "24px 24px 0 0",
                y: dragY, opacity: dragOpacity,
              }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
              role="dialog" aria-modal="true"
              aria-label={t(locale, "Add New Customer", "Ongeza Mteja Mpya")}
            >
              <DialogContent
                isMobile={true}
                locale={locale}
                data={data}
                errors={errors}
                duplicateWarning={duplicateWarning}
                network={network}
                isSubmitting={isSubmitting}
                submitSuccess={submitSuccess}
                firstInputRef={firstInputRef}
                updateField={updateField}
                formatPhone={formatPhone}
                handleClose={handleClose}
                handleSubmit={handleSubmit}
              />
            </motion.div>
          ) : (
            /* Desktop/Tablet Centered Modal */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={handleClose}>
              <motion.div
                key="customer-dialog-desktop"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{
                  width: isTablet ? "min(560px, calc(100vw - 32px))" : "min(640px, calc(100vw - 48px))",
                  maxHeight: "85vh",
                }}
                role="dialog" aria-modal="true"
                aria-label={t(locale, "Add New Customer", "Ongeza Mteja Mpya")}
              >
                <DialogContent
                  isMobile={false}
                  locale={locale}
                  data={data}
                  errors={errors}
                  duplicateWarning={duplicateWarning}
                  network={network}
                  isSubmitting={isSubmitting}
                  submitSuccess={submitSuccess}
                  firstInputRef={firstInputRef}
                  updateField={updateField}
                  formatPhone={formatPhone}
                  handleClose={handleClose}
                  handleSubmit={handleSubmit}
                />
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
  locale: Locale;
  data: CustomerFormValues;
  errors: Record<string, string>;
  duplicateWarning: string | null;
  network: string | null;
  isSubmitting: boolean;
  submitSuccess: boolean;
  firstInputRef: React.RefObject<HTMLInputElement>;
  updateField: <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => void;
  formatPhone: (raw: string) => string;
  handleClose: () => void;
  handleSubmit: () => void;
}

function DialogContent({
  isMobile, locale, data, errors, duplicateWarning, network,
  isSubmitting, submitSuccess, firstInputRef,
  updateField, formatPhone, handleClose, handleSubmit,
}: ContentProps) {
  const t_ = (en: string, sw: string) => locale === "sw" ? sw : en;

  return (
    <>
      {/* Mobile Drag Handle */}
      {isMobile && (
        <div className="flex-shrink-0 flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-manipulation select-none">
          <div className="w-10 h-1.5 rounded-full bg-warm-300 dark:bg-warm-600" />
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center rounded-inherit"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4">
              <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}>
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
            <p className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
              {t_("Customer Added!", "Mteja Ameongezwa!")}
            </p>
            <div className="mt-4 px-6 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200/60 dark:border-warm-700/60">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{data.name}</p>
              <p className="text-xs text-warm-500">{data.phone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 border-b border-warm-100 dark:border-warm-800"
        style={{
          ...(isMobile
            ? { padding: "8px 16px 12px", paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }
            : { padding: "20px 20px 16px" }
          ),
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/20 flex items-center justify-center text-terracotta-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
            </div>
            <h2 className={`font-heading font-bold text-warm-900 dark:text-warm-50 ${isMobile ? "text-base" : "text-lg"}`}>
              {t_("Add New Customer", "Ongeza Mteja Mpya")}
            </h2>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className={`w-10 h-10 flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 active:scale-95 transition-all ${isMobile ? "rounded-full" : "rounded-lg"}`}
            aria-label={t_("Close", "Funga")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain"
        style={isMobile ? { WebkitOverflowScrolling: "touch", paddingBottom: "120px" } : { scrollbarWidth: "thin", scrollbarColor: "rgba(199,91,57,0.2) transparent" }}>

        <div style={{ padding: isMobile ? "16px" : "20px" }} className="space-y-5">
          {/* Section 1: Customer Basics */}
          <FormSection title={t_("Customer Basics", "Taarifa za Msingi")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput ref={firstInputRef} label={t_("Full Name", "Jina Kamili")} value={data.name}
                onChange={(v) => updateField("name", v)} error={errors.name} required
                placeholder={t_("e.g. Mama Wanjiku", "mf. Mama Wanjiku")} />
              <FormInput label={t_("Name (Swahili)", "Jina (Kiswahili)")} value={data.nameSw || ""}
                onChange={(v) => updateField("nameSw", v)}
                placeholder={t_("Optional", "Si lazima")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormInput label={t_("Phone Number", "Namba ya Simu")} value={data.phone}
                  onChange={(v) => updateField("phone", formatPhone(v))} error={errors.phone} required
                  placeholder="07XX XXX XXX" type="tel" />
                {network && data.phone.length >= 9 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-2 h-2 rounded-full ${network === "Safaricom" ? "bg-forest-500" : network === "Airtel" ? "bg-red-500" : "bg-terracotta-500"}`} />
                    <span className="text-[11px] text-warm-500 font-medium">{network}</span>
                    {network === "Safaricom" && <span className="text-[10px] text-forest-600 bg-forest-50 dark:bg-forest-900/20 px-1.5 py-0.5 rounded">M-Pesa Ready</span>}
                  </div>
                )}
              </div>
              <FormInput label={t_("Alt Phone", "Simu ya Pili")} value={data.phoneAlt || ""}
                onChange={(v) => updateField("phoneAlt", v)} placeholder={t_("Optional", "Si lazima")} type="tel" />
            </div>

            <FormInput label={t_("Email", "Barua Pepe")} value={data.email || ""}
              onChange={(v) => updateField("email", v)} error={errors.email}
              placeholder="email@example.com" type="email" />

            {/* Duplicate Warning */}
            <AnimatePresence>
              {duplicateWarning && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-sunset-50 dark:bg-sunset-900/15 border border-sunset-200/60 dark:border-sunset-700/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-xs text-sunset-700 dark:text-sunset-400">
                    {t_("Existing customer:", "Mteja aliyeko:")} <strong>{duplicateWarning}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>

          {/* Section 2: Customer Type */}
          <FormSection title={t_("Customer Type", "Aina ya Mteja")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          }>
            <div className="flex gap-2">
              {(["regular", "credit"] as const).map((type) => (
                <button key={type} onClick={() => updateField("customerType", type)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all text-sm font-heading font-bold min-h-[48px] ${
                    data.customerType === type
                      ? type === "credit" ? "border-sunset-400 bg-sunset-50 dark:bg-sunset-900/15 text-sunset-600" : "border-forest-400 bg-forest-50 dark:bg-forest-900/15 text-forest-600"
                      : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                  }`}>
                  {type === "regular"
                    ? t_("Regular Customer", "Mteja wa Kawaida")
                    : t_("Credit Customer", "Mteja wa Mkopo")}
                </button>
              ))}
            </div>

            {/* Credit Limit (conditional) */}
            <AnimatePresence>
              {data.customerType === "credit" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}>
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                      {t_("Credit Limit", "Kikomo cha Mkopo")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
                      <input type="number" value={data.creditLimit || ""} onChange={(e) => updateField("creditLimit", Number(e.target.value))}
                        placeholder="0" min={500} max={50000}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 tabular-nums ${
                          errors.creditLimit ? "border-red-400" : "border-warm-200 dark:border-warm-700"
                        }`}
                        style={{ fontSize: "16px", minHeight: "48px" }} />
                    </div>
                    {errors.creditLimit && <p className="text-xs text-red-500 mt-1">{errors.creditLimit}</p>}
                    <p className="text-[10px] text-warm-400 mt-1">{t_("Min KSh 500, Max KSh 50,000", "KSh 500 - KSh 50,000")}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t_("Preferred Payment", "Njia ya Malipo")}
              </label>
              <div className="flex gap-2">
                {(["mpesa", "cash", "credit"] as const).map((method) => (
                  <button key={method} onClick={() => updateField("preferredPayment", method)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all min-h-[40px] ${
                      data.preferredPayment === method
                        ? "bg-terracotta-500 text-white shadow-sm"
                        : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
                    }`}>
                    {method === "mpesa" ? "M-Pesa" : method === "cash" ? t_("Cash", "Pesa Taslimu") : t_("Credit", "Mkopo")}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>

          {/* Section 3: Location */}
          <FormSection title={t_("Location Details", "Taarifa za Mahali")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          }>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t_("Address", "Anwani")}
              </label>
              <textarea value={data.address || ""} onChange={(e) => updateField("address", e.target.value)} rows={2}
                placeholder={t_("Street, building, house number...", "Barabara, jengo, namba ya nyumba...")}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
                style={{ fontSize: "16px", minHeight: "72px" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label={t_("Landmark", "Kielezo")} value={data.landmark || ""}
                onChange={(v) => updateField("landmark", v)}
                placeholder={t_("e.g. Near Equity Bank", "mf. Karibu na Equity Bank")} />
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                  {t_("Ward / Location", "Wadi / Mahali")}
                </label>
                <select value={data.ward || ""} onChange={(e) => updateField("ward", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
                  style={{ fontSize: "16px", minHeight: "48px" }}>
                  <option value="">{t_("-- Select Ward --", "-- Chagua Wadi --")}</option>
                  {KENYAN_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
          </FormSection>

          {/* Section 4: Additional */}
          <FormSection title={t_("Additional Info", "Taarifa za Zianna")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          }>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t_("Notes", "Maelezo")}
              </label>
              <textarea value={data.notes || ""} onChange={(e) => updateField("notes", e.target.value)} rows={2}
                placeholder={t_("Customer preferences, payment history, special arrangements...", "Mapendeleo ya mteja, historia ya malipo...")}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
                style={{ fontSize: "16px", minHeight: "72px" }} />
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
                {t_("How did they find you?", "Alikujaje?")}
              </label>
              <select value={data.referralSource || ""} onChange={(e) => updateField("referralSource", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
                style={{ fontSize: "16px", minHeight: "48px" }}>
                <option value="">{t_("-- Select --", "-- Chagua --")}</option>
                {REFERRAL_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{locale === "sw" ? s.labelSw : s.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-terracotta-50/50 dark:bg-terracotta-900/10 border border-terracotta-200/30 dark:border-terracotta-700/20 cursor-pointer">
              <input type="checkbox" checked={data.enrollLoyalty} onChange={(e) => updateField("enrollLoyalty", e.target.checked)}
                className="w-5 h-5 rounded border-2 border-terracotta-300 text-terracotta-500 focus:ring-terracotta-500 accent-terracotta-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                  {t_("Enroll in Loyalty Program", "Weka kwenye Programu ya Uaminifu")}
                </p>
                <p className="text-[11px] text-warm-500">
                  {t_("Earn points on every purchase", "Pata pointi kila unaponunua")}
                </p>
              </div>
            </label>
          </FormSection>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 ${isMobile ? "" : "px-5 py-4"}`}
        style={isMobile ? { padding: "12px 16px", paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" } : undefined}>
        {isMobile ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}
              className="flex-shrink-0 justify-center !w-[56px] !min-w-[56px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
              iconLeft={!isSubmitting ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}
              className="flex-1 min-w-0">
              {isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Customer", "Hifadhi Mteja")}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}>
              {t_("Cancel", "Ghairi")}
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
              iconLeft={!isSubmitting ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}>
              {isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Customer", "Hifadhi Mteja")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
   FORM SECTION CARD
   ============================================ */

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-warm-100/60 dark:border-warm-800/60 bg-warm-50/50 dark:bg-warm-800/30">
        <span className="text-terracotta-500">{icon}</span>
        <h3 className="text-xs font-heading font-bold text-warm-700 dark:text-warm-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

/* ============================================
   FORM INPUT
   ============================================ */

import { forwardRef } from "react";

const FormInput = forwardRef<HTMLInputElement, {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}>(function FormInput({ label, value, onChange, error, required, placeholder, type = "text" }, ref) {
  return (
    <div>
      <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input ref={ref} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500/30 transition-colors ${
          error ? "border-red-400" : "border-warm-200 dark:border-warm-700"
        }`}
        style={{ fontSize: "16px", minHeight: "48px" }} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
