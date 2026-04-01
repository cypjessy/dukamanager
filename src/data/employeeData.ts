export type Department = "sales" | "cashier" | "stock" | "cleaner" | "security" | "delivery" | "manager";
export type EmploymentType = "permanent" | "contract" | "casual" | "daily";
export type EmployeeStatus = "active" | "on_leave" | "suspended" | "terminated";
export type AttendanceStatus = "present" | "absent" | "late" | "on_break" | "half_day" | "leave";
export type LeaveType = "annual" | "sick" | "emergency" | "maternity" | "paternity" | "unpaid";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type ShiftType = "morning" | "afternoon" | "night" | "full_day";

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  phone: string;
  whatsapp: string;
  email: string;
  nationalId: string;
  kraPin: string;
  nhifNo: string;
  nssfNo: string;
  department: Department;
  jobTitle: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  probationEnd: string;
  monthlySalary: number;
  dailyWage: number;
  bankName: string;
  bankAccount: string;
  mpesaNumber: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  attendanceScore: number;
  punctualityRate: number;
  salesPerformance?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  status: AttendanceStatus;
  overtimeMinutes: number;
  notes: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  grossPay: number;
  paye: number;
  nhif: number;
  nssfEmployee: number;
  nssfEmployer: number;
  otherDeductions: number;
  netPay: number;
  paymentStatus: PaymentStatus;
  mpesaRef: string;
  paidDate: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
}

export const departmentConfig: Record<Department, { label: string; labelSw: string; color: string; bgGradient: string }> = {
  sales: { label: "Sales", labelSw: "Mauzo", color: "text-terracotta-600", bgGradient: "from-terracotta-500 to-terracotta-400" },
  cashier: { label: "Cashier", labelSw: "Mhasibu", color: "text-savanna-600", bgGradient: "from-savanna-500 to-savanna-400" },
  stock: { label: "Stock Keeper", labelSw: "Msimamizi wa Hesabu", color: "text-forest-600", bgGradient: "from-forest-500 to-forest-400" },
  cleaner: { label: "Cleaner", labelSw: "Msafi", color: "text-warm-600", bgGradient: "from-warm-400 to-warm-300" },
  security: { label: "Security", labelSw: "Mlinzi", color: "text-sunset-600", bgGradient: "from-sunset-400 to-sunset-300" },
  delivery: { label: "Delivery", labelSw: "Msafirishaji", color: "text-terracotta-600", bgGradient: "from-terracotta-400 to-savanna-400" },
  manager: { label: "Manager", labelSw: "Meneja", color: "text-forest-700", bgGradient: "from-forest-600 to-forest-500" },
};

export const employees: Employee[] = [
  {
    id: "e1", employeeId: "DM-001", firstName: "Grace", lastName: "Njeri", preferredName: "Mama Njeri",
    phone: "0712 345 678", whatsapp: "254712345678", email: "grace@dukamanager.co.ke",
    nationalId: "12345678", kraPin: "A012345678B", nhifNo: "NHIF-12345", nssfNo: "NSSF-67890",
    department: "manager", jobTitle: "Owner/Manager", employmentType: "permanent", status: "active",
    hireDate: "2024-01-15", probationEnd: "2024-04-15", monthlySalary: 45000, dailyWage: 0,
    bankName: "Equity Bank", bankAccount: "1234567890", mpesaNumber: "0712345678",
    nextOfKin: "John Kamau", nextOfKinPhone: "0722 111 222",
    attendanceScore: 98, punctualityRate: 95, salesPerformance: 92,
  },
  {
    id: "e2", employeeId: "DM-002", firstName: "Peter", lastName: "Ochieng", preferredName: "Pete",
    phone: "0733 111 222", whatsapp: "254733111222", email: "",
    nationalId: "23456789", kraPin: "B123456789C", nhifNo: "NHIF-23456", nssfNo: "NSSF-78901",
    department: "sales", jobTitle: "Sales Assistant", employmentType: "permanent", status: "active",
    hireDate: "2024-06-01", probationEnd: "2024-09-01", monthlySalary: 18000, dailyWage: 0,
    bankName: "KCB Bank", bankAccount: "0987654321", mpesaNumber: "0733111222",
    nextOfKin: "Mary Ochieng", nextOfKinPhone: "0720 333 444",
    attendanceScore: 92, punctualityRate: 88, salesPerformance: 85,
  },
  {
    id: "e3", employeeId: "DM-003", firstName: "Faith", lastName: "Wambui", preferredName: "Fay",
    phone: "0711 222 333", whatsapp: "254711222333", email: "",
    nationalId: "34567890", kraPin: "C234567890D", nhifNo: "NHIF-34567", nssfNo: "NSSF-89012",
    department: "cashier", jobTitle: "Cashier", employmentType: "permanent", status: "active",
    hireDate: "2024-08-15", probationEnd: "2024-11-15", monthlySalary: 16000, dailyWage: 0,
    bankName: "Cooperative Bank", bankAccount: "5678901234", mpesaNumber: "0711222333",
    nextOfKin: "James Wambui", nextOfKinPhone: "0721 555 666",
    attendanceScore: 95, punctualityRate: 90, salesPerformance: 88,
  },
  {
    id: "e4", employeeId: "DM-004", firstName: "John", lastName: "Mutua", preferredName: "Johnny",
    phone: "0722 333 444", whatsapp: "254722333444", email: "",
    nationalId: "45678901", kraPin: "D345678901E", nhifNo: "NHIF-45678", nssfNo: "NSSF-90123",
    department: "stock", jobTitle: "Stock Keeper", employmentType: "contract", status: "active",
    hireDate: "2025-01-10", probationEnd: "2025-04-10", monthlySalary: 15000, dailyWage: 0,
    bankName: "NCBA Bank", bankAccount: "4321098765", mpesaNumber: "0722333444",
    nextOfKin: "Agnes Mutua", nextOfKinPhone: "0733 777 888",
    attendanceScore: 90, punctualityRate: 85,
  },
  {
    id: "e5", employeeId: "DM-005", firstName: "Amina", lastName: "Hassan", preferredName: "Amina",
    phone: "0734 444 555", whatsapp: "254734444555", email: "",
    nationalId: "56789012", kraPin: "E456789012F", nhifNo: "", nssfNo: "",
    department: "cleaner", jobTitle: "Cleaner", employmentType: "daily", status: "active",
    hireDate: "2025-03-01", probationEnd: "", monthlySalary: 0, dailyWage: 500,
    bankName: "", bankAccount: "", mpesaNumber: "0734444555",
    nextOfKin: "Fatma Hassan", nextOfKinPhone: "0712 999 000",
    attendanceScore: 85, punctualityRate: 80,
  },
  {
    id: "e6", employeeId: "DM-006", firstName: "Daniel", lastName: "Kipchoge", preferredName: "Dan",
    phone: "0720 555 666", whatsapp: "254720555666", email: "",
    nationalId: "67890123", kraPin: "F567890123G", nhifNo: "", nssfNo: "",
    department: "security", jobTitle: "Night Guard", employmentType: "casual", status: "active",
    hireDate: "2025-02-15", probationEnd: "", monthlySalary: 0, dailyWage: 600,
    bankName: "", bankAccount: "", mpesaNumber: "0720555666",
    nextOfKin: "Ruth Kipchoge", nextOfKinPhone: "0733 111 000",
    attendanceScore: 88, punctualityRate: 82,
  },
];

function genAttendance(employeeId: string, daysBack: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.getDay();
    if (day === 0) continue;

    const rand = Math.random();
    const isPresent = rand > 0.1;
    const isLate = isPresent && rand > 0.7 && rand < 0.85;
    const clockInHour = isLate ? 8 + Math.floor(Math.random() * 2) : 8;
    const clockInMin = isLate ? Math.floor(Math.random() * 59) : Math.floor(Math.random() * 10);

    records.push({
      id: `att-${employeeId}-${i}`,
      employeeId,
      date: date.toISOString().slice(0, 10),
      clockIn: isPresent ? `${String(clockInHour).padStart(2, "0")}:${String(clockInMin).padStart(2, "0")}` : "",
      clockOut: isPresent ? "17:00" : null,
      breakStart: isPresent ? "13:00" : null,
      breakEnd: isPresent ? "14:00" : null,
      status: !isPresent ? "absent" : isLate ? "late" : "present",
      overtimeMinutes: Math.random() > 0.7 ? Math.floor(Math.random() * 120) : 0,
      notes: "",
    });
  }
  return records;
}

export const attendanceRecords: AttendanceRecord[] = employees.flatMap((e) => genAttendance(e.id, 14));

export const samplePayslips: Payslip[] = employees.filter((e) => e.monthlySalary > 0).map((e) => {
  const gross = e.monthlySalary;
  const paye = Math.round(gross * 0.25);
  const nhif = gross <= 5999 ? 150 : gross <= 7999 ? 300 : gross <= 11999 ? 400 : gross <= 14999 ? 500 : gross <= 19999 ? 600 : 750;
  const nssfEmp = Math.min(Math.round(gross * 0.06), 1080);
  const nssfEmr = Math.min(Math.round(gross * 0.06), 1080);
  return {
    id: `PAY-${e.employeeId}`,
    employeeId: e.id,
    employeeName: `${e.firstName} ${e.lastName}`,
    month: "March 2026",
    grossPay: gross,
    paye, nhif,
    nssfEmployee: nssfEmp,
    nssfEmployer: nssfEmr,
    otherDeductions: 0,
    netPay: gross - paye - nhif - nssfEmp,
    paymentStatus: "pending" as PaymentStatus,
    mpesaRef: "",
    paidDate: null,
  };
});

export const sampleLeaveRequests: LeaveRequest[] = [
  { id: "lv1", employeeId: "e2", employeeName: "Peter Ochieng", leaveType: "annual", startDate: "2026-04-01", endDate: "2026-04-05", days: 5, reason: "Family visit to Kisumu", status: "pending", approvedBy: "" },
  { id: "lv2", employeeId: "e3", employeeName: "Faith Wambui", leaveType: "sick", startDate: "2026-03-20", endDate: "2026-03-21", days: 2, reason: "Doctor's appointment", status: "approved", approvedBy: "Grace Njeri" },
  { id: "lv3", employeeId: "e5", employeeName: "Amina Hassan", leaveType: "emergency", startDate: "2026-03-25", endDate: "2026-03-25", days: 1, reason: "Family emergency", status: "approved", approvedBy: "Grace Njeri" },
];

export const todayAttendance = {
  present: 4,
  absent: 1,
  onLeave: 1,
  total: 6,
};

export const monthlyPayrollTotal = samplePayslips.reduce((s, p) => s + p.netPay, 0);
