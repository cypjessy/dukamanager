export interface ShopSettings {
  shopName: string;
  legalName: string;
  kraPin: string;
  regNumber: string;
  email: string;
  phone: string;
  whatsappBusiness: boolean;
  address: string;
  estate: string;
  city: string;
  county: string;
  coordinates: string;
  primaryColor: string;
  secondaryColor: string;
  receiptHeader: string;
  receiptHeaderSw: string;
  receiptFooter: string;
  receiptFooterSw: string;
  operatingHours: OperatingDay[];
}

export interface OperatingDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "manager" | "cashier" | "viewer";
  isActive: boolean;
  lastLogin: string;
}

export interface Permission {
  feature: string;
  featureSw: string;
  admin: boolean;
  manager: boolean;
  cashier: boolean;
  viewer: boolean;
}

export interface NotificationPreference {
  alert: string;
  alertSw: string;
  sms: boolean;
  email: boolean;
  inApp: boolean;
  whatsapp: boolean;
}

export interface BackupSchedule {
  frequency: "daily" | "weekly" | "monthly";
  retention: number;
  lastBackup: string;
  nextBackup: string;
  storageUsed: string;
  storageLimit: string;
}

export const defaultShopSettings: ShopSettings = {
  shopName: "Mama Njeri Groceries",
  legalName: "Njeri Enterprises Ltd",
  kraPin: "P051234567A",
  regNumber: "BN-2024-123456",
  email: "info@mamanjeri.co.ke",
  phone: "0712 345 678",
  whatsappBusiness: true,
  address: "Plot 45, Gikomba Market",
  estate: "Gikomba",
  city: "Nairobi",
  county: "Nairobi",
  coordinates: "-1.2833, 36.8333",
  primaryColor: "#C75B39",
  secondaryColor: "#D4A574",
  receiptHeader: "Thank you for shopping with us!",
  receiptHeaderSw: "Asante kwa kununua hapa!",
  receiptFooter: "Come again! We appreciate your business.",
  receiptFooterSw: "Karibu tena! Tunathamini biashara yako.",
  operatingHours: [
    { day: "Monday", open: "07:00", close: "20:00", isClosed: false },
    { day: "Tuesday", open: "07:00", close: "20:00", isClosed: false },
    { day: "Wednesday", open: "07:00", close: "20:00", isClosed: false },
    { day: "Thursday", open: "07:00", close: "20:00", isClosed: false },
    { day: "Friday", open: "07:00", close: "21:00", isClosed: false },
    { day: "Saturday", open: "06:00", close: "21:00", isClosed: false },
    { day: "Sunday", open: "08:00", close: "16:00", isClosed: false },
  ],
};

export const defaultUsers: UserRole[] = [
  { id: "u1", name: "Grace Njeri", phone: "0712 345 678", role: "admin", isActive: true, lastLogin: "2026-03-27 08:15" },
  { id: "u2", name: "Peter Ochieng", phone: "0733 111 222", role: "cashier", isActive: true, lastLogin: "2026-03-27 09:00" },
  { id: "u3", name: "Faith Wambui", phone: "0711 222 333", role: "cashier", isActive: true, lastLogin: "2026-03-26 17:30" },
];

export const defaultPermissions: Permission[] = [
  { feature: "Sales Recording", featureSw: "Kurekodi Mauzo", admin: true, manager: true, cashier: true, viewer: false },
  { feature: "Inventory Editing", featureSw: "Kuhariri Hesabu", admin: true, manager: true, cashier: false, viewer: false },
  { feature: "Expense Approval", featureSw: "Kuidhinisha Gharama", admin: true, manager: true, cashier: false, viewer: false },
  { feature: "View Reports", featureSw: "Kuona Ripoti", admin: true, manager: true, cashier: true, viewer: true },
  { feature: "Modify Settings", featureSw: "Kubadilisha Mipangilio", admin: true, manager: false, cashier: false, viewer: false },
  { feature: "Manage Employees", featureSw: "Kusimamia Wafanyakazi", admin: true, manager: true, cashier: false, viewer: false },
  { feature: "Process Payroll", featureSw: "Kulipa Mishahara", admin: true, manager: false, cashier: false, viewer: false },
  { feature: "Credit Management", featureSw: "Usimamizi wa Mikopo", admin: true, manager: true, cashier: false, viewer: false },
];

export const defaultNotifications: NotificationPreference[] = [
  { alert: "Low Stock Alerts", alertSw: "Onyo la Hesabu Ndogo", sms: false, email: false, inApp: true, whatsapp: true },
  { alert: "Credit Due Dates", alertSw: "Tarehe za Mkopo", sms: true, email: false, inApp: true, whatsapp: false },
  { alert: "Attendance Anomalies", alertSw: "Matatizo ya Mahudhurio", sms: false, email: false, inApp: true, whatsapp: false },
  { alert: "Sales Targets", alertSw: "Malengo ya Mauzo", sms: false, email: true, inApp: true, whatsapp: false },
  { alert: "System Updates", alertSw: "Maboresho ya Mfumo", sms: false, email: true, inApp: true, whatsapp: false },
  { alert: "Daily Summary", alertSw: "Muhtasari wa Kila Siku", sms: false, email: true, inApp: false, whatsapp: true },
];

export const defaultBackup: BackupSchedule = {
  frequency: "daily",
  retention: 30,
  lastBackup: "2026-03-27 06:00",
  nextBackup: "2026-03-28 06:00",
  storageUsed: "24 MB",
  storageLimit: "500 MB",
};

export const customUnits = [
  { value: "pieces", label: "Pieces (Vipande)" },
  { value: "kg", label: "Kilograms (Kilo)" },
  { value: "liters", label: "Liters (Lita)" },
  { value: "boxes", label: "Boxes (Masanduku)" },
  { value: "bottles", label: "Bottles (Chupa)" },
  { value: "packs", label: "Packs (Pakiti)" },
  { value: "jars", label: "Jars (Mapipa)" },
  { value: "debes", label: "Debes (Debesi)" },
  { value: "bales", label: "Bales (Mabeseni)" },
  { value: "crates", label: "Crates (Makratishi)" },
];

export const kenyanCounties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
  "Kitale", "Garissa", "Nyeri", "Machakos", "Meru", "Embu", "Nanyuki",
  "Naivasha", "Kericho", "Bomet", "Kakamega", "Bungoma", "Busia",
];

export const mpesaProviders = [
  { value: "safaricom", label: "Safaricom M-Pesa" },
  { value: "equitel", label: "Equitel" },
  { value: "t-kash", label: "T-Kash (Telkom)" },
  { value: "airtel-money", label: "Airtel Money" },
];
