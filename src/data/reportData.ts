export type ReportCategory = "sales" | "inventory" | "financial" | "customers" | "operations";
export type DateRange = "today" | "yesterday" | "week" | "last_week" | "month" | "last_month" | "quarter" | "ytd" | "custom";
export type PaymentMethod = "mpesa" | "cash" | "credit" | "bank";

export interface DailySales {
  date: string;
  revenue: number;
  transactions: number;
  mpesa: number;
  cash: number;
  credit: number;
}

export interface HourlyData {
  hour: string;
  sales: number;
  transactions: number;
}

export interface ProductPerformance {
  name: string;
  revenue: number;
  margin: number;
  quantity: number;
  category: string;
}

export interface CategoryBreakdown {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface PLLineItem {
  label: string;
  labelSw: string;
  amount: number;
  isSubtotal: boolean;
  isBold: boolean;
}

export interface ABCItem {
  name: string;
  sku: string;
  revenue: number;
  percentage: number;
  cumulative: number;
  class: "A" | "B" | "C";
  daysSinceLastSale: number;
}

export interface CustomerCohort {
  month: string;
  customers: number;
  retained1: number;
  retained2: number;
  retained3: number;
  retained6: number;
}

export interface MetricCard {
  label: string;
  labelSw: string;
  value: string;
  change: number;
  changeLabel: string;
  color: string;
}

// 6 months of daily sales data
const monthKeys = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];

function genDailySales(): DailySales[] {
  const data: DailySales[] = [];
  for (let m = 0; m < 6; m++) {
    const daysInMonth = [31, 30, 31, 31, 28, 27][m];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(parseInt(monthKeys[m].slice(0, 4)), parseInt(monthKeys[m].slice(5)) - 1, d);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isHoliday = m === 2 && d >= 20;
      const seasonalFactor = m === 2 ? 1.5 : m === 0 ? 1.2 : m === 3 ? 0.8 : 1.0;
      const baseRevenue = 18000 + Math.random() * 15000;
      const revenue = Math.round(baseRevenue * seasonalFactor * (isWeekend ? 1.3 : 1.0) * (isHoliday ? 0.3 : 1.0));
      const mpesa = Math.round(revenue * (0.55 + Math.random() * 0.15));
      const cash = Math.round(revenue * (0.2 + Math.random() * 0.1));
      const credit = revenue - mpesa - cash;
      data.push({ date: date.toISOString().slice(0, 10), revenue, transactions: Math.round(25 + Math.random() * 30), mpesa, cash, credit: Math.max(0, credit) });
    }
  }
  return data;
}

export const dailySalesData: DailySales[] = genDailySales();

export const hourlySalesData: HourlyData[] = [
  { hour: "7AM", sales: 2400, transactions: 8 }, { hour: "8AM", sales: 4200, transactions: 14 },
  { hour: "9AM", sales: 5800, transactions: 18 }, { hour: "10AM", sales: 7200, transactions: 22 },
  { hour: "11AM", sales: 6500, transactions: 20 }, { hour: "12PM", sales: 8100, transactions: 25 },
  { hour: "1PM", sales: 5400, transactions: 16 }, { hour: "2PM", sales: 4800, transactions: 15 },
  { hour: "3PM", sales: 6200, transactions: 19 }, { hour: "4PM", sales: 7800, transactions: 24 },
  { hour: "5PM", sales: 9200, transactions: 28 }, { hour: "6PM", sales: 8500, transactions: 26 },
  { hour: "7PM", sales: 4100, transactions: 12 }, { hour: "8PM", sales: 2200, transactions: 7 },
];

export const productPerformance: ProductPerformance[] = [
  { name: "Pembe Maize Flour 2kg", revenue: 67500, margin: 20, quantity: 450, category: "Cereals" },
  { name: "Elianto Cooking Oil 1L", revenue: 59400, margin: 15, quantity: 180, category: "Cooking Oil" },
  { name: "Coca-Cola 500ml x12", revenue: 54000, margin: 22, quantity: 100, category: "Beverages" },
  { name: "Omo Washing Powder 1kg", revenue: 42000, margin: 17, quantity: 140, category: "Soap" },
  { name: "KCC Milk 500ml", revenue: 38500, margin: 21, quantity: 550, category: "Dairy" },
  { name: "Ketepa Tea 250g", revenue: 36000, margin: 20, quantity: 180, category: "Beverages" },
  { name: "Soko Ugali 2kg", revenue: 33600, margin: 21, quantity: 240, category: "Cereals" },
  { name: "Dettol Soap x4", revenue: 30800, margin: 18, quantity: 140, category: "Soap" },
  { name: "Blueband Margarine 500g", revenue: 29700, margin: 19, quantity: 110, category: "Dairy" },
  { name: "Safaricom Airtime KSh 100", revenue: 25000, margin: 2, quantity: 250, category: "Emergency" },
  { name: "Ndizi Banana Bundle", revenue: 22500, margin: 33, quantity: 75, category: "Dairy" },
  { name: "Glucose Biscuits 200g", revenue: 18000, margin: 25, quantity: 300, category: "Snacks" },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { name: "Cereals", revenue: 128000, percentage: 28, color: "#D4A574" },
  { name: "Cooking Oil", revenue: 89000, percentage: 19, color: "#E85D04" },
  { name: "Beverages", revenue: 75000, percentage: 16, color: "#C75B39" },
  { name: "Soap", revenue: 62000, percentage: 13, color: "#2D5A3D" },
  { name: "Dairy", revenue: 52000, percentage: 11, color: "#56524b" },
  { name: "Snacks", revenue: 28000, percentage: 6, color: "#9a958a" },
  { name: "Emergency", revenue: 25000, percentage: 5, color: "#DC2626" },
  { name: "Other", revenue: 11000, percentage: 2, color: "#b8b4ab" },
];

export const monthlySummary = [
  { month: "Oct", revenue: 420000, expenses: 310000, profit: 110000, transactions: 1240 },
  { month: "Nov", revenue: 450000, expenses: 335000, profit: 115000, transactions: 1320 },
  { month: "Dec", revenue: 580000, expenses: 420000, profit: 160000, transactions: 1680 },
  { month: "Jan", revenue: 340000, expenses: 285000, profit: 55000, transactions: 980 },
  { month: "Feb", revenue: 380000, expenses: 305000, profit: 75000, transactions: 1120 },
  { month: "Mar", revenue: 480000, expenses: 350000, profit: 130000, transactions: 1450 },
];

export const profitAndLoss: PLLineItem[] = [
  { label: "Revenue", labelSw: "Mapato", amount: 2650000, isSubtotal: false, isBold: true },
  { label: "Cost of Goods Sold", labelSw: "Gharama ya Bidhaa", amount: 1855000, isSubtotal: false, isBold: false },
  { label: "Gross Profit", labelSw: "Faida Ghafi", amount: 795000, isSubtotal: true, isBold: true },
  { label: "Rent", labelSw: "Kodi", amount: 72000, isSubtotal: false, isBold: false },
  { label: "Salaries", labelSw: "Mishahara", amount: 90000, isSubtotal: false, isBold: false },
  { label: "Utilities (Electricity/Water)", labelSw: "Umeme na Maji", amount: 18000, isSubtotal: false, isBold: false },
  { label: "Transport", labelSw: "Usafiri", amount: 28000, isSubtotal: false, isBold: false },
  { label: "Marketing", labelSw: "Uuzaji", amount: 8000, isSubtotal: false, isBold: false },
  { label: "Repairs & Maintenance", labelSw: "Matengenezo", amount: 12000, isSubtotal: false, isBold: false },
  { label: "Licenses & Fees", labelSw: "Leseni", amount: 10000, isSubtotal: false, isBold: false },
  { label: "Other Expenses", labelSw: "Gharama Nyingine", amount: 15000, isSubtotal: false, isBold: false },
  { label: "Total Operating Expenses", labelSw: "Jumla ya Gharama", amount: 253000, isSubtotal: true, isBold: false },
  { label: "Net Profit Before Tax", labelSw: "Faida Kabla ya Kodi", amount: 542000, isSubtotal: true, isBold: true },
  { label: "Tax Provision (KRA)", labelSw: "Kodi ya KRA", amount: 135500, isSubtotal: false, isBold: false },
  { label: "Net Profit After Tax", labelSw: "Faida Baada ya Kodi", amount: 406500, isSubtotal: true, isBold: true },
];

export const abcAnalysis: ABCItem[] = [
  { name: "Pembe Maize Flour 2kg", sku: "CER-001", revenue: 67500, percentage: 14.8, cumulative: 14.8, class: "A", daysSinceLastSale: 0 },
  { name: "Elianto Cooking Oil 1L", sku: "OIL-001", revenue: 59400, percentage: 13.0, cumulative: 27.8, class: "A", daysSinceLastSale: 1 },
  { name: "Coca-Cola 500ml x12", sku: "BEV-001", revenue: 54000, percentage: 11.8, cumulative: 39.6, class: "A", daysSinceLastSale: 0 },
  { name: "Omo Washing Powder 1kg", sku: "SOP-001", revenue: 42000, percentage: 9.2, cumulative: 48.8, class: "A", daysSinceLastSale: 1 },
  { name: "KCC Milk 500ml", sku: "DAI-001", revenue: 38500, percentage: 8.4, cumulative: 57.2, class: "A", daysSinceLastSale: 0 },
  { name: "Ketepa Tea 250g", sku: "BEV-002", revenue: 36000, percentage: 7.9, cumulative: 65.1, class: "A", daysSinceLastSale: 2 },
  { name: "Soko Ugali 2kg", sku: "CER-002", revenue: 33600, percentage: 7.4, cumulative: 72.5, class: "A", daysSinceLastSale: 0 },
  { name: "Dettol Soap x4", sku: "SOP-002", revenue: 30800, percentage: 6.7, cumulative: 79.2, class: "B", daysSinceLastSale: 3 },
  { name: "Blueband Margarine 500g", sku: "DAI-002", revenue: 29700, percentage: 6.5, cumulative: 85.7, class: "B", daysSinceLastSale: 2 },
  { name: "Safaricom Airtime", sku: "EMG-001", revenue: 25000, percentage: 5.5, cumulative: 91.2, class: "B", daysSinceLastSale: 0 },
  { name: "Ndizi Banana Bundle", sku: "DAI-004", revenue: 22500, percentage: 4.9, cumulative: 96.1, class: "C", daysSinceLastSale: 1 },
  { name: "Glucose Biscuits", sku: "SNK-003", revenue: 18000, percentage: 3.9, cumulative: 100.0, class: "C", daysSinceLastSale: 4 },
];

export const customerCohorts: CustomerCohort[] = [
  { month: "Oct", customers: 45, retained1: 82, retained2: 71, retained3: 65, retained6: 58 },
  { month: "Nov", customers: 38, retained1: 85, retained2: 74, retained3: 68, retained6: 0 },
  { month: "Dec", customers: 62, retained1: 78, retained2: 68, retained3: 0, retained6: 0 },
  { month: "Jan", customers: 28, retained1: 88, retained2: 76, retained3: 0, retained6: 0 },
  { month: "Feb", customers: 35, retained1: 86, retained2: 0, retained3: 0, retained6: 0 },
  { month: "Mar", customers: 42, retained1: 0, retained2: 0, retained3: 0, retained6: 0 },
];

export const customerLTV = [
  { range: "0-1K", count: 35, percentage: 28 },
  { range: "1K-5K", count: 42, percentage: 34 },
  { range: "5K-10K", count: 25, percentage: 20 },
  { range: "10K-50K", count: 15, percentage: 12 },
  { range: "50K+", count: 8, percentage: 6 },
];

export const employeeProductivity = [
  { name: "Grace Njeri", role: "Manager", sales: 185000, transactions: 142, avgTicket: 1303, attendance: 98 },
  { name: "Peter Ochieng", role: "Sales", sales: 142000, transactions: 118, avgTicket: 1203, attendance: 92 },
  { name: "Faith Wambui", role: "Cashier", sales: 128000, transactions: 156, avgTicket: 820, attendance: 95 },
  { name: "John Mutua", role: "Stock", sales: 0, transactions: 0, avgTicket: 0, attendance: 90 },
];

export const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const keyMetrics: MetricCard[] = [
  { label: "Total Revenue", labelSw: "Jumla ya Mapato", value: "KSh 2,650,000", change: 12.5, changeLabel: "vs last period", color: "terracotta" },
  { label: "Gross Margin", labelSw: "Uwiano wa Faida", value: "30.0%", change: 2.1, changeLabel: "vs last period", color: "forest" },
  { label: "Transactions", labelSw: "Miamala", value: "7,790", change: 8.3, changeLabel: "vs last period", color: "savanna" },
  { label: "Avg Basket", labelSw: "Wastani wa Ununuzi", value: "KSh 340", change: -1.2, changeLabel: "vs last period", color: "sunset" },
];

export function getDateRangeLabel(range: DateRange): string {
  const labels: Record<DateRange, string> = {
    today: "Today", yesterday: "Yesterday", week: "This Week", last_week: "Last Week",
    month: "This Month", last_month: "Last Month", quarter: "This Quarter",
    ytd: "Year to Date", custom: "Custom Range",
  };
  return labels[range];
}

export function filterByDateRange(data: DailySales[], range: DateRange): DailySales[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  switch (range) {
    case "today": return data.filter((d) => d.date === today);
    case "yesterday": { const y = new Date(now); y.setDate(y.getDate() - 1); return data.filter((d) => d.date === y.toISOString().slice(0, 10)); }
    case "week": { const w = new Date(now); w.setDate(w.getDate() - 7); return data.filter((d) => d.date >= w.toISOString().slice(0, 10)); }
    case "last_week": { const lw = new Date(now); lw.setDate(lw.getDate() - 14); const lw2 = new Date(now); lw2.setDate(lw2.getDate() - 7); return data.filter((d) => d.date >= lw.toISOString().slice(0, 10) && d.date < lw2.toISOString().slice(0, 10)); }
    case "month": { const m = new Date(now); m.setMonth(m.getMonth() - 1); return data.filter((d) => d.date >= m.toISOString().slice(0, 10)); }
    case "last_month": { const lm = new Date(now); lm.setMonth(lm.getMonth() - 2); const lm2 = new Date(now); lm2.setMonth(lm2.getMonth() - 1); return data.filter((d) => d.date >= lm.toISOString().slice(0, 10) && d.date < lm2.toISOString().slice(0, 10)); }
    case "quarter": { const q = new Date(now); q.setMonth(q.getMonth() - 3); return data.filter((d) => d.date >= q.toISOString().slice(0, 10)); }
    case "ytd": return data.filter((d) => d.date >= "2026-01-01");
    default: return data;
  }
}
