"use client";

import { LocaleProvider } from "@/providers/LocaleProvider";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "cashier", "head_cashier", "trainee"]}>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </ProtectedRoute>
  );
}
