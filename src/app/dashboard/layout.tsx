"use client";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { OfflineProvider } from "@/providers/OfflineProvider";
import { LocaleProvider, useLocale } from "@/providers/LocaleProvider";
import { ViewportProvider } from "@/providers/ViewportProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, toggleLocale } = useLocale();

  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "viewer"]}>
      <DashboardLayout locale={locale} onToggleLocale={toggleLocale}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewportProvider>
      <ThemeProvider>
        <OfflineProvider>
          <LocaleProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
          </LocaleProvider>
        </OfflineProvider>
      </ThemeProvider>
    </ViewportProvider>
  );
}
