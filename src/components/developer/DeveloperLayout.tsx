"use client";

import { useState, useCallback } from "react";
import type { Locale } from "@/types";
import DeveloperSidebar from "@/components/developer/DeveloperSidebar";
import DeveloperMobileLayout from "@/components/developer/DeveloperMobileLayout";

interface DeveloperLayoutProps {
  children: React.ReactNode;
  locale: Locale;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function DeveloperLayout({ children, locale, userName, userRole, onLogout }: DeveloperLayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((p) => !p), []);
  const handleMouseEnter = useCallback(() => setExpanded(true), []);
  const handleMouseLeave = useCallback(() => setExpanded(false), []);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <DeveloperSidebar
          locale={locale}
          expanded={expanded}
          onToggleExpanded={toggleExpanded}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
      </div>

      {/* Desktop main content */}
      <main className="hidden md:block transition-all duration-200" style={{ marginLeft: expanded ? 256 : 72 }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile layout - visible only on mobile */}
      <div className="md:hidden">
        <DeveloperMobileLayout locale={locale} userName={userName} userRole={userRole} onLogout={onLogout}>
          {children}
        </DeveloperMobileLayout>
      </div>
    </div>
  );
}
