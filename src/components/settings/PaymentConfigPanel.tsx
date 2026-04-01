"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/types";
import type { PaymentSettings } from "@/hooks/useSettingsFirestore";
import FloatingInput from "@/components/ui/FloatingInput";

interface Props {
  locale: Locale;
  onChange: () => void;
  settings: PaymentSettings;
  onSave: (data: Partial<PaymentSettings>) => Promise<void>;
}

export default function PaymentConfigPanel({ locale, onChange, settings, onSave }: Props) {
  const [local, setLocal] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => { setLocal(settings); }, [settings]);

  const toggleMethod = (method: keyof PaymentSettings) => {
    setLocal((prev) => ({ ...prev, [method]: !prev[method] }));
    onChange();
  };

  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);

  const updateField = (field: keyof PaymentSettings, value: string) => {
    setLocal((p) => ({ ...p, [field]: value }));
    onChange();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const methods = [];
      if (local.mpesaEnabled) methods.push("mpesa");
      if (local.cashEnabled) methods.push("cash");
      if (local.cardEnabled) methods.push("card");
      if (local.bankEnabled) methods.push("bank");
      if (local.creditEnabled) methods.push("credit");
      await onSave({ ...local, acceptedMethods: methods });
      setTestResult(null);
    } catch (err) {
      console.error("Failed to save payment settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Save first, then test
      await handleSave();
      // The actual STK test would need a phone number - just validate credentials format
      if (!local.mpesaConsumerKey || !local.mpesaConsumerSecret || !local.mpesaPasskey || !local.mpesaShortcode) {
        setTestResult({ success: false, message: "Please fill in all M-Pesa Daraja credentials" });
      } else {
        setTestResult({ success: true, message: "Credentials saved. They will be used for STK Push payments." });
      }
    } catch {
      setTestResult({ success: false, message: "Failed to save credentials" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Toggle */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">
          {t("Payment Methods", "Njia za Malipo")}
        </h3>
        <div className="space-y-3">
          {[
            { key: "mpesaEnabled" as const, label: "M-Pesa", icon: "\u{1F4F1}", color: "bg-[#00A650]" },
            { key: "cashEnabled" as const, label: t("Cash", "Pesa Taslimu"), icon: "\u{1F4B5}", color: "bg-terracotta-500" },
            { key: "cardEnabled" as const, label: t("Card", "Kadi"), icon: "\u{1F4B3}", color: "bg-blue-500" },
            { key: "bankEnabled" as const, label: t("Bank", "Benki"), icon: "\u{1F3E6}", color: "bg-purple-500" },
            { key: "creditEnabled" as const, label: t("Credit", "Mkopo"), icon: "\u{1F4CB}", color: "bg-sunset-400" },
          ].map((m) => (
            <div key={m.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-medium text-warm-900 dark:text-warm-50">{m.label}</span>
              </div>
              <button onClick={() => toggleMethod(m.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${local[m.key] ? m.color : "bg-warm-300 dark:bg-warm-600"}`}
                role="switch" aria-checked={local[m.key]}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${local[m.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* M-Pesa Daraja API Configuration */}
      <div className="rounded-2xl border border-[#00A650]/30 dark:border-[#00A650]/20 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#00A650]/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A650" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">M-Pesa Daraja API</h3>
            <p className="text-[10px] text-warm-400">Configure your Safaricom Daraja credentials for STK Push</p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {/* Environment */}
          <div>
            <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Environment</label>
            <div className="flex gap-2">
              {(["sandbox", "production"] as const).map((env) => (
                <button key={env} onClick={() => updateField("mpesaEnvironment", env)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[40px] transition-all ${
                    local.mpesaEnvironment === env
                      ? env === "production" ? "bg-[#00A650] text-white" : "bg-savanna-500 text-white"
                      : "bg-warm-100 dark:bg-warm-800 text-warm-500"
                  }`}>
                  {env === "sandbox" ? "Sandbox (Testing)" : "Production (Live)"}
                </button>
              ))}
            </div>
            {local.mpesaEnvironment === "sandbox" && (
              <p className="text-[10px] text-savanna-600 mt-1">Use sandbox for testing. Switch to production when ready to go live.</p>
            )}
          </div>

          <FloatingInput label="Consumer Key" type="text" value={local.mpesaConsumerKey}
            onChange={(e) => updateField("mpesaConsumerKey", e.target.value)} />
          <FloatingInput label="Consumer Secret" type="password" value={local.mpesaConsumerSecret}
            onChange={(e) => updateField("mpesaConsumerSecret", e.target.value)} />
          <FloatingInput label="Passkey" type="password" value={local.mpesaPasskey}
            onChange={(e) => updateField("mpesaPasskey", e.target.value)} />
          <FloatingInput label="Shortcode / Paybill Number" type="text" value={local.mpesaShortcode}
            onChange={(e) => updateField("mpesaShortcode", e.target.value)} />
          <FloatingInput label="M-Pesa Paybill (display)" type="text" value={local.mpesaPaybill}
            onChange={(e) => updateField("mpesaPaybill", e.target.value)} />
          <FloatingInput label="M-Pesa Till (display)" type="text" value={local.mpesaTill}
            onChange={(e) => updateField("mpesaTill", e.target.value)} />
        </div>

        {testResult && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-medium ${testResult.success ? "bg-forest-50 dark:bg-forest-900/20 text-forest-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
            {testResult.success ? "\u2713" : "\u2717"} {testResult.message}
          </div>
        )}

        <button onClick={handleTestConnection} disabled={testing}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#00A650] text-white text-xs font-bold min-h-[40px] disabled:opacity-50">
          {testing ? "Testing..." : "Test & Save Credentials"}
        </button>

        <p className="text-[10px] text-warm-400 mt-2 text-center">
          Get credentials at <span className="font-mono text-warm-500">developer.safaricom.co.ke</span>
        </p>
      </div>

      {/* VAT Settings */}
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">VAT</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-warm-900 dark:text-warm-50">{t("Enable VAT", "Washa VAT")}</span>
          <button onClick={() => toggleMethod("vatEnabled")}
            className={`relative w-11 h-6 rounded-full transition-colors ${local.vatEnabled ? "bg-terracotta-500" : "bg-warm-300 dark:bg-warm-600"}`}
            role="switch" aria-checked={local.vatEnabled}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${local.vatEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {local.vatEnabled && (
          <FloatingInput label="VAT Rate (%)" type="number" value={String(local.vatRate)}
            onChange={(e) => { setLocal((p) => ({ ...p, vatRate: Number(e.target.value) })); onChange(); }} />
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px] disabled:opacity-50">
        {saving ? t("Saving...", "Inahifadhi...") : t("Save Payment Settings", "Hifadhi Malipo")}
      </button>
    </div>
  );
}
