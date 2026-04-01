export type ReturnReason = "defective" | "wrong_item" | "changed_mind" | "expired" | "quality" | "size_issue" | "damaged_transit" | "overstock" | "supplier_error" | "breakage";
export type ReturnStatus = "pending" | "approved" | "rejected" | "completed" | "processing";
export type ReturnCondition = "sellable" | "resell_discount" | "damaged" | "destroyed";
export type RefundMethod = "mpesa" | "cash" | "credit" | "exchange";
export type ReturnType = "customer" | "supplier" | "internal";

export interface ReturnRequest {
  id: string;
  returnNo: string;
  type: ReturnType;
  originalReceipt: string;
  customerName: string;
  customerPhone: string;
  items: ReturnItem[];
  totalValue: number;
  reason: ReturnReason;
  reasonNote: string;
  condition: ReturnCondition;
  refundMethod: RefundMethod;
  refundAmount: number;
  status: ReturnStatus;
  approvedBy: string;
  processedDate: string;
  createdDate: string;
}

export interface ReturnItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DamageLog {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  value: number;
  category: "breakage" | "spillage" | "pest" | "water" | "fire" | "theft" | "expiry";
  location: string;
  employee: string;
  date: string;
  disposalMethod: "donation" | "recycling" | "destruction" | "writeoff";
  notes: string;
}

export const reasonConfig: Record<ReturnReason, { label: string; labelSw: string; color: string }> = {
  defective: { label: "Defective", labelSw: "Hitilafu", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  wrong_item: { label: "Wrong Item", labelSw: "Bidhaa Makosa", color: "text-sunset-600 bg-sunset-100 dark:bg-sunset-900/30" },
  changed_mind: { label: "Changed Mind", labelSw: "Amebadilisha", color: "text-warm-600 bg-warm-100 dark:bg-warm-800" },
  expired: { label: "Expired", labelSw: "Muda Umeisha", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  quality: { label: "Quality Issue", labelSw: "Ubora Duni", color: "text-savanna-600 bg-savanna-100 dark:bg-savanna-900/30" },
  size_issue: { label: "Size Issue", labelSw: "Ukubwa Mbaya", color: "text-warm-600 bg-warm-100 dark:bg-warm-800" },
  damaged_transit: { label: "Damaged in Transit", labelSw: "Kuharibika Safarini", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  overstock: { label: "Overstock", labelSw: "Hisani Nyingi", color: "text-warm-600 bg-warm-100 dark:bg-warm-800" },
  supplier_error: { label: "Supplier Error", labelSw: "Kosa la Msambazaji", color: "text-sunset-600 bg-sunset-100 dark:bg-sunset-900/30" },
  breakage: { label: "Breakage", labelSw: "Kuvunjika", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
};

export const statusConfig: Record<ReturnStatus, { label: string; labelSw: string; color: string }> = {
  pending: { label: "Pending", labelSw: "Inasubiri", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400" },
  processing: { label: "Processing", labelSw: "Inashughulikiwa", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  approved: { label: "Approved", labelSw: "Imeidhinishwa", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400" },
  rejected: { label: "Rejected", labelSw: "Imekataliwa", color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  completed: { label: "Completed", labelSw: "Imekamilika", color: "bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300" },
};

export const sampleReturns: ReturnRequest[] = [
  {
    id: "ret1", returnNo: "RET-001", type: "customer", originalReceipt: "RCP20001", customerName: "Wanjiku M.", customerPhone: "0722 111 001",
    items: [{ productName: "Elianto Cooking Oil 1L", sku: "OIL-001", quantity: 1, unitPrice: 330, total: 330 }],
    totalValue: 330, reason: "defective", reasonNote: "Oil was rancid", condition: "damaged", refundMethod: "mpesa",
    refundAmount: 330, status: "approved", approvedBy: "Grace Njeri", processedDate: "2026-03-26", createdDate: "2026-03-26",
  },
  {
    id: "ret2", returnNo: "RET-002", type: "customer", originalReceipt: "RCP19980", customerName: "Baba Karanja", customerPhone: "0733 222 001",
    items: [{ productName: "KCC Milk 500ml", sku: "DAI-001", quantity: 3, unitPrice: 70, total: 210 }],
    totalValue: 210, reason: "expired", reasonNote: "Past sell-by date", condition: "destroyed", refundMethod: "cash",
    refundAmount: 210, status: "completed", approvedBy: "Grace Njeri", processedDate: "2026-03-25", createdDate: "2026-03-24",
  },
  {
    id: "ret3", returnNo: "RET-003", type: "customer", originalReceipt: "RCP19950", customerName: "Mama Fatuma", customerPhone: "0711 333 001",
    items: [{ productName: "Omo Washing Powder 1kg", sku: "SOP-001", quantity: 1, unitPrice: 300, total: 300 }],
    totalValue: 300, reason: "changed_mind", reasonNote: "Bought wrong brand", condition: "sellable", refundMethod: "credit",
    refundAmount: 300, status: "pending", approvedBy: "", processedDate: "", createdDate: "2026-03-27",
  },
  {
    id: "ret4", returnNo: "RET-004", type: "supplier", originalReceipt: "PO002", customerName: "CCBA Kenya", customerPhone: "0711 300 400",
    items: [{ productName: "Coca-Cola 500ml x12", sku: "BEV-001", quantity: 2, unitPrice: 540, total: 1080 }],
    totalValue: 1080, reason: "damaged_transit", reasonNote: "Bottles cracked during delivery", condition: "damaged", refundMethod: "credit",
    refundAmount: 1080, status: "processing", approvedBy: "", processedDate: "", createdDate: "2026-03-27",
  },
  {
    id: "ret5", returnNo: "RET-005", type: "internal", originalReceipt: "", customerName: "Stock Check", customerPhone: "",
    items: [{ productName: "KCC Milk 500ml", sku: "DAI-001", quantity: 5, unitPrice: 70, total: 350 }],
    totalValue: 350, reason: "breakage", reasonNote: "Dropped during stocking", condition: "destroyed", refundMethod: "cash",
    refundAmount: 0, status: "completed", approvedBy: "Grace Njeri", processedDate: "2026-03-23", createdDate: "2026-03-23",
  },
  {
    id: "ret6", returnNo: "RET-006", type: "customer", originalReceipt: "RCP19920", customerName: "Peter Njoroge", customerPhone: "0722 333 001",
    items: [{ productName: "Glucose Biscuits 200g", sku: "SNK-003", quantity: 2, unitPrice: 60, total: 120 }],
    totalValue: 120, reason: "quality", reasonNote: "Tasted stale", condition: "sellable", refundMethod: "exchange",
    refundAmount: 120, status: "rejected", approvedBy: "Grace Njeri", processedDate: "2026-03-22", createdDate: "2026-03-21",
  },
];

export const sampleDamageLogs: DamageLog[] = [
  { id: "dmg1", productName: "KCC Milk 500ml", sku: "DAI-001", quantity: 5, value: 350, category: "expiry", location: "Fridge", employee: "John Mutua", date: "2026-03-23", disposalMethod: "destruction", notes: "Expired stock" },
  { id: "dmg2", productName: "Ndizi Banana Bundle", sku: "DAI-004", quantity: 2, value: 600, category: "breakage", location: "Display", employee: "Peter Ochieng", date: "2026-03-25", disposalMethod: "donation", notes: "Overripe" },
  { id: "dmg3", productName: "Coca-Cola 500ml x12", sku: "BEV-001", quantity: 1, value: 540, category: "breakage", location: "Storage", employee: "John Mutua", date: "2026-03-20", disposalMethod: "recycling", notes: "Bottles cracked" },
];

export const returnReasonsBreakdown = [
  { name: "Defective", value: 35, color: "#DC2626" },
  { name: "Expired", value: 25, color: "#E85D04" },
  { name: "Changed Mind", value: 20, color: "#D4A574" },
  { name: "Wrong Item", value: 10, color: "#C75B39" },
  { name: "Quality", value: 7, color: "#2D5A3D" },
  { name: "Other", value: 3, color: "#9a958a" },
];

export function getTodayReturns(returns: ReturnRequest[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return returns.filter((r) => r.createdDate === today && r.type === "customer").reduce((s, r) => s + r.totalValue, 0);
}

export function getReturnRate(returns: ReturnRequest[]): number {
  const completed = returns.filter((r) => r.status === "completed" && r.type === "customer");
  return completed.length > 0 ? Math.round((completed.length / 50) * 100) : 3;
}

export function getPendingCount(returns: ReturnRequest[]): number {
  return returns.filter((r) => r.status === "pending").length;
}
