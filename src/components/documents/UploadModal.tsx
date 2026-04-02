"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categoryConfig } from "@/data/documentData";
import type { Locale } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onUploaded?: () => void;
}

const uploadSchema = z.object({
  name: z.string().min(2, "Name required"),
  category: z.string().min(1, "Select category"),
  description: z.string().optional(),
  expiryDate: z.string().optional(),
  tags: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const categories = Object.entries(categoryConfig);

export default function UploadModal({ isOpen, onClose, locale, onUploaded }: UploadModalProps) {
  const { shopId } = useAuth();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema) as never,
    defaultValues: { name: "", category: "", description: "", expiryDate: "", tags: "" },
  });

  const _categoryName = watch("category");

  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedFiles([]);
      setUploadProgress(0);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    setSelectedFiles(valid);
    if (valid.length > 0 && !watch("name")) {
      setValue("name", valid[0].name.replace(/\.[^.]+$/, ""));
    }
  }, [setValue, watch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const onSubmit = useCallback(async (data: UploadFormValues) => {
    if (!shopId) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const { uploadToBunny } = await import("@/lib/bunny");
      const { db } = await import("@/lib/firebase/config");
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");

      const tagsArr = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

      for (const file of selectedFiles) {
        const result = await uploadToBunny({ file, folder: data.category || "documents", shopId: shopId || undefined });
        setUploadProgress(Math.round(((selectedFiles.indexOf(file) + 1) / selectedFiles.length) * 100));

        const fileType = result.contentType.includes("pdf") ? "pdf"
          : result.contentType.includes("image") ? "image"
          : result.contentType.includes("spreadsheet") || result.contentType.includes("excel") ? "xls"
          : "doc";
        const fileSize = result.size > 1024 * 1024
          ? `${(result.size / (1024 * 1024)).toFixed(1)}MB`
          : `${(result.size / 1024).toFixed(0)}KB`;

        await addDoc(collection(db, "shops", shopId, "documents"), {
          name: selectedFiles.length > 1 ? file.name.replace(/\.[^.]+$/, "") : data.name,
          description: data.description || "",
          category: data.category,
          fileType,
          fileSize,
          uploadDate: new Date().toISOString().slice(0, 10),
          expiryDate: data.expiryDate || null,
          renewalDate: data.expiryDate ? new Date(new Date(data.expiryDate).getTime() - 30 * 86400000).toISOString().slice(0, 10) : null,
          tags: tagsArr,
          folderId: data.category,
          version: 1,
          linkedTo: "",
          uploadedBy: "Staff",
          fileUrl: result.cdnUrl,
          documentNumber: "",
          issuingAuthority: "",
          accessLevel: "private",
          reminderEnabled: false,
          reminderDays: 30,
          createdAt: serverTimestamp(),
        });
      }

      onUploaded?.();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [shopId, selectedFiles, onUploaded, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-3 sm:inset-auto sm:top-[5vh] sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-xl shadow-glass-lg"
            role="dialog" aria-modal="true" aria-label={locale === "sw" ? "Pakia Hati" : "Upload Document"}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-warm-200/60 dark:border-warm-700/60 bg-white/90 dark:bg-warm-900/90 backdrop-blur-sm rounded-t-3xl">
              <h2 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">{locale === "sw" ? "Pakia Hati" : "Upload Document"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="rounded-xl border-2 border-dashed border-warm-300 dark:border-warm-600 p-6 text-center cursor-pointer hover:border-terracotta-400 transition-colors"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warm-400 mx-auto mb-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm font-medium text-warm-700 dark:text-warm-300">{locale === "sw" ? "Bofya au Buruta Hati" : "Click or Drag Document Here"}</p>
                <p className="text-xs text-warm-400 mt-1">PDF, Images, Word, Excel up to 10MB</p>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {selectedFiles.map((f, i) => (
                      <p key={i} className="text-xs text-terracotta-500 font-medium truncate">{f.name} ({(f.size / 1024).toFixed(0)}KB)</p>
                    ))}
                  </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" multiple
                  onChange={(e) => handleFileSelect(e.target.files)} />
              </div>

              <FloatingInput {...register("name")} ref={(e) => { register("name").ref(e); (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e; }}
                label={locale === "sw" ? "Jina la Hati" : "Document Name"} type="text" error={errors.name?.message} />

              <div>
                <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">{locale === "sw" ? "Aina" : "Category"}</label>
                <select {...register("category")} className={`w-full rounded-xl border-2 bg-white/80 dark:bg-warm-800/80 py-3 px-4 text-sm text-warm-900 dark:text-warm-100 outline-none appearance-none min-h-[48px] ${errors.category ? "border-red-400" : "border-warm-200 dark:border-warm-600"}`}>
                  <option value="">-- {locale === "sw" ? "Chagua" : "Select"} --</option>
                  {categories.map(([key, config]) => <option key={key} value={key}>{config.icon} {config.label}</option>)}
                </select>
              </div>

              <FloatingInput {...register("expiryDate")} label={locale === "sw" ? "Tarehe ya Mwisho (au Acha Tupu)" : "Expiry Date (optional)"} type="date" />
              <FloatingInput {...register("tags")} label={locale === "sw" ? "Lebo (tenganisha kwa koma)" : "Tags (comma separated)"} type="text" />
              <FloatingInput {...register("description")} label={locale === "sw" ? "Maelezo" : "Description"} type="text" />

              {uploading && (
                <div className="w-full h-2 bg-warm-100 dark:bg-warm-800 rounded-full overflow-hidden">
                  <div className="h-full bg-terracotta-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1" disabled={uploading}>{locale === "sw" ? "Ghairi" : "Cancel"}</Button>
                <Button type="submit" size="md" isLoading={isSubmitting || uploading} className="flex-1" disabled={uploading || selectedFiles.length === 0}>
                  {locale === "sw" ? "Pakia" : "Upload"} {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
