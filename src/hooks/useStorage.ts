"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface UploadResult {
  url: string;
  fileName: string;
  safeName: string;
  size: number;
  type: string;
  category: string;
  path: string;
  shopId: string | null;
}

export type FileCategory = "documents" | "receipts" | "products" | "logos" | "profiles" | "returns" | "reports" | "backups";

export function useStorage() {
  const { shopId } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (
    file: File,
    category: FileCategory = "documents"
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (shopId) formData.append("shopId", shopId);
      formData.append("category", category);

      // Simulate progress (actual progress not available with fetch)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const result: UploadResult = await res.json();
      setProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [shopId]);

  const uploadMultiple = useCallback(async (
    files: File[],
    category: FileCategory = "documents"
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await upload(file, category);
      if (result) results.push(result);
    }
    return results;
  }, [upload]);

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return { upload, uploadMultiple, deleteFile, uploading, progress, error };
}
