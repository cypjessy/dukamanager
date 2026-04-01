"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "firebase/auth";
import type { UserRole } from "@/lib/firebase/auth";

interface CurrentShop {
  id: string;
  name: string;
  ownerId: string;
}

interface AuthContextType {
  user: User | null;
  shopId: string | null;
  role: UserRole | null;
  currentShop: CurrentShop;
  profile: {
    uid: string;
    email: string;
    displayName?: string;
    phone?: string;
    isActive: boolean;
  } | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  shopId: null,
  role: null,
  currentShop: { id: "", name: "", ownerId: "" },
  profile: null,
  loading: true,
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentShop, setCurrentShop] = useState<CurrentShop>({ id: "", name: "", ownerId: "" });
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const authResolvedRef = useRef(false);

  const logout = useCallback(async () => {
    try {
      const { logoutUser } = await import("@/lib/firebase/auth");
      await logoutUser();
    } catch (err) {
      console.warn("Logout failed:", err);
    }
    if (!mountedRef.current) return;
    setUser(null);
    setShopId(null);
    setRole(null);
    setCurrentShop({ id: "", name: "", ownerId: "" });
    setProfile(null);
    setLoading(false);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    authResolvedRef.current = false;
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const config = await import("@/lib/firebase/config");
        const authModule = await import("firebase/auth");
        const firestoreModule = await import("firebase/firestore");
        const authUtilModule = await import("@/lib/firebase/auth");

        if (!mountedRef.current) return;

        unsubscribe = authModule.onAuthStateChanged(config.auth, async (firebaseUser: User | null) => {
          if (!mountedRef.current) return;

          if (firebaseUser) {
            setUser(firebaseUser);

            try {
              const userProfile = await authUtilModule.getUserProfile(firebaseUser.uid);

              if (!mountedRef.current) return;

              if (userProfile) {
                setShopId(userProfile.shopId || null);
                setRole(userProfile.role);
                setProfile({
                  uid: firebaseUser.uid,
                  email: userProfile.email,
                  displayName: userProfile.displayName,
                  phone: userProfile.phone,
                  isActive: userProfile.isActive,
                });

                if (userProfile.shopId) {
                  try {
                    const shopDoc = await firestoreModule.getDoc(
                      firestoreModule.doc(config.db, "shops", userProfile.shopId)
                    );
                    if (!mountedRef.current) return;
                    if (shopDoc.exists()) {
                      const shopData = shopDoc.data();
                      setCurrentShop({
                        id: userProfile.shopId,
                        name: shopData.shopName || "",
                        ownerId: shopData.ownerId || "",
                      });
                    }
                  } catch (shopErr) {
                    console.warn("Could not fetch shop:", shopErr);
                  }
                }
              } else {
                console.warn("No Firestore profile found for user:", firebaseUser.uid);
              }
            } catch (profileErr) {
              console.warn("Could not fetch profile:", profileErr);
            }

            if (!authResolvedRef.current) {
              authResolvedRef.current = true;
              if (mountedRef.current) setLoading(false);
            }
          } else {
            setUser(null);
            setShopId(null);
            setRole(null);
            setCurrentShop({ id: "", name: "", ownerId: "" });
            setProfile(null);

            if (!authResolvedRef.current) {
              authResolvedRef.current = true;
              if (mountedRef.current) setLoading(false);
            }
          }
        });
      } catch (initErr) {
        console.warn("Firebase init failed:", initErr);
        if (mountedRef.current && !authResolvedRef.current) {
          authResolvedRef.current = true;
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, shopId, role, currentShop, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
