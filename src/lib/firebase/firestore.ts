import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "./config";

// Generic helper functions for a multi-tenant shop

/**
 * Get a reference to a subcollection for a specific shop
 * e.g. shops/shopId/products
 */
export const getShopCollectionRef = (shopId: string, path: string) => {
  return collection(db, "shops", shopId, path);
};

/**
 * Get a reference to a specific document inside a shop's subcollection
 * e.g. shops/shopId/products/productId
 */
export const getShopDocRef = (shopId: string, path: string, docId: string) => {
  return doc(db, "shops", shopId, path, docId);
};

// Fetch generic docs
export const getShopDocs = async <T>(shopId: string, path: string): Promise<T[]> => {
  const colRef = getShopCollectionRef(shopId, path);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

// Listen to generic docs
export const subscribeToShopDocs = <T>(
  shopId: string, 
  path: string, 
  callback: (data: T[]) => void
) => {
  const colRef = getShopCollectionRef(shopId, path);
  const q = query(colRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
};

// Add doc
export const addShopDoc = async <T extends Record<string, unknown>>(shopId: string, path: string, data: T) => {
  const colRef = getShopCollectionRef(shopId, path);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// Update doc
export const updateShopDoc = async (shopId: string, path: string, docId: string, data: Partial<Record<string, unknown>>) => {
  const docRef = getShopDocRef(shopId, path, docId);
  await updateDoc(docRef, data);
};

// Delete doc
export const deleteShopDoc = async (shopId: string, path: string, docId: string) => {
  const docRef = getShopDocRef(shopId, path, docId);
  await deleteDoc(docRef);
};
