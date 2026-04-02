"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { inventoryProducts } from "@/data/inventoryData";
import type { Product } from "@/data/inventoryData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (product: Product) => void;
}

type ScanMode = "camera" | "manual" | "hardware";
type ScanState = "idle" | "scanning" | "detected" | "looking_up" | "found" | "not_found";

export default function QRScanner({ isOpen, onClose, onScanResult }: QRScannerProps) {
  const [mode, setMode] = useState<ScanMode>("manual");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [manualCode, setManualCode] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; product: Product | null; time: string }>>([]);
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<{ clear: () => void | Promise<void> } | null>(null);
  const { isMobile } = useResponsiveDialog();

  const lookupProduct = useCallback((code: string): Product | null => {
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return inventoryProducts.find((p) =>
      p.sku.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(normalized) ||
      normalized.includes(p.sku.toUpperCase().replace(/[^A-Z0-9]/g, ""))
    ) || null;
  }, []);

  const handleScan = useCallback((code: string) => {
    setScanState("looking_up");
    setTimeout(() => {
      const product = lookupProduct(code);
      setFoundProduct(product);
      setScanHistory((prev) => [{ code, product, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
      setScanState(product ? "found" : "not_found");
      if (product) {
        setTimeout(() => {
          onScanResult(product);
          setManualCode("");
          setScanState("idle");
          setFoundProduct(null);
        }, 1500);
      }
    }, 500);
  }, [lookupProduct, onScanResult]);

  const handleManualSubmit = useCallback(() => {
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim());
  }, [manualCode, handleScan]);

  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  const startCameraScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    setCameraError(null);
    setScanState("scanning");

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
          handleScan(decodedText);
        },
        () => {}
      );
      setCameraPermission("granted");
      setMode("camera");
    } catch (err) {
      console.error("Camera scanner error:", err);
      setCameraError("Camera not available or permission denied");
      setCameraPermission("denied");
      setScanState("idle");
    }
  }, [handleScan]);

  const stopCameraScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.clear();
      } catch { /* ignore */ }
      html5QrRef.current = null;
    }
    setScanState("idle");
    setTorchOn(false);
  }, []);

  const handleCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((t) => t.stop());
      startCameraScanner();
    } catch {
      setCameraPermission("denied");
      setMode("manual");
    }
  }, [startCameraScanner]);

  useEffect(() => {
    if (isOpen && mode === "camera" && cameraPermission === "granted") {
      startCameraScanner();
    }
    return () => { stopCameraScanner(); };
  }, [isOpen, mode, cameraPermission, startCameraScanner, stopCameraScanner]);

  // Hardware scanner keyboard listener
  useEffect(() => {
    if (!isOpen || mode !== "hardware") return;
    let buffer = "";
    let timeout: NodeJS.Timeout;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && buffer.length > 3) {
        handleScan(buffer);
        buffer = "";
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { buffer = ""; }, 200);
      }
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); clearTimeout(timeout); };
  }, [isOpen, mode, handleScan]);

  useEffect(() => {
    if (isOpen && mode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {isMobile ? (
            <motion.div key="scanner-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", borderRadius: "24px 24px 0 0" }}
              className="z-50 bg-white flex flex-col overflow-hidden">
                <ScannerContent mode={mode} setMode={setMode} scanState={scanState} setScanState={setScanState} manualCode={manualCode}
                setManualCode={setManualCode} foundProduct={foundProduct} setFoundProduct={setFoundProduct} scanHistory={scanHistory}
                cameraPermission={cameraPermission} cameraError={cameraError} torchOn={torchOn} setTorchOn={setTorchOn}
                inputRef={inputRef} onManualSubmit={handleManualSubmit}
                onCameraPermission={handleCameraPermission} onScanResult={onScanResult}
                onClose={onClose} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
              <motion.div key="scanner-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: "min(480px, calc(100vw - 32px))", maxHeight: "85vh" }}>
                <ScannerContent mode={mode} setMode={setMode} scanState={scanState} setScanState={setScanState} manualCode={manualCode}
                  setManualCode={setManualCode} foundProduct={foundProduct} setFoundProduct={setFoundProduct} scanHistory={scanHistory}
                  cameraPermission={cameraPermission} cameraError={cameraError} torchOn={torchOn} setTorchOn={setTorchOn}
                  inputRef={inputRef} onManualSubmit={handleManualSubmit}
                  onCameraPermission={handleCameraPermission} onScanResult={onScanResult}
                  onClose={onClose} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   SCANNER CONTENT
   ============================================ */

interface ScannerContentProps {
  mode: ScanMode;
  setMode: (m: ScanMode) => void;
  scanState: ScanState;
  setScanState: (s: ScanState) => void;
  manualCode: string;
  setManualCode: (v: string) => void;
  foundProduct: Product | null;
  setFoundProduct: (p: Product | null) => void;
  scanHistory: Array<{ code: string; product: Product | null; time: string }>;
  cameraPermission: "granted" | "denied" | "prompt";
  cameraError: string | null;
  torchOn: boolean;
  setTorchOn: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onManualSubmit: () => void;
  onCameraPermission: () => void;
  onScanResult: (p: Product) => void;
  onClose: () => void;
}

function ScannerContent(p: ScannerContentProps) {
  const { mode, setMode, scanState, setScanState, manualCode, setManualCode, foundProduct, setFoundProduct, scanHistory,
    cameraPermission, cameraError, torchOn, setTorchOn, inputRef, onManualSubmit,
    onCameraPermission, onScanResult, onClose } = p;

  const statusColors: Record<ScanState, string> = {
    idle: "text-warm-400",
    scanning: "text-[#00A650]",
    detected: "text-[#00A650]",
    looking_up: "text-savanna-600",
    found: "text-forest-600",
    not_found: "text-red-500",
  };

  const statusLabels: Record<ScanState, string> = {
    idle: "Ready to scan",
    scanning: "Scanning...",
    detected: "Code detected!",
    looking_up: "Looking up product...",
    found: "Product found!",
    not_found: "Product not found",
  };

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-warm-100"
        style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" rx="0.5" />
                <rect x="18" y="14" width="3" height="3" rx="0.5" /><rect x="14" y="18" width="3" height="3" rx="0.5" />
                <rect x="18" y="18" width="3" height="3" rx="0.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-warm-900">Scan Product</h2>
              <p className={`text-[10px] font-medium ${statusColors[scanState]}`}>{statusLabels[scanState]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors min-h-[40px]"
            aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1.5">
          {([
            { key: "manual" as ScanMode, label: "Manual", icon: "\u2328\uFE0F" },
            { key: "camera" as ScanMode, label: "Camera", icon: "\uD83D\uDCF7" },
            { key: "hardware" as ScanMode, label: "Scanner", icon: "\uD83D\uDD0D" },
          ]).map((m) => (
            <button key={m.key} onClick={() => {
              if (m.key === "camera" && cameraPermission === "prompt") { onCameraPermission(); return; }
              setMode(m.key);
              if (m.key === "manual") setScanState("idle");
              if (m.key === "hardware") setScanState("scanning");
            }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 min-h-[36px] transition-all ${
                mode === m.key ? "bg-terracotta-500 text-white" : "bg-warm-100 text-warm-500"
              }`}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Camera mode */}
        {mode === "camera" && (
          <div className="space-y-3">
            {cameraPermission === "denied" ? (
              <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="mx-auto mb-2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <p className="text-sm font-medium text-red-600">Camera access denied</p>
                <p className="text-xs text-warm-400 mt-1">Use manual entry or hardware scanner</p>
              </div>
            ) : cameraError ? (
              <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="mx-auto mb-2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <p className="text-sm font-medium text-red-600">{cameraError}</p>
                <button onClick={onCameraPermission} className="mt-2 px-4 py-2 rounded-xl bg-terracotta-500 text-white text-sm font-bold">
                  Retry
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: "240px" }}>
                <div
                  id="qr-scanner-region"
                  ref={scannerRef}
                  className="w-full h-[240px] sm:h-[280px]"
                />
                {scanState !== "scanning" && !html5QrRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={startCameraScanner} className="px-6 py-3 rounded-xl bg-terracotta-500 text-white font-bold">
                      Start Camera
                    </button>
                  </div>
                )}
                {scanState === "scanning" && html5QrRef.current && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <button onClick={() => setTorchOn(!torchOn)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${torchOn ? "bg-yellow-400 text-black" : "bg-black/50 text-white"}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </button>
                    <button onClick={stopCameraScanner}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white">
                      Stop
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual entry */}
        {mode === "manual" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">Enter SKU or Barcode</label>
              <div className="flex gap-2">
                <input ref={inputRef} type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onManualSubmit()}
                  placeholder="Type or paste code..."
                  className="flex-1 px-4 py-3 rounded-xl bg-warm-50 border border-warm-200 text-sm outline-none focus:border-terracotta-500 font-mono min-h-[48px]"
                  style={{ fontSize: "16px" }} />
                <button onClick={onManualSubmit} disabled={!manualCode.trim() || scanState === "looking_up"}
                  className="px-4 py-3 rounded-xl bg-terracotta-500 text-white text-sm font-bold hover:bg-terracotta-600 disabled:opacity-40 min-h-[48px] flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  Look Up
                </button>
              </div>
            </div>
            {/* Quick SKU chips from products */}
            <div>
              <p className="text-[10px] text-warm-400 mb-1.5">Quick scan (tap to simulate)</p>
              <div className="flex flex-wrap gap-1.5">
                {inventoryProducts.slice(0, 8).map((p) => (
                  <button key={p.id} onClick={() => { setManualCode(p.sku); onManualSubmit(); }}
                    className="px-2 py-1 rounded-lg text-[10px] font-mono bg-warm-100 text-warm-500 hover:bg-warm-200 min-h-[28px]">
                    {p.sku}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hardware scanner mode */}
        {mode === "hardware" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-forest-200/60 bg-forest-50/50 p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><rect x="7" y="7" width="3" height="3" rx="0.5" />
                  <rect x="14" y="7" width="3" height="3" rx="0.5" /><rect x="7" y="14" width="3" height="3" rx="0.5" />
                  <rect x="14" y="14" width="3" height="3" rx="0.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-forest-700">Hardware Scanner Mode</p>
              <p className="text-xs text-warm-400 mt-1">Scan a barcode with your USB/Bluetooth scanner</p>
              <p className="text-[10px] text-warm-300 mt-2">Scanner acts as keyboard input - just scan and it will appear here</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warm-50">
              <span className={`w-2 h-2 rounded-full ${scanState === "scanning" ? "bg-forest-500 animate-pulse" : "bg-warm-300"}`} />
              <span className="text-xs text-warm-500">{scanState === "scanning" ? "Listening for scan..." : "Ready"}</span>
            </div>
          </div>
        )}

        {/* Found product card */}
        <AnimatePresence>
          {foundProduct && scanState === "found" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-forest-200/60 bg-forest-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-forest-700">Bidhaa Imepatikana!</p>
                  <p className="text-xs text-warm-500">{foundProduct.name}</p>
                  <p className="text-lg font-heading font-extrabold text-warm-900 tabular-nums mt-1">
                    KSh {foundProduct.sellingPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-warm-400">Stock: {foundProduct.quantity}</p>
                  <button onClick={() => { onScanResult(foundProduct); setFoundProduct(null); setManualCode(""); setScanState("idle"); }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-forest-500 text-white text-xs font-bold min-h-[32px]">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not found */}
        {scanState === "not_found" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 text-center">
            <p className="text-sm font-medium text-red-600">Product not found</p>
            <p className="text-xs text-warm-400 mt-1">Check the code and try again</p>
            <button onClick={() => { setScanState("idle"); setManualCode(""); }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-warm-100 text-xs font-medium text-warm-600 min-h-[32px]">
              Try Again
            </button>
          </motion.div>
        )}

        {/* Scan history */}
        {scanHistory.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider mb-2">Recent Scans</p>
            <div className="space-y-1.5">
              {scanHistory.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-warm-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-warm-500 truncate">{item.code}</p>
                    {item.product && <p className="text-[10px] text-warm-400 truncate">{item.product.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-warm-400">{item.time}</span>
                    {item.product && (
                      <button onClick={() => onScanResult(item.product!)}
                        className="px-2 py-1 rounded-md bg-terracotta-500 text-white text-[9px] font-bold min-h-[24px]">
                        +Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-warm-100 p-4"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}>
        <button onClick={onClose}
          className="w-full py-3 rounded-xl bg-warm-100 text-warm-600 text-sm font-bold min-h-[48px]">
          Close Scanner
        </button>
      </div>
    </>
  );
}
