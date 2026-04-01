"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ConnectionStatus } from "@/types/cashier";

interface OfflineBannerProps {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  pendingItems: number;
  lastOnlineAt: string | null;
}

export default function OfflineBanner({ isOnline, connectionStatus, pendingItems, lastOnlineAt }: OfflineBannerProps) {
  if (isOnline && connectionStatus !== "reconnecting") return null;

  const getLastOnlineText = () => {
    if (!lastOnlineAt) return "";
    const diff = Date.now() - new Date(lastOnlineAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 overflow-hidden"
      >
        <div
          className={`flex items-center justify-between px-3 py-2 ${
            connectionStatus === "reconnecting"
              ? "bg-savanna-500 text-white"
              : "bg-warm-800 text-warm-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {connectionStatus === "reconnecting" ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
            )}
            <span className="text-xs font-medium">
              {connectionStatus === "reconnecting"
                ? "Reconnecting..."
                : "No Internet Connection - Offline Mode Active"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pendingItems > 0 && (
              <span className="text-[10px] font-medium opacity-80">
                {pendingItems} pending sync
              </span>
            )}
            {lastOnlineAt && !isOnline && (
              <span className="text-[10px] opacity-60">Last online: {getLastOnlineText()}</span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
