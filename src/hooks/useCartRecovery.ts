"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CartItem, CartRecoveryData, SaveState } from "@/types/cashier";
import { getCartPersistenceService } from "@/lib/cartPersistence";

export function useCartRecovery() {
  const [recoveryData, setRecoveryData] = useState<CartRecoveryData | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    layer: null,
  });

  const serviceRef = useRef(getCartPersistenceService());

  // Subscribe to save state changes
  useEffect(() => {
    const service = serviceRef.current;
    const unsubscribe = service.onSaveStateChange(setSaveState);
    setSaveState(service.getSaveState());
    return unsubscribe;
  }, []);

  // Check for recovery on mount
  useEffect(() => {
    const checkRecovery = async () => {
      const service = serviceRef.current;
      const data = await service.recoverCart();
      setRecoveryData(data);
      if (data.hasRecovery) {
        setShowRecoveryDialog(true);
      }
    };
    checkRecovery();
  }, []);

  // Auto-save on cart changes
  const saveCart = useCallback((items: CartItem[], customerId: string | null) => {
    if (items.length === 0) return;
    serviceRef.current.saveCart(items, customerId);
  }, []);

  // Manual save (Hifadhi Muda)
  const saveCartManual = useCallback(async (items: CartItem[], customerId: string | null) => {
    await serviceRef.current.saveCartImmediate(items, customerId);
  }, []);

  // Resume recovered cart
  const resumeCart = useCallback((): { items: CartItem[]; customerId: string | null } | null => {
    if (!recoveryData?.cart) return null;
    setShowRecoveryDialog(false);
    return {
      items: recoveryData.cart.items,
      customerId: recoveryData.cart.customerId,
    };
  }, [recoveryData]);

  // Discard recovered cart
  const discardRecovery = useCallback(async () => {
    await serviceRef.current.clearAll();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, []);

  // Clear cart persistence after successful payment
  const clearPersistedCart = useCallback(async () => {
    await serviceRef.current.clearAll();
  }, []);

  return {
    recoveryData,
    showRecoveryDialog,
    setShowRecoveryDialog,
    saveState,
    saveCart,
    saveCartManual,
    resumeCart,
    discardRecovery,
    clearPersistedCart,
  };
}
