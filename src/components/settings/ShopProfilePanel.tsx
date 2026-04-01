"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/types";
import type { ShopSettings } from "@/hooks/useSettingsFirestore";
import FloatingInput from "@/components/ui/FloatingInput";

interface Props {
  locale: Locale;
  onChange: () => void;
  settings: ShopSettings;
  onSave: (data: Partial<ShopSettings>) => Promise<void>;
}

export default function ShopProfilePanel({ locale, onChange, settings, onSave }: Props) {
  const [local, setLocal] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(settings); }, [settings]);

  const update = (key: keyof ShopSettings, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    onChange();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(local);
    } catch (err) {
      console.error("Failed to save shop settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Shop Details", "Taarifa za Duka")}</h3>
        <div className="space-y-3">
          <FloatingInput label={t("Shop Name", "Jina la Duka")} type="text" value={local.shopName} onChange={(e) => update("shopName", e.target.value)} />
          <FloatingInput label={t("Business Type", "Aina ya Biashara")} type="text" value={local.businessType} onChange={(e) => update("businessType", e.target.value)} />
          <FloatingInput label="KRA PIN" type="text" value={local.kraPin} onChange={(e) => update("kraPin", e.target.value)} />
          <FloatingInput label={t("Phone", "Simu")} type="tel" value={local.phone} onChange={(e) => update("phone", e.target.value)} />
          <FloatingInput label="Email" type="email" value={local.email} onChange={(e) => update("email", e.target.value)} />
          <div>
            <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Address", "Anwani")}</label>
            <textarea value={local.address} onChange={(e) => update("address", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm text-warm-900 dark:text-warm-100 outline-none focus:border-terracotta-500 resize-none" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Receipt Settings", "Mipangio ya Risiti")}</h3>
        <div className="space-y-3">
          <FloatingInput label={t("Receipt Header", "Kichwa cha Risiti")} type="text" value={local.receiptHeader} onChange={(e) => update("receiptHeader", e.target.value)} />
          <FloatingInput label={t("Receipt Footer", "Mwisho wa Risiti")} type="text" value={local.receiptFooter} onChange={(e) => update("receiptFooter", e.target.value)} />
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{t("Regional Settings", "Mipangio ya Eneo")}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Currency", "Sarafu")}</label>
            <div className="px-4 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-sm text-warm-500">KSh (Kenyan Shilling)</div>
          </div>
          <div>
            <label className="text-xs font-medium text-warm-600 dark:text-warm-400 mb-1 block">{t("Timezone", "Saa za Eneo")}</label>
            <div className="px-4 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-sm text-warm-500">Africa/Nairobi</div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-50">
        {saving ? t("Saving...", "Inahifadhi...") : t("Save Shop Settings", "Hifadhi Mipangio")}
      </button>
    </div>
  );
}
