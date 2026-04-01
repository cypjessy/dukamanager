import type { Transaction } from "@/data/salesData";

// ===== SHOP TENANT MODEL =====

export interface ShopTenant {
  id: string;
  name: string;
  location: string;
  kraPin?: string;
  phone?: string;
  senderId: string;
  senderIdStatus: "auto" | "pending" | "approved" | "rejected" | "fallback";
  verificationPrefix: string;
  brandGradient: [string, string];
  initials: string;
}

// ===== SENDER ID MANAGEMENT =====

// Prohibited words per Kenyan Communications Authority
const PROHIBITED_WORDS = new Set([
  "SAFARICOM", "AIRTEL", "EQUITEL", "TELKOM", "KRA", "GOV", "GOVERNMENT",
  "POLICE", "ARMY", "MILITARY", "BANK", "CENTRALBANK", "CBK", "MPESA",
  "MICROSOFT", "GOOGLE", "FACEBOOK", "APPLE", "AMAZON", "NETFLIX",
  "EMERGENCY", "URGENT", "ALERT", "WARNING", "VIRUS", "COVID",
]);

/**
 * Generate sender ID from shop name per Africa's Talking/Safaricom rules:
 * - Max 11 characters
 * - Uppercase alphanumeric only
 * - No spaces or special characters
 * - Not in prohibited words list
 */
export function generateSenderId(shopName: string): string {
  const cleaned = shopName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);

  if (cleaned.length < 3) return "DUKAMAN";
  if (PROHIBITED_WORDS.has(cleaned)) return "DUKAMAN";

  return cleaned;
}

/**
 * Validate sender ID against regulatory requirements
 */
export function validateSenderId(senderId: string): { valid: boolean; reason?: string } {
  if (senderId.length < 3) return { valid: false, reason: "Too short (min 3 chars)" };
  if (senderId.length > 11) return { valid: false, reason: "Too long (max 11 chars)" };
  if (!/^[A-Z0-9]+$/.test(senderId)) return { valid: false, reason: "Alphanumeric only" };
  if (PROHIBITED_WORDS.has(senderId)) return { valid: false, reason: "Prohibited word" };
  return { valid: true };
}

/**
 * Generate 3-character shop prefix from name hash
 */
export function generateShopPrefix(shopName: string): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  for (let i = 0; i < shopName.length; i++) {
    hash = ((hash << 5) - hash + shopName.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);
  return [
    CHARS[hash % CHARS.length],
    CHARS[(hash >> 5) % CHARS.length],
    CHARS[(hash >> 10) % CHARS.length],
  ].join("");
}

/**
 * Generate brand gradient colors from shop name hash
 */
export function generateBrandGradient(shopName: string): [string, string] {
  const palettes: [string, string][] = [
    ["#C75B39", "#D4A574"], // Terracotta-Gold (default)
    ["#2D5A3D", "#8CB369"], // Forest
    ["#D4A574", "#F2CC8F"], // Gold-Sunrise
    ["#9B2335", "#D4A574"], // Crimson-Gold
    ["#1B4965", "#62B6CB"], // Ocean
    ["#6B4226", "#D4A574"], // Mahogany
  ];
  let hash = 0;
  for (let i = 0; i < shopName.length; i++) {
    hash = ((hash << 5) - hash + shopName.charCodeAt(i)) | 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}

/**
 * Get shop initials for avatar
 */
export function getShopInitials(shopName: string): string {
  const words = shopName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ===== VERIFICATION CODE WITH SHOP PREFIX =====

const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomSegment(length: number): string {
  let segment = "";
  const array = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * SAFE_CHARS.length);
  }
  for (let i = 0; i < length; i++) {
    segment += SAFE_CHARS[array[i] % SAFE_CHARS.length];
  }
  return segment;
}

/**
 * Generate verification code with shop prefix: PREFIX-RANDOM
 * Example: DMR-7X9K2
 */
export function generateShopVerificationCode(shopPrefix: string): string {
  const random = generateRandomSegment(5);
  return `${shopPrefix}-${random}`;
}

/**
 * Parse verification code to extract prefix and full code
 */
export function parseVerificationCode(code: string): { prefix: string; fullCode: string } | null {
  const cleaned = code.replace(/-/g, "").toUpperCase();
  if (cleaned.length < 8) return null;
  const prefix = cleaned.slice(0, 3);
  const fullCode = cleaned;
  return { prefix, fullCode };
}

// ===== SMS COMPOSITION WITH SENDER ID =====

/**
 * Build SMS with shop sender ID, constrained to 160 chars for single SMS
 * Format: Receipt #[NUM] KES[AMT] Code:[CODE] [SHOP] verify:duka.manager/v/[CODE]
 */
export function buildShopReceiptSMS(
  transaction: Transaction,
  verificationCode: string,
  shopName: string,
  senderId: string
): { message: string; charCount: number; smsCount: number; estimatedCost: number } {
  const total = transaction.total.toLocaleString();
  const receiptNum = transaction.receiptNo.slice(-5);
  const code = verificationCode;

  // Compact format to fit 160 chars
  const shopShort = senderId.slice(0, 8);
  let msg = `Receipt #${receiptNum} KES${total} Code:${code} ${shopShort} verify:duka.manager/v/${code}`;

  if (msg.length <= 160) {
    return { message: msg, charCount: msg.length, smsCount: 1, estimatedCost: 0.50 };
  }

  // Ultra-compact fallback
  msg = `RCP${receiptNum} KES${total} ${code} ${shopShort}`;
  if (msg.length <= 160) {
    return { message: msg, charCount: msg.length, smsCount: 1, estimatedCost: 0.50 };
  }

  // Multi-SMS as last resort
  return { message: msg.slice(0, 320), charCount: msg.length, smsCount: Math.ceil(msg.length / 160), estimatedCost: Math.ceil(msg.length / 160) * 0.50 };
}

/**
 * Build download summary with shop branding
 */
export function buildShopDownloadSummary(
  transaction: Transaction,
  verificationCode: string,
  shop: ShopTenant
): string {
  const lines = [
    "══════════════════════════════",
    `         ${shop.senderId}`,
    "         SALES RECEIPT",
    "══════════════════════════════",
    "",
    `Shop: ${shop.name}`,
    `Location: ${shop.location}`,
    ...(shop.kraPin ? [`KRA PIN: ${shop.kraPin}`] : []),
    "",
    `Receipt #: ${transaction.receiptNo}`,
    `Date: ${transaction.date}`,
    `Time: ${transaction.time}`,
    `Cashier: ${transaction.cashier}`,
    `Customer: ${transaction.customer}`,
    `Verification: ${verificationCode}`,
    "",
    "──────────────────────────────",
    "ITEMS",
    "──────────────────────────────",
  ];

  for (const item of transaction.items) {
    const lineTotal = (item.qty * item.price).toLocaleString();
    lines.push(`${item.name}`);
    lines.push(`  ${item.qty} x KSh ${item.price.toLocaleString()} = KSh ${lineTotal}`);
  }

  lines.push("──────────────────────────────");
  lines.push(`Subtotal:    KSh ${transaction.subtotal.toLocaleString()}`);
  if (transaction.discount > 0) lines.push(`Discount:   -KSh ${transaction.discount.toLocaleString()}`);
  if (transaction.vat > 0) lines.push(`VAT:         KSh ${transaction.vat.toLocaleString()}`);
  lines.push(`TOTAL:       KSh ${transaction.total.toLocaleString()}`);
  lines.push("──────────────────────────────");
  lines.push(`Payment: ${transaction.method.toUpperCase()}`);
  if (transaction.mpesaRef) lines.push(`M-Pesa Ref: ${transaction.mpesaRef}`);
  if (transaction.cashTendered) lines.push(`Cash: KSh ${transaction.cashTendered.toLocaleString()}`);
  if (transaction.changeDue) lines.push(`Change: KSh ${transaction.changeDue.toLocaleString()}`);
  lines.push("──────────────────────────────");
  lines.push(`Verify: duka.manager/v/${verificationCode}`);
  lines.push("");
  lines.push(`Asante kwa Kununuka kwa ${shop.name}!`);
  lines.push("Thank you for shopping with us!");
  lines.push("══════════════════════════════");

  return lines.join("\n");
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== SMS DELIVERY AUDIT LOG =====

export interface SMSDeliveryLog {
  id: string;
  shopId: string;
  shopName: string;
  senderId: string;
  phone: string;
  transactionId: string;
  receiptNo: string;
  verificationCode: string;
  message: string;
  charCount: number;
  smsCount: number;
  cost: number;
  status: "pending" | "sent" | "delivered" | "failed";
  carrier?: "safaricom" | "airtel" | "equitel" | "other";
  timestamp: number;
  error?: string;
}

// In-memory stores (would be DB in production)
const smsLogs: SMSDeliveryLog[] = [];
const verificationStore = new Map<string, { shopId: string; shopName: string; transaction: Transaction; timestamp: number }>();

export function logSMSDelivery(log: Omit<SMSDeliveryLog, "id" | "timestamp">): SMSDeliveryLog {
  const entry: SMSDeliveryLog = {
    ...log,
    id: `SMS${Date.now().toString(36).toUpperCase()}`,
    timestamp: Date.now(),
  };
  smsLogs.push(entry);
  return entry;
}

export function storeVerificationWithShop(code: string, shopId: string, shopName: string, transaction: Transaction) {
  verificationStore.set(code.replace(/-/g, "").toUpperCase(), { shopId, shopName, transaction, timestamp: Date.now() });
}

export function lookupVerificationWithShop(code: string): { shopId: string; shopName: string; transaction: Transaction } | null {
  const entry = verificationStore.get(code.replace(/-/g, "").toUpperCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > 90 * 24 * 60 * 60 * 1000) return null;
  return entry;
}

export function getSMSLogsForShop(shopId: string): SMSDeliveryLog[] {
  return smsLogs.filter((l) => l.shopId === shopId);
}

export function getSMSSuccessRate(shopId: string): number {
  const logs = getSMSLogsForShop(shopId);
  if (logs.length === 0) return 100;
  const successful = logs.filter((l) => l.status === "sent" || l.status === "delivered").length;
  return Math.round((successful / logs.length) * 100);
}

// ===== SHOP TENANT REGISTRY =====

// In production this would be a database table
const shopTenants = new Map<string, ShopTenant>();

export function registerShopTenant(shop: { id: string; name: string; location: string; kraPin?: string; phone?: string }): ShopTenant {
  const existing = shopTenants.get(shop.id);
  if (existing) return existing;

  const tenant: ShopTenant = {
    ...shop,
    senderId: generateSenderId(shop.name),
    senderIdStatus: "auto",
    verificationPrefix: generateShopPrefix(shop.name),
    brandGradient: generateBrandGradient(shop.name),
    initials: getShopInitials(shop.name),
  };
  shopTenants.set(shop.id, tenant);
  return tenant;
}

export function getShopTenant(shopId: string): ShopTenant | null {
  return shopTenants.get(shopId) || null;
}

export function getShopTenantByName(shopName: string): ShopTenant | null {
  const tenants = Array.from(shopTenants.values());
  for (const tenant of tenants) {
    if (tenant.name === shopName) return tenant;
  }
  return null;
}

// Register default shops
registerShopTenant({ id: "1", name: "Mama Njeri Groceries", location: "Gikomba, Nairobi", kraPin: "A123456789B", phone: "0712345678" });
registerShopTenant({ id: "2", name: "Westlands Branch", location: "Westlands, Nairobi", phone: "0798765432" });
