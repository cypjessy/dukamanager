"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import FloatingInput from "@/components/ui/FloatingInput";
import type { CashierUser } from "@/hooks/useCashierMonitoring";

interface AdminControlsProps {
  cashier: CashierUser | null;
  locale: string;
  onLock: () => Promise<void>;
  onUnlock: () => Promise<void>;
  onForceLogout: () => Promise<void>;
  onGrantPermission: (permission: string, value: boolean) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

export function AdminControls({ cashier, locale, onLock, onUnlock, onForceLogout, onGrantPermission, onSendMessage }: AdminControlsProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const [locking, setLocking] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [granting, setGranting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [message, setMessage] = useState("");

  if (!cashier) {
    return (
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-6 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <p className="text-sm text-warm-400">{t("No cashier selected", "Hakuna mhasibu aliyechaguliwa")}</p>
      </div>
    );
  }

  const permissionKeys = [
    { key: "processSales", label: t("Process Sales", "Fanya Mauzo"), description: t("Process sales transactions", "Fanya maamala ya mauzo") },
    { key: "applyDiscounts", label: t("Apply Discounts", "Weka Punguzo"), description: t("Apply discounts to transactions", "Weka punguzo kwenye maamala") },
    { key: "handleRefunds", label: t("Handle Refunds", "Shughulikia Kurudisha"), description: t("Process refunds and returns", "Fanya kurudisha na marekebisho") },
    { key: "viewReports", label: t("View Reports", "Tazama Ripoti"), description: t("View sales and performance reports", "Tazama ripoti za mauzo na utendaji") },
    { key: "manageInventory", label: t("Manage Inventory", "Dhibiti Hesabu"), description: t("Manage product inventory", "Dhibiti husna za bidhaa") },
    { key: "openCloseRegister", label: t("Open/Close Register", "Funga/Fungua Kasha"), description: t("Open and close cash register", "Funga na fungua kasha") },
    { key: "voidTransactions", label: t("Void Transactions", "Futa Mauzo"), description: t("Void or cancel transactions", "Futa au kufuta maamala") },
  ];

  return (
    <div className="space-y-3">
      {/* Portal controls */}
      <div className="rounded-2xl border border-terracotta-200/60 dark:border-terracotta-800/30 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">{t("Portal Controls", "Mipangio ya Kifagio")}</h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            cashier.status === "suspended" ? "bg-red-100 text-red-600" : "bg-forest-100 text-forest-600"
          }`}>
            {cashier.status === "suspended" ? t("Suspended", "Imesimamishwa") : t("Active", "Hai")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              setLocking(true);
              try {
                await onLock();
              } finally {
                setLocking(false);
              }
            }}
            className="w-full justify-start text-[9px] px-3 py-2"
            disabled={locking || cashier.status === "suspended"}
          >
            {locking ? t("Locking...", "Inalock...") : t("Lock Portal", "Funga Kifagio")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              setUnlocking(true);
              try {
                await onUnlock();
              } finally {
                setUnlocking(false);
              }
            }}
            className="w-full justify-start text-[9px] px-3 py-2"
            disabled={unlocking || cashier.status !== "suspended"}
          >
            {unlocking ? t("Unlocking...", "Inaunlock...") : t("Unlock Portal", "Fungua Kifagio")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              setLoggingOut(true);
              try {
                await onForceLogout();
              } finally {
                setLoggingOut(false);
              }
            }}
            className="w-full justify-start text-[9px] px-3 py-2 col-span-2"
            disabled={loggingOut || cashier.onlineStatus === "offline"}
          >
            {loggingOut ? t("Logging out...", "Inalogs out...") : t("Force Logout", "Log-out wa Nyeusi")}
          </Button>
        </div>
      </div>

      {/* Permission overrides */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Permission Overrides", "Kuwasiliana Ruhusa")}</h4>
        {permissionKeys.map((perm) => (
          <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-warm-800/50">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-medium text-warm-700 dark:text-warm-300">{perm.label}</p>
              <p className="text-[8px] text-warm-400">{perm.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded uppercase ${
                cashier.permissions[perm.key as keyof typeof cashier.permissions] ? "bg-forest-100 text-forest-600" : "bg-warm-200 text-warm-500"
              }`}>
                {cashier.permissions[perm.key as keyof typeof cashier.permissions] ? t("Allowed", "Ruhusiwa") : t("Denied", "Kataa")}
              </span>
              <Button
              variant="ghost"
              size="sm"
                onClick={async () => {
                  setGranting(true);
                  try {
                    await onGrantPermission(perm.key, !cashier.permissions[perm.key as keyof typeof cashier.permissions]);
                  } finally {
                    setGranting(false);
                  }
                }}
                className="px-2 py-1 text-[8px]"
                disabled={granting}
              >
                {granting ? t("...", "...") : t("Toggle", "Badilisho")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Messaging */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <h4 className="text-[10px] font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">{t("Broadcast Message", "Tumiajumbe Kuwasiliana")}</h4>
        <div className="mb-2">
          <FloatingInput
            label={t("Message", "Ujumbe")}
            placeholder={t("Enter message to send to cashier", "Ingiza ujumbe kusuma kwa mhasibu")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={async () => {
            if (!message.trim()) return;
            setMessaging(true);
            try {
              await onSendMessage(message);
              setMessage("");
            } finally {
              setMessaging(false);
            }
          }}
          className="w-full"
          disabled={!message.trim() || messaging}
        >
          {messaging ? t("Sending...", "Inatumia...") : t("Send", "Tuma")}
        </Button>
      </div>
    </div>
  );
}
