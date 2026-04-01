import { z } from "zod";

const KENYAN_PHONE = /^(?:\+254|254|0)([7][0-9]{8})$/;

export const employeeFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "Jina linahitajika / First name required").max(50),
  lastName: z.string().min(2, "Jina la mwisho linahitajika / Last name required").max(50),
  nationalId: z.string().regex(/^\d{8}$/, "Namba ya kitambulisho lazima iwe tarakimu 8 / ID must be 8 digits"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).default("male"),

  // Contact Details
  phone: z.string().regex(KENYAN_PHONE, "Namba ya simu si sahihi / Invalid phone (07XX XXX XXX)"),
  phoneAlt: z.string().optional().or(z.literal("")),
  email: z.string().email("Barua pepe si sahihi / Invalid email").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  emergencyContactName: z.string().max(100).optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  emergencyContactRelation: z.string().optional().or(z.literal("")),

  // Employment Details
  department: z.string().min(1, "Chagua idara / Select department"),
  jobTitle: z.string().min(1, "Kazi inahitajika / Job title required"),
  employmentType: z.enum(["full_time", "part_time", "casual"]).default("full_time"),
  startDate: z.string().optional().or(z.literal("")),
  salaryAmount: z.coerce.number().min(0).default(0),
  salaryPeriod: z.enum(["monthly", "weekly", "daily"]).default("monthly"),
  mpesaNumber: z.string().optional().or(z.literal("")),

  // Permissions
  permViewSales: z.boolean().default(true),
  permRecordSales: z.boolean().default(true),
  permViewInventory: z.boolean().default(false),
  permManageInventory: z.boolean().default(false),
  permViewCustomers: z.boolean().default(false),
  permManageCustomers: z.boolean().default(false),
  permViewSuppliers: z.boolean().default(false),
  permManageSuppliers: z.boolean().default(false),
  permViewReports: z.boolean().default(false),
  permGenerateReports: z.boolean().default(false),
  permManageEmployees: z.boolean().default(false),
  permAccessSettings: z.boolean().default(false),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const DEPARTMENTS = [
  { value: "sales", label: "Sales", labelSw: "Mauzo" },
  { value: "cashier", label: "Cashier", labelSw: "Mhasibu" },
  { value: "stock", label: "Stock Keeper", labelSw: "Msimamizi" },
  { value: "cleaner", label: "Cleaner", labelSw: "Msafi" },
  { value: "security", label: "Security", labelSw: "Mlinzi" },
  { value: "delivery", label: "Delivery Driver", labelSw: "Dereva" },
  { value: "manager", label: "Manager", labelSw: "Meneja" },
];

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time", labelSw: "Wakati Wote" },
  { value: "part_time", label: "Part-Time", labelSw: "Nusu Wakati" },
  { value: "casual", label: "Casual", labelSw: "Muda" },
];

export const RELATIONS = [
  { value: "parent", label: "Parent", labelSw: "Mzazi" },
  { value: "spouse", label: "Spouse", labelSw: "Mwenza" },
  { value: "sibling", label: "Sibling", labelSw: "Ndugu" },
  { value: "friend", label: "Friend", labelSw: "Rafiki" },
  { value: "other", label: "Other", labelSw: "Nyingine" },
];

export const PERMISSION_GROUPS = [
  { key: "sales", label: "Sales", labelSw: "Mauzo", viewKey: "permViewSales" as const, manageKey: "permRecordSales" as const },
  { key: "inventory", label: "Inventory", labelSw: "Hesabu", viewKey: "permViewInventory" as const, manageKey: "permManageInventory" as const },
  { key: "customers", label: "Customers", labelSw: "Wateja", viewKey: "permViewCustomers" as const, manageKey: "permManageCustomers" as const },
  { key: "suppliers", label: "Suppliers", labelSw: "Watoa Huduma", viewKey: "permViewSuppliers" as const, manageKey: "permManageSuppliers" as const },
  { key: "reports", label: "Reports", labelSw: "Ripoti", viewKey: "permViewReports" as const, manageKey: "permGenerateReports" as const },
];

export const PERMISSION_PRESETS = [
  { name: "Attendant", nameSw: "Msaidizi", perms: { permViewSales: true, permRecordSales: true } },
  { name: "Cashier", nameSw: "Mhasibu", perms: { permViewSales: true, permRecordSales: true, permViewInventory: true } },
  { name: "Manager", nameSw: "Meneja", perms: { permViewSales: true, permRecordSales: true, permViewInventory: true, permManageInventory: true, permViewCustomers: true, permManageCustomers: true, permViewReports: true, permGenerateReports: true } },
];
