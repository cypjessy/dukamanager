"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";

export type LockoutReason = "locked" | "force_logout" | "none";

export interface PortalGuardState {
  isLocked: boolean;
  reason: LockoutReason;
  message: string;
  adminMessage: string | null;
}

export function usePortalGuard() {
  const { user, shopId } = useAuth();
  const [guardState, setGuardState] = useState<PortalGuardState>({
    isLocked: false,
    reason: "none",
    message: "",
    adminMessage: null,
  });
  const isInitRef = useRef(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user || !shopId) return;

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const { doc, onSnapshot } = await import("firebase/firestore");

        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          const isActive = data.isActive !== false;
          const forceLogoutAt = data.forceLogoutAt || null;

          // On initial load: check if already locked out
          if (isInitRef.current) {
            isInitRef.current = false;
            if (!isActive) {
              setGuardState({
                isLocked: true,
                reason: "locked",
                message: "Your portal has been temporarily suspended by the administrator. Please contact your supervisor for assistance.",
                adminMessage: data.lastAdminMessage || null,
              });
            } else if (forceLogoutAt) {
              // If forceLogoutAt exists on init, check if it's recent (within last 30 seconds)
              const logoutTime = new Date(forceLogoutAt).getTime();
              if (Date.now() - logoutTime < 30000) {
                setGuardState({
                  isLocked: true,
                  reason: "force_logout",
                  message: "Your session has been ended by the administrator. Please log in again to continue.",
                  adminMessage: data.lastAdminMessage || null,
                });
              }
            }
            return;
          }

          // On subsequent updates: detect changes
          if (!isActive) {
            setGuardState({
              isLocked: true,
              reason: "locked",
              message: "Your portal has been temporarily suspended by the administrator. Please contact your supervisor for assistance.",
              adminMessage: data.lastAdminMessage || null,
            });
          } else if (forceLogoutAt) {
            setGuardState({
              isLocked: true,
              reason: "force_logout",
              message: "Your session has been ended by the administrator. Please log in again to continue.",
              adminMessage: data.lastAdminMessage || null,
            });
          }
        });

        unsubRef.current = unsub;
      } catch (e) {
        console.warn("Failed to init portal guard:", e);
      }
    };

    init();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [user, shopId]);

  // Subscribe to admin messages
  useEffect(() => {
    if (!user || !shopId) return;

    let unsubMessages: (() => void) | undefined;

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");
        const { collection, query, where, orderBy, limit, onSnapshot } = await import("firebase/firestore");

        unsubMessages = onSnapshot(
          query(
            collection(db, "shops", shopId, "messages"),
            where("cashierId", "==", user.uid),
            where("read", "==", false),
            orderBy("sentAt", "desc"),
            limit(1)
          ),
          (snap) => {
            if (snap.docs.length > 0) {
              const msg = snap.docs[0].data();
              setGuardState((prev) => ({
                ...prev,
                adminMessage: msg.message || null,
              }));
            }
          }
        );
      } catch (e) {
        console.warn("Failed to subscribe to admin messages:", e);
      }
    };

    init();
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [user, shopId]);

  const clearGuard = () => {
    setGuardState({
      isLocked: false,
      reason: "none",
      message: "",
      adminMessage: null,
    });
  };

  return { ...guardState, clearGuard };
}
