"use client";

import type { Locale } from "@/types";

interface AdvancedPanelProps {
  locale: Locale;
  onChange: () => void;
}

export default function AdvancedPanel({ onChange }: AdvancedPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Multi-Shop Mode</h3>
        <div className="flex items-center justify-between mb-3">
          <div><p className="text-sm font-medium text-warm-900 dark:text-warm-50">Enable Multi-Shop</p><p className="text-xs text-warm-400">Manage multiple locations</p></div>
          <button className="relative w-12 h-7 rounded-full bg-warm-300 transition-colors" role="switch" aria-checked={false}>
            <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow translate-x-0.5" />
          </button>
        </div>
        <p className="text-xs text-warm-400">Premium feature - Upgrade to enable</p>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Integrations</h3>
        <div className="space-y-3">
          {[
            { name: "WhatsApp Catalog", desc: "Sync products to WhatsApp", active: true },
            { name: "Facebook Shop", desc: "List products on Facebook", active: false },
            { name: "Instagram Shopping", desc: "Tag products in posts", active: false },
          ].map((int) => (
            <div key={int.name} className="flex items-center justify-between py-3 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <div><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{int.name}</p><p className="text-xs text-warm-400">{int.desc}</p></div>
              <button onClick={onChange} className={`relative w-12 h-7 rounded-full transition-colors ${int.active ? "bg-[#00A650]" : "bg-warm-300"}`} role="switch" aria-checked={int.active}>
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${int.active ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Beta Features</h3>
        <div className="space-y-3">
          {[
            { name: "AI Demand Forecasting", desc: "Predict stock needs automatically", active: false },
            { name: "Voice Commands", desc: "Control with Swahili voice", active: false },
            { name: "Smart Repricing", desc: "Auto-adjust prices based on demand", active: false },
          ].map((feat) => (
            <div key={feat.name} className="flex items-center justify-between py-3 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 px-1.5 py-0.5 rounded">BETA</span>
                <div><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{feat.name}</p><p className="text-xs text-warm-400">{feat.desc}</p></div>
              </div>
              <button onClick={onChange} className="relative w-12 h-7 rounded-full bg-warm-300 transition-colors" role="switch" aria-checked={false}>
                <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-200/60 dark:border-red-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-red-600 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button className="w-full py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-600 text-sm font-medium min-h-[44px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            Reset All Settings
          </button>
          <button className="w-full py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-600 text-sm font-medium min-h-[44px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
}
