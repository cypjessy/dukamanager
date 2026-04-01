import type { Transaction } from "@/data/salesData";
import type { ShopTenant } from "./shopTenant";

// ESC/POS Command bytes
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

// Alignment
const ALIGN_LEFT = new Uint8Array([ESC, 0x61, 0x00]);
const ALIGN_CENTER = new Uint8Array([ESC, 0x61, 0x01]);

// Text formatting
const BOLD_ON = new Uint8Array([ESC, 0x45, 0x01]);
const BOLD_OFF = new Uint8Array([ESC, 0x45, 0x00]);
const TEXT_NORMAL = new Uint8Array([ESC, 0x21, 0x00]);
const TEXT_DOUBLE_HEIGHT = new Uint8Array([ESC, 0x21, 0x10]);
const TEXT_DOUBLE_BOTH = new Uint8Array([ESC, 0x21, 0x30]);

// Paper
const LINE_FEED = new Uint8Array([LF]);
const CUT_PARTIAL = new Uint8Array([GS, 0x56, 0x01]);

// Cash drawer
const KICK_DRAWER = new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xFA]);

// Character set - Code page 437 (USA Standard Europe)
const CHAR_SET = new Uint8Array([ESC, 0x74, 0x00]);

function textToBytes(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text.replace(/[^\x20-\x7E\u00C0-\u00FF]/g, "?"));
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  let length = 0;
  for (const arr of arrays) length += arr.length;
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function padLine(left: string, right: string, width: number = 42): Uint8Array {
  const maxLeft = width - right.length - 1;
  const leftTrunc = left.length > maxLeft ? left.slice(0, maxLeft - 2) + ".." : left;
  const spaces = Math.max(1, width - leftTrunc.length - right.length);
  return textToBytes(leftTrunc + " ".repeat(spaces) + right + "\n");
}

function separator(char: string = "-", width: number = 42): Uint8Array {
  return textToBytes(char.repeat(width) + "\n");
}

function centerText(text: string, width: number = 42): Uint8Array {
  const padded = text.length >= width ? text.slice(0, width) : " ".repeat(Math.floor((width - text.length) / 2)) + text;
  return textToBytes(padded + "\n");
}

function sanitizeForReceipt(text: string): string {
  return text
    .replace(/[<>&"']/g, (c) => ({ "<": "<", ">": ">", "&": "&", '"': '"', "'": "'" }[c] || c))
    .replace(/[^\x20-\x7E\u00C0-\u00FF\u0100-\u024F]/g, "")
    .slice(0, 60);
}

export interface ESCPOSResult {
  data: Uint8Array;
  estimatedLines: number;
  estimatedTimeMs: number;
}

export function generateESCPOS(
  transaction: Transaction,
  shop: ShopTenant,
  verificationCode: string,
  options: { cutPaper?: boolean; kickDrawer?: boolean } = {}
): ESCPOSResult {
  const { cutPaper = true, kickDrawer = false } = options;
  const width = 42;
  const parts: Uint8Array[] = [];

  // Initialize
  parts.push(CHAR_SET, ALIGN_CENTER, TEXT_NORMAL);

  // Shop header
  parts.push(TEXT_DOUBLE_BOTH, BOLD_ON);
  parts.push(centerText(sanitizeForReceipt(shop.name.toUpperCase()), width));
  parts.push(BOLD_OFF, TEXT_NORMAL);

  parts.push(centerText(sanitizeForReceipt(shop.location), width));
  if (shop.kraPin) parts.push(centerText("KRA PIN: " + shop.kraPin, width));
  parts.push(LINE_FEED);

  // Receipt title
  parts.push(BOLD_ON, centerText("SALES RECEIPT", width), BOLD_OFF);
  parts.push(separator("=", width));

  // Meta info
  parts.push(ALIGN_LEFT);
  parts.push(padLine("Receipt: " + transaction.receiptNo, "Date: " + transaction.date, width));
  parts.push(padLine("Cashier: " + sanitizeForReceipt(transaction.cashier), "Time: " + transaction.time, width));
  parts.push(padLine("Customer: " + sanitizeForReceipt(transaction.customer), "", width));
  parts.push(separator("-", width));

  // Items header
  parts.push(BOLD_ON);
  parts.push(padLine("Item", "Qty  Price   Total", width));
  parts.push(BOLD_OFF);
  parts.push(separator("-", width));

  // Items
  parts.push(ALIGN_LEFT);
  for (const item of transaction.items) {
    const name = sanitizeForReceipt(item.name);
    const total = (item.qty * item.price).toLocaleString();
    const price = item.price.toLocaleString();
    parts.push(textToBytes(name + "\n"));
    const line = `${item.qty}x ${price}`.padStart(14) + total.padStart(10);
    parts.push(padLine("", line, width));
  }

  parts.push(separator("=", width));

  // Totals
  parts.push(padLine("Subtotal", "KSh " + transaction.subtotal.toLocaleString(), width));
  if (transaction.discount > 0) {
    parts.push(padLine("Discount", "-KSh " + transaction.discount.toLocaleString(), width));
  }
  if (transaction.vat > 0) {
    parts.push(padLine("VAT (16%)", "KSh " + transaction.vat.toLocaleString(), width));
  }
  parts.push(separator("-", width));
  parts.push(BOLD_ON, TEXT_DOUBLE_HEIGHT);
  parts.push(padLine("TOTAL", "KSh " + transaction.total.toLocaleString(), width));
  parts.push(BOLD_OFF, TEXT_NORMAL);
  parts.push(separator("=", width));

  // Payment
  parts.push(padLine("Payment: " + transaction.method.toUpperCase(), "", width));
  if (transaction.mpesaRef) parts.push(padLine("M-Pesa Ref: " + transaction.mpesaRef, "", width));
  if (transaction.cashTendered) {
    parts.push(padLine("Cash Tendered", "KSh " + transaction.cashTendered.toLocaleString(), width));
    if (transaction.changeDue && transaction.changeDue > 0) {
      parts.push(padLine("Change Due", "KSh " + transaction.changeDue.toLocaleString(), width));
    }
  }
  parts.push(separator("-", width));

  // Verification
  parts.push(ALIGN_CENTER);
  parts.push(centerText("Verification: " + verificationCode, width));
  parts.push(centerText("duka.manager/v/" + verificationCode, width));
  parts.push(LINE_FEED);

  // Thank you
  parts.push(centerText("Asante kwa Kununuka!", width));
  parts.push(centerText("Thank you for shopping with us!", width));
  parts.push(LINE_FEED, LINE_FEED);

  // Optional cash drawer kick
  if (kickDrawer) parts.push(KICK_DRAWER);

  // Paper cut
  if (cutPaper) parts.push(CUT_PARTIAL);

  const data = concatBytes(...parts);
  const estimatedLines = Math.ceil(data.length / width) + 10;
  const estimatedTimeMs = estimatedLines * 50;

  return { data, estimatedLines, estimatedTimeMs };
}

export function getPrinterCapabilities(): {
  webUSBAvailable: boolean;
  webSerialAvailable: boolean;
  webBluetoothAvailable: boolean;
  isMobile: boolean;
} {
  if (typeof navigator === "undefined") {
    return { webUSBAvailable: false, webSerialAvailable: false, webBluetoothAvailable: false, isMobile: false };
  }
  return {
    webUSBAvailable: "usb" in navigator,
    webSerialAvailable: "serial" in navigator,
    webBluetoothAvailable: "bluetooth" in navigator,
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
  };
}
