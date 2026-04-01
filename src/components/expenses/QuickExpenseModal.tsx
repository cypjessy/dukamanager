"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/expenseValidations";
import { categoryConfig } from "@/data/expenseData";
import type { Locale } from "@/types";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: ExpenseFormValues) => void;
}

const categories = Object.entries(categoryConfig);

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa", icon: "📲" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "bank", label: "Bank Transfer", icon: "🏦" },
  { value: "mobile_banking", label: "Mobile Banking", icon: "📱" },
];

export default function QuickExpenseModal({ isOpen, onClose, locale, onSave }: QuickExpenseModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as never,
    defaultValues: {
      description: "", category: "", amount: 0, paymentMethod: "mpesa",
      date: new Date().toISOString().slice(0, 10), type: "business",
      reference: "", notes: "", isRecurring: false, recurrenceFrequency: "",
    },
  });

  const isRecurring = watch("isRecurring");

  useEffect(() => {
    if (isOpen) {
      reset({
        description: "", category: "", amount: 0, paymentMethod: "mpesa",
        date: new Date().toISOString().slice(0, 10), type: "business",
        reference: "", notes: "", isRecurring: false, recurrenceFrequency: "",
      });
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = (data: ExpenseFormValues) => { onSave(data); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-3 sm:inset-auto sm:top-[5vh] sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg"
            role="dialog" aria-modal="true" aria-label={locale === "sw" ? "Rekodi Gharama" : "Record Expense"}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-sm rounded-t-3xl">
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{locale === "sw" ? "Rekodi Gharama" : "Record Expense"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="business" {...register("type")} className="accent-terracotta-500" defaultChecked />
                  <span className="text-warm-700 dark:text-warm-300">{locale === "sw" ? "Biashara" : "Business"}</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="personal" {...register("type")} className="accent-terracotta-500" />
                  <span className="text-warm-700 dark:text-warm-300">{locale === "sw" ? "Binafsi" : "Personal"}</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Aina ya Gharama" : "Category"}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {categories.map(([key, config]) => (
                    <label key={key} className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer border-2 transition-all text-center min-h-[56px] justify-center ${watch("category") === key ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20" : "border-transparent bg-warm-50 dark:bg-warm-800/50 hover:bg-warm-100 dark:hover:bg-warm-800"}`}>
                      <input type="radio" value={key} {...register("category")} className="sr-only" />
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-[9px] text-warm-600 dark:text-warm-300 leading-tight">{config.label}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              <FloatingInput
                {...register("amount")}
                ref={(e) => { register("amount").ref(e); (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e; }}
                label={locale === "sw" ? "Kiasi (KSh)" : "Amount (KSh)"}
                type="number"
                error={errors.amount?.message}
              />
              <FloatingInput {...register("description")} label={locale === "sw" ? "Maelezo" : "Description"} type="text" error={errors.description?.message} />

              <div>
                <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 block">{locale === "sw" ? "Njia ya Malipo" : "Payment Method"}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {paymentMethods.map((m) => (
                    <label key={m.value} className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer border-2 transition-all min-h-[52px] justify-center ${watch("paymentMethod") === m.value ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/20" : "border-transparent bg-warm-50 dark:bg-warm-800/50"}`}>
                      <input type="radio" value={m.value} {...register("paymentMethod")} className="sr-only" />
                      <span className="text-base">{m.icon}</span>
                      <span className="text-[9px] text-warm-600 dark:text-warm-300">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">Date</label>
                  <input type="date" {...register("date")} className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 min-h-[48px]" />
                </div>
                <FloatingInput {...register("reference")} label="Reference" type="text" />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px]">
                <input type="checkbox" {...register("isRecurring")} className="rounded accent-terracotta-500" />
                <span className="text-sm text-warm-700 dark:text-warm-300">{locale === "sw" ? "Gharama ya Mara kwa Mara" : "Recurring Expense"}</span>
              </label>

              {isRecurring && (
                <div>
                  <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">Frequency</label>
                  <select {...register("recurrenceFrequency")} className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px]">
                    <option value="">-- Select --</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 border-2 border-dashed border-warm-300 dark:border-warm-600 text-center cursor-pointer hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-h-[56px] flex flex-col items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 mb-1">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs text-warm-500">{locale === "sw" ? "Pakia Risiti" : "Upload Receipt"}</span>
                <input type="file" className="hidden" accept="image/*" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1">{locale === "sw" ? "Ghairi" : "Cancel"}</Button>
                <Button type="submit" size="md" isLoading={isSubmitting} className="flex-1">{locale === "sw" ? "Hifadhi" : "Save Expense"}</Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
