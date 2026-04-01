"use client";

import { useState, useCallback, useRef } from "react";
import type { Transaction } from "@/data/salesData";
import type { ShopTenant } from "@/lib/shopTenant";
import type { PaperSize, PrintMethod, PrintStatus, PrintResult, PrinterDevice } from "@/lib/printManager";
import { getPrintManager, logPrint } from "@/lib/printManager";
import { buildShopDownloadSummary, downloadTextFile } from "@/lib/shopTenant";

interface UsePrintOptions {
  transaction: Transaction;
  shop: ShopTenant;
  verificationCode: string;
}

interface UsePrintReturn {
  status: PrintStatus;
  method: PrintMethod | null;
  paperSize: PaperSize;
  setPaperSize: (s: PaperSize) => void;
  connectedPrinter: PrinterDevice | null;
  error: string | null;
  printQuick: () => Promise<PrintResult>;
  printBrowser: () => Promise<PrintResult>;
  printPDF: () => Promise<PrintResult>;
  shareReceipt: () => Promise<PrintResult>;
  connectPrinter: (type: "serial" | "usb") => Promise<PrinterDevice | null>;
  disconnectPrinter: () => void;
  reset: () => void;
}

export function usePrint({ transaction, shop, verificationCode }: UsePrintOptions): UsePrintReturn {
  const [status, setStatus] = useState<PrintStatus>("idle");
  const [method, setMethod] = useState<PrintMethod | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>("80mm");
  const [connectedPrinter, setConnectedPrinter] = useState<PrinterDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef(getPrintManager());

  const log = useCallback(
    (result: PrintResult, m: PrintMethod) => {
      logPrint({
        transactionId: transaction.id,
        receiptNo: transaction.receiptNo,
        shopId: shop.id,
        method: m,
        paperSize,
        printerName: connectedPrinter?.name,
        success: result.success,
        error: result.error,
      });
    },
    [transaction, shop, paperSize, connectedPrinter]
  );

  const printQuick = useCallback(async (): Promise<PrintResult> => {
    setStatus("printing");
    setMethod("thermal");
    setError(null);

    const mgr = managerRef.current;
    const device = mgr.getConnectedDevice();

    if (device) {
      const result = await mgr.printThermal(transaction, shop, verificationCode, { cutPaper: true, kickDrawer: false });
      log(result, "thermal");
      setStatus(result.success ? "success" : "error");
      if (!result.success) setError(result.message);
      return result;
    }

    const browserResult = await mgr.printBrowser(paperSize);
    log(browserResult, "browser");
    setMethod("browser");
    setStatus(browserResult.success ? "success" : "error");
    if (!browserResult.success) setError(browserResult.message);
    return browserResult;
  }, [transaction, shop, verificationCode, paperSize, log]);

  const printBrowser = useCallback(async (): Promise<PrintResult> => {
    setStatus("printing");
    setMethod("browser");
    setError(null);

    const result = await managerRef.current.printBrowser(paperSize);
    log(result, "browser");
    setStatus(result.success ? "success" : "error");
    if (!result.success) setError(result.message);
    return result;
  }, [paperSize, log]);

  const printPDF = useCallback(async (): Promise<PrintResult> => {
    setStatus("printing");
    setMethod("pdf");
    setError(null);

    const result = await managerRef.current.generatePDF();
    log(result, "pdf");
    setStatus(result.success ? "success" : "error");
    if (!result.success) setError(result.message);
    return result;
  }, [log]);

  const shareReceipt = useCallback(async (): Promise<PrintResult> => {
    setStatus("printing");
    setMethod("share");
    setError(null);

    const content = buildShopDownloadSummary(transaction, verificationCode, shop);
    const filename = `DukaManager_${transaction.receiptNo}_${transaction.date}.txt`;

    const result = await managerRef.current.shareReceipt(content, filename);

    if (!result.success && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(content);
        const fallback: PrintResult = { success: true, method: "share", message: "Copied to clipboard", timestamp: Date.now() };
        log(fallback, "share");
        setStatus("success");
        return fallback;
      } catch {
        downloadTextFile(content, filename);
        const dl: PrintResult = { success: true, method: "share", message: "Downloaded instead", timestamp: Date.now() };
        log(dl, "share");
        setStatus("success");
        return dl;
      }
    }

    log(result, "share");
    setStatus(result.success ? "success" : "error");
    if (!result.success) setError(result.message);
    return result;
  }, [transaction, shop, verificationCode, log]);

  const connectPrinter = useCallback(async (type: "serial" | "usb"): Promise<PrinterDevice | null> => {
    setStatus("detecting");
    setError(null);

    const device = type === "serial"
      ? await managerRef.current.connectSerial()
      : await managerRef.current.connectUSB();

    if (device) {
      setConnectedPrinter(device);
      setStatus("ready");
    } else {
      setStatus("error");
      setError("Could not connect to printer");
    }
    return device;
  }, []);

  const disconnectPrinter = useCallback(() => {
    managerRef.current.disconnect();
    setConnectedPrinter(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setMethod(null);
    setError(null);
  }, []);

  return {
    status, method, paperSize, setPaperSize,
    connectedPrinter, error,
    printQuick, printBrowser, printPDF, shareReceipt,
    connectPrinter, disconnectPrinter, reset,
  };
}
