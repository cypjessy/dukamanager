"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import type { Employee, LeaveRequest, AttendanceRecord } from "@/data/employeeData";
import { departmentConfig } from "@/data/employeeData";
import type { EmployeeFormValues } from "@/lib/employeeValidations";

export function useEmployeesFirestore() {
  const { shopId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!shopId) { setLoading(false); setEmployees([]); return; }

    const init = async () => {
      try {
        const { db } = await import("@/lib/firebase/config");

        // Employees
        const unsubE = onSnapshot(collection(db, "shops", shopId, "employees"), (snap) => {
          const data: Employee[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              employeeId: r.employeeId || `EMP-${d.id.slice(-4).toUpperCase()}`,
              firstName: r.firstName || "",
              lastName: r.lastName || "",
              preferredName: r.preferredName || r.firstName || "",
              phone: r.phone || "",
              whatsapp: r.whatsapp || r.phone?.replace(/\s/g, "") || "",
              email: r.email || "",
              nationalId: r.nationalId || "",
              kraPin: r.kraPin || "",
              nhifNo: r.nhifNo || "",
              nssfNo: r.nssfNo || "",
              department: r.department || "sales",
              jobTitle: r.jobTitle || "",
              employmentType: r.employmentType || "permanent",
              status: r.status || "active",
              hireDate: r.hireDate || r.createdAt?.slice(0, 10) || "",
              probationEnd: r.probationEnd || "",
              monthlySalary: Number(r.monthlySalary) || 0,
              dailyWage: Number(r.dailyWage) || 0,
              bankName: r.bankName || "",
              bankAccount: r.bankAccount || "",
              mpesaNumber: r.mpesaNumber || "",
              nextOfKin: r.nextOfKin || "",
              nextOfKinPhone: r.nextOfKinPhone || "",
              attendanceScore: Number(r.attendanceScore) || 100,
              punctualityRate: Number(r.punctualityRate) || 100,
              salesPerformance: r.salesPerformance ? Number(r.salesPerformance) : undefined,
            };
          });
          setEmployees(data);
          setLoading(false);
        }, () => setLoading(false));
        unsubRef.current.push(unsubE);

        // Attendance records
        const unsubA = onSnapshot(collection(db, "shops", shopId, "attendance"), (snap) => {
          const data: AttendanceRecord[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              employeeId: r.employeeId || "",
              date: r.date || "",
              clockIn: r.clockIn || "",
              clockOut: r.clockOut || null,
              breakStart: r.breakStart || null,
              breakEnd: r.breakEnd || null,
              status: r.status || "present",
              overtimeMinutes: Number(r.overtimeMinutes) || 0,
              notes: r.notes || "",
            };
          });
          setAttendance(data);
        });
        unsubRef.current.push(unsubA);

        // Leave requests
        const unsubL = onSnapshot(collection(db, "shops", shopId, "leaveRequests"), (snap) => {
          const data: LeaveRequest[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              employeeId: r.employeeId || "",
              employeeName: r.employeeName || "",
              leaveType: r.leaveType || "annual",
              startDate: r.startDate || "",
              endDate: r.endDate || "",
              days: Number(r.days) || 0,
              reason: r.reason || "",
              status: r.status || "pending",
              approvedBy: r.approvedBy || "",
            };
          });
          setLeaveRequests(data);
        });
        unsubRef.current.push(unsubL);
      } catch (err) {
        console.warn("Failed to init employees:", err);
        setLoading(false);
      }
    };

    init();
    return () => { unsubRef.current.forEach((u) => u()); unsubRef.current = []; };
  }, [shopId]);

  const addEmployee = useCallback(async (data: EmployeeFormValues) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date().toISOString();
    const empData: Record<string, unknown> = {
      firstName: data.firstName,
      lastName: data.lastName || "",
      preferredName: (data as Record<string, unknown>).preferredName || data.firstName,
      phone: data.phone || "",
      whatsapp: (data as Record<string, unknown>).whatsapp || data.phone?.replace(/\s/g, "") || "",
      email: data.email || "",
      nationalId: (data as Record<string, unknown>).nationalId || "",
      kraPin: (data as Record<string, unknown>).kraPin || "",
      nhifNo: (data as Record<string, unknown>).nhifNo || "",
      nssfNo: (data as Record<string, unknown>).nssfNo || "",
      department: data.department || "sales",
      jobTitle: data.jobTitle || "",
      employmentType: data.employmentType || "permanent",
      status: "active",
      hireDate: (data as Record<string, unknown>).hireDate || now.slice(0, 10),
      probationEnd: (data as Record<string, unknown>).probationEnd || "",
      monthlySalary: Number((data as Record<string, unknown>).monthlySalary) || 0,
      dailyWage: Number((data as Record<string, unknown>).dailyWage) || 0,
      bankName: (data as Record<string, unknown>).bankName || "",
      bankAccount: (data as Record<string, unknown>).bankAccount || "",
      mpesaNumber: (data as Record<string, unknown>).mpesaNumber || "",
      nextOfKin: (data as Record<string, unknown>).nextOfKin || "",
      nextOfKinPhone: (data as Record<string, unknown>).nextOfKinPhone || "",
      attendanceScore: 100,
      punctualityRate: 100,
      createdAt: now,
    };
    return addDoc(collection(db, "shops", shopId, "employees"), empData);
  }, [shopId]);

  const updateEmployee = useCallback(async (employeeId: string, data: Partial<Employee>) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) { if (v !== undefined) clean[k] = v; }
    return updateDoc(doc(db, "shops", shopId, "employees", employeeId), clean);
  }, [shopId]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return deleteDoc(doc(db, "shops", shopId, "employees", employeeId));
  }, [shopId]);

  const clockIn = useCallback(async (employeeId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    const now = new Date();
    return addDoc(collection(db, "shops", shopId, "attendance"), {
      employeeId,
      date: now.toISOString().slice(0, 10),
      clockIn: now.toTimeString().slice(0, 5),
      clockOut: null,
      breakStart: null,
      breakEnd: null,
      status: now.getHours() >= 9 ? "late" : "present",
      overtimeMinutes: 0,
      notes: "",
      createdAt: now.toISOString(),
    });
  }, [shopId]);

  const clockOut = useCallback(async (recordId: string) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return updateDoc(doc(db, "shops", shopId, "attendance", recordId), {
      clockOut: new Date().toTimeString().slice(0, 5),
    });
  }, [shopId]);

  const submitLeaveRequest = useCallback(async (
    employeeId: string,
    employeeName: string,
    data: Record<string, unknown>
  ) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return addDoc(collection(db, "shops", shopId, "leaveRequests"), {
      employeeId,
      employeeName,
      leaveType: data.leaveType || "annual",
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      days: Number(data.days) || 0,
      reason: data.reason || "",
      status: "pending",
      approvedBy: "",
      createdAt: new Date().toISOString(),
    });
  }, [shopId]);

  const approveLeave = useCallback(async (requestId: string, approved: boolean) => {
    if (!shopId) throw new Error("No active shop");
    const { db } = await import("@/lib/firebase/config");
    return updateDoc(doc(db, "shops", shopId, "leaveRequests", requestId), {
      status: approved ? "approved" : "rejected",
    });
  }, [shopId]);

  return {
    employees,
    attendance,
    leaveRequests,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    clockIn,
    clockOut,
    submitLeaveRequest,
    approveLeave,
    departmentConfig,
  };
}
