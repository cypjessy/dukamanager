"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/inventoryData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface BarcodePrintDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

type BarcodeFormat = "code128" | "ean13";
type LabelSize = "small" | "medium" | "large";

const LABEL_SIZES: { key: LabelSize; label: string; w: number; h: number }[] = [
  { key: "small", label: "30×20mm", w: 30, h: 20 },
  { key: "medium", label: "50×30mm", w: 50, h: 30 },
  { key: "large", label: "100×50mm", w: 100, h: 50 },
];

export default function BarcodePrintDialog({ product, isOpen, onClose }: BarcodePrintDialogProps) {
  const [format, setFormat] = useState<BarcodeFormat>("code128");
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [copies, setCopies] = useState(1);
  const { isMobile } = useResponsiveDialog();
  const printRef = useRef<HTMLDivElement>(null);

  const barcodeData = useMemo(() => {
    if (!product) return "";
    return format === "ean13" ? product.sku.replace(/[^0-9]/g, "").slice(0, 13).padEnd(13, "0") : product.sku;
  }, [product, format]);

  const bars = useMemo(() => generateBars(barcodeData, format), [barcodeData, format]);

  const handlePrint = useCallback(() => {
    if (!printRef.current || !product) return;
    const content = Array.from({ length: copies }).map(() => printRef.current!.innerHTML).join("");
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Barcode - ${product.name}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; justify-content: center; }
      .label { border: 1px dashed #ccc; padding: 8px; text-align: center; page-break-inside: avoid; }
      .barcode-bars { display: flex; justify-content: center; height: ${labelSize === "small" ? 30 : labelSize === "medium" ? 50 : 80}px; margin: 4px 0; }
      .barcode-bar { width: 1px; background: #000; }
      .product-name { font-size: ${labelSize === "small" ? 7 : labelSize === "medium" ? 9 : 11}px; font-weight: bold; margin-top: 2px; }
      .product-price { font-size: ${labelSize === "small" ? 8 : labelSize === "medium" ? 10 : 13}px; font-weight: bold; }
      .product-sku { font-size: ${labelSize === "small" ? 6 : labelSize === "medium" ? 7 : 9}px; color: #666; }
      @media print { body { padding: 0; } .label { border: none; } }
    </style></head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }, [copies, product, labelSize]);

  if (!isOpen || !product) return null;

  const sizeConfig = LABEL_SIZES.find((s) => s.key === labelSize)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-warm-900 rounded-2xl shadow-2xl border border-warm-200/60 dark:border-warm-700/60 flex flex-col overflow-hidden"
              style={{ width: isMobile ? "calc(100vw - 32px)" : "min(480px, calc(100vw - 48px))", maxHeight: "90vh" }}
              role="dialog" aria-modal="true" aria-label="Print Barcode"
            >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-warm-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8v8M10 8v8M14 8v4M18 8v8" /></svg>
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Print Barcode</h2>
                    <p className="text-xs text-warm-400">{product.name}</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                  aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Format selection */}
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">Barcode Format</label>
                <div className="flex gap-2">
                  {(["code128", "ean13"] as BarcodeFormat[]).map((f) => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[40px] ${
                        format === f ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                      }`}>
                      {f === "code128" ? "Code 128" : "EAN-13"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label size */}
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">Label Size</label>
                <div className="flex gap-2">
                  {LABEL_SIZES.map((s) => (
                    <button key={s.key} onClick={() => setLabelSize(s.key)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[40px] ${
                        labelSize === s.key ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">Copies</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 flex items-center justify-center text-lg font-bold transition-all active:scale-90">-</button>
                  <span className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums min-w-[2rem] text-center">{copies}</span>
                  <button onClick={() => setCopies(Math.min(50, copies + 1))}
                    className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 flex items-center justify-center text-lg font-bold transition-all active:scale-90">+</button>
                </div>
              </div>

              {/* Barcode Preview */}
              <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 bg-warm-50 dark:bg-warm-800/50 p-4">
                <p className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-3">Preview</p>
                <div ref={printRef} className="flex justify-center">
                  <div className="label inline-block bg-white rounded-lg p-3 text-center shadow-sm border border-warm-100">
                    <div className="barcode-bars flex justify-center items-end" style={{ height: sizeConfig.h * 1.5, gap: "0px" }}>
                      {bars.map((w, i) => (
                        <div key={i} style={{ width: w, height: "100%", background: "#000", flexShrink: 0 }} />
                      ))}
                    </div>
                    <p className="product-name font-mono font-bold text-warm-900 mt-1.5" style={{ fontSize: labelSize === "small" ? 8 : labelSize === "medium" ? 10 : 12 }}>
                      {product.name.length > 24 ? product.name.slice(0, 22) + ".." : product.name}
                    </p>
                    <p className="product-price font-mono font-extrabold text-warm-900" style={{ fontSize: labelSize === "small" ? 9 : labelSize === "medium" ? 12 : 15 }}>
                      KSh {product.sellingPrice.toLocaleString()}
                    </p>
                    <p className="product-sku font-mono text-warm-400" style={{ fontSize: labelSize === "small" ? 6 : labelSize === "medium" ? 7 : 9 }}>
                      {barcodeData}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-warm-100 dark:border-warm-800">
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Cancel</Button>
                <Button variant="primary" size="md" onClick={handlePrint}
                  iconLeft={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>}
                  className="flex-1">
                  Print {copies > 1 ? `${copies} Labels` : "Label"}
                </Button>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function generateBars(data: string, format: BarcodeFormat): number[] {
  if (!data) return [];
  const bars: number[] = [];
  const seed = data.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rng = (i: number) => ((seed * 31 + i * 17) % 100);

  if (format === "ean13") {
    // Simplified EAN-13 pattern
    for (let i = 0; i < 95; i++) {
      const r = rng(i);
      bars.push(r % 3 === 0 ? 2 : 1);
    }
  } else {
    // Code 128 simplified pattern
    for (let i = 0; i < data.length * 11 + 35; i++) {
      const r = rng(i);
      bars.push(r % 4 === 0 ? 3 : r % 3 === 0 ? 2 : 1);
    }
  }
  return bars;
}
