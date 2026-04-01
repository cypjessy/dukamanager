"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type PrinterStatus = "disconnected" | "detecting" | "connecting" | "connected" | "printing" | "error";

export interface PrinterState {
  status: PrinterStatus;
  deviceName: string | null;
  error: string | null;
}

export function usePrinter() {
  const [state, setState] = useState<PrinterState>({
    status: "disconnected",
    deviceName: null,
    error: null,
  });
  const portRef = useRef<unknown>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  const isSupported = typeof navigator !== "undefined" && "serial" in navigator;

  // Auto-detect already-granted ports
  useEffect(() => {
    if (!isSupported) return;

    const checkPorts = async () => {
      try {
        const ports = await navigator.serial!.getPorts();
        if (ports.length > 0) {
          const port = ports[0];
          try {
            await port.open({ baudRate: 9600 });
            portRef.current = port;
            const info = port.getInfo?.();
            setState({
              status: "connected",
              deviceName: info?.usbVendorId ? `Thermal Printer (${info.usbVendorId})` : "Thermal Printer",
              error: null,
            });
          } catch {
            // Port already open or can't connect
          }
        }
      } catch { /* no ports */ }
    };

    checkPorts();

    // Listen for connect/disconnect events
    const handleConnect = () => {
      checkPorts();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    nav.serial?.addEventListener?.("connect", handleConnect);
    return () => {
      nav.serial?.removeEventListener?.("connect", handleConnect);
    };
  }, [isSupported]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState((p) => ({ ...p, status: "error", error: "Web Serial not supported in this browser" }));
      return false;
    }
    setState((p) => ({ ...p, status: "connecting", error: null }));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      const info = port.getInfo?.();
      setState({
        status: "connected",
        deviceName: info?.usbVendorId ? `Thermal Printer (${info.usbVendorId})` : "Thermal Printer",
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect printer";
      setState({ status: "error", deviceName: null, error: msg });
      return false;
    }
  }, [isSupported]);

  const disconnect = useCallback(async () => {
    const port = portRef.current as { close: () => Promise<void> } | null;
    if (port) {
      try {
        if (writerRef.current) {
          await writerRef.current.close();
          writerRef.current = null;
        }
        await port.close();
      } catch { /* ignore */ }
    }
    portRef.current = null;
    setState({ status: "disconnected", deviceName: null, error: null });
  }, []);

  const print = useCallback(async (lines: string[]) => {
    const port = portRef.current as { writable: WritableStream<Uint8Array> } | null;
    if (!port?.writable) {
      setState((p) => ({ ...p, status: "error", error: "Printer not connected" }));
      return false;
    }

    setState((p) => ({ ...p, status: "printing" }));
    try {
      const writer = port.writable.getWriter();
      writerRef.current = writer;

      // ESC/POS commands
      const encoder = new TextEncoder();
      const INIT = new Uint8Array([0x1b, 0x40]); // ESC @
      const BOLD_ON = new Uint8Array([0x1b, 0x45, 0x01]);
      const BOLD_OFF = new Uint8Array([0x1b, 0x45, 0x00]);
      const CENTER = new Uint8Array([0x1b, 0x61, 0x01]);
      const LEFT = new Uint8Array([0x1b, 0x61, 0x00]);
      const CUT = new Uint8Array([0x1d, 0x56, 0x00]); // Full cut
      const LINE_FEED = new Uint8Array([0x0a]);

      await writer.write(INIT);

      for (const line of lines) {
        if (line === "---CUT---") {
          await writer.write(LINE_FEED);
          await writer.write(LINE_FEED);
          await writer.write(CUT);
          continue;
        }

        if (line.startsWith("**CENTER**")) {
          await writer.write(CENTER);
          const text = line.replace("**CENTER**", "");
          await writer.write(encoder.encode(text + "\n"));
          await writer.write(LEFT);
          continue;
        }

        if (line.startsWith("**BOLD**")) {
          await writer.write(BOLD_ON);
          const text = line.replace("**BOLD**", "");
          await writer.write(encoder.encode(text + "\n"));
          await writer.write(BOLD_OFF);
          continue;
        }

        await writer.write(encoder.encode(line + "\n"));
      }

      await writer.write(LINE_FEED);
      await writer.write(LINE_FEED);
      await writer.close();
      writerRef.current = null;

      setState((p) => ({ ...p, status: "connected" }));
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Print failed";
      setState((p) => ({ ...p, status: "connected", error: msg }));
      return false;
    }
  }, []);

  return {
    ...state,
    isSupported,
    connect,
    disconnect,
    print,
  };
}
