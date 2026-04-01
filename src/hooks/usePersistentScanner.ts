"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { inventoryProducts } from "@/data/inventoryData";
import type { Product } from "@/data/inventoryData";
import { playBeep } from "./useBarcodeScanner";

interface UsePersistentScannerOptions {
  onProductFound: (product: Product) => void;
  onNotFound: (code: string) => void;
  enabled?: boolean;
}

interface ScannerEvent {
  code: string;
  product: Product | null;
  timestamp: string;
}

export function usePersistentScanner({ onProductFound, onNotFound, enabled = true }: UsePersistentScannerOptions) {
  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef(0);
  const cooldownRef = useRef(false);
  const [isActive, setIsActive] = useState(true);
  const [lastScan, setLastScan] = useState<ScannerEvent | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [scannerConnected, setScannerConnected] = useState(false);

  const lookupProduct = useCallback((code: string): Product | null => {
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Exact SKU match first
    const exactMatch = inventoryProducts.find(
      (p) => p.sku.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalized
    );
    if (exactMatch) return exactMatch;
    // Partial match
    return (
      inventoryProducts.find(
        (p) =>
          p.sku.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(normalized) ||
          normalized.includes(p.sku.toUpperCase().replace(/[^A-Z0-9]/g, ""))
      ) || null
    );
  }, []);

  const processBuffer = useCallback(() => {
    const code = bufferRef.current.trim();
    bufferRef.current = "";
    if (code.length >= 3 && !cooldownRef.current && isActive) {
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 500);

      const product = lookupProduct(code);
      const event: ScannerEvent = {
        code,
        product,
        timestamp: new Date().toISOString(),
      };
      setLastScan(event);
      setScanCount((prev) => prev + 1);

      if (product) {
        playBeep(true);
        onProductFound(product);
      } else {
        playBeep(false);
        onNotFound(code);
      }
    }
  }, [isActive, lookupProduct, onProductFound, onNotFound]);

  // Persistent keyboard listener - always listening
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs EXCEPT when scanner is active
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";

      // Scanner detection: rapid keystrokes followed by Enter
      // If typing into an input, still allow scanner detection if keystrokes are fast enough
      // (scanner input is typically <10ms between keys, human is >50ms)

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (timerRef.current) clearTimeout(timerRef.current);

      if (e.key === "Enter") {
        if (bufferRef.current.length >= 3) {
          e.preventDefault();
          processBuffer();
        }
        return;
      }

      if (e.key && e.key.length === 1) {
        // Detect scanner vs human typing: scanners send keys very fast (<50ms)
        if (timeSinceLast > 80 && !isInput) {
          bufferRef.current = "";
        }
        // For inputs, only capture if keystrokes are extremely fast (scanner-like)
        if (isInput && timeSinceLast > 80) {
          bufferRef.current = "";
          return; // Don't capture slow typing in inputs
        }

        bufferRef.current += e.key;

        // If buffer is building fast (scanner-like), process quickly
        const timeout = timeSinceLast < 50 ? 30 : 100;
        timerRef.current = setTimeout(processBuffer, timeout);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Detect HID scanner devices
    const detectScanner = async () => {
      try {
        if ("hid" in navigator) {
          const devices = await (
            navigator as Navigator & {
              hid: { getDevices: () => Promise<{ vendorId: number; productName?: string }[]> };
            }
          ).hid.getDevices();
          const KNOWN_SCANNER_VENDORS = [0x05e0, 0x0c2e, 0x1a86, 0x23d8, 0x0536, 0x04b4, 0x0483];
          const hasScanner = devices.some((d) => KNOWN_SCANNER_VENDORS.includes(d.vendorId));
          setScannerConnected(hasScanner);
        }
      } catch {
        // HID not available
      }
    };
    detectScanner();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, processBuffer]);

  const toggleActive = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  return {
    isActive,
    toggleActive,
    lastScan,
    scanCount,
    scannerConnected,
  };
}
