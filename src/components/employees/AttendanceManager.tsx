"use client";

import { useState, useMemo } from "react";
import type { Employee, AttendanceRecord } from "@/data/employeeData";
import { departmentConfig } from "@/data/employeeData";
import type { Locale } from "@/types";

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  locale: Locale;
  onClockIn: (id: string) => void;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  present: { color: "bg-forest-500", label: "Present" },
  absent: { color: "bg-red-500", label: "Absent" },
  late: { color: "bg-savanna-500", label: "Late" },
  on_break: { color: "bg-sunset-400", label: "On Break" },
  leave: { color: "bg-blue-500", label: "Leave" },
};

export default function AttendanceManager({ employees, attendance, locale, onClockIn }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const todayRecords = useMemo(() => attendance.filter((a) => a.date === selectedDate), [attendance, selectedDate]);
  const present = todayRecords.filter((a) => a.status === "present" || a.status === "late").length;
  const absent = todayRecords.filter((a) => a.status === "absent").length;
  const onLeave = todayRecords.filter((a) => a.status === "leave").length;

  const calendarDays = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-forest-200/60 dark:border-forest-700/60 p-4 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="w-8 h-8 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mx-auto mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-forest-600"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-2xl font-heading font-extrabold text-forest-600">{present}</p>
          <p className="text-xs text-warm-500">{locale === "sw" ? "Wapo" : "Present"}</p>
        </div>
        <div className="rounded-2xl border border-red-200/60 dark:border-red-700/60 p-4 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </div>
          <p className="text-2xl font-heading font-extrabold text-red-500">{absent}</p>
          <p className="text-xs text-warm-500">{locale === "sw" ? "Hawapo" : "Absent"}</p>
        </div>
        <div className="rounded-2xl border border-blue-200/60 dark:border-blue-700/60 p-4 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /></svg>
          </div>
          <p className="text-2xl font-heading font-extrabold text-blue-500">{onLeave}</p>
          <p className="text-xs text-warm-500">{locale === "sw" ? "Likizo" : "On Leave"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Kalenda" : "Attendance Calendar"}</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {calendarDays.map((date) => {
            const dayRecords = attendance.filter((a) => a.date === date);
            const dayPresent = dayRecords.filter((a) => a.status === "present" || a.status === "late").length;
            const dayTotal = dayRecords.length;
            const isSelected = date === selectedDate;
            const d = new Date(date + "T00:00:00");
            const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl min-w-[48px] transition-all ${isSelected ? "bg-terracotta-500 text-white" : "bg-warm-50 dark:bg-warm-800/50 text-warm-600 dark:text-warm-300 hover:bg-warm-100"}`}>
                <span className="text-[9px] font-medium">{dayName}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
                <span className={`text-[8px] ${isSelected ? "text-white/80" : "text-warm-400"}`}>{dayPresent}/{dayTotal}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 px-1">{locale === "sw" ? "Wafanyakazi" : "Employee Attendance"} - {selectedDate}</h3>
        {employees.length === 0 ? (
          <p className="text-xs text-warm-400 text-center py-8">{locale === "sw" ? "Hakuna wafanyakazi" : "No employees yet"}</p>
        ) : (
          employees.map((emp) => {
            const record = todayRecords.find((a) => a.employeeId === emp.id);
            const dept = departmentConfig[emp.department];
            const status = record ? statusConfig[record.status] : { color: "bg-warm-300", label: "No Record" };
            return (
              <div key={emp.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                <span className={`w-2.5 h-2.5 rounded-full ${status.color} ${record?.status === "late" ? "animate-pulse" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-50 truncate">{emp.firstName} {emp.lastName}</p>
                  <p className="text-[10px] text-warm-400">{dept?.label || emp.department} &middot; {record?.clockIn ? `In: ${record.clockIn}` : status.label}</p>
                </div>
                {!record && (
                  <button onClick={() => onClockIn(emp.id)} className="px-3 py-1.5 rounded-lg bg-forest-500 text-white text-xs font-bold min-h-[32px]">
                    {locale === "sw" ? "Ingia" : "Clock In"}
                  </button>
                )}
                {record?.status === "present" && !record.clockOut && (
                  <span className="text-[10px] font-medium text-forest-600 bg-forest-50 dark:bg-forest-900/20 px-2 py-0.5 rounded">Checked In</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
