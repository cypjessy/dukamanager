"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { Employee, Department } from "@/data/employeeData";
import { useEmployeesFirestore } from "@/hooks/useEmployeesFirestore";
import { useLocale } from "@/providers/LocaleProvider";
import { useViewport } from "@/providers/ViewportProvider";
import type { EmployeeFormValues } from "@/lib/employeeValidations";
import EmployeeCard from "@/components/employees/EmployeeCard";
import EmployeeProfile from "@/components/employees/EmployeeProfile";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import AttendanceManager from "@/components/employees/AttendanceManager";
import PayrollProcessor from "@/components/employees/PayrollProcessor";
import LeaveRequestDialog from "@/components/employees/LeaveRequestDialog";

type EmployeeView = "directory" | "attendance" | "payroll" | "leave";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const { isMobile } = useViewport();
  const {
    employees, attendance, leaveRequests, loading,
    addEmployee, clockIn, submitLeaveRequest, approveLeave,
    departmentConfig,
  } = useEmployeesFirestore();

  const [view, setView] = useState<EmployeeView>("directory");
  const [deptFilter, setDeptFilter] = useState<Department | "all">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [leaveEmployee, setLeaveEmployee] = useState<Employee | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const departments: (Department | "all")[] = ["all", ...Object.keys(departmentConfig) as Department[]];

  const filtered = useMemo(() => employees.filter((e) => {
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchDept && e.status !== "terminated";
  }), [employees, deptFilter]);

  const monthlyPayroll = useMemo(() => employees.reduce((s, e) => s + (e.monthlySalary || 0), 0), [employees]);

  // Today's attendance
  const today = new Date().toISOString().slice(0, 10);
  const todayPresent = useMemo(() =>
    attendance.filter((a) => a.date === today && (a.status === "present" || a.status === "late")).length,
    [attendance, today]
  );

  // Clock-in tracking from attendance records
  const todayClockIns = useMemo(() => {
    const map: Record<string, string> = {};
    attendance.filter((a) => a.date === today).forEach((a) => {
      map[a.employeeId] = a.clockIn;
    });
    return map;
  }, [attendance, today]);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, "")}`;
  }, []);

  const handleClockToggle = useCallback(async (id: string) => {
    if (todayClockIns[id]) {
      // Already clocked in - clock out not supported via this simple toggle
      return;
    }
    try {
      await clockIn(id);
    } catch (err) {
      console.error("Clock in failed:", err);
    }
  }, [clockIn, todayClockIns]);

  const handleRequestLeave = useCallback((emp: Employee) => {
    setLeaveEmployee(emp);
    setShowLeaveDialog(true);
  }, []);

  const handleLeaveSubmit = useCallback(async (data: Record<string, unknown>) => {
    if (!leaveEmployee) return;
    try {
      await submitLeaveRequest(leaveEmployee.id, `${leaveEmployee.firstName} ${leaveEmployee.lastName}`, data);
      setShowLeaveDialog(false);
      setLeaveEmployee(null);
    } catch (err) {
      console.error("Leave request failed:", err);
    }
  }, [leaveEmployee, submitLeaveRequest]);

  const handleSaveEmployee = useCallback(async (data: EmployeeFormValues) => {
    try {
      await addEmployee(data);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save employee:", err);
    }
  }, [addEmployee]);

  const handleApproveLeave = useCallback(async (requestId: string, approved: boolean) => {
    try {
      await approveLeave(requestId, approved);
    } catch (err) {
      console.error("Leave approval failed:", err);
    }
  }, [approveLeave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-savanna-500 animate-pulse" />
          <p className="text-sm text-warm-500">{locale === "sw" ? "Inapakia..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "" : "page-contained"}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "mb-4" : "mb-3 page-section-fixed"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-warm-900 dark:text-warm-50">
              {locale === "sw" ? "Wafanyakazi" : "Employees"}
            </h1>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
              {employees.length} {locale === "sw" ? "wafanyakazi" : "employees"}
              {monthlyPayroll > 0 && <span> &middot; KSh {monthlyPayroll.toLocaleString()} {locale === "sw" ? "mshahara" : "monthly payroll"}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-forest-50 dark:bg-forest-900/10 px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-500 animate-pulse" />
              <span className="text-xs font-medium text-forest-700 dark:text-forest-400">{todayPresent} {locale === "sw" ? "wamefika" : "present"}</span>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm hover:shadow-btn-hover transition-shadow min-h-[48px] flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span className="hidden sm:inline">{locale === "sw" ? "Ongeza" : "Add Employee"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? "mb-4" : "mb-3 page-section-fixed"}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-warm-100/80 dark:bg-warm-800/80">
          {(["directory", "attendance", "payroll", "leave"] as EmployeeView[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[48px] ${view === v ? "bg-white dark:bg-warm-700 shadow-sm text-warm-900 dark:text-warm-50" : "text-warm-500 dark:text-warm-400"}`}>
              {v === "directory" ? (locale === "sw" ? "Orodha" : "Directory") : v === "attendance" ? (locale === "sw" ? "Mahudhurio" : "Attendance") : v === "payroll" ? (locale === "sw" ? "Mishahara" : "Payroll") : (locale === "sw" ? "Likizo" : "Leave")}
            </button>
          ))}
        </div>
        {view === "directory" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {departments.map((dept) => (
              <button key={dept} onClick={() => setDeptFilter(dept)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${deptFilter === dept ? "bg-terracotta-500 text-white" : "bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400"}`}>
                {dept === "all" ? "All" : departmentConfig[dept]?.label || dept}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={isMobile ? "" : "page-section-scroll"}>
        {view === "directory" && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-1">{locale === "sw" ? "Ongeza Wafanyakazi" : "Add Your First Employee"}</h3>
                <p className="text-sm text-warm-400 mb-4">{locale === "sw" ? "Anza kwa kuongeza mfanyakazi wako" : "Start by adding your shop staff"}</p>
                <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-savanna-500 text-white font-heading font-bold text-sm min-h-[48px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {locale === "sw" ? "Ongeza Mfanyakazi" : "Add Employee"}
                </button>
              </div>
            ) : (
              <div className={isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
                {filtered.map((emp, i) => (
                  <motion.div key={emp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <EmployeeCard
                      employee={emp}
                      clockedIn={!!todayClockIns[emp.id]}
                      clockInTime={todayClockIns[emp.id] || null}
                      hoursWorked={0}
                      onCall={handleCall}
                      onClockToggle={handleClockToggle}
                      onRequestLeave={handleRequestLeave}
                      onClick={setSelectedEmployee}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "attendance" && <AttendanceManager employees={employees} attendance={attendance} locale={locale} onClockIn={handleClockToggle} />}
        {view === "payroll" && <PayrollProcessor employees={employees} locale={locale} />}
        {view === "leave" && (
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 px-1">{locale === "sw" ? "Maombi ya Likizo" : "Leave Requests"}</h3>
            {leaveRequests.length === 0 ? (
              <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-8 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                <p className="text-sm text-warm-400">{locale === "sw" ? "Hakuna maombi ya likizo" : "No leave requests yet"}</p>
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div key={req.id} className="rounded-xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50">{req.employeeName}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${req.status === "approved" ? "bg-forest-100 text-forest-700" : req.status === "rejected" ? "bg-red-100 text-red-600" : "bg-savanna-100 text-savanna-700"}`}>{req.status}</span>
                  </div>
                  <p className="text-xs text-warm-500">{req.leaveType} &middot; {req.startDate} to {req.endDate} &middot; {req.days} days</p>
                  <p className="text-xs text-warm-400 mt-1">{req.reason}</p>
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleApproveLeave(req.id, true)} className="flex-1 py-2.5 rounded-lg bg-forest-500 text-white text-xs font-bold min-h-[48px]">Approve</button>
                      <button onClick={() => handleApproveLeave(req.id, false)} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-xs font-bold min-h-[48px]">Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <EmployeeProfile employee={selectedEmployee} locale={locale} onClose={() => setSelectedEmployee(null)} />
      <AddEmployeeDialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} locale={locale} onSave={handleSaveEmployee} />
      <LeaveRequestDialog employee={leaveEmployee} isOpen={showLeaveDialog} onClose={() => { setShowLeaveDialog(false); setLeaveEmployee(null); }} onSubmit={handleLeaveSubmit} />
    </div>
  );
}
