"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Employee } from "@/data/employeeData";
import { departmentConfig } from "@/data/employeeData";

interface EmployeeCardProps {
  employee: Employee;
  clockedIn: boolean;
  clockInTime: string | null;
  hoursWorked: number;
  onCall: (phone: string, name: string) => void;
  onClockToggle: (id: string) => void;
  onRequestLeave: (emp: Employee) => void;
  onClick: (emp: Employee) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-forest-500",
  on_leave: "bg-savanna-500",
  suspended: "bg-sunset-400",
  terminated: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
};

export default function EmployeeCard({
  employee, clockedIn, clockInTime, hoursWorked,
  onCall, onClockToggle, onRequestLeave, onClick,
}: EmployeeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [elapsed, setElapsed] = useState(hoursWorked);
  const menuRef = useRef<HTMLDivElement>(null);
  const dept = departmentConfig[employee.department];
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  useEffect(() => {
    if (!clockedIn || !clockInTime) return;
    const interval = setInterval(() => {
      const start = new Date(clockInTime).getTime();
      const now = Date.now();
      setElapsed((now - start) / (1000 * 60 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [clockedIn, clockInTime]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const formatHours = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.floor((h - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCall(employee.phone, `${employee.firstName} ${employee.lastName}`);
  }, [employee.phone, employee.firstName, employee.lastName, onCall]);

  const handleClock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClockToggle(employee.id);
  }, [employee.id, onClockToggle]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onClick(employee)}
      className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4 cursor-pointer transition-all hover:shadow-lg hover:border-terracotta-200 dark:hover:border-terracotta-700/40 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {/* Top section */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${dept.bgGradient} flex items-center justify-center shadow-sm`}>
            <span className="text-white font-heading font-extrabold text-sm sm:text-base">{initials}</span>
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-warm-900 ${statusColors[employee.status]}`} />
          {clockedIn && (
            <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-forest-500 border-2 border-white dark:border-warm-900 animate-pulse" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-heading font-bold text-sm sm:text-base text-warm-900 dark:text-warm-50 truncate">
              {employee.firstName} {employee.lastName}
            </h3>
            {employee.status !== "active" && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-500 flex-shrink-0">
                {statusLabels[employee.status]}
              </span>
            )}
          </div>
          {employee.preferredName && (
            <p className="text-xs text-warm-400 truncate mb-0.5">&quot;{employee.preferredName}&quot;</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${dept.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-").replace("-600", "-100").replace("-400", "-900/30")} ${dept.color}`}>
              {dept.label}
            </span>
            <span className="text-[10px] font-mono text-warm-400 px-1 py-0.5 rounded bg-warm-50 dark:bg-warm-800/50">
              {employee.employeeId}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
            aria-label="More actions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-warm-800 rounded-xl shadow-xl border border-warm-200/60 dark:border-warm-700/60 py-1 z-20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRequestLeave(employee); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  Request Leave
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onClick(employee); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  View Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contact + clock status */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={handleCall}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-forest-50 dark:bg-forest-900/15 text-forest-600 dark:text-forest-400 hover:bg-forest-100 dark:hover:bg-forest-900/25 transition-colors min-h-[36px]"
          aria-label={`Call ${employee.firstName}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" />
          </svg>
          <span className="text-xs font-medium tabular-nums">{employee.phone}</span>
        </button>
        {clockedIn ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-forest-50 dark:bg-forest-900/15 text-forest-600 dark:text-forest-400">
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
            <span className="text-xs font-bold tabular-nums">{formatHours(elapsed)}</span>
          </div>
        ) : (
          <span className="text-[10px] text-warm-400">Not clocked in</span>
        )}
      </div>

      {/* Clock in/out button */}
      <button onClick={handleClock} disabled={employee.status !== "active"}
        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-2 active:scale-[0.98] ${
          employee.status !== "active"
            ? "bg-warm-100 dark:bg-warm-800 text-warm-400 cursor-not-allowed"
            : clockedIn
              ? "bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/25 border border-red-200/60 dark:border-red-700/30"
              : "bg-forest-500 text-white hover:bg-forest-600 shadow-md shadow-forest-500/20"
        }`}>
        {employee.status !== "active" ? statusLabels[employee.status]
          : clockedIn ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>Clock Out</>
          : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>Clock In</>
        }
      </button>

      {/* Quick actions */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-warm-100/60 dark:border-warm-800/60">
        <button onClick={(e) => { e.stopPropagation(); onRequestLeave(employee); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium text-warm-500 dark:text-warm-400 hover:bg-warm-50 dark:hover:bg-warm-800/50 transition-colors min-h-[32px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Leave
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClick(employee); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium text-warm-500 dark:text-warm-400 hover:bg-warm-50 dark:hover:bg-warm-800/50 transition-colors min-h-[32px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          Details
        </button>
        <div className="flex items-center gap-1 px-2 py-2 rounded-lg text-[10px] text-warm-400">
          <span className={employee.attendanceScore >= 90 ? "text-forest-600 font-bold" : employee.attendanceScore >= 80 ? "text-savanna-600 font-bold" : "text-red-500 font-bold"}>
            {employee.attendanceScore}%
          </span>
          <span>attendance</span>
        </div>
      </div>
    </motion.div>
  );
}
