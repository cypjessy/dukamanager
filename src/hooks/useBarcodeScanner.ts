"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ScannerMode = "hardware" | "camera" | "manual";

interface UseBarcodeScannerOptions {
  onScan: (code: string) => void;
  enabled?: boolean;
}

interface ScannerStatus {
  mode: ScannerMode;
  isConnected: boolean;
  deviceName: string | null;
  lastScan: string | null;
}

const KNOWN_VENDORS: Record<number, string> = {
  0x05E0: "Symbol/Zebra",
  0x0C2E: "Honeywell",
  0x1A86: "Generic HID",
  0x23D8: "Datalogic",
  0x0536: "Handheld Products",
  0x04B4: "Cypress",
  0x0483: "STMicroelectronics",
};

export function useBarcodeScanner({ onScan, enabled = true }: UseBarcodeScannerOptions) {
  const [status, setStatus] = useState<ScannerStatus>({
    mode: "manual",
    isConnected: false,
    deviceName: null,
    lastScan: null,
  });
  const [showCamera, setShowCamera] = useState(false);

  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef(0);
  const scanCooldownRef = useRef(false);

  const processBuffer = useCallback(() => {
    const code = bufferRef.current.trim();
    bufferRef.current = "";
    if (code.length >= 3 && !scanCooldownRef.current) {
      scanCooldownRef.current = true;
      setTimeout(() => { scanCooldownRef.current = false; }, 300);
      setStatus((prev) => ({ ...prev, lastScan: code }));
      onScan(code);
    }
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (timerRef.current) clearTimeout(timerRef.current);

      if (e.key === "Enter") {
        e.preventDefault();
        processBuffer();
        return;
      }

      if (e.key.length === 1) {
        if (timeSinceLast > 100) bufferRef.current = "";
        bufferRef.current += e.key;
        timerRef.current = setTimeout(processBuffer, 60);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, processBuffer]);

  useEffect(() => {
    if (!enabled) return;

    let hidCheckDone = false;

    async function detectHID() {
      if (!("hid" in navigator)) return;
      try {
        const devices = await (navigator as Navigator & { hid: { getDevices: () => Promise<{ vendorId: number; productName?: string }[]> } }).hid.getDevices();
        const scanner = devices.find((d) => d.vendorId in KNOWN_VENDORS);
        if (scanner) {
          hidCheckDone = true;
          setStatus({
            mode: "hardware",
            isConnected: true,
            deviceName: scanner.productName || KNOWN_VENDORS[scanner.vendorId] || "USB Scanner",
            lastScan: null,
          });
        }
      } catch {
        // HID not available
      }
    }

    const checkBluetooth = async () => {
      if (!("bluetooth" in navigator)) return;
      try {
        // Bluetooth detection - just check availability
        const available = await (navigator as Navigator & { bluetooth?: { getAvailability: () => Promise<boolean> } }).bluetooth?.getAvailability?.();
        if (available && !hidCheckDone) {
          // Bluetooth available but no HID - still default to manual
        }
      } catch {
        // Bluetooth not available
      }
    };

    detectHID();
    checkBluetooth();

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && !hidCheckDone) {
      setStatus((prev) => ({
        ...prev,
        mode: "camera",
        isConnected: false,
        deviceName: null,
      }));
    }
  }, [enabled]);

  const setMode = useCallback((mode: ScannerMode) => {
    setStatus((prev) => ({ ...prev, mode }));
    if (mode === "camera") setShowCamera(true);
    else setShowCamera(false);
  }, []);

  const manualScan = useCallback((code: string) => {
    if (code.trim().length >= 1) {
      setStatus((prev) => ({ ...prev, lastScan: code.trim() }));
      onScan(code.trim());
    }
  }, [onScan]);

  return {
    status,
    showCamera,
    setShowCamera,
    setMode,
    manualScan,
  };
}

export function validateKenyanPhone(phone: string): { valid: boolean; formatted: string; error?: string } {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

  if (/^254[17]\d{8}$/.test(cleaned)) return { valid: true, formatted: cleaned };
  if (/^0[17]\d{8}$/.test(cleaned)) return { valid: true, formatted: "254" + cleaned.slice(1) };
  if (/^[17]\d{8}$/.test(cleaned)) return { valid: true, formatted: "254" + cleaned };

  if (cleaned.length < 9) return { valid: false, formatted: cleaned, error: "Phone number too short" };
  if (cleaned.length > 12) return { valid: false, formatted: cleaned, error: "Phone number too long" };

  return { valid: false, formatted: cleaned, error: "Use format: 0712 345 678" };
}

export function playBeep(success: boolean = true) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = success ? 1200 : 400;
    osc.type = "sine";
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (success ? 0.15 : 0.3));
    osc.stop(ctx.currentTime + (success ? 0.15 : 0.3));
  } catch {
    // Audio not available
  }
}
