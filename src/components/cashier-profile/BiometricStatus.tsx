"use client";

import type { BiometricStatus } from "@/hooks/useCashierLiveData";

interface BiometricStatusProps {
  biometric: BiometricStatus;
  locale: string;
}

export function BiometricStatus({ biometric, locale }: BiometricStatusProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const lastVerified = biometric.lastVerified
    ? new Date(biometric.lastVerified).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-savanna-50 dark:bg-savanna-900/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-savanna-600">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h4 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{t("Biometric Verification", "Uthibitisho wa Biodata")}</h4>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
          biometric.fingerprintEnrolled || biometric.faceEnrolled ? "bg-forest-100 text-forest-600" : "bg-warm-200 text-warm-500"
        }`}>
          {biometric.fingerprintEnrolled || biometric.faceEnrolled ? t("Enrolled", "IMEJJISHWA") : t("Not Enrolled", "HAIJUUJISHWA")}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            <span className="text-[10px] text-warm-700 dark:text-warm-300">{t("Fingerprint", "Gufaa la Mkono")}</span>
          </div>
          <span className={`text-[10px] font-bold ${biometric.fingerprintEnrolled ? "text-forest-600" : "text-red-500"}`}>
            {biometric.fingerprintEnrolled ? t("Enrolled", "IMEJJISHWA") : t("Not Enrolled", "HAIJUUJISHWA")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-warm-700 dark:text-warm-300">{t("Face Recognition", "Uthibitisho wauso")}</span>
          </div>
          <span className={`text-[10px] font-bold ${biometric.faceEnrolled ? "text-forest-600" : "text-red-500"}`}>
            {biometric.faceEnrolled ? t("Enrolled", "IMEJJISHWA") : t("Not Enrolled", "HAIJUUJISHWA")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-savanna-500" />
            <span className="text-[10px] text-warm-700 dark:text-warm-300">{t("Last Verified", "Uthibitisho Mwisho")}</span>
          </div>
          <span className="text-[10px] font-bold text-warm-900 dark:text-warm-50 tabular-nums">{lastVerified}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-forest-500" />
            <span className="text-[10px] text-warm-700 dark:text-warm-300">{t("Status", "Hali")}</span>
          </div>
          <span className={`text-[10px] font-bold ${biometric.fingerprintEnrolled || biometric.faceEnrolled ? "text-forest-600" : "text-red-500"}`}>
            {biometric.fingerprintEnrolled || biometric.faceEnrolled ? t("Ready", "Tayari") : t("Not Available", "Haipo")}
          </span>
        </div>
      </div>
    </div>
  );
}
