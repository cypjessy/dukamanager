"use client";

import { motion } from "framer-motion";
import type { CashierUser } from "@/hooks/useCashierMonitoring";

interface ProfileHeaderProps {
  cashier: CashierUser;
  locale: string;
  isConnected: boolean;
  idleTime: number;
}

export function ProfileHeader({ cashier, locale, isConnected, idleTime }: ProfileHeaderProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const statusConfig = {
    online: { bg: "bg-forest-500", text: t("Online", "Mtandaoni"), pulse: true },
    on_break: { bg: "bg-savanna-500", text: t("On Break", "Mapumzikoni"), pulse: false },
    offline: { bg: "bg-warm-400", text: t("Offline", "Nje ya Mtandao"), pulse: false },
    suspended: { bg: "bg-red-500", text: t("Suspended", "Imesimamishwa"), pulse: false },
  };

  const currentStatus = cashier.status === "suspended" ? "suspended" : cashier.onlineStatus;
  const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.offline;

  const formatIdleTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const shiftDuration = () => {
    if (!cashier.shiftStart) return null;
    const start = new Date(cashier.shiftStart);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-terracotta-200/60 dark:border-terracotta-800/30 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)" }}
    >
      {/* Connection indicator */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-warm-200/40 dark:border-warm-700/40">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-forest-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-[9px] font-medium text-warm-500">
            {isConnected ? t("Live data connected", "Data ya moja kwa moja imeshikana") : t("Disconnected", "Imekatika")}
          </span>
        </div>
        {idleTime > 0 && cashier.onlineStatus === "online" && (
          <span className={`text-[9px] font-medium tabular-nums ${idleTime > 300 ? "text-red-500" : idleTime > 120 ? "text-savanna-500" : "text-warm-400"}`}>
            {t("Idle", "Bila shughuli")}: {formatIdleTime(idleTime)}
          </span>
        )}
      </div>

      {/* Main header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {cashier.photoUrl ? (
              <img src={cashier.photoUrl} alt={cashier.displayName} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-warm-700 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-300 to-savanna-300 dark:from-terracotta-700 dark:to-savanna-700 flex items-center justify-center shadow-md">
                <span className="text-xl font-heading font-extrabold text-white">
                  {cashier.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-warm-800 ${statusInfo.bg} ${statusInfo.pulse ? "animate-pulse" : ""}`} />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-heading font-extrabold text-lg text-warm-900 dark:text-warm-50 truncate">{cashier.displayName}</h2>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                cashier.role === "head_cashier" ? "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600" :
                cashier.role === "trainee" ? "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600" :
                "bg-forest-100 dark:bg-forest-900/30 text-forest-600"
              }`}>{cashier.role.replace("_", " ")}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-[11px] text-warm-500">
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  {cashier.uid.slice(0, 8).toUpperCase()}
                </span>
                {cashier.phone && (
                  <span className="flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {cashier.phone}
                  </span>
                )}
              </div>
              {cashier.email && (
                <div className="flex items-center gap-1 text-[11px] text-warm-500">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  {cashier.email}
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0 text-right">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${statusInfo.bg} bg-opacity-15`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.bg} ${statusInfo.pulse ? "animate-pulse" : ""}`} />
              <span className={`text-[10px] font-bold ${statusInfo.bg.replace("bg-", "text-")}`}>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Shift info bar */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-warm-200/40 dark:border-warm-700/40">
          {[
            {
              label: t("Device", "Kifaa"),
              value: cashier.deviceName || t("None", "Hakuna"),
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ),
            },
            {
              label: t("Shift Start", "Kuanza Zamu"),
              value: cashier.shiftStart ? new Date(cashier.shiftStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              ),
            },
            {
              label: t("Duration", "Muda"),
              value: shiftDuration() || "--",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v10l4.24 4.24" /><circle cx="12" cy="12" r="10" />
                </svg>
              ),
            },
            {
              label: t("Last Login", "Kuingia Mwisho"),
              value: cashier.lastLogin ? new Date(cashier.lastLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="text-warm-400">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[9px] text-warm-400 truncate">{item.label}</p>
                <p className="text-[11px] font-medium text-warm-900 dark:text-warm-50 tabular-nums truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
