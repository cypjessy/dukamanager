"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Locale } from "@/types";
import type { EmployeeFormValues } from "@/lib/employeeValidations";
import {
  DEPARTMENTS, EMPLOYMENT_TYPES, RELATIONS, PERMISSION_GROUPS, PERMISSION_PRESETS,
} from "@/lib/employeeValidations";
import { employees } from "@/data/employeeData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: EmployeeFormValues) => void;
}

const DEFAULTS: EmployeeFormValues = {
  firstName: "", lastName: "", nationalId: "", dateOfBirth: "", gender: "male",
  phone: "", phoneAlt: "", email: "", address: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
  department: "", jobTitle: "", employmentType: "full_time",
  startDate: new Date().toISOString().slice(0, 10),
  salaryAmount: 0, salaryPeriod: "monthly", mpesaNumber: "",
  permViewSales: true, permRecordSales: true,
  permViewInventory: false, permManageInventory: false,
  permViewCustomers: false, permManageCustomers: false,
  permViewSuppliers: false, permManageSuppliers: false,
  permViewReports: false, permGenerateReports: false,
  permManageEmployees: false, permAccessSettings: false,
};

const t = (locale: Locale, en: string, sw: string) => locale === "sw" ? sw : en;

export default function AddEmployeeDialog({ isOpen, onClose, locale, onSave }: AddEmployeeDialogProps) {
  const [data, setData] = useState<EmployeeFormValues>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null!);
  const screen = useResponsiveDialog();
  const { isMobile, isTablet } = screen;

  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);

  const updateField = useCallback(<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    if (key === "nationalId" && typeof value === "string" && value.length === 8) {
      const existing = employees.find((e) => e.nationalId === value);
      setDuplicateWarning(existing ? `${existing.firstName} ${existing.lastName}` : null);
    }
  }, []);

  const applyPreset = useCallback((preset: typeof PERMISSION_PRESETS[number]) => {
    setData((prev) => {
      const reset: Partial<EmployeeFormValues> = {
        permViewSales: false, permRecordSales: false,
        permViewInventory: false, permManageInventory: false,
        permViewCustomers: false, permManageCustomers: false,
        permViewSuppliers: false, permManageSuppliers: false,
        permViewReports: false, permGenerateReports: false,
        permManageEmployees: false, permAccessSettings: false,
      };
      return { ...prev, ...reset, ...preset.perms };
    });
  }, []);

  const generateCredentials = useCallback(() => {
    const username = `${data.firstName.toLowerCase().slice(0, 4)}${data.lastName.toLowerCase().slice(0, 4)}${Math.floor(10 + Math.random() * 90)}`;
    const password = `${data.firstName.slice(0, 3).toUpperCase()}${data.nationalId.slice(-4)}!`;
    return { username, password };
  }, [data.firstName, data.lastName, data.nationalId]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!data.firstName.trim() || data.firstName.length < 2) errs.firstName = locale === "sw" ? "Jina linahitajika" : "First name required";
    if (!data.lastName.trim() || data.lastName.length < 2) errs.lastName = locale === "sw" ? "Jina la mwisho linahitajika" : "Last name required";
    if (!/^\d{8}$/.test(data.nationalId)) errs.nationalId = locale === "sw" ? "Namba ya kitambulisho lazima iwe tarakimu 8" : "ID must be 8 digits";
    if (!/^(?:\+254|254|0)([7][0-9]{8})$/.test(data.phone)) errs.phone = locale === "sw" ? "Namba ya simu si sahihi" : "Invalid phone number";
    if (!data.department) errs.department = locale === "sw" ? "Chagua idara" : "Select department";
    if (!data.jobTitle.trim()) errs.jobTitle = locale === "sw" ? "Kazi inahitajika" : "Job title required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [data, locale]);

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

  const credentials = data.firstName && data.lastName && data.nationalId.length === 8 ? generateCredentials() : null;
  const permCount = [
    data.permViewSales, data.permRecordSales, data.permViewInventory, data.permManageInventory,
    data.permViewCustomers, data.permManageCustomers, data.permViewSuppliers, data.permManageSuppliers,
    data.permViewReports, data.permGenerateReports, data.permManageEmployees, data.permAccessSettings,
  ].filter(Boolean).length;
  const securityLevel = permCount <= 3 ? "Low" : permCount <= 7 ? "Medium" : "High";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-50"
            style={{ backgroundColor: isMobile ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)", backdropFilter: isMobile ? "blur(2px)" : "blur(8px)", WebkitBackdropFilter: isMobile ? "blur(2px)" : "blur(8px)" }}
            onClick={handleClose} />

          {isMobile ? (
            <motion.div key="emp-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", maxHeight: "100dvh", borderRadius: "24px 24px 0 0", y: dragY, opacity: dragOpacity }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden"
              role="dialog" aria-modal="true" aria-label={t(locale, "Add New Employee", "Ongeza Mfanyakazi Mpya")}>
              <EmployeeDialogContent isMobile={true} locale={locale} data={data} errors={errors}
                duplicateWarning={duplicateWarning} isSubmitting={isSubmitting} submitSuccess={submitSuccess}
                contentRef={contentRef} firstInputRef={firstInputRef}
                credentials={credentials} securityLevel={securityLevel}
                updateField={updateField} applyPreset={applyPreset}
                handleClose={handleClose} handleSubmit={handleSubmit} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={handleClose}>
              <motion.div key="emp-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: isTablet ? "min(580px, calc(100vw - 32px))" : "min(680px, calc(100vw - 48px))", maxHeight: "88vh" }}
                role="dialog" aria-modal="true" aria-label={t(locale, "Add New Employee", "Ongeza Mfanyakazi Mpya")}>
                <EmployeeDialogContent isMobile={false} locale={locale} data={data} errors={errors}
                  duplicateWarning={duplicateWarning} isSubmitting={isSubmitting} submitSuccess={submitSuccess}
                  contentRef={contentRef} firstInputRef={firstInputRef}
                  credentials={credentials} securityLevel={securityLevel}
                  updateField={updateField} applyPreset={applyPreset}
                  handleClose={handleClose} handleSubmit={handleSubmit} />
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
  data: EmployeeFormValues;
  errors: Record<string, string>;
  duplicateWarning: string | null;
  isSubmitting: boolean;
  submitSuccess: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  firstInputRef: React.RefObject<HTMLInputElement>;
  credentials: { username: string; password: string } | null;
  securityLevel: string;
  updateField: <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => void;
  applyPreset: (preset: typeof PERMISSION_PRESETS[number]) => void;
  handleClose: () => void;
  handleSubmit: () => void;
}

function EmployeeDialogContent({
  isMobile, locale, data, errors, duplicateWarning, isSubmitting, submitSuccess,
  contentRef, firstInputRef, credentials, securityLevel,
  updateField, applyPreset, handleClose, handleSubmit,
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
            <p className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{t_("Employee Added!", "Mfanyakazi Ameongezwa!")}</p>
            <div className="mt-4 px-6 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/50 border border-warm-200/60 dark:border-warm-700/60 text-center">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{data.firstName} {data.lastName}</p>
              <p className="text-xs text-warm-500">{data.department && DEPARTMENTS.find(d => d.value === data.department)?.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 border-b border-warm-100 dark:border-warm-800"
        style={isMobile ? { padding: "8px 16px 12px", paddingTop: "max(8px, env(safe-area-inset-top, 8px))" } : { padding: "20px 20px 16px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-savanna-50 dark:bg-savanna-900/20 flex items-center justify-center text-savanna-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M6 11V8a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1v3" /></svg>
            </div>
            <h2 className={`font-heading font-bold text-warm-900 dark:text-warm-50 ${isMobile ? "text-base" : "text-lg"}`}>
              {t_("Add New Employee", "Ongeza Mfanyakazi Mpya")}
            </h2>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className={`w-10 h-10 flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 active:scale-95 transition-all ${isMobile ? "rounded-full" : "rounded-lg"}`}
            aria-label={t_("Close", "Funga")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain"
        style={isMobile ? { WebkitOverflowScrolling: "touch", paddingBottom: "120px" } : { scrollbarWidth: "thin", scrollbarColor: "rgba(199,91,57,0.2) transparent" }}>
        <div style={{ padding: isMobile ? "16px" : "20px" }} className="space-y-5">

          {/* Section 1: Personal Information */}
          <FormSection title={t_("Personal Information", "Taarifa Binafsi")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("First Name", "Jina la Kwanza")} <span className="text-red-500">*</span></label>
                <input ref={firstInputRef} type="text" value={data.firstName} onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Grace" className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 ${errors.firstName ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Last Name", "Jina la Mwisho")} <span className="text-red-500">*</span></label>
                <input type="text" value={data.lastName} onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Njeri" className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 ${errors.lastName ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("National ID", "Kitambulisho")} <span className="text-red-500">*</span></label>
                <input type="text" value={data.nationalId} onChange={(e) => updateField("nationalId", e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="12345678" maxLength={8}
                  className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 font-mono tabular-nums ${errors.nationalId ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {errors.nationalId && <p className="text-xs text-red-500 mt-1">{errors.nationalId}</p>}
                <AnimatePresence>
                  {duplicateWarning && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sunset-50 dark:bg-sunset-900/15 border border-sunset-200/60 dark:border-sunset-700/30 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      <p className="text-xs text-sunset-700 dark:text-sunset-400">{t_("Existing:", "Aliyeko:")} <strong>{duplicateWarning}</strong></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Date of Birth", "Tarehe ya Kuzaliwa")}</label>
                <input type="date" value={data.dateOfBirth || ""} onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {data.dateOfBirth && (() => {
                  const age = Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                  return <p className="text-[11px] text-warm-400 mt-1">{age} {t_("years old", "miaka")}</p>;
                })()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">{t_("Gender", "Jinsia")}</label>
              <div className="flex gap-2">
                {(["male", "female", "other"] as const).map((g) => (
                  <button key={g} onClick={() => updateField("gender", g)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] ${
                      data.gender === g ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                    }`}>
                    {g === "male" ? t_("Male", "Mwanaume") : g === "female" ? t_("Female", "Mwanamke") : t_("Other", "Nyingine")}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>

          {/* Section 2: Contact Details */}
          <FormSection title={t_("Contact Details", "Mawasiliano")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Phone", "Simu")} <span className="text-red-500">*</span></label>
                <input type="tel" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="07XX XXX XXX"
                  className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 ${errors.phone ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Alt Phone", "Simu ya Pili")}</label>
                <input type="tel" value={data.phoneAlt || ""} onChange={(e) => updateField("phoneAlt", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Email", "Barua Pepe")}</label>
              <input type="email" value={data.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                style={{ fontSize: "16px", minHeight: "48px" }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Address", "Anwani")}</label>
              <textarea value={data.address || ""} onChange={(e) => updateField("address", e.target.value)} rows={2}
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 resize-none"
                style={{ fontSize: "16px", minHeight: "72px" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Emergency Contact", "Mtu wa Dharura")}</label>
                <input type="text" value={data.emergencyContactName || ""} onChange={(e) => updateField("emergencyContactName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Emergency Phone", "Simu ya Dharura")}</label>
                <input type="tel" value={data.emergencyContactPhone || ""} onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Relationship", "Uhusiano")}</label>
                <select value={data.emergencyContactRelation || ""} onChange={(e) => updateField("emergencyContactRelation", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none"
                  style={{ fontSize: "16px", minHeight: "48px" }}>
                  <option value="">{t_("-- Select --", "-- Chagua --")}</option>
                  {RELATIONS.map((r) => <option key={r.value} value={r.value}>{locale === "sw" ? r.labelSw : r.label}</option>)}
                </select>
              </div>
            </div>
          </FormSection>

          {/* Section 3: Employment Details */}
          <FormSection title={t_("Employment Details", "Taarifa za Kazi")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Department", "Idara")} <span className="text-red-500">*</span></label>
                <select value={data.department} onChange={(e) => updateField("department", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 appearance-none ${errors.department ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }}>
                  <option value="">{t_("-- Select --", "-- Chagua --")}</option>
                  {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{locale === "sw" ? d.labelSw : d.label}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Job Title", "Kazi")} <span className="text-red-500">*</span></label>
                <input type="text" value={data.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder="e.g. Sales Assistant"
                  className={`w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border outline-none focus:border-terracotta-500 ${errors.jobTitle ? "border-red-400" : "border-warm-200 dark:border-warm-700"}`}
                  style={{ fontSize: "16px", minHeight: "48px" }} />
                {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">{t_("Employment Type", "Aina ya Kazi")}</label>
              <div className="flex gap-2">
                {EMPLOYMENT_TYPES.map((et) => (
                  <button key={et.value} onClick={() => updateField("employmentType", et.value as EmployeeFormValues["employmentType"])}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] ${
                      data.employmentType === et.value ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                    }`}>
                    {locale === "sw" ? et.labelSw : et.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Start Date", "Tarehe ya Kuanza")}</label>
                <input type="date" value={data.startDate || ""} onChange={(e) => updateField("startDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500"
                  style={{ fontSize: "16px", minHeight: "48px" }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("Salary / Wage", "Mshahara")}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">KSh</span>
                    <input type="number" value={data.salaryAmount || ""} onChange={(e) => updateField("salaryAmount", Number(e.target.value))}
                      placeholder="0" className="w-full pl-12 pr-3 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 tabular-nums"
                      style={{ fontSize: "16px", minHeight: "48px" }} />
                  </div>
                  <select value={data.salaryPeriod} onChange={(e) => updateField("salaryPeriod", e.target.value as EmployeeFormValues["salaryPeriod"])}
                    className="w-24 px-2 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 appearance-none text-xs"
                    style={{ minHeight: "48px" }}>
                    <option value="monthly">{t_("Monthly", "Mwezi")}</option>
                    <option value="weekly">{t_("Weekly", "Wiki")}</option>
                    <option value="daily">{t_("Daily", "Siku")}</option>
                  </select>
                </div>
                {data.salaryAmount > 0 && data.salaryAmount < 15000 && data.salaryPeriod === "monthly" && (
                  <p className="text-[11px] text-sunset-500 mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {t_("Below minimum wage (KSh 15,393)", "Chini ya mshahara mdogo")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">{t_("M-Pesa for Salary", "M-Pesa ya Mshahara")}</label>
              <input type="tel" value={data.mpesaNumber || ""} onChange={(e) => updateField("mpesaNumber", e.target.value)} placeholder="07XX XXX XXX"
                className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 outline-none focus:border-terracotta-500 font-mono"
                style={{ fontSize: "16px", minHeight: "48px" }} />
            </div>
          </FormSection>

          {/* Section 4: Permissions & Access */}
          <FormSection title={t_("Permissions & Access", "Ruhusa na Ufikiaji")} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          }>
            {/* Quick Set Presets */}
            <div>
              <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">{t_("Quick Set", "Weka Haraka")}</label>
              <div className="flex gap-2 flex-wrap">
                {PERMISSION_PRESETS.map((preset) => (
                  <button key={preset.name} onClick={() => applyPreset(preset)}
                    className="px-3 py-2 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium hover:bg-warm-200 dark:hover:bg-warm-700 active:scale-95 transition-all min-h-[40px]">
                    {locale === "sw" ? preset.nameSw : preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-1">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
                  <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{locale === "sw" ? group.labelSw : group.label}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-[10px] text-warm-400">{t_("View", "Angalia")}</span>
                      <input type="checkbox" checked={data[group.viewKey]} onChange={(e) => updateField(group.viewKey, e.target.checked)}
                        className="w-4 h-4 rounded accent-terracotta-500" />
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-[10px] text-warm-400">{t_("Manage", "Dhibiti")}</span>
                      <input type="checkbox" checked={data[group.manageKey]} onChange={(e) => updateField(group.manageKey, e.target.checked)}
                        className="w-4 h-4 rounded accent-forest-500" />
                    </label>
                  </div>
                </div>
              ))}
              {/* Special permissions */}
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
                <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{t_("Employees", "Wafanyakazi")}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] text-warm-400">{t_("Manage", "Dhibiti")}</span>
                  <input type="checkbox" checked={data.permManageEmployees} onChange={(e) => updateField("permManageEmployees", e.target.checked)}
                    className="w-4 h-4 rounded accent-sunset-500" />
                </label>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50/50 dark:bg-warm-800/30">
                <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{t_("Settings", "Mipangilio")}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] text-warm-400">{t_("Access", "Fikia")}</span>
                  <input type="checkbox" checked={data.permAccessSettings} onChange={(e) => updateField("permAccessSettings", e.target.checked)}
                    className="w-4 h-4 rounded accent-red-500" />
                </label>
              </div>
            </div>

            {/* Security Level */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <span className="text-xs text-warm-500">{t_("Security Level", "Kiwango cha Usalama")}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                securityLevel === "Low" ? "bg-forest-100 dark:bg-forest-900/30 text-forest-600" :
                securityLevel === "Medium" ? "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600" :
                "bg-red-100 dark:bg-red-900/30 text-red-600"
              }`}>{t_(securityLevel, securityLevel === "Low" ? "Chini" : securityLevel === "Medium" ? "Wastani" : "Juu")}</span>
            </div>

            {/* Generated Credentials */}
            {credentials && (
              <div className="rounded-xl border border-forest-200/60 dark:border-forest-700/30 bg-forest-50/50 dark:bg-forest-900/10 p-3">
                <p className="text-xs font-medium text-forest-700 dark:text-forest-400 mb-2">{t_("Generated Login", "Ingia Iliyotengenezwa")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-warm-400 mb-0.5">{t_("Username", "Jina la Mtumiaji")}</p>
                    <p className="text-sm font-mono font-bold text-warm-900 dark:text-warm-50">{credentials.username}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-400 mb-0.5">{t_("Password", "Nenosiri")}</p>
                    <p className="text-sm font-mono font-bold text-warm-900 dark:text-warm-50">{credentials.password}</p>
                  </div>
                </div>
              </div>
            )}
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
              className="flex-1 min-w-0">{isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Employee", "Hifadhi Mfanyakazi")}</Button>
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={handleClose} disabled={isSubmitting}>{t_("Cancel", "Ghairi")}</Button>
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}
              iconLeft={!isSubmitting ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> : undefined}>
              {isSubmitting ? t_("Saving...", "Inahifadhi...") : t_("Save Employee", "Hifadhi")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
   FORM SECTION COMPONENT
   ============================================ */

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-warm-100/60 dark:border-warm-800/60 bg-warm-50/50 dark:bg-warm-800/30">
        <span className="text-savanna-600">{icon}</span>
        <h3 className="text-xs font-heading font-bold text-warm-700 dark:text-warm-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}
