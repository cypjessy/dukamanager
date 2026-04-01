"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import type { Product } from "@/data/inventoryData";

export const useProducts = () => {
  const { shopId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadProducts = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const colRef = collection(db, "shops", shopId, "products");

        const unsub = onSnapshot(
          colRef,
          (snapshot) => {
            const data: Product[] = snapshot.docs.map((d) => {
              const raw = d.data();
              return {
                id: d.id,
                name: raw.name || "",
                nameSw: raw.nameSw || raw.name || "",
                sku: raw.sku || d.id.slice(-6).toUpperCase(),
                category: raw.category || "other",
                categorySw: raw.categorySw || raw.category || "",
                unit: raw.unit || "pieces",
                unitLabel: raw.unitLabel || { en: raw.unit || "pieces", sw: raw.unit || "vipande" },
                quantity: Number(raw.quantity) || 0,
                reorderPoint: Number(raw.reorderPoint || raw.minStock) || 10,
                buyingPrice: Number(raw.buyingPrice) || 0,
                sellingPrice: Number(raw.sellingPrice) || 0,
                wholesalePrice: Number(raw.wholesalePrice) || 0,
                supplierId: raw.supplierId || raw.supplier || "",
                lastRestocked: raw.lastRestocked || raw.createdAt || new Date().toISOString(),
                expiryDate: raw.expiryDate,
                description: raw.description || "",
                salesVelocity: Number(raw.salesVelocity) || 1,
                warehouse: raw.warehouse || "Shelf A",
                imageUrl: raw.imageUrl || "",
                createdAt: raw.createdAt || new Date().toISOString(),
              };
            });
            setProducts(data);
            setLoading(false);
          },
          (err) => {
            console.warn("Products subscription error:", err);
            setLoading(false);
          }
        );

        return unsub;
      } catch (err) {
        console.warn("Failed to init products:", err);
        setLoading(false);
        return () => {};
      }
    };

    let unsubFn: (() => void) | undefined;
    loadProducts().then((fn) => { unsubFn = fn; });

    return () => { if (unsubFn) unsubFn(); };
  }, [shopId]);

  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "lastRestocked">) => {
    if (!shopId) throw new Error("No active shop");
    const now = new Date().toISOString();
    const data = {
      ...product,
      lastRestocked: now,
      createdAt: now,
      buyingPrice: Number(product.buyingPrice) || 0,
      sellingPrice: Number(product.sellingPrice) || 0,
      wholesalePrice: Number(product.wholesalePrice) || 0,
      quantity: Number(product.quantity) || 0,
      reorderPoint: Number(product.reorderPoint) || 10,
      salesVelocity: Number(product.salesVelocity) || 1,
    };
    const { db } = await import("@/lib/firebase/config");
    const colRef = collection(db, "shops", shopId, "products");
    return addDoc(colRef, data).then((ref) => ref.id);
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const docRef = doc(db, "shops", shopId, "products", productId);
    const cleanData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) cleanData[key] = value;
    }
    return updateDoc(docRef, cleanData);
  };

  const deleteProduct = async (productId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const docRef = doc(db, "shops", shopId, "products", productId);
    return deleteDoc(docRef);
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
