"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormValues } from "@/lib/inventoryValidations";
import { KENYAN_CATEGORIES } from "@/data/sampleData";
import { type Product } from "@/data/inventoryData";
import { useLocale } from "@/providers/LocaleProvider";
import { dt } from "@/lib/dashboardTranslations";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";

interface SupplierOption {
  id: string;
  name: string;
  phone?: string;
}

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (data: ProductFormValues) => void;
  suppliers?: SupplierOption[];
}

const unitOptions = [
  { value: "pieces", label: "Pieces (Vipande)" },
  { value: "kg", label: "Kilograms (Kilo)" },
  { value: "liters", label: "Liters (Lita)" },
  { value: "boxes", label: "Boxes (Masanduku)" },
  { value: "bottles", label: "Bottles (Chupa)" },
  { value: "packs", label: "Packs (Pakiti)" },
];

type TabKey = "basic" | "pricing" | "stock" | "supplier";

const tabs: { key: TabKey; label: string; labelSw: string }[] = [
  { key: "basic", label: "Basic Info", labelSw: "Taarifa za Msingi" },
  { key: "pricing", label: "Pricing", labelSw: "Bei" },
  { key: "stock", label: "Stock", labelSw: "Hesabu" },
  { key: "supplier", label: "Supplier", labelSw: "Msambazaji" },
];

export default function AddEditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  suppliers = [],
}: AddEditProductModalProps) {
  const { locale } = useLocale();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as never,
    defaultValues: {
      name: "", nameSw: "", category: "", unit: "pieces",
      buyingPrice: 0, sellingPrice: 0, wholesalePrice: 0,
      quantity: 0, reorderPoint: 0,
      supplierId: "", warehouse: "", expiryDate: "", description: "",
    },
  });

  const buyingPrice = watch("buyingPrice");
  const sellingPrice = watch("sellingPrice");
  const margin = sellingPrice > 0 ? Math.round(((sellingPrice - buyingPrice) / sellingPrice) * 100) : 0;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name, nameSw: product.nameSw,
          category: product.category, unit: product.unit,
          buyingPrice: product.buyingPrice, sellingPrice: product.sellingPrice,
          wholesalePrice: product.wholesalePrice,
          quantity: product.quantity, reorderPoint: product.reorderPoint,
          supplierId: product.supplierId, warehouse: product.warehouse,
          expiryDate: product.expiryDate || "", description: product.description,
        });
      } else {
        reset({
          name: "", nameSw: "", category: "", unit: "pieces",
          buyingPrice: 0, sellingPrice: 0, wholesalePrice: 0,
          quantity: 0, reorderPoint: 0,
          supplierId: "", warehouse: "", expiryDate: "", description: "",
        });
      }
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [isOpen, product, reset]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = (data: ProductFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-3 sm:inset-auto sm:top-[5vh] sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg overflow-hidden"
            role="dialog" aria-modal="true" aria-label={product ? "Edit Product" : dt("addProduct", locale)}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60 flex-shrink-0">
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">
                {product ? "Edit Product" : dt("addProduct", locale)}
              </h2>
              <button onClick={onClose}
                className="p-2 rounded-xl text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={dt("cancel", locale)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex border-b border-warm-200/60 dark:border-warm-700/60 px-5 flex-shrink-0 overflow-x-auto">
                {tabs.map((tab) => (
                  <button key={tab.key} type="button" onClick={() => {
                    const el = document.getElementById(`tab-${tab.key}`);
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                    className="px-3 py-3 text-xs sm:text-sm font-medium text-warm-500 dark:text-warm-400 hover:text-terracotta-600 border-b-2 border-transparent hover:border-terracotta-300 transition-colors whitespace-nowrap min-h-[44px]">
                    {locale === "sw" ? tab.labelSw : tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <section id="tab-basic">
                  <h3 className="font-heading font-bold text-sm text-warm-700 dark:text-warm-300 mb-3">
                    {locale === "sw" ? "Taarifa za Msingi" : "Basic Information"}
                  </h3>
                  <div className="space-y-3">
                    <FloatingInput {...register("name")} ref={(e) => { register("name").ref(e); (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e; }}
                      label={dt("productName", locale)} type="text" error={errors.name?.message} />
                    <FloatingInput {...register("nameSw")} label="Swahili Name" type="text" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">{dt("category", locale)}</label>
                        <select {...register("category")} className={`w-full rounded-xl border-2 bg-white/80 dark:bg-warm-800/80 py-3 px-4 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px] ${errors.category ? "border-red-400" : "border-warm-200 dark:border-warm-600"}`}>
                          <option value="">-- {dt("category", locale)} --</option>
                          {KENYAN_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{locale === "sw" ? c.labelSw : c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">Unit</label>
                        <select {...register("unit")} className="w-full rounded-xl border-2 border-warm-200 dark:border-warm-600 bg-white/80 dark:bg-warm-800/80 py-3 px-4 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px]">
                          {unitOptions.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <FloatingInput {...register("description")} label="Description" type="text" />
                  </div>
                </section>

                <section id="tab-pricing">
                  <h3 className="font-heading font-bold text-sm text-warm-700 dark:text-warm-300 mb-3">
                    {locale === "sw" ? "Bei" : "Pricing (KSh)"}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <FloatingInput {...register("buyingPrice")} label={dt("buyingPrice", locale)} type="number" error={errors.buyingPrice?.message} />
                    <FloatingInput {...register("sellingPrice")} label={dt("sellingPrice", locale)} type="number" error={errors.sellingPrice?.message} />
                    <FloatingInput {...register("wholesalePrice")} label="Wholesale (KSh)" type="number" />
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${margin < 20 ? "bg-red-100 dark:bg-red-900/20 text-red-600" : margin < 30 ? "bg-savanna-100 dark:bg-savanna-900/20 text-savanna-700" : "bg-forest-100 dark:bg-forest-900/20 text-forest-600"}`}>
                    Profit Margin: {margin}%
                    {margin < 20 && <span className="text-red-500">(Low!)</span>}
                  </div>
                </section>

                <section id="tab-stock">
                  <h3 className="font-heading font-bold text-sm text-warm-700 dark:text-warm-300 mb-3">
                    {locale === "sw" ? "Hesabu" : "Stock Management"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FloatingInput {...register("quantity")} label={dt("quantity", locale)} type="number" error={errors.quantity?.message} />
                    <FloatingInput {...register("reorderPoint")} label="Reorder Point" type="number" />
                    <FloatingInput {...register("warehouse")} label="Warehouse/Shelf" type="text" />
                    <FloatingInput {...register("expiryDate")} label="Expiry Date" type="date" />
                  </div>
                </section>

                <section id="tab-supplier">
                  <h3 className="font-heading font-bold text-sm text-warm-700 dark:text-warm-300 mb-3">
                    {locale === "sw" ? "Msambazaji" : "Supplier"}
                  </h3>
                  <div>
                    <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">{dt("supplier", locale)}</label>
                    <select {...register("supplierId")} className="w-full rounded-xl border-2 border-warm-200 dark:border-warm-600 bg-white/80 dark:bg-warm-800/80 py-3 px-4 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px]">
                      <option value="">-- {dt("supplier", locale)} --</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>)}
                    </select>
                  </div>
                </section>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-warm-200/60 dark:border-warm-700/60 flex-shrink-0">
                <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1">
                  {dt("cancel", locale)}
                </Button>
                <Button type="submit" size="md" isLoading={isSubmitting} className="flex-1">
                  {dt("save", locale)}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
