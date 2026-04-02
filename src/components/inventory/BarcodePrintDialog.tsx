"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import JsBarcode from "jsbarcode";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/inventoryData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface BarcodePrintDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

type BarcodeFormat = "CODE128" | "EAN13";
type LabelSize = "small" | "medium" | "large";

const LABEL_SIZES: { key: LabelSize; label: string; w: number; h: number; fontSize: { name: number; price: number; sku: number } }[] = [
  { key: "small", label: "30×20mm", w: 30, h: 20, fontSize: { name: 6, price: 7, sku: 5 } },
  { key: "medium", label: "50×30mm", w: 50, h: 30, fontSize: { name: 8, price: 9, sku: 6 } },
  { key: "large", label: "100×50mm", w: 100, h: 50, fontSize: { name: 10, price: 12, sku: 8 } },
];

export default function BarcodePrintDialog({ product, isOpen, onClose }: BarcodePrintDialogProps) {
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [copies, setCopies] = useState(1);
  const { isMobile } = useResponsiveDialog();
  const printRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const barcodeData = format === "EAN13" ? product?.sku.replace(/[^0-9]/g, "").slice(0, 13).padEnd(13, "0") || "0000000000000" : product?.sku || "";

  const sizeConfig = LABEL_SIZES.find((s) => s.key === labelSize)!;

  useEffect(() => {
    if (svgRef.current && product && barcodeData) {
      try {
        JsBarcode(svgRef.current, barcodeData, {
          format: format,
          width: 2,
          height: sizeConfig.h * 2.5,
          displayValue: false,
          margin: 0,
          background: "transparent",
          lineColor: "#000",
        });
      } catch (e) {
        console.warn("Barcode generation error:", e);
      }
    }
  }, [barcodeData, format, product, sizeConfig.h]);

  const handlePrint = useCallback(async () => {
    if (!printRef.current || !product) return;

    const svgElement = printRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const content = Array.from({ length: copies }).map(() => {
      return `
        <div class="label" style="width: ${sizeConfig.w}mm; height: ${sizeConfig.h}mm; padding: 2mm; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #ccc; page-break-inside: avoid; box-sizing: border-box;">
          <img src="${svgUrl}" style="height: ${sizeConfig.h * 0.5}mm; width: auto; display: block; margin-bottom: 1mm;" />
          <div style="font-size: ${sizeConfig.fontSize.name}pt; font-weight: bold; font-family: monospace; line-height: 1.1; max-height: ${sizeConfig.fontSize.name * 1.5}pt; overflow: hidden; text-align: center;">
            ${product.name.length > 20 ? product.name.slice(0, 18) + ".." : product.name}
          </div>
          <div style="font-size: ${sizeConfig.fontSize.price}pt; font-weight: bold; font-family: monospace; margin-top: 0.5mm;">
            KSh ${product.sellingPrice.toLocaleString()}
          </div>
          <div style="font-size: ${sizeConfig.fontSize.sku}pt; font-family: monospace; color: #666;">
            ${barcodeData}
          </div>
        </div>
      `;
    }).join("");

    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;

    win.document.write(`<!DOCTYPE html><html><head><title>Barcode - ${product.name}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: monospace; display: flex; flex-wrap: wrap; gap: 4mm; padding: 10mm; justify-content: center; background: #f5f5f5; }
      @media print { body { padding: 5mm; background: white; } .label { border: none; } }
      @page { margin: 0; size: auto; }
    </style></head><body>${content}</body></html>`);
    win.document.close();

    setTimeout(() => {
      win.print();
      URL.revokeObjectURL(svgUrl);
    }, 500);
  }, [copies, product, sizeConfig, barcodeData]);

  if (!isOpen || !product) return null;

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
                  {(["CODE128", "EAN13"] as BarcodeFormat[]).map((f) => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[40px] ${
                        format === f ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600" : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                      }`}>
                      {f === "CODE128" ? "Code 128" : "EAN-13"}
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
                  <div 
                    className="label inline-block bg-white rounded-lg p-2 text-center shadow-sm border border-warm-100"
                    style={{ 
                      width: sizeConfig.w * 4, 
                      height: sizeConfig.h * 4,
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg 
                      ref={svgRef}
                      style={{ 
                        height: sizeConfig.h * 1.5, 
                        width: 'auto',
                        maxWidth: '100%'
                      }}
                    />
                    <p 
                      className="font-mono font-bold text-warm-900 mt-1" 
                      style={{ fontSize: sizeConfig.fontSize.name }}
                    >
                      {product.name.length > 20 ? product.name.slice(0, 18) + ".." : product.name}
                    </p>
                    <p 
                      className="font-mono font-extrabold text-warm-900" 
                      style={{ fontSize: sizeConfig.fontSize.price }}
                    >
                      KSh {product.sellingPrice.toLocaleString()}
                    </p>
                    <p 
                      className="font-mono text-warm-400" 
                      style={{ fontSize: sizeConfig.fontSize.sku }}
                    >
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