const ENCRYPTION_KEY = "DukaManager2026!@#";

function xorEncrypt(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function toBase64(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

function fromBase64(str: string): string {
  if (typeof window !== "undefined") {
    return decodeURIComponent(escape(atob(str)));
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

export function encryptData(data: string): string {
  try {
    const encrypted = xorEncrypt(data, ENCRYPTION_KEY);
    return toBase64(encrypted);
  } catch {
    return data;
  }
}

export function decryptData(data: string): string {
  try {
    const decoded = fromBase64(data);
    return xorEncrypt(decoded, ENCRYPTION_KEY);
  } catch {
    return data;
  }
}

export function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateReturnAuthNo(): string {
  const prefix = "RA";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
