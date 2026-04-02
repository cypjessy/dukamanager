"use client";

import { useState } from "react";
import { useSupervisorPin } from "@/hooks/useSupervisorPin";
import { useAuth } from "@/providers/AuthProvider";

interface SupervisorPinSetupProps {
  locale: string;
}

export default function SupervisorPinSetup({ locale }: SupervisorPinSetupProps) {
  const { pin, loading, updatePin } = useSupervisorPin();
  const { role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdmin = role === "owner" || role === "manager";
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  if (!isAdmin) return null;

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (newPin.length < 4) {
      setError(t("PIN must be at least 4 digits", "PIN lazima iwe tarakimu 4 au zaidi"));
      return;
    }
    if (!/^\d+$/.test(newPin)) {
      setError(t("PIN must contain only numbers", "PIN lazima iwe tarakimu tu"));
      return;
    }
    if (newPin !== confirmPin) {
      setError(t("PINs do not match", "PIN hazifanani"));
      return;
    }

    setSaving(true);
    try {
      await updatePin(newPin);
      setSuccess(true);
      setIsEditing(false);
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("Failed to save PIN", "Imeshindwa kuhifadhi PIN"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPin("");
    setConfirmPin("");
    setError("");
  };

  if (loading) return null;

  return (
    <div className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-3" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium text-warm-400 uppercase tracking-wider">
          {t("Supervisor PIN", "PIN ya Msimamizi")}
        </p>
        {success && (
          <span className="text-[9px] font-bold text-forest-600 bg-forest-50 dark:bg-forest-900/20 px-1.5 py-0.5 rounded">
            {t("Saved!", "Imehifadhiwa!")}
          </span>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs text-warm-600 dark:text-warm-300">
                {pin ? "••••" : t("Not set (uses default 1234)", "Haijawekwa (inatumia 1234)")}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-[9px] font-medium min-h-[28px]"
            >
              {pin ? t("Change", "Badilisha") : t("Set PIN", "Weka PIN")}
            </button>
          </div>
          <p className="text-[9px] text-warm-400">
            {t("Required for refunds in cashier portal", "Inahitajika kwa marejesho kwenye duka")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-medium text-warm-500 dark:text-warm-400 block mb-1">
              {t("New PIN", "PIN Mpya")}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder={t("Enter 4+ digit PIN", "Ingiza PIN ya tarakimu 4+")}
              className="w-full px-3 py-2 rounded-lg bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 font-mono text-center tracking-widest min-h-[40px]"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-warm-500 dark:text-warm-400 block mb-1">
              {t("Confirm PIN", "Thibitisha PIN")}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder={t("Re-enter PIN", "Ingiza tena PIN")}
              className="w-full px-3 py-2 rounded-lg bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 font-mono text-center tracking-widest min-h-[40px]"
            />
          </div>

          {error && (
            <p className="text-[10px] text-red-500 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-600 dark:text-warm-300 min-h-[36px]"
            >
              {t("Cancel", "Ghairi")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !newPin || !confirmPin}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white text-xs font-bold min-h-[36px] disabled:opacity-40"
            >
              {saving ? t("Saving...", "Inahifadhi...") : t("Save PIN", "Hifadhi PIN")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
