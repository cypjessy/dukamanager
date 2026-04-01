import type { Transaction } from "@/data/salesData";
import type { ShopTenant } from "./shopTenant";
import { generateESCPOS, getPrinterCapabilities } from "./thermalPrinter";

// ===== Types =====

export type PrintMethod = "thermal" | "browser" | "pdf" | "share";
export type PrintStatus = "idle" | "detecting" | "ready" | "printing" | "success" | "error";
export type PaperSize = "80mm" | "a4" | "letter" | "legal";

export interface PrinterDevice {
  id: string;
  name: string;
  type: "usb" | "serial" | "bluetooth";
  connected: boolean;
}

export interface PrintOptions {
  method: PrintMethod;
  paperSize?: PaperSize;
  copies?: number;
  cutPaper?: boolean;
  kickDrawer?: boolean;
  includeQR?: boolean;
}

export interface PrintResult {
  success: boolean;
  method: PrintMethod;
  message: string;
  timestamp: number;
  error?: string;
}

export interface PrintLog {
  id: string;
  transactionId: string;
  receiptNo: string;
  shopId: string;
  method: PrintMethod;
  paperSize: PaperSize;
  printerName?: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

// ===== Print History Store =====
const printLogs: PrintLog[] = [];

export function logPrint(log: Omit<PrintLog, "id" | "timestamp">): PrintLog {
  const entry: PrintLog = { ...log, id: `PRT${Date.now().toString(36).toUpperCase()}`, timestamp: Date.now() };
  printLogs.push(entry);
  return entry;
}

export function getPrintLogsForShop(shopId: string): PrintLog[] {
  return printLogs.filter((l) => l.shopId === shopId);
}

// ===== Print Manager =====

export class PrintManager {
  private connectedDevice: PrinterDevice | null = null;
  private serialPort: unknown | null = null;
  private usbDevice: unknown | null = null;

  async detectPrinters(): Promise<PrinterDevice[]> {
    const caps = getPrinterCapabilities();
    const devices: PrinterDevice[] = [];

    if (caps.webSerialAvailable) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nav = navigator as any;
        const ports = await nav.serial.getPorts();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ports.forEach((port: any, i: number) => {
          const info = port.getInfo?.();
          devices.push({
            id: `serial-${i}`,
            name: info?.usbVendorId ? `Serial Printer (${info.usbVendorId})` : `Serial Port ${i + 1}`,
            type: "serial",
            connected: port.readable !== null,
          });
        });
      } catch { /* no serial ports */ }
    }

    return devices;
  }

  async connectSerial(): Promise<PrinterDevice | null> {
    if (!("serial" in navigator)) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.serialPort = port;
      const info = port.getInfo?.();
      this.connectedDevice = {
        id: "serial-0",
        name: info?.usbVendorId ? `Thermal (${info.usbVendorId})` : "Thermal Printer",
        type: "serial",
        connected: true,
      };
      return this.connectedDevice;
    } catch {
      return null;
    }
  }

  async connectUSB(): Promise<PrinterDevice | null> {
    if (!("usb" in navigator)) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const device = await nav.usb.requestDevice({
        filters: [{ vendorId: 0x04b8 }, { vendorId: 0x0519 }, {}],
      });
      await device.open();
      if (device.configuration) await device.selectConfiguration(1);
      await device.claimInterface(0);
      this.usbDevice = device;
      this.connectedDevice = {
        id: `usb-${device.serialNumber || "0"}`,
        name: device.productName || "USB Printer",
        type: "usb",
        connected: true,
      };
      return this.connectedDevice;
    } catch {
      return null;
    }
  }

  disconnect(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.serialPort as any)?.close?.().catch(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.usbDevice as any)?.close?.().catch(() => {});
    this.connectedDevice = null;
    this.serialPort = null;
    this.usbDevice = null;
  }

  getConnectedDevice(): PrinterDevice | null {
    return this.connectedDevice;
  }

  async printThermal(
    transaction: Transaction,
    shop: ShopTenant,
    verificationCode: string,
    options: { cutPaper?: boolean; kickDrawer?: boolean } = {}
  ): Promise<PrintResult> {
    const result = generateESCPOS(transaction, shop, verificationCode, options);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serial = this.serialPort as any;
    if (serial?.writable) {
      try {
        const writer = serial.writable.getWriter();
        await writer.write(result.data);
        writer.releaseLock();
        return { success: true, method: "thermal", message: "Printed via serial", timestamp: Date.now() };
      } catch (e) {
        return { success: false, method: "thermal", message: "Serial write failed", timestamp: Date.now(), error: String(e) };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usb = this.usbDevice as any;
    if (usb) {
      try {
        const endpoint = usb.configuration?.interfaces[0]?.alternates[0]?.endpoints.find((e: { direction: string }) => e.direction === "out");
        if (endpoint) {
          await usb.transferOut(endpoint.endpointNumber, result.data);
          return { success: true, method: "thermal", message: "Printed via USB", timestamp: Date.now() };
        }
      } catch (e) {
        return { success: false, method: "thermal", message: "USB write failed", timestamp: Date.now(), error: String(e) };
      }
    }

    return { success: false, method: "thermal", message: "No thermal printer connected", timestamp: Date.now(), error: "NO_DEVICE" };
  }

  async printBrowser(paperSize: PaperSize = "80mm"): Promise<PrintResult> {
    try {
      const style = document.createElement("style");
      style.id = "print-overrides";
      style.textContent = this.getPrintCSS(paperSize);
      document.head.appendChild(style);

      document.body.classList.add("print-mode");

      await new Promise<void>((resolve) => {
        const handler = () => {
          window.removeEventListener("afterprint", handler);
          document.body.classList.remove("print-mode");
          document.getElementById("print-overrides")?.remove();
          resolve();
        };
        window.addEventListener("afterprint", handler);
        window.print();
        setTimeout(handler, 1000);
      });

      return { success: true, method: "browser", message: `Printed (${paperSize})`, timestamp: Date.now() };
    } catch (e) {
      return { success: false, method: "browser", message: "Browser print failed", timestamp: Date.now(), error: String(e) };
    }
  }

  async generatePDF(elementId: string = "receipt-content"): Promise<PrintResult> {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById(elementId) || document.querySelector(".receipt-content");
      if (!element) throw new Error("Receipt element not found");

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "mm",
        format: [80, Math.max(120, (canvas.height * 80) / canvas.width)],
      });

      pdf.addImage(imgData, "PNG", 2, 2, 76, (canvas.height * 76) / canvas.width);
      pdf.setProperties({
        title: "DukaManager Receipt",
        subject: "Sales Receipt",
        creator: "DukaManager",
      });

      pdf.save("DukaManager_Receipt.pdf");
      return { success: true, method: "pdf", message: "PDF downloaded", timestamp: Date.now() };
    } catch (e) {
      return { success: false, method: "pdf", message: "PDF generation failed", timestamp: Date.now(), error: String(e) };
    }
  }

  async shareReceipt(content: string, filename: string): Promise<PrintResult> {
    try {
      if (navigator.share) {
        const blob = new Blob([content], { type: "text/plain" });
        const file = new File([blob], filename, { type: "text/plain" });
        await navigator.share({ title: "DukaManager Receipt", text: content.slice(0, 200), files: [file] });
        return { success: true, method: "share", message: "Shared successfully", timestamp: Date.now() };
      }
      throw new Error("Share not available");
    } catch (e) {
      return { success: false, method: "share", message: "Share failed", timestamp: Date.now(), error: String(e) };
    }
  }

  private getPrintCSS(paperSize: PaperSize): string {
    const sizes: Record<PaperSize, string> = {
      "80mm": "size: 80mm auto; margin: 2mm;",
      a4: "size: A4; margin: 10mm;",
      letter: "size: letter; margin: 0.5in;",
      legal: "size: legal; margin: 0.5in;",
    };

    return `
      @media print {
        ${sizes[paperSize]}
        body * { visibility: hidden !important; }
        #receipt-content, #receipt-content *, .receipt-content, .receipt-content * {
          visibility: visible !important;
        }
        #receipt-content, .receipt-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: ${paperSize === "80mm" ? "302px" : "100%"} !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .print\\:hidden, .print-hidden { display: none !important; }
        tr, .receipt-item { page-break-inside: avoid !important; }
        @page { ${sizes[paperSize]} }
      }
    `;
  }
}

// Singleton instance
let managerInstance: PrintManager | null = null;

export function getPrintManager(): PrintManager {
  if (!managerInstance) managerInstance = new PrintManager();
  return managerInstance;
}
