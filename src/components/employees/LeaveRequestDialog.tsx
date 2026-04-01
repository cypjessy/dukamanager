"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Employee, LeaveType } from "@/data/employeeData";
import { departmentConfig } from "@/data/employeeData";
import { useResponsiveDialog } from "@/hooks/useResponsiveDialog";
import Button from "@/components/ui/Button";

interface LeaveRequestDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { employeeId: string; leaveType: LeaveType; startDate: string; endDate: string; days: number; reason: string }) => void;
}

const LEAVE_TYPES: { key: LeaveType; label: string; labelSw: string; color: string; icon: string }[] = [
  { key: "annual", label: "Annual Leave", labelSw: "Likizo ya Mwaka", color: "border-forest-400 bg-forest-50 dark:bg-forest-900/15 text-forest-600", icon: "\u{1F3D6}\uFE0F" },
  { key: "sick", label: "Sick Leave", labelSw: "Likizo ya Ugonjwa", color: "border-red-400 bg-red-50 dark:bg-red-900/15 text-red-600", icon: "\u{1F912}" },
  { key: "emergency", label: "Emergency Leave", labelSw: "Likizo ya Dharura", color: "border-sunset-400 bg-sunset-50 dark:bg-sunset-900/15 text-sunset-600", icon: "\u{1F6A8}" },
  { key: "maternity", label: "Maternity", labelSw: "Likizo ya Uzazi", color: "border-savanna-400 bg-savanna-50 dark:bg-savanna-900/15 text-savanna-600", icon: "\u{1F476}" },
  { key: "paternity", label: "Paternity", labelSw: "Likizo ya Baba", color: "border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/15 text-terracotta-600", icon: "\u{1F468}" },
  { key: "unpaid", label: "Unpaid Leave", labelSw: "Likizo Bila Malipo", color: "border-warm-400 bg-warm-50 dark:bg-warm-800/50 text-warm-600", icon: "\u{1F4B8}" },
];

const QUICK_REASONS = [
  "Family visit", "Medical appointment", "Personal matters", "Home repair", "School event",
];

export default function LeaveRequestDialog({ employee, isOpen, onClose, onSubmit }: LeaveRequestDialogProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { isMobile } = useResponsiveDialog();

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  const annualBalance = 21;
  const annualUsed = 5;

  useEffect(() => {
    if (isOpen) {
      setLeaveType("annual");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!employee || !startDate || !endDate || !reason.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit({ employeeId: employee.id, leaveType, startDate, endDate, days, reason });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => { setSubmitSuccess(false); onClose(); }, 1200);
  }, [employee, startDate, endDate, days, reason, leaveType, onSubmit, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const dept = departmentConfig[employee.department];
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;
  const canSubmit = !!(startDate && endDate && reason.trim() && days > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {isMobile ? (
            <motion.div key="leave-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "100dvh", borderRadius: "24px 24px 0 0" }}
              className="z-50 bg-white dark:bg-warm-900 flex flex-col overflow-hidden">
              <LeaveContent employee={employee} dept={dept} initials={initials}
                leaveType={leaveType} setLeaveType={setLeaveType}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                reason={reason} setReason={setReason} days={days}
                annualBalance={annualBalance} annualUsed={annualUsed}
                isSubmitting={isSubmitting} submitSuccess={submitSuccess} canSubmit={canSubmit}
                onClose={onClose} onSubmit={handleSubmit} />
            </motion.div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
              <motion.div key="leave-desktop" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-warm-900 flex flex-col overflow-hidden rounded-[20px] shadow-2xl"
                style={{ width: "min(480px, calc(100vw - 32px))", maxHeight: "85vh" }}>
                <LeaveContent employee={employee} dept={dept} initials={initials}
                  leaveType={leaveType} setLeaveType={setLeaveType}
                  startDate={startDate} setStartDate={setStartDate}
                  endDate={endDate} setEndDate={setEndDate}
                  reason={reason} setReason={setReason} days={days}
                  annualBalance={annualBalance} annualUsed={annualUsed}
                  isSubmitting={isSubmitting} submitSuccess={submitSuccess} canSubmit={canSubmit}
                  onClose={onClose} onSubmit={handleSubmit} />
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

interface LeaveContentProps {
  employee: Employee;
  dept: { label: string; labelSw: string; color: string; bgGradient: string };
  initials: string;
  leaveType: LeaveType;
  setLeaveType: (t: LeaveType) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  reason: string;
  setReason: (r: string) => void;
  days: number;
  annualBalance: number;
  annualUsed: number;
  isSubmitting: boolean;
  submitSuccess: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

function LeaveContent(p: LeaveContentProps) {
  const { employee, dept, initials, leaveType, setLeaveType, startDate, setStartDate, endDate, setEndDate,
    reason, setReason, days, annualBalance, annualUsed, isSubmitting, submitSuccess, canSubmit, onClose, onSubmit } = p;

  return (
    <>
      {/* Success overlay */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white dark:bg-warm-900 flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-forest-500 flex items-center justify-center mb-4">
              <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}>
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            </motion.div>
            <p className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50">Request Submitted</p>
            <p className="text-sm text-warm-400 mt-1">Awaiting approval</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-warm-100 dark:border-warm-800"
        style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.bgGradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50">Request Leave</h2>
              <p className="text-xs text-warm-400">{employee.firstName} {employee.lastName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
            aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Leave balance */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-forest-50 dark:bg-forest-900/10 p-2.5 text-center">
            <p className="text-[10px] text-warm-400">Annual</p>
            <p className="text-sm font-heading font-extrabold text-forest-600">{annualBalance}</p>
          </div>
          <div className="rounded-xl bg-sunset-50 dark:bg-sunset-900/10 p-2.5 text-center">
            <p className="text-[10px] text-warm-400">Used</p>
            <p className="text-sm font-heading font-extrabold text-sunset-500">{annualUsed}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-2.5 text-center">
            <p className="text-[10px] text-warm-400">Balance</p>
            <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50">{annualBalance - annualUsed}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: "120px" }}>
        {/* Leave type */}
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">Leave Type</label>
          <div className="grid grid-cols-2 gap-2">
            {LEAVE_TYPES.map((lt) => (
              <button key={lt.key} onClick={() => setLeaveType(lt.key)}
                className={`py-2.5 rounded-xl border-2 text-xs font-heading font-bold transition-all min-h-[44px] text-left px-3 ${
                  leaveType === lt.key ? lt.color : "border-warm-200 dark:border-warm-700 text-warm-500 dark:text-warm-400 hover:border-warm-300"
                }`}>
                <span className="mr-1">{lt.icon}</span> {lt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500"
              style={{ fontSize: "16px", minHeight: "44px" }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500"
              style={{ fontSize: "16px", minHeight: "44px" }} />
          </div>
        </div>

        {days > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-200/40 dark:border-terracotta-700/20">
            <span className="text-lg font-heading font-extrabold text-terracotta-600">{days}</span>
            <span className="text-xs text-warm-500">{days === 1 ? "day" : "days"} requested</span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-medium text-warm-500 dark:text-warm-400 mb-1.5">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
            placeholder="Brief reason for leave..."
            className="w-full px-3 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-800/60 border border-warm-200 dark:border-warm-700 text-sm outline-none focus:border-terracotta-500 resize-none"
            style={{ fontSize: "16px", minHeight: "72px" }} />
        </div>

        {/* Quick reasons */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-h-[28px] ${
                reason === r ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700"
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-warm-100 dark:border-warm-800 bg-white dark:bg-warm-900 px-4 py-3"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="md" onClick={onSubmit} isLoading={isSubmitting} disabled={!canSubmit} className="flex-1">
            Submit Request
          </Button>
        </div>
      </div>
    </>
  );
}
