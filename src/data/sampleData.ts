import type { Locale } from "@/types";

export interface Product {
  id: string;
  name: string;
  nameSw: string;
  category: string;
  categorySw: string;
  quantity: number;
  minStock: number;
  buyingPrice: number;
  sellingPrice: number;
  supplier: string;
  lastRestocked: string;
}

export interface Transaction {
  id: string;
  customer: string;
  items: number;
  amount: number;
  method: "mpesa" | "cash" | "credit";
  status: "completed" | "pending" | "failed";
  date: string;
  time: string;
}

export interface SupplierOrder {
  id: string;
  supplier: string;
  items: string[];
  total: number;
  status: "pending" | "in_transit" | "delivered";
  expectedDate: string;
}

export interface Notification {
  id: string;
  type: "stock" | "sale" | "payment" | "system";
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  read: boolean;
  time: string;
}

export const KENYAN_CATEGORIES = [
  { value: "cereals", label: "Cereals (Nafaka)", labelSw: "Nafaka" },
  { value: "cooking_oil", label: "Cooking Oil (Mafuta)", labelSw: "Mafuta ya Kupikia" },
  { value: "soap", label: "Soap & Detergents", labelSw: "Sabuni na Detergenti" },
  { value: "beverages", label: "Beverages (Vinywaji)", labelSw: "Vinywaji" },
  { value: "snacks", label: "Snacks (Vitafunio)", labelSw: "Vitafunio" },
  { value: "household", label: "Household Items", labelSw: "Vit vya Nyumbani" },
  { value: "farming", label: "Farming Inputs", labelSw: "Bidhaa za Kilimo" },
  { value: "emergency", label: "Emergency Supplies", labelSw: "Bidhaa za Dharura" },
  { value: "dairy", label: "Dairy & Fresh", labelSw: "Maziwa na Bidhaa Mpya" },
  { value: "personal", label: "Personal Care", labelSw: "Utunzaji wa Mwili" },
] as const;

export const sampleProducts: Product[] = [
  { id: "1", name: "Pembe Maize Flour 2kg", nameSw: "Pembe Unga wa Mahindi 2kg", category: "cereals", categorySw: "Nafaka", quantity: 45, minStock: 20, buyingPrice: 120, sellingPrice: 150, supplier: "Bidco Africa", lastRestocked: "2026-03-20" },
  { id: "2", name: "Elianto Cooking Oil 1L", nameSw: "Mafuta ya Elianto 1L", category: "cooking_oil", categorySw: "Mafuta ya Kupikia", quantity: 8, minStock: 15, buyingPrice: 280, sellingPrice: 330, supplier: "Bidco Africa", lastRestocked: "2026-03-18" },
  { id: "3", name: "Omo Washing Powder 1kg", nameSw: "Omo Powder ya Kufua 1kg", category: "soap", categorySw: "Sabuni", quantity: 32, minStock: 10, buyingPrice: 250, sellingPrice: 300, supplier: "Unilever Kenya", lastRestocked: "2026-03-22" },
  { id: "4", name: "Coca-Cola 500ml x12", nameSw: "Coca-Cola 500ml x12", category: "beverages", categorySw: "Vinywaji", quantity: 5, minStock: 10, buyingPrice: 420, sellingPrice: 540, supplier: "CCBA Kenya", lastRestocked: "2026-03-15" },
  { id: "5", name: "Ketepa Tea 250g", nameSw: "Ketepa Chai 250g", category: "beverages", categorySw: "Vinywaji", quantity: 18, minStock: 8, buyingPrice: 160, sellingPrice: 200, supplier: "KETEPA Ltd", lastRestocked: "2026-03-19" },
  { id: "6", name: "Soko Ugali 2kg", nameSw: "Soko Ugali 2kg", category: "cereals", categorySw: "Nafaka", quantity: 60, minStock: 25, buyingPrice: 110, sellingPrice: 140, supplier: "Unga Group", lastRestocked: "2026-03-21" },
  { id: "7", name: "Blueband Margarine 500g", nameSw: "Blueband 500g", category: "dairy", categorySw: "Maziwa", quantity: 12, minStock: 10, buyingPrice: 220, sellingPrice: 270, supplier: "Bidco Africa", lastRestocked: "2026-03-17" },
  { id: "8", name: "Dettol Soap x4", nameSw: "Sabuni ya Dettol x4", category: "soap", categorySw: "Sabuni", quantity: 25, minStock: 12, buyingPrice: 180, sellingPrice: 220, supplier: "Reckitt Kenya", lastRestocked: "2026-03-20" },
  { id: "9", name: "Safaricom Airtime KSh 100", nameSw: "Airtime ya Safaricom KSh 100", category: "emergency", categorySw: "Dharura", quantity: 100, minStock: 50, buyingPrice: 98, sellingPrice: 100, supplier: "Safaricom", lastRestocked: "2026-03-25" },
  { id: "10", name: "KCC Milk 500ml", nameSw: "Maziwa ya KCC 500ml", category: "dairy", categorySw: "Maziwa", quantity: 3, minStock: 20, buyingPrice: 55, sellingPrice: 70, supplier: "KCC", lastRestocked: "2026-03-25" },
];

export const sampleTransactions: Transaction[] = [
  { id: "TXN001", customer: "Wanjiku M.", items: 4, amount: 680, method: "mpesa", status: "completed", date: "2026-03-27", time: "14:32" },
  { id: "TXN002", customer: "Odhiambo J.", items: 2, amount: 320, method: "cash", status: "completed", date: "2026-03-27", time: "14:15" },
  { id: "TXN003", customer: "Mutua P.", items: 7, amount: 1450, method: "mpesa", status: "completed", date: "2026-03-27", time: "13:48" },
  { id: "TXN004", customer: "Akinyi R.", items: 1, amount: 150, method: "credit", status: "pending", date: "2026-03-27", time: "13:20" },
  { id: "TXN005", customer: "Kamau D.", items: 3, amount: 540, method: "mpesa", status: "completed", date: "2026-03-27", time: "12:55" },
  { id: "TXN006", customer: "Nekesa S.", items: 5, amount: 890, method: "cash", status: "completed", date: "2026-03-27", time: "12:30" },
  { id: "TXN007", customer: "Hassan A.", items: 2, amount: 400, method: "mpesa", status: "failed", date: "2026-03-27", time: "11:45" },
  { id: "TXN008", customer: "Wambui K.", items: 6, amount: 1120, method: "mpesa", status: "completed", date: "2026-03-27", time: "11:20" },
  { id: "TXN009", customer: "Otieno B.", items: 3, amount: 510, method: "cash", status: "completed", date: "2026-03-27", time: "10:50" },
  { id: "TXN010", customer: "Muthoni L.", items: 4, amount: 720, method: "mpesa", status: "completed", date: "2026-03-27", time: "10:15" },
];

export const sampleSupplierOrders: SupplierOrder[] = [
  { id: "PO001", supplier: "Bidco Africa", items: ["Cooking Oil", "Blueband"], total: 15600, status: "in_transit", expectedDate: "2026-03-29" },
  { id: "PO002", supplier: "CCBA Kenya", items: ["Coca-Cola 500ml x24"], total: 8400, status: "pending", expectedDate: "2026-03-30" },
  { id: "PO003", supplier: "KCC", items: ["Milk 500ml x48", "Yogurt x24"], total: 4200, status: "pending", expectedDate: "2026-03-31" },
];

export const sampleNotifications: Notification[] = [
  { id: "n1", type: "stock", title: { en: "Low Stock Alert", sw: "Onyo la Hesabu Ndogo" }, message: { en: "KCC Milk 500ml is running low (3 remaining)", sw: "Maziwa ya KCC 500ml yamepungua (3 yamebaki)" }, read: false, time: "5 min ago" },
  { id: "n2", type: "sale", title: { en: "Sale Completed", sw: "Mauzo Yamekamilika" }, message: { en: "M-Pesa payment of KSh 1,450 received from Mutua P.", sw: "Malipo ya M-Pesa ya KSh 1,450 yamepokelewa kutoka Mutua P." }, read: false, time: "12 min ago" },
  { id: "n3", type: "stock", title: { en: "Low Stock Alert", sw: "Onyo la Hesabu Ndogo" }, message: { en: "Coca-Cola 500ml is running low (5 remaining)", sw: "Coca-Cola 500ml imepungua (5 imebaki)" }, read: false, time: "25 min ago" },
  { id: "n4", type: "payment", title: { en: "M-Pesa Failed", sw: "M-Pesa Imeshindwa" }, message: { en: "Payment of KSh 400 from Hassan A. failed to process", sw: "Malipo ya KSh 400 kutoka Hassan A. yameshindwa" }, read: true, time: "1 hr ago" },
  { id: "n5", type: "system", title: { en: "Daily Summary", sw: "Muhtasari wa Kila Siku" }, message: { en: "Yesterday: 42 sales, KSh 28,500 revenue", sw: "Jana: mauzo 42, mapato KSh 28,500" }, read: true, time: "8 hrs ago" },
];

export const salesChartData = {
  daily: [
    { name: "Mon", mpesa: 12500, cash: 8200, credit: 1500 },
    { name: "Tue", mpesa: 15200, cash: 9100, credit: 2200 },
    { name: "Wed", mpesa: 11800, cash: 7500, credit: 1800 },
    { name: "Thu", mpesa: 18500, cash: 10200, credit: 2800 },
    { name: "Fri", mpesa: 22100, cash: 12800, credit: 3200 },
    { name: "Sat", mpesa: 25600, cash: 15400, credit: 2100 },
    { name: "Sun", mpesa: 14200, cash: 8800, credit: 1200 },
  ],
  weekly: [
    { name: "Wk 1", mpesa: 85000, cash: 52000, credit: 12000 },
    { name: "Wk 2", mpesa: 92000, cash: 58000, credit: 15000 },
    { name: "Wk 3", mpesa: 78000, cash: 48000, credit: 10000 },
    { name: "Wk 4", mpesa: 98000, cash: 62000, credit: 18000 },
  ],
  monthly: [
    { name: "Oct", mpesa: 320000, cash: 195000, credit: 45000 },
    { name: "Nov", mpesa: 345000, cash: 210000, credit: 52000 },
    { name: "Dec", mpesa: 420000, cash: 280000, credit: 65000 },
    { name: "Jan", mpesa: 310000, cash: 185000, credit: 38000 },
    { name: "Feb", mpesa: 355000, cash: 215000, credit: 48000 },
    { name: "Mar", mpesa: 380000, cash: 230000, credit: 55000 },
  ],
};
