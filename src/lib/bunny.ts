const BUNNY_STORAGE_ZONE = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE || "histoview";
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "213c0699-7662-4802-8017bd573513-a997-4abe";
const BUNNY_CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || "https://histoview.b-cdn.net";
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_REGION || "jh.storage.bunnycdn.com";

export interface BunnyUploadOptions {
  file: File;
  folder?: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface BunnyUploadResult {
  cdnUrl: string;
  fileName: string;
  size: number;
  contentType: string;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

function generateUniquePath(folder: string, file: File, shopId?: string): string {
  const ext = file.name.split(".").pop() || "bin";
  const base = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  const prefix = shopId ? `${shopId}/${folder}` : folder;
  return `${prefix}/${base}_${ts}_${rand}.${ext}`;
}

export async function uploadToBunny({
  file,
  folder = "general",
  shopId,
  onProgress,
  signal,
}: BunnyUploadOptions & { shopId?: string }): Promise<BunnyUploadResult> {
  const path = generateUniquePath(folder, file, shopId);
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          cdnUrl: `${BUNNY_CDN_URL}/${path}`,
          fileName: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    if (signal) {
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.open("PUT", url);
    xhr.setRequestHeader("AccessKey", BUNNY_API_KEY);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}

export async function deleteFromBunny(cdnUrl: string): Promise<void> {
  const path = cdnUrl.replace(`${BUNNY_CDN_URL}/`, "");
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${path}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: BUNNY_API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status}`);
  }
}

export function getBunnyCdnUrl(path: string): string {
  return `${BUNNY_CDN_URL}/${path}`;
}

export const BUNNY_CDN_BASE = BUNNY_CDN_URL;
