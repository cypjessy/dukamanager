"use client";

import { useState } from "react";
import type { NotificationPreference, BackupSchedule } from "@/data/settingsData";
import { defaultNotifications, defaultBackup } from "@/data/settingsData";
import type { Locale } from "@/types";

interface NotificationsPanelProps {
  locale: Locale;
  onChange: () => void;
}

interface DataSecurityPanelProps {
  locale: Locale;
  onChange: () => void;
}

export function NotificationsPanel({ locale, onChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationPreference[]>(defaultNotifications);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:00");

  const toggleChannel = (index: number, channel: "sms" | "email" | "inApp" | "whatsapp") => {
    const newNotifs = [...notifications];
    newNotifs[index][channel] = !newNotifs[index][channel];
    setNotifications(newNotifs);
    onChange();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Alert Preferences</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200/60 dark:border-warm-700/60">
                <th className="px-2 py-2 text-left text-xs font-semibold text-warm-500">Alert</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-warm-500">SMS</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-warm-500">Email</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-warm-500">In-App</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-warm-500">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif, i) => (
                <tr key={notif.alert} className="border-b border-warm-100/60 dark:border-warm-800/60 last:border-0">
                  <td className="px-2 py-2.5 text-sm text-warm-900 dark:text-warm-50">{locale === "sw" ? notif.alertSw : notif.alert}</td>
                  {(["sms", "email", "inApp", "whatsapp"] as const).map((ch) => (
                    <td key={ch} className="px-2 py-2.5 text-center">
                      <button onClick={() => toggleChannel(i, ch)} className={`w-5 h-5 rounded ${notif[ch] ? "bg-terracotta-500" : "bg-warm-200 dark:bg-warm-700"} transition-colors inline-flex items-center justify-center`}
                        aria-label={`Toggle ${ch} for ${notif.alert}`}>
                        {notif[ch] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Quiet Hours</h3>
        <p className="text-xs text-warm-400 mb-3">No notifications during these hours</p>
        <div className="flex items-center gap-3">
          <input type="time" value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} className="px-3 py-2 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm min-h-[44px]" />
          <span className="text-warm-400">to</span>
          <input type="time" value={quietTo} onChange={(e) => setQuietTo(e.target.value)} className="px-3 py-2 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm min-h-[44px]" />
        </div>
      </div>
    </div>
  );
}

export function DataSecurityPanel({ locale, onChange }: DataSecurityPanelProps) {
  const [backup] = useState<BackupSchedule>(defaultBackup);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [autoLock, setAutoLock] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">{locale === "sw" ? "Backup" : "Backup & Recovery"}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-forest-50 dark:bg-forest-900/10">
            <div>
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">Last Backup</p>
              <p className="text-xs text-warm-400">{backup.lastBackup}</p>
            </div>
            <span className="text-xs font-bold text-forest-600">Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-warm-600 dark:text-warm-300">Storage Used</span>
            <span className="text-sm font-medium text-warm-900 dark:text-warm-50 tabular-nums">{backup.storageUsed} / {backup.storageLimit}</span>
          </div>
          <div className="h-2 rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden">
            <div className="h-full rounded-full bg-forest-500" style={{ width: "5%" }} />
          </div>
          <div className="flex gap-2">
            <select defaultValue={backup.frequency} className="flex-1 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none appearance-none min-h-[44px]">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button className="px-4 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-bold min-h-[44px]">Backup Now</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-warm-900 dark:text-warm-50">Two-Factor Authentication</p><p className="text-xs text-warm-400">Extra security via SMS code</p></div>
            <button onClick={() => { setTwoFactor(!twoFactor); onChange(); }} className={`relative w-12 h-7 rounded-full transition-colors ${twoFactor ? "bg-terracotta-500" : "bg-warm-300"}`} role="switch" aria-checked={twoFactor}>
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${twoFactor ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-warm-900 dark:text-warm-50">Auto-Lock</p><p className="text-xs text-warm-400">Lock after inactivity</p></div>
            <button onClick={() => { setAutoLock(!autoLock); onChange(); }} className={`relative w-12 h-7 rounded-full transition-colors ${autoLock ? "bg-terracotta-500" : "bg-warm-300"}`} role="switch" aria-checked={autoLock}>
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${autoLock ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-1 block">Session Timeout (minutes)</label>
            <input type="number" value={sessionTimeout} onChange={(e) => { setSessionTimeout(Number(e.target.value)); onChange(); }}
              className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-warm-800/80 border border-warm-200 dark:border-warm-600 text-sm outline-none min-h-[48px] tabular-nums" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-5" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-4">Data Export</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-700 dark:text-warm-300 min-h-[44px]">Export All (JSON)</button>
          <button className="py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-700 dark:text-warm-300 min-h-[44px]">Export (CSV)</button>
          <button className="py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-700 dark:text-warm-300 min-h-[44px]">Customers Only</button>
          <button className="py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-700 dark:text-warm-300 min-h-[44px]">Products Only</button>
        </div>
      </div>
    </div>
  );
}
