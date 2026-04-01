"use client";

import { useState, useCallback, useRef } from "react";
import { uploadToBunny, type BunnyUploadResult } from "@/lib/bunny";

interface UseBunnyUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  result: BunnyUploadResult | null;
  upload: (file: File, folder?: string) => Promise<BunnyUploadResult | null>;
  reset: () => void;
}

export function useBunnyUpload(shopId?: string): UseBunnyUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BunnyUploadResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File, folder = "general"): Promise<BunnyUploadResult | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    abortRef.current = new AbortController();

    try {
      const res = await uploadToBunny({
        file,
        folder,
        shopId,
        onProgress: setProgress,
        signal: abortRef.current.signal,
      });
      setResult(res);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      return null;
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  }, [shopId]);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { uploading, progress, error, result, upload, reset };
}
