"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/lib/firebase/auth";

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}) {
  const { user, role, loading, profile, logout } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const lockedHandledRef = useRef(false);
  const actionTakenRef = useRef(false);

  const handleLockedAccount = useCallback(async () => {
    if (lockedHandledRef.current) return;
    lockedHandledRef.current = true;
    sessionStorage.setItem("locked_account_notice", "true");
    await logout();
    actionTakenRef.current = true;
    router.replace(redirectTo);
  }, [logout, router, redirectTo]);

  useEffect(() => {
    if (actionTakenRef.current) return;

    if (loading) {
      return;
    }

    if (!user) {
      actionTakenRef.current = true;
      router.replace(redirectTo);
      return;
    }

    if (profile && !profile.isActive) {
      handleLockedAccount();
      return;
    }

    if (allowedRoles && !role) {
      actionTakenRef.current = true;
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      const isCashier = role === "cashier" || role === "head_cashier" || role === "trainee";
      const isDeveloper = role === "developer";
      actionTakenRef.current = true;
      router.replace(isDeveloper ? "/developer" : isCashier ? "/cashier" : "/dashboard");
      return;
    }

    setAuthorized(true);
    actionTakenRef.current = true;
  }, [user, role, loading, profile, allowedRoles, redirectTo, router, handleLockedAccount]);

  if (loading || !authorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
