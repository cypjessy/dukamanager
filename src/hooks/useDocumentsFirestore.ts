"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { uploadToBunny as bunnyUpload } from "@/lib/bunny";
import type { Document, DocCategory, DocStatus } from "@/data/documentData";
import { categoryConfig } from "@/data/documentData";

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function useDocumentsFirestore() {
  const { shopId } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)>();

  useEffect(() => {
    if (!shopId) { setLoading(false); setDocuments([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const unsub = onSnapshot(collection(db, "shops", shopId, "documents"), (snap) => {
          const data: Document[] = snap.docs.map((d) => {
            const r = d.data();
            const expiryDate = r.expiryDate || null;
            const now = new Date();
            const daysUntil = expiryDate ? Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / 86400000) : null;
            let status: DocStatus = "valid";
            if (daysUntil !== null) {
              if (daysUntil < 0) status = "expired";
              else if (daysUntil < 30) status = "expiring_soon";
            }

            return {
              id: d.id,
              name: r.name || "",
              description: r.description || "",
              category: r.category || "other",
              fileType: r.fileType || "doc",
              fileSize: r.fileSize || "0KB",
              uploadDate: r.uploadDate || r.createdAt?.slice(0, 10) || "",
              expiryDate,
              renewalDate: r.renewalDate || null,
              tags: r.tags || [],
              folderId: r.folderId || r.category || "",
              version: Number(r.version) || 1,
              status,
              linkedTo: r.linkedTo,
              uploadedBy: r.uploadedBy || "Staff",
              fileUrl: r.fileUrl || undefined,
            };
          });
          setDocuments(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current = unsub;
      } catch (err) {
        console.warn("Failed to init documents:", err);
        setLoading(false);
      }
    };

    init();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [shopId]);

  const uploadToBunny = useCallback(async (file: File, folder = "documents"): Promise<UploadResult> => {
    const result = await bunnyUpload({
      file,
      folder,
      shopId: shopId || undefined,
    });
    return {
      url: result.cdnUrl,
      fileName: result.fileName,
      fileSize: result.size,
      fileType: result.contentType,
    };
  }, [shopId]);

  // Save document metadata to Firestore (after upload)
  const addDocument = useCallback(async (data: {
    name: string;
    category: DocCategory;
    description: string;
    documentNumber: string;
    issuingAuthority: string;
    issueDate: string;
    expiryDate: string;
    tags: string[];
    linkedTo: string;
    accessLevel: string;
    reminder: boolean;
    reminderDays: number;
    file: File | null;
  }) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date();

    let fileUrl = "";
    let fileType: Document["fileType"] = "doc";
    let fileSize = "0KB";

    if (data.file) {
      const uploadResult = await uploadToBunny(data.file);
      fileUrl = uploadResult.url;
      fileType = uploadResult.fileType.includes("pdf") ? "pdf"
        : uploadResult.fileType.includes("image") ? "image"
        : uploadResult.fileType.includes("spreadsheet") || uploadResult.fileType.includes("excel") ? "xls"
        : "doc";
      fileSize = uploadResult.fileSize > 1024 * 1024
        ? `${(uploadResult.fileSize / (1024 * 1024)).toFixed(1)}MB`
        : `${(uploadResult.fileSize / 1024).toFixed(0)}KB`;
    }

    const expiryDate = data.expiryDate || null;
    const renewalDate = expiryDate
      ? new Date(new Date(expiryDate).getTime() - 30 * 86400000).toISOString().slice(0, 10)
      : null;

    return addDoc(collection(db, "shops", shopId, "documents"), {
      name: data.name,
      description: data.description || "",
      category: data.category,
      fileType,
      fileSize,
      uploadDate: now.toISOString().slice(0, 10),
      expiryDate,
      renewalDate,
      tags: [...data.tags, data.documentNumber, data.issuingAuthority].filter(Boolean),
      folderId: data.category,
      version: 1,
      linkedTo: data.linkedTo || "",
      uploadedBy: "Staff",
      fileUrl,
      documentNumber: data.documentNumber || "",
      issuingAuthority: data.issuingAuthority || "",
      accessLevel: data.accessLevel || "private",
      reminderEnabled: data.reminder,
      reminderDays: data.reminderDays || 30,
      createdAt: now.toISOString(),
    });
  }, [shopId, uploadToBunny]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) { if (v !== undefined) clean[k] = v; }
    return updateDoc(doc(db, "shops", shopId, "documents", id), clean);
  }, [shopId]);

  const deleteDocument = useCallback(async (id: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const { deleteFromBunny } = await import("@/lib/bunny");

    // Get the document to retrieve fileUrl before deleting
    const { getDoc } = await import("firebase/firestore");
    const docRef = doc(db, "shops", shopId, "documents", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.fileUrl) {
        deleteFromBunny(data.fileUrl).catch((e) => console.warn("Failed to delete file from BunnyCDN:", e));
      }
    }

    return deleteDoc(docRef);
  }, [shopId]);

  // Computed stats
  const expiringDocs = documents.filter((d) => d.status === "expiring_soon").length;
  const expiredDocs = documents.filter((d) => d.status === "expired").length;
  const validDocs = documents.filter((d) => d.status === "valid").length;
  const complianceScore = documents.length > 0
    ? Math.round(((validDocs + expiringDocs) / documents.length) * 100)
    : 100;

  return {
    documents,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    uploadToBunny,
    expiringDocs,
    expiredDocs,
    complianceScore,
    categoryConfig,
  };
}
