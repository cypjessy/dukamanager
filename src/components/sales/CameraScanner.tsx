"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/types";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  locale: Locale;
}

export default function CameraScanner({ isOpen, onClose, onScan, locale }: CameraScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<{ clear: () => void | Promise<void> } | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    setError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerRef.current.id);
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          const now = Date.now();
          if (lastScanRef.current?.code === decodedText && now - lastScanRef.current.time < 2000) return;
          lastScanRef.current = { code: decodedText, time: now };
          onScan(decodedText);
        },
        () => {}
      );
    } catch {
      setError(locale === "sw" ? "Hakuna kamera iliyopatikana" : "No camera available");
      setScanning(false);
    }
  }, [onScan, locale]);

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.clear();
      } catch {
        // ignore
      }
      html5QrRef.current = null;
    }
    setScanning(false);
    setTorchOn(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  const toggleTorch = useCallback(async () => {
    if (!html5QrRef.current) return;
    try {
      const scanner = html5QrRef.current as unknown as {
        applyVideoConstraints?: (constraints: { torch?: boolean }) => Promise<void>;
      };
      if (scanner.applyVideoConstraints) {
        await scanner.applyVideoConstraints({ torch: !torchOn });
        setTorchOn(!torchOn);
      }
    } catch {
      // Torch not supported
    }
  }, [torchOn]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "sw" ? "Skana Barcode" : "Scan Barcode"}
          >
            <div className="flex items-center justify-between p-4 bg-black/50">
              <h2 className="text-white font-heading font-bold text-lg">
                {locale === "sw" ? "Skana Barcode" : "Scan Barcode"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    torchOn ? "bg-savanna-500 text-white" : "bg-white/20 text-white"
                  }`}
                  aria-label={locale === "sw" ? "Washa tochi" : "Toggle torch"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18h6" /><path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={locale === "sw" ? "Funga" : "Close"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black">
              {error ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">{error}</p>
                  <button onClick={startScanner} className="px-4 py-2 rounded-xl bg-terracotta-500 text-white text-sm font-bold min-h-[44px]">
                    {locale === "sw" ? "Jaribu Tena" : "Retry"}
                  </button>
                </div>
              ) : (
                <>
                  <div
                    id="camera-scanner-region"
                    ref={scannerRef}
                    className="w-full max-w-md aspect-[4/3]"
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-40 border-2 border-terracotta-500 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-terracotta-500 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-terracotta-500 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-terracotta-500 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-terracotta-500 rounded-br-lg" />
                        <motion.div
                          animate={{ y: [0, 120, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-2 left-4 right-4 h-0.5 bg-terracotta-500/80"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-black/50 safe-area-bottom">
              <p className="text-center text-white/70 text-sm">
                {locale === "sw"
                  ? "Weka barcode mbele ya kamera"
                  : "Point camera at barcode"}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
