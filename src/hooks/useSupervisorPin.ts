"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function useSupervisorPin() {
  const { shopId } = useAuth();
  const [pin, setPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }

    const load = async () => {
      try {
        const ref = doc(db, "shops", shopId, "settings", "security");
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().supervisorPin) {
          setPin(snap.data().supervisorPin);
        }
      } catch { /* use default */ }
      setLoading(false);
    };
    load();
  }, [shopId]);

  const updatePin = useCallback(async (newPin: string) => {
    if (!shopId) throw new Error("No active shop");
    if (newPin.length < 4) throw new Error("PIN must be at least 4 digits");
    if (!/^\d+$/.test(newPin)) throw new Error("PIN must contain only numbers");

    const ref = doc(db, "shops", shopId, "settings", "security");
    await setDoc(ref, { supervisorPin: newPin, updatedAt: new Date().toISOString() }, { merge: true });
    setPin(newPin);
  }, [shopId]);

  const verifyPin = useCallback((inputPin: string) => {
    return inputPin === pin;
  }, [pin]);

  return { pin, loading, updatePin, verifyPin };
}
