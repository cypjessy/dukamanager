"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/providers/LocaleProvider";
import { useAuth } from "@/providers/AuthProvider";
import { logoutUser } from "@/lib/firebase/auth";
import DeveloperLayout from "@/components/developer/DeveloperLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

function DeveloperPortalInner({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const { profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/");
  };

  return (
    <DeveloperLayout
      locale={locale}
      userName={profile?.displayName || profile?.email?.split("@")[0] || "Developer"}
      userRole="developer"
      onLogout={handleLogout}
    >
      {children}
    </DeveloperLayout>
  );
}

export default function DeveloperPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["developer"]}>
      <DeveloperPortalInner>{children}</DeveloperPortalInner>
    </ProtectedRoute>
  );
}
