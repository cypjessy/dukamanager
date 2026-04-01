"use client";

import { useMemo } from "react";
import type { Employee } from "@/data/employeeData";
import type { Locale } from "@/types";

interface Props {
  employees: Employee[];
  locale: Locale;
}

export default function PayrollProcessor({ employees, locale }: Props) {
  const activeEmployees = useMemo(() => employees.filter((e) => e.status === "active" && e.monthlySalary > 0), [employees]);

  const totalGross = activeEmployees.reduce((s, e) => s + e.monthlySalary, 0);

  // Simplified Kenya payroll deductions (approximate)
  const deductions = useMemo(() => {
    let paye = 0, nhif = 0, nssf = 0;
    activeEmployees.forEach((e) => {
      const salary = e.monthlySalary;
      // PAYE rough estimate
      if (salary > 24000) paye += Math.round((salary - 24000) * 0.25);
      else if (salary > 12298) paye += Math.round((salary - 12298) * 0.1);
      // NHIF tiered
      if (salary <= 5999) nhif += 150;
      else if (salary <= 7999) nhif += 300;
      else if (salary <= 11999) nhif += 400;
      else if (salary <= 14999) nhif += 500;
      else if (salary <= 19999) nhif += 600;
      else if (salary <= 24999) nhif += 750;
      else if (salary <= 29999) nhif += 850;
      else if (salary <= 34999) nhif += 900;
      else if (salary <= 39999) nhif += 950;
      else if (salary <= 44999) nhif += 1000;
      else nhif += 1100;
      // NSSF Tier I (6% of pensionable up to 6000, max 360)
      nssf += 360;
    });
    return { paye, nhif, nssf };
  }, [activeEmployees]);

  const totalDeductions = deductions.paye + deductions.nhif + deductions.nssf;
  const totalNet = totalGross - totalDeductions;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Jumla" : "Gross Pay"}</p>
          <p className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">KSh {totalGross.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-red-200/60 dark:border-red-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Katizo" : "Deductions"}</p>
          <p className="text-xl font-heading font-extrabold text-red-500 tabular-nums">KSh {totalDeductions.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-forest-200/60 dark:border-forest-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Mshahara Halisi" : "Net Pay"}</p>
          <p className="text-xl font-heading font-extrabold text-forest-600 tabular-nums">KSh {totalNet.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs text-warm-500 dark:text-warm-400">{locale === "sw" ? "Wafanyakazi" : "Employees"}</p>
          <p className="text-xl font-heading font-extrabold text-warm-900 dark:text-warm-50 tabular-nums">{activeEmployees.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200/60 dark:border-warm-700/60 p-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <h3 className="font-heading font-bold text-sm text-warm-900 dark:text-warm-50 mb-3">{locale === "sw" ? "Mishahara" : "Salary Details"}</h3>
        {activeEmployees.length === 0 ? (
          <p className="text-xs text-warm-400 text-center py-6">{locale === "sw" ? "Hakuna wafanyakazi wenye mshahara" : "No employees with salary data"}</p>
        ) : (
          <div className="space-y-2">
            {activeEmployees.map((emp) => {
              const empPaye = emp.monthlySalary > 24000 ? Math.round((emp.monthlySalary - 24000) * 0.25) : emp.monthlySalary > 12298 ? Math.round((emp.monthlySalary - 12298) * 0.1) : 0;
              const empNhif = emp.monthlySalary <= 5999 ? 150 : emp.monthlySalary <= 7999 ? 300 : emp.monthlySalary <= 11999 ? 400 : emp.monthlySalary <= 14999 ? 500 : emp.monthlySalary <= 19999 ? 600 : emp.monthlySalary <= 24999 ? 750 : emp.monthlySalary <= 29999 ? 850 : emp.monthlySalary <= 34999 ? 900 : emp.monthlySalary <= 39999 ? 950 : emp.monthlySalary <= 44999 ? 1000 : 1100;
              const empNssf = 360;
              const empNet = emp.monthlySalary - empPaye - empNhif - empNssf;
              return (
                <div key={emp.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50 dark:bg-warm-800/50">
                  <div>
                    <p className="text-sm font-medium text-warm-900 dark:text-warm-50">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-warm-400">{emp.jobTitle || emp.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-heading font-bold text-forest-600 tabular-nums">KSh {empNet.toLocaleString()}</p>
                    <p className="text-[10px] text-warm-400 tabular-nums">Gross: KSh {emp.monthlySalary.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
