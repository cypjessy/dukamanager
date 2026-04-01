export type DocCategory = "licenses" | "contracts" | "employee" | "financial" | "tax" | "insurance" | "lease" | "operational" | "other";
export type DocStatus = "valid" | "expiring_soon" | "expired" | "pending";
export type ViewMode = "grid" | "list";
export type SortBy = "date" | "name" | "size" | "type" | "expiry";

export interface Document {
  id: string;
  name: string;
  description: string;
  category: DocCategory;
  fileType: "pdf" | "image" | "doc" | "xls" | "scan";
  fileSize: string;
  uploadDate: string;
  expiryDate: string | null;
  renewalDate: string | null;
  tags: string[];
  folderId: string;
  version: number;
  status: DocStatus;
  linkedTo?: string;
  uploadedBy: string;
  fileUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  nameSw: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  isSystem: boolean;
}

export interface LicenseItem {
  id: string;
  name: string;
  nameSw: string;
  issuingBody: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalCost: number;
  status: DocStatus;
  docId: string;
}

export interface Contract {
  id: string;
  title: string;
  party: string;
  type: "supplier" | "employee" | "lease" | "service";
  startDate: string;
  endDate: string;
  value: number;
  status: "active" | "expiring" | "expired" | "terminated";
  docId: string;
}

export const categoryConfig: Record<DocCategory, { label: string; labelSw: string; color: string; icon: string }> = {
  licenses: { label: "Licenses", labelSw: "Leseni", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", icon: "\u{1F4DC}" },
  contracts: { label: "Contracts", labelSw: "Mikataba", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400", icon: "\u{1F4CB}" },
  employee: { label: "Employee", labelSw: "Wafanyakazi", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400", icon: "\u{1F465}" },
  financial: { label: "Financial", labelSw: "Kifedha", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400", icon: "\u{1F4B0}" },
  tax: { label: "Tax", labelSw: "Kodi", color: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400", icon: "\u{1F4CA}" },
  insurance: { label: "Insurance", labelSw: "Bima", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", icon: "\u{1F6E1}\u{FE0F}" },
  lease: { label: "Leases", labelSw: "Kodi ya Jengo", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", icon: "\u{1F3E0}" },
  operational: { label: "Operational", labelSw: "Utendaji", color: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300", icon: "\u{1F4DD}" },
  other: { label: "Other", labelSw: "Nyingine", color: "bg-warm-100 dark:bg-warm-800 text-warm-500", icon: "\u{1F4C4}" },
};

export function genDoc(id: number, name: string, cat: DocCategory, expiry: string | null, tags: string[]): Document {
  const fileType = cat === "licenses" ? "scan" : cat === "financial" ? "pdf" : cat === "employee" ? "doc" : "pdf";
  const now = new Date();
  const expiryDate = expiry ? new Date(expiry) : null;
  const daysUntil = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const status: DocStatus = !expiryDate ? "valid" : daysUntil! < 0 ? "expired" : daysUntil! < 30 ? "expiring_soon" : "valid";

  return {
    id: `doc-${String(id).padStart(3, "0")}`,
    name,
    description: "",
    category: cat,
    fileType,
    fileSize: `${Math.floor(Math.random() * 500 + 100)}KB`,
    uploadDate: new Date(now.getTime() - Math.floor(Math.random() * 180) * 86400000).toISOString().slice(0, 10),
    expiryDate: expiry,
    renewalDate: expiry ? new Date(new Date(expiry).getTime() - 30 * 86400000).toISOString().slice(0, 10) : null,
    tags,
    folderId: cat,
    version: 1,
    status,
    uploadedBy: "Grace Njeri",
  };
}

export const sampleDocuments: Document[] = [
  genDoc(1, "Single Business Permit 2026", "licenses", "2026-12-31", ["Nairobi County", "2026"]),
  genDoc(2, "County Trade License", "licenses", "2026-06-30", ["Nairobi County", "Trade"]),
  genDoc(3, "KRA PIN Certificate", "tax", null, ["KRA", "PIN", "P051234567A"]),
  genDoc(4, "NHIF Registration Certificate", "employee", null, ["NHIF", "Registration"]),
  genDoc(5, "NSSF Registration Certificate", "employee", null, ["NSSF", "Registration"]),
  genDoc(6, "Fire Safety Certificate", "licenses", "2026-09-15", ["Fire", "Safety", "County"]),
  genDoc(7, "Shop Lease Agreement", "lease", "2027-01-31", ["Gikomba", "Rent", "Lease"]),
  genDoc(8, "Supplier Contract - Bidco Africa", "contracts", "2026-12-31", ["Bidco", "Supplier", "Cooking Oil"]),
  genDoc(9, "Supplier Contract - Unilever Kenya", "contracts", "2026-11-30", ["Unilever", "Supplier", "Soap"]),
  genDoc(10, "Supplier Contract - CCBA Kenya", "contracts", "2026-10-15", ["CCBA", "Supplier", "Beverages"]),
  genDoc(11, "Employee Contract - Peter Ochieng", "employee", null, ["Employee", "Sales", "Peter"]),
  genDoc(12, "Employee Contract - Faith Wambui", "employee", null, ["Employee", "Cashier", "Faith"]),
  genDoc(13, "Employee Contract - John Mutua", "employee", "2026-12-31", ["Employee", "Stock", "John", "Contract"]),
  genDoc(14, "KRA iTax Returns 2025", "tax", null, ["KRA", "Tax", "2025", "Returns"]),
  genDoc(15, "KRA iTax Returns 2024", "tax", null, ["KRA", "Tax", "2024", "Returns"]),
  genDoc(16, "Bank Statement - March 2026", "financial", null, ["Equity", "Bank", "Statement", "2026-03"]),
  genDoc(17, "Bank Statement - February 2026", "financial", null, ["Equity", "Bank", "Statement", "2026-02"]),
  genDoc(18, "Bank Statement - January 2026", "financial", null, ["Equity", "Bank", "Statement", "2026-01"]),
  genDoc(19, "Business Insurance Policy", "insurance", "2026-08-15", ["Insurance", "CIC", "Policy"]),
  genDoc(20, "M-Pesa Statement March 2026", "financial", null, ["M-Pesa", "Statement", "2026-03"]),
  genDoc(21, "Rent Receipt March 2026", "lease", null, ["Rent", "Receipt", "2026-03"]),
  genDoc(22, "Health Inspection Certificate", "licenses", "2026-04-30", ["Health", "Inspection", "County"]),
  genDoc(23, "Supplier Invoice - Bidco March", "financial", null, ["Bidco", "Invoice", "2026-03"]),
  genDoc(24, "Employee Payslip Template", "operational", null, ["Template", "Payslip"]),
  genDoc(25, "Stock Take Report March 2026", "operational", null, ["Stock", "Report", "2026-03"]),
];

export const licenseItems: LicenseItem[] = [
  { id: "lic1", name: "Single Business Permit", nameSw: "Kibali cha Biashara", issuingBody: "Nairobi County", expiryDate: "2026-12-31", daysUntilExpiry: 279, renewalCost: 10000, status: "valid", docId: "doc-001" },
  { id: "lic2", name: "County Trade License", nameSw: "Leseni ya Biashara", issuingBody: "Nairobi County", expiryDate: "2026-06-30", daysUntilExpiry: 95, renewalCost: 8000, status: "valid", docId: "doc-002" },
  { id: "lic3", name: "Fire Safety Certificate", nameSw: "Cheti cha Usalama wa Moto", issuingBody: "Nairobi County Fire", expiryDate: "2026-09-15", daysUntilExpiry: 172, renewalCost: 5000, status: "valid", docId: "doc-006" },
  { id: "lic4", name: "Health Inspection Certificate", nameSw: "Cheti cha Afya", issuingBody: "County Health Dept", expiryDate: "2026-04-30", daysUntilExpiry: 34, renewalCost: 3000, status: "expiring_soon", docId: "doc-022" },
  { id: "lic5", name: "Business Insurance", nameSw: "Bima ya Biashara", issuingBody: "CIC Insurance", expiryDate: "2026-08-15", daysUntilExpiry: 141, renewalCost: 25000, status: "valid", docId: "doc-019" },
];

export const contracts: Contract[] = [
  { id: "con1", title: "Supplier - Bidco Africa", party: "Bidco Africa Ltd", type: "supplier", startDate: "2025-01-01", endDate: "2026-12-31", value: 500000, status: "active", docId: "doc-008" },
  { id: "con2", title: "Supplier - Unilever Kenya", party: "Unilever Kenya", type: "supplier", startDate: "2025-03-01", endDate: "2026-11-30", value: 300000, status: "active", docId: "doc-009" },
  { id: "con3", title: "Employee - Peter Ochieng", party: "Peter Ochieng", type: "employee", startDate: "2024-06-01", endDate: "2027-05-31", value: 216000, status: "active", docId: "doc-011" },
  { id: "con4", title: "Employee - John Mutua", party: "John Mutua", type: "employee", startDate: "2025-01-10", endDate: "2026-12-31", value: 180000, status: "expiring", docId: "doc-013" },
  { id: "con5", title: "Shop Lease", party: "Gikomba Properties Ltd", type: "lease", startDate: "2024-02-01", endDate: "2027-01-31", value: 432000, status: "active", docId: "doc-007" },
];

export function getComplianceScore(docs: Document[]): number {
  const licenses = docs.filter((d) => d.category === "licenses");
  const valid = licenses.filter((d) => d.status === "valid" || d.status === "expiring_soon");
  return licenses.length > 0 ? Math.round((valid.length / licenses.length) * 100) : 100;
}

export function getExpiryUrgency(days: number): { color: string; label: string } {
  if (days < 0) return { color: "bg-red-100 dark:bg-red-900/30 text-red-600", label: "Expired" };
  if (days <= 7) return { color: "bg-red-100 dark:bg-red-900/30 text-red-600", label: `${days}d` };
  if (days <= 30) return { color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-600", label: `${days}d` };
  return { color: "bg-forest-100 dark:bg-forest-900/30 text-forest-600", label: `${days}d` };
}
