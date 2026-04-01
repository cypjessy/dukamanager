"use client";

import { useState, useCallback } from "react";
import type { Locale } from "@/types";
import { useOffline } from "@/providers/OfflineProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/hooks/useSidebar";
import { useViewport } from "@/providers/ViewportProvider";
import DesktopSidebar from "@/components/nav/DesktopSidebar";
import MobileBottomBar from "@/components/nav/MobileBottomBar";
import Header from "@/components/layout/Header";
import OfflineBanner from "@/components/common/OfflineBanner";
import QuickAddProduct from "@/components/dashboard/QuickAddProduct";
import FAB from "@/components/dashboard/FAB";
import OnboardingTutorial, { useOnboarding } from "@/components/registration/OnboardingTutorial";

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale: Locale;
  onToggleLocale: () => void;
}

export default function DashboardLayout({
  children,
  locale,
}: DashboardLayoutProps) {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const { isOffline, queuedActions } = useOffline();
  const { user, role, currentShop, profile, logout } = useAuth();
  const sidebar = useSidebar();
  const { isMobile } = useViewport();
  const { showOnboarding, dismissOnboarding } = useOnboarding();

  const toggleMobileMenu = useCallback(() => {
    // Mobile menu handled by MobileBottomBar
  }, []);

  return (
    <div className="dashboard-shell bg-warm-50 dark:bg-warm-950">
      <OfflineBanner isOffline={isOffline} queuedActions={queuedActions} />

      <DesktopSidebar
        locale={locale}
        expanded={sidebar.expanded}
        collapseProgress={sidebar.collapseProgress}
        onMouseEnter={sidebar.onMouseEnter}
        onMouseLeave={sidebar.onMouseLeave}
        toggleExpanded={sidebar.toggleExpanded}
        userName={profile?.displayName || user?.email?.split("@")[0] || "User"}
        userRole={role || "owner"}
        shopName={currentShop.name}
        onLogout={logout}
      />

      <div className="dashboard-main-area">
        <Header
          locale={locale}
          onToggleSidebar={toggleMobileMenu}
          onOpenProductModal={() => setProductModalOpen(true)}
        />

        <main className="dashboard-content-scroll p-4 sm:p-5 lg:p-6" role="main" style={isMobile ? { paddingBottom: "100px" } : {}}>
          {children}
        </main>
      </div>

      <MobileBottomBar
        locale={locale}
        onOpenQuickActions={() => setProductModalOpen(true)}
      />

      <FAB
        locale={locale}
        onOpenProductModal={() => setProductModalOpen(true)}
      />

      <QuickAddProduct
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        locale={locale}
      />

      {showOnboarding && (
        <OnboardingTutorial locale={locale} onComplete={dismissOnboarding} />
      )}
    </div>
  );
}
