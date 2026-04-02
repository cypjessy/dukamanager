"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Locale } from "@/types";
import { dt } from "@/lib/dashboardTranslations";
import { KENYAN_CATEGORIES } from "@/data/sampleData";
import { useSuppliersFirestore } from "@/hooks/useSuppliersFirestore";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";

interface QuickAddProductProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

const productSchema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0, "Must be 0 or more"),
  buyingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  supplier: z.string().optional(),
});

interface ProductFormValues {
  name: string;
  category: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  supplier?: string;
}

export default function QuickAddProduct({
  isOpen,
  onClose,
  locale,
}: QuickAddProductProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  const { suppliers } = useSuppliersFirestore();

  const filteredSuppliers = suppliers.filter((s) =>
    s.isActive && s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: "",
      category: "",
      quantity: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      supplier: "",
    },
  });

  const watchSupplier = watch("supplier");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      reset();
      setIsSuccess(false);
      setShowSupplierDropdown(false);
      setSupplierSearch("");
    }
  }, [isOpen, reset]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target as Node)) {
        setShowSupplierDropdown(false);
        setSupplierSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = useCallback(
    async (_data: ProductFormValues) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 1200));
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg"
            role="dialog"
            aria-modal="true"
            aria-label={dt("addProduct", locale)}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60 bg-white/80 dark:bg-warm-900/80 backdrop-blur-sm rounded-t-3xl">
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                {dt("addProduct", locale)}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={dt("cancel", locale)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-warm-300 dark:border-warm-600 rounded-2xl cursor-pointer hover:border-terracotta-400 dark:hover:border-terracotta-500 hover:bg-terracotta-50/30 dark:hover:bg-terracotta-900/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 mb-1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-xs text-warm-500 dark:text-warm-400 font-medium">
                      {dt("uploadImage", locale)}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              <FloatingInput
                {...register("name")}
                  ref={(e) => {
                    register("name").ref(e);
                    (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                  }}
                label={dt("productName", locale)}
                type="text"
                error={errors.name?.message}
              />

              <div className="relative">
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5 ml-1">
                  {dt("category", locale)}
                </label>
                <select
                  {...register("category")}
                  className={`w-full rounded-xl border-2 bg-white/80 dark:bg-warm-800/80 backdrop-blur-sm py-3.5 px-4 text-sm text-warm-900 dark:text-warm-100 transition-all duration-200 outline-none appearance-none min-h-[48px] ${
                    errors.category
                      ? "border-red-400"
                      : "border-warm-200 dark:border-warm-600 focus:border-terracotta-500"
                  }`}
                >
                  <option value="">-- {dt("category", locale)} --</option>
                  {KENYAN_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {locale === "sw" ? cat.labelSw : cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  {...register("quantity")}
                  label={dt("quantity", locale)}
                  type="number"
                  error={errors.quantity?.message}
                />
                <FloatingInput
                  {...register("buyingPrice")}
                  label={dt("buyingPrice", locale)}
                  type="number"
                  error={errors.buyingPrice?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  {...register("sellingPrice")}
                  label={dt("sellingPrice", locale)}
                  type="number"
                  error={errors.sellingPrice?.message}
                />
                <div className="relative" ref={supplierDropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setShowSupplierDropdown(!showSupplierDropdown); setSupplierSearch(""); }}
                    className={`w-full rounded-xl border-2 bg-white/80 dark:bg-warm-800/80 backdrop-blur-sm py-3.5 px-4 text-sm transition-all duration-200 outline-none min-h-[48px] text-left flex items-center justify-between gap-2 ${
                      errors.supplier
                        ? "border-red-400"
                        : "border-warm-200 dark:border-warm-600 focus:border-terracotta-500"
                    }`}
                  >
                    <span className={`truncate ${!watchSupplier ? "text-warm-400" : "text-warm-900 dark:text-warm-100"}`}>
                      {watchSupplier || dt("supplier", locale)}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-warm-400">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showSupplierDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 shadow-xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-warm-100 dark:border-warm-700">
                          <div className="relative">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400">
                              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                              type="text"
                              value={supplierSearch}
                              onChange={(e) => setSupplierSearch(e.target.value)}
                              placeholder="Search supplier..."
                              className="w-full pl-8 pr-3 py-2 rounded-lg bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 text-sm outline-none focus:border-terracotta-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => { setValue("supplier", ""); setShowSupplierDropdown(false); setSupplierSearch(""); }}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors min-h-[40px]"
                          >
                            <span className="text-warm-400">None / Walk-in</span>
                          </button>
                          {filteredSuppliers.length === 0 && (
                            <p className="px-3 py-4 text-xs text-warm-400 text-center">No suppliers found</p>
                          )}
                          {filteredSuppliers.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => { setValue("supplier", s.name); setShowSupplierDropdown(false); setSupplierSearch(""); }}
                              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors min-h-[40px] ${
                                watchSupplier === s.name ? "bg-terracotta-50 dark:bg-terracotta-900/20" : ""
                              }`}
                            >
                              <p className="font-medium text-warm-900 dark:text-warm-50 truncate">{s.name}</p>
                              <p className="text-[10px] text-warm-400">{s.phone}{s.location ? ` · ${s.location}` : ""}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="flex-1"
                >
                  {dt("cancel", locale)}
                </Button>
                <Button
                  type="submit"
                  size="md"
                  isLoading={isSubmitting}
                  isSuccess={isSuccess}
                  className="flex-1"
                >
                  {isSuccess ? "✓" : dt("save", locale)}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
