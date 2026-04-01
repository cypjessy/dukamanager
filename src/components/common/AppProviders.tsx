"use client";

import { ReactNode } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import PageTransitionProvider from "@/components/page-loader/PageTransitionProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
