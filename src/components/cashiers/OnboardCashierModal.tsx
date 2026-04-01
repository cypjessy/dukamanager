"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CashierPermissions } from "@/hooks/useCashierMonitoring";

interface OnboardCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  locale: string;
  defaultPermissions?: CashierPermissions;
}

const step1Schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  nationalId: z.string().min(6, "National ID must be at least 6 characters"),
});

const step2Schema = z.object({
  role: z.enum(["cashier", "head_cashier", "trainee"]),
  pin: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN must be at most 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  deviceName: z.string().optional(),
});

const step3Schema = z.object({
  processSales: z.boolean(),
  applyDiscounts: z.boolean(),
  maxDiscountPercent: z.number().min(0).max(100),
  handleRefunds: z.boolean(),
  viewReports: z.boolean(),
  manageInventory: z.boolean(),
  openCloseRegister: z.boolean(),
  voidTransactions: z.boolean(),
});

export function OnboardCashierModal({ isOpen, onClose, onSubmit, locale, defaultPermissions }: OnboardCashierModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { displayName: "", email: "", phone: "", nationalId: "" },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { role: "cashier" as const, pin: "", password: "", deviceName: "" },
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      processSales: true,
      applyDiscounts: true,
      maxDiscountPercent: defaultPermissions?.maxDiscountPercent ?? 10,
      handleRefunds: false,
      viewReports: false,
      manageInventory: false,
      openCloseRegister: true,
      voidTransactions: false,
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSuccess(false);
      step1Form.reset();
      step2Form.reset();
      step3Form.reset();
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (step === 1) {
      const valid = await step1Form.trigger();
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await step2Form.trigger();
      if (valid) setStep(3);
    }
  };

  const handleSubmit = async () => {
    const valid = await step3Form.trigger();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();

      await onSubmit({
        ...step1Data,
        ...step2Data,
        permissions: step3Data,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to onboard cashier:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%", scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{ backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-warm-200/40 dark:border-warm-700/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                    {t("Onboard New Cashier", "Sajili Mhasibu Mpya")}
                  </h2>
                  <p className="text-xs text-warm-500 dark:text-warm-400">
                    {t("Step", "Hatua")} {step} {t("of", "ya")} 3
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        s <= step ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"
                      }`}
                    />
                    {s < 3 && <div className={`w-2 h-2 rounded-full ${s < step ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-warm-900 dark:text-warm-50 mb-2">
                      {t("Cashier Onboarded!", "Mhasibu Amesajiliwa!")}
                    </h3>
                    <p className="text-sm text-warm-500 dark:text-warm-400">
                      {t("The cashier account has been created successfully.", "Akaunti ya mhasibu imesajiliwa kwa mafanikio.")}
                    </p>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                        {t("Full Name", "Jina Kamili")} *
                      </label>
                      <input
                        {...step1Form.register("displayName")}
                        type="text"
                        placeholder="e.g. John Mwangi"
                        className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                      />
                      {step1Form.formState.errors.displayName && (
                        <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.displayName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                        {t("Email Address", "Barua Pepe")} *
                      </label>
                      <input
                        {...step1Form.register("email")}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                      />
                      {step1Form.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                          {t("Phone Number", "Nambari ya Simu")} *
                        </label>
                        <input
                          {...step1Form.register("phone")}
                          type="tel"
                          placeholder="+254 712 345 678"
                          className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                        />
                        {step1Form.formState.errors.phone && (
                          <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                          {t("National ID", "Kitambulisho")} *
                        </label>
                        <input
                          {...step1Form.register("nationalId")}
                          type="text"
                          placeholder="12345678"
                          className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                        />
                        {step1Form.formState.errors.nationalId && (
                          <p className="text-xs text-red-500 mt-1">{step1Form.formState.errors.nationalId.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : step === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                        {t("Role", "Wajibu")} *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "trainee", label: t("Trainee", "Mwanafunzi"), icon: "🎓" },
                          { value: "cashier", label: t("Cashier", "Mhasibu"), icon: "💰" },
                          { value: "head_cashier", label: t("Head Cashier", "Kiongozi"), icon: "👑" },
                        ].map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => step2Form.setValue("role", role.value as "cashier" | "head_cashier" | "trainee")}
                            className={`p-3 rounded-xl border-2 text-center transition-all min-h-[48px] ${
                              step2Form.watch("role") === role.value
                                ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20"
                                : "border-warm-200/60 dark:border-warm-700/60 hover:border-warm-300 dark:hover:border-warm-600"
                            }`}
                          >
                            <span className="text-lg">{role.icon}</span>
                            <p className="text-xs font-semibold text-warm-900 dark:text-warm-50 mt-1">{role.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                          {t("Portal PIN", "PIN ya Portal")} *
                        </label>
                        <input
                          {...step2Form.register("pin")}
                          type="password"
                          placeholder="4-6 digits"
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                        />
                        {step2Form.formState.errors.pin && (
                          <p className="text-xs text-red-500 mt-1">{step2Form.formState.errors.pin.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                          {t("Password", "Nenosiri")} *
                        </label>
                        <input
                          {...step2Form.register("password")}
                          type="password"
                          placeholder="Min 6 characters"
                          className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                        />
                        {step2Form.formState.errors.password && (
                          <p className="text-xs text-red-500 mt-1">{step2Form.formState.errors.password.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                        {t("Assigned Device (Optional)", "Kifaa (Hiari)")}
                      </label>
                      <input
                        {...step2Form.register("deviceName")}
                        type="text"
                        placeholder="e.g. POS-Terminal-01"
                        className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <p className="text-xs font-semibold text-warm-700 dark:text-warm-300 mb-3 uppercase tracking-wide">
                      {t("Portal Permissions", "Ruhusa za Portal")}
                    </p>
                    {[
                      { key: "processSales", label: t("Process Sales", "Chakata Mauzo"), desc: t("Allow processing sales transactions", "Ruhusu kuchakata mauzo") },
                      { key: "applyDiscounts", label: t("Apply Discounts", "Ruhusa Punguzo"), desc: t("Allow applying discounts at checkout", "Ruhusa kupunguza bei") },
                      { key: "handleRefunds", label: t("Handle Refunds", "Rudisha Pesa"), desc: t("Allow processing refunds", "Ruhusa kurudisha pesa") },
                      { key: "viewReports", label: t("View Reports", "Angalia Ripoti"), desc: t("Allow viewing sales reports", "Ruhusa kuona ripoti") },
                      { key: "manageInventory", label: t("Manage Inventory", "Simamia Bidhaa"), desc: t("Allow stock adjustments", "Ruhusa kurekebisha stoo") },
                      { key: "openCloseRegister", label: t("Open/Close Register", "Funga/Fungua Kasha"), desc: t("Allow register management", "Ruhusa kusimamia kasha") },
                      { key: "voidTransactions", label: t("Void Transactions", "Ghairi Muamala"), desc: t("Allow voiding transactions", "Ruhusa kughairi muamala") },
                    ].map((perm) => (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-warm-50/60 dark:bg-warm-800/30"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-warm-900 dark:text-warm-50">{perm.label}</p>
                          <p className="text-[10px] text-warm-500 dark:text-warm-400">{perm.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px] justify-end">
                          <input
                            type="checkbox"
                            {...step3Form.register(perm.key as keyof typeof step3Schema.shape)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-warm-300 dark:bg-warm-600 peer-focus:ring-2 peer-focus:ring-terracotta-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta-500" />
                        </label>
                      </div>
                    ))}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wide">
                        {t("Max Discount %", "Punguzo Max %")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        {...step3Form.register("maxDiscountPercent", { valueAsNumber: true })}
                        className="w-24 px-4 py-3 rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-white/60 dark:bg-warm-800/40 text-sm text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-400 transition-all min-h-[48px]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-warm-200/40 dark:border-warm-700/40 bg-warm-50/40 dark:bg-warm-800/20">
                <button
                  onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800/50 transition-colors min-h-[44px]"
                >
                  {step > 1 ? t("Back", "Rudi") : t("Cancel", "Ghairi")}
                </button>
                <button
                  onClick={step === 3 ? handleSubmit : handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm shadow-lg shadow-terracotta-500/20 hover:shadow-xl hover:shadow-terracotta-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("Creating...", "Inasajili...")}
                    </>
                  ) : step === 3 ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t("Create Cashier", "Sajili Mhasibu")}
                    </>
                  ) : (
                    <>
                      {t("Next", "Endelea")}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
