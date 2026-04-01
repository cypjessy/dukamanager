"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Employee } from "@/data/employeeData";
import { departmentConfig, attendanceRecords, samplePayslips } from "@/data/employeeData";
import type { Locale } from "@/types";

interface EmployeeProfileProps {
  employee: Employee | null;
  locale: Locale;
  onClose: () => void;
}

type ProfileTab = "details" | "attendance" | "payroll" | "leave";

const tabs: { key: ProfileTab; label: string; labelSw: string }[] = [
  { key: "details", label: "Details", labelSw: "Maelezo" },
  { key: "attendance", label: "Attendance", labelSw: "Mahudhurio" },
  { key: "payroll", label: "Payroll", labelSw: "Mishahara" },
  { key: "leave", label: "Leave", labelSw: "Likizo" },
];

const attendanceColor: Record<string, string> = {
  present: "bg-forest-500", absent: "bg-red-500", late: "bg-savanna-500",
  on_break: "bg-sunset-400", half_day: "bg-warm-400", leave: "bg-blue-500",
};

export default function EmployeeProfile({ employee, locale, onClose }: EmployeeProfileProps) {
  const [tab, setTab] = useState<ProfileTab>("details");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!employee) return null;

  const dept = departmentConfig[employee.department];
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;
  const empAttendance = attendanceRecords.filter((a) => a.employeeId === employee.id).slice(0, 10);
  const empPayslip = samplePayslips.find((p) => p.employeeId === employee.id);

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <motion.div
          ref={dialogRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-white/95 dark:bg-warm-900/95 backdrop-blur-xl shadow-glass-lg overflow-y-auto"
          role="dialog" aria-modal="true" aria-label={`${employee.firstName} ${employee.lastName} profile`}>
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-warm-900/90 backdrop-blur-sm border-b border-warm-200/60 dark:border-warm-700/60">
            <div className="flex items-center gap-3 px-5 py-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.bgGradient} flex items-center justify-center`}>
                <span className="text-white font-heading font-extrabold text-sm">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-base text-warm-900 dark:text-warm-50 truncate">{employee.firstName} {employee.lastName}</h2>
                <p className="text-xs text-warm-400">{employee.jobTitle} &middot; {employee.employeeId}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex px-5 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-h-[36px] ${tab === t.key ? "border-terracotta-500 text-terracotta-600" : "border-transparent text-warm-400"}`}>
                  {locale === "sw" ? t.labelSw : t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {tab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">National ID</p><p className="text-sm font-mono font-medium text-warm-900 dark:text-warm-50">{employee.nationalId}</p></div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">Phone</p><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{employee.phone}</p></div>
                  {employee.kraPin && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">KRA PIN</p><p className="text-sm font-mono font-medium text-warm-900 dark:text-warm-50">{employee.kraPin}</p></div>}
                  {employee.nhifNo && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">NHIF</p><p className="text-sm font-mono font-medium text-warm-900 dark:text-warm-50">{employee.nhifNo}</p></div>}
                  {employee.nssfNo && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">NSSF</p><p className="text-sm font-mono font-medium text-warm-900 dark:text-warm-50">{employee.nssfNo}</p></div>}
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">Hire Date</p><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{employee.hireDate}</p></div>
                  {employee.mpesaNumber && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3"><p className="text-[10px] text-warm-400 mb-0.5">M-Pesa</p><p className="text-sm font-mono font-medium text-[#00A650]">{employee.mpesaNumber}</p></div>}
                  {employee.bankName && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 col-span-2"><p className="text-[10px] text-warm-400 mb-0.5">Bank</p><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{employee.bankName} &middot; {employee.bankAccount}</p></div>}
                  {employee.nextOfKin && <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 col-span-2"><p className="text-[10px] text-warm-400 mb-0.5">Next of Kin</p><p className="text-sm font-medium text-warm-900 dark:text-warm-50">{employee.nextOfKin} &middot; {employee.nextOfKinPhone}</p></div>}
                </div>
                {employee.monthlySalary > 0 && (
                  <div className="rounded-xl bg-forest-50 dark:bg-forest-900/10 border border-forest-200/50 dark:border-forest-700/30 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Monthly Salary</p>
                    <p className="text-lg font-heading font-extrabold text-forest-700 dark:text-forest-400 tabular-nums">KSh {employee.monthlySalary.toLocaleString()}</p>
                  </div>
                )}
                {employee.dailyWage > 0 && (
                  <div className="rounded-xl bg-savanna-50 dark:bg-savanna-900/10 border border-savanna-200/50 dark:border-savanna-700/30 p-3">
                    <p className="text-[10px] text-warm-400 mb-0.5">Daily Wage</p>
                    <p className="text-lg font-heading font-extrabold text-savanna-700 dark:text-savanna-400 tabular-nums">KSh {employee.dailyWage.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {tab === "attendance" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-forest-50 dark:bg-forest-900/10 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Score</p>
                    <p className="text-lg font-heading font-extrabold text-forest-600">{employee.attendanceScore}%</p>
                  </div>
                  <div className="rounded-xl bg-savanna-50 dark:bg-savanna-900/10 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Punctuality</p>
                    <p className="text-lg font-heading font-extrabold text-savanna-600">{employee.punctualityRate}%</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">This Month</p>
                    <p className="text-lg font-heading font-extrabold text-warm-900 dark:text-warm-50">{empAttendance.filter((a) => a.status === "present").length}/{empAttendance.length}</p>
                  </div>
                </div>
                {empAttendance.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                    <span className={`w-2.5 h-2.5 rounded-full ${attendanceColor[record.status]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{record.date}</p>
                      <p className="text-[10px] text-warm-400 capitalize">{record.status.replace("_", " ")}{record.clockIn && ` &middot; In: ${record.clockIn}`}{record.clockOut && ` &middot; Out: ${record.clockOut}`}</p>
                    </div>
                    {record.overtimeMinutes > 0 && <span className="text-[10px] font-medium text-sunset-500">+{record.overtimeMinutes}m OT</span>}
                  </div>
                ))}
              </div>
            )}

            {tab === "payroll" && empPayslip && (
              <div className="space-y-4">
                <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-4 space-y-2">
                  <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{empPayslip.month} Payslip</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-warm-500">Gross Pay</span><span className="font-medium text-warm-900 dark:text-warm-50 tabular-nums">KSh {empPayslip.grossPay.toLocaleString()}</span></div>
                    <div className="flex justify-between text-red-500"><span>KRA PAYE</span><span className="tabular-nums">-KSh {empPayslip.paye.toLocaleString()}</span></div>
                    <div className="flex justify-between text-red-500"><span>NHIF</span><span className="tabular-nums">-KSh {empPayslip.nhif.toLocaleString()}</span></div>
                    <div className="flex justify-between text-red-500"><span>NSSF</span><span className="tabular-nums">-KSh {empPayslip.nssfEmployee.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-warm-200/30 dark:border-warm-700/30">
                      <span className="text-warm-900 dark:text-warm-50">Net Pay</span>
                      <span className="text-forest-600 tabular-nums">KSh {empPayslip.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${empPayslip.paymentStatus === "paid" ? "bg-forest-100 text-forest-700" : "bg-savanna-100 text-savanna-700"}`}>
                      {empPayslip.paymentStatus.toUpperCase()}
                    </span>
                    {empPayslip.mpesaRef && <span className="text-[10px] text-warm-400">Ref: {empPayslip.mpesaRef}</span>}
                  </div>
                </div>
              </div>
            )}

            {tab === "leave" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-forest-50 dark:bg-forest-900/10 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Annual</p>
                    <p className="text-sm font-heading font-extrabold text-forest-600">21 days</p>
                  </div>
                  <div className="rounded-xl bg-sunset-50 dark:bg-sunset-900/10 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Used</p>
                    <p className="text-sm font-heading font-extrabold text-sunset-500">5 days</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 dark:bg-warm-800/50 p-3 text-center">
                    <p className="text-[10px] text-warm-400">Balance</p>
                    <p className="text-sm font-heading font-extrabold text-warm-900 dark:text-warm-50">16 days</p>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[44px]">
                  {locale === "sw" ? "Omba Likizo" : "Request Leave"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
