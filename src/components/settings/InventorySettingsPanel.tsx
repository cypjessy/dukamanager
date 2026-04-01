"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/types";
import type { NotificationSettings } from "@/hooks/useSettingsFirestore";

interface Props {
  locale: Locale;
  onChange: () => void;
  notificationSettings: NotificationSettings;
  onSaveNotifications: (data: Partial<NotificationSettings>) => Promise<void>;
}

export default function InventorySettingsPanel({ locale, onChange, notificationSettings, onSaveNotifications }: Props) {
  const [local, setLocal] = useState(notificationSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(notificationSettings); }, [notificationSettings]);

  const toggle = (key: keyof NotificationSettings) => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
    onChange();
  };

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const handleSave = async () => {
    setSaving(true);
    try { await onSaveNotifications(local); }
    catch (err) { console.error("Failed to save:", err); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Stock Alerts", "Arifa za Bidhaa")}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{t("Low Stock Alert", "Arifa ya Bidhaa Kupungua")}</p>
              <p className="text-[10px] text-warm-400">{t("Get notified when stock is running low", "Pata taarifa bidhaa zinapopungua")}</p>
            </div>
            <button onClick={() => toggle("lowStockAlert")}
              className={`relative w-11 h-6 rounded-full transition-colors ${local.lowStockAlert ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}
              role="switch" aria-checked={local.lowStockAlert}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${local.lowStockAlert ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {local.lowStockAlert && (
            <div>
              <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">{t("Threshold", "Kiwango")}</label>
              <input type="number" value={local.lowStockThreshold}
                onChange={(e) => { setLocal((p) => ({ ...p, lowStockThreshold: Number(e.target.value) })); onChange(); }}
                className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 min-h-[48px]" />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Notifications", "Arifa")}</h3>
        <div className="space-y-3">
          {[
            { key: "dailySummary" as const, label: t("Daily Summary", "Muhtasari wa Kila Siku") },
            { key: "paymentAlerts" as const, label: t("Payment Alerts", "Arifa za Malipo") },
            { key: "expiryAlerts" as const, label: t("Expiry Alerts", "Arifa za Bidhaa Kuisha Muda") },
            { key: "customerBirthday" as const, label: t("Customer Birthdays", "Siku za Kuzaliwa Wateja") },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-warm-900 dark:text-warm-50">{n.label}</span>
              <button onClick={() => toggle(n.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${local[n.key] ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}
                role="switch" aria-checked={local[n.key]}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${local[n.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Units of Measure", "Vipimo")}</h3>
        <div className="flex flex-wrap gap-2">
          {["Pieces", "Kilograms", "Liters", "Boxes", "Bottles", "Packs", "Jars", "Debes", "Bales", "Crates"].map((unit) => (
            <span key={unit} className="px-3 py-1.5 rounded-lg bg-warm-100 dark:bg-warm-800 text-xs font-medium text-warm-700 dark:text-warm-300">{unit}</span>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-50">
        {saving ? t("Saving...", "Inahifadhi...") : t("Save Settings", "Hifadhi Mipangio")}
      </button>
    </div>
  );
}
