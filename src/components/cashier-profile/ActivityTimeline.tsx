"use client";

import { motion } from "framer-motion";
import type { ShiftEvent } from "@/hooks/useCashierLiveData";

interface ActivityTimelineProps {
  shiftEvents: ShiftEvent[];
  locale: string;
  selectedDate?: string;
}

const eventConfig: Record<string, { icon: string; color: string; label: string; labelSw: string }> = {
  login: { icon: "🔐", color: "bg-blue-500", label: "Login", labelSw: "Kuingia" },
  logout: { icon: "🚪", color: "bg-warm-400", label: "Logout", labelSw: "Kutoka" },
  break_start: { icon: "☕", color: "bg-savanna-500", label: "Break Start", labelSw: "Mapumziko" },
  break_end: { icon: "✅", color: "bg-forest-500", label: "Break End", labelSw: "Rudi Kazini" },
  sale: { icon: "💰", color: "bg-forest-500", label: "Sale", labelSw: "Muamala" },
  refund: { icon: "↩️", color: "bg-red-500", label: "Refund", labelSw: "Kurudisha" },
  discount: { icon: "🏷️", color: "bg-savanna-500", label: "Discount", labelSw: "Punguzo" },
  void: { icon: "❌", color: "bg-red-500", label: "Void", labelSw: "Kufuta" },
  register_open: { icon: "📂", color: "bg-blue-500", label: "Register Open", labelSw: "Fungua Kasha" },
  register_close: { icon: "📁", color: "bg-warm-400", label: "Register Close", labelSw: "Funga Kasha" },
  cash_drop: { icon: "💵", color: "bg-forest-500", label: "Cash Drop", labelSw: "Peleka Pesa" },
};

export function ActivityTimeline({ shiftEvents, locale, selectedDate }: ActivityTimelineProps) {
  const t = (en: string, sw: string) => (locale === "sw" ? sw : en);
  const today = new Date().toISOString().slice(0, 10);
  const isToday = !selectedDate || selectedDate === today;

  if (shiftEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-6 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <p className="text-sm text-warm-400">{isToday ? t("No shift events yet", "Hakuna matukio ya zamu") : t("No events for this date", "Hakuna matukio kwa tarehe hii")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-warm-200/40 dark:border-warm-700/40">
        <div className="w-6 h-6 rounded-lg bg-savanna-50 dark:bg-savanna-900/20 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-savanna-600">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{t("Session Timeline", "Ratiba ya Kipindi")}</h3>
        <span className="text-[9px] text-warm-400 ml-auto">{shiftEvents.length} {t("events", "matukio")}</span>
      </div>

      <div className="p-4 max-h-[300px] overflow-y-auto hide-scrollbar">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-warm-200 dark:bg-warm-700" />

          <div className="space-y-1">
            {shiftEvents.map((event, i) => {
              const config = eventConfig[event.type] || eventConfig.sale;
              const time = event.time ? new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex items-start gap-3 pl-0 group"
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-[30px] h-[30px] rounded-full ${config.color} flex items-center justify-center flex-shrink-0 text-xs shadow-sm`}>
                    {config.icon}
                  </div>

                  {/* Event card */}
                  <div className="flex-1 min-w-0 p-2 rounded-lg bg-warm-50/80 dark:bg-warm-800/50 hover:bg-warm-100/80 dark:hover:bg-warm-800/80 transition-colors cursor-default">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-warm-900 dark:text-warm-50">{t(config.label, config.labelSw)}</span>
                      <span className="text-[9px] text-warm-400 tabular-nums">{time}</span>
                    </div>
                    {event.details && <p className="text-[9px] text-warm-500 mt-0.5 truncate">{event.details}</p>}
                    {event.amount !== undefined && event.amount > 0 && (
                      <p className="text-[10px] font-heading font-bold text-warm-900 dark:text-warm-50 tabular-nums mt-0.5">KSh {event.amount.toLocaleString()}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
