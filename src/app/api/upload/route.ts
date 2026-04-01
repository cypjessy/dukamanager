import { NextRequest, NextResponse } from "next/server";

// Supported file categories and their storage paths
const STORAGE_PATHS: Record<string, string> = {
  documents: "documents",
  receipts: "receipts",
  products: "products",
  logos: "logos",
  profiles: "profiles",
  returns: "returns",
  reports: "reports",
  backups: "backups",
};

// File size limits by type (in bytes)
const SIZE_LIMITS: Record<string, number> = {
  "image/jpeg": 10 * 1024 * 1024,   // 10MB
  "image/png": 10 * 1024 * 1024,
  "image/webp": 10 * 1024 * 1024,
  "image/gif": 5 * 1024 * 1024,
  "application/pdf": 25 * 1024 * 1024, // 25MB
  "text/csv": 10 * 1024 * 1024,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 10 * 1024 * 1024,
  "application/vnd.ms-excel": 10 * 1024 * 1024,
};

const DEFAULT_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB default

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const shopId = formData.get("shopId") as string | null;
    const category = (formData.get("category") as string) || "documents";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bunnyApiKey = process.env.BUNNY_API_KEY;
    const bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE || "duka-manager";
    const bunnyPullZone = process.env.BUNNY_PULL_ZONE || "cdn.dukamanager.co.ke";

    if (!bunnyApiKey) {
      return NextResponse.json({ error: "Bunny.net storage not configured" }, { status: 500 });
    }

    // Validate file size
    const sizeLimit = SIZE_LIMITS[file.type] || DEFAULT_SIZE_LIMIT;
    if (file.size > sizeLimit) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB`,
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = Object.keys(SIZE_LIMITS);
    if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json({
        error: `File type not allowed: ${file.type}`,
      }, { status: 400 });
    }

    // Build storage path organized by shop
    const storagePrefix = STORAGE_PATHS[category] || "uploads";
    const timestamp = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeName = `${timestamp}.${ext}`;

    // Shop-isolated path: shops/{shopId}/{category}/{filename}
    const shopPath = shopId ? `shops/${shopId}` : "shared";
    const fullPath = `${shopPath}/${storagePrefix}/${safeName}`;

    // Upload to Bunny.net
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadUrl = `https://storage.bunnycdn.com/${bunnyStorageZone}/${fullPath}`;

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: bunnyApiKey,
        "Content-Type": file.type,
        "Content-Length": file.size.toString(),
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Bunny.net upload error:", errorText);
      return NextResponse.json({ error: "Upload to CDN failed" }, { status: 500 });
    }

    const cdnUrl = `https://${bunnyPullZone}/${fullPath}`;

    return NextResponse.json({
      url: cdnUrl,
      fileName: file.name,
      safeName,
      size: file.size,
      type: file.type,
      category,
      path: fullPath,
      shopId: shopId || null,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE endpoint for removing files
export async function DELETE(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const bunnyApiKey = process.env.BUNNY_API_KEY;
    const bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE || "duka-manager";

    if (!bunnyApiKey) {
      return NextResponse.json({ error: "Bunny.net storage not configured" }, { status: 500 });
    }

    const deleteUrl = `https://storage.bunnycdn.com/${bunnyStorageZone}/${path}`;

    const res = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { AccessKey: bunnyApiKey },
    });

    if (!res.ok && res.status !== 404) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
