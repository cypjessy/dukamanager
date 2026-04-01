"use client";

import { useState, useCallback } from "react";
import type { DocCategory } from "@/data/documentData";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx"];

export interface UploadedFile {
  file: File;
  preview: string | null;
  progress: number;
  speed: string;
  status: "pending" | "uploading" | "complete" | "error";
  error: string | null;
}

export interface OcrResult {
  text: string;
  fields: Record<string, string>;
  confidence: number;
}

export function useDocumentUpload() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File): { valid: boolean; error: string | null } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.` };
    }
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `File type ${ext} not supported. Use PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.` };
    }
    return { valid: true, error: null };
  }, []);

  const processFile = useCallback((file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        const result: UploadedFile = { file, preview: null, progress: 0, speed: "", status: "error", error: validation.error };
        setUploadedFile(result);
        resolve(result);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const uf: UploadedFile = { file, preview: null, progress: 0, speed: "0 KB/s", status: "uploading", error: null };

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uf.preview = e.target?.result as string;
          setUploadedFile({ ...uf });
        };
        reader.readAsDataURL(file);
      }

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          uf.progress = 100;
          uf.speed = "Complete";
          uf.status = "complete";
          setUploadedFile({ ...uf });
          resolve(uf);
        } else {
          const speed = Math.floor(Math.random() * 500 + 200);
          uf.progress = Math.round(progress);
          uf.speed = `${speed} KB/s`;
          setUploadedFile({ ...uf });
        }
      }, 200);
    });
  }, [validateFile]);

  const simulateOcr = useCallback(async (): Promise<OcrResult> => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const result: OcrResult = {
      text: "Extracted text from document...",
      fields: {
        "Document Number": "P051234567A",
        "Name": "DUKA SHOP LIMITED",
        "Date Issued": "2024-01-15",
        "Expiry Date": "2026-12-31",
      },
      confidence: Math.round(75 + Math.random() * 20),
    };

    setOcrResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  const detectCategory = useCallback((filename: string): DocCategory => {
    const lower = filename.toLowerCase();
    if (lower.includes("kra") || lower.includes("tax") || lower.includes("itax")) return "tax";
    if (lower.includes("license") || lower.includes("permit") || lower.includes("certificate")) return "licenses";
    if (lower.includes("contract") || lower.includes("mkataba")) return "contracts";
    if (lower.includes("employee") || lower.includes("staff") || lower.includes("payslip")) return "employee";
    if (lower.includes("invoice") || lower.includes("receipt") || lower.includes("bank") || lower.includes("mpesa")) return "financial";
    if (lower.includes("insurance") || lower.includes("bima")) return "insurance";
    if (lower.includes("lease") || lower.includes("rent") || lower.includes("kodisha")) return "lease";
    return "other";
  }, []);

  const detectDuplicates = useCallback((docNumber: string, existingDocs: { name: string; tags: string[] }[]): boolean => {
    if (!docNumber) return false;
    return existingDocs.some(
      (d) => d.name.toLowerCase().includes(docNumber.toLowerCase()) || d.tags.some((t) => t.toLowerCase() === docNumber.toLowerCase())
    );
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setOcrResult(null);
  }, []);

  return {
    uploadedFile,
    ocrResult,
    isProcessing,
    processFile,
    simulateOcr,
    detectCategory,
    detectDuplicates,
    removeFile,
    validateFile,
  };
}
