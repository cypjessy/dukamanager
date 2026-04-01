import { inventoryProducts } from "./inventoryData";

export type PaymentMethod = "mpesa" | "cash" | "credit" | "bank";
export type TransactionStatus = "completed" | "pending" | "voided" | "refunded";

export interface CartItem {
  productId: string;
  name: string;
  nameSw: string;
  price: number;
  quantity: number;
  maxQty: number;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  customer: string;
  customerPhone?: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  cashTendered?: number;
  changeDue?: number;
  mpesaRef?: string;
  bankRef?: string;
  creditRef?: string;
  status: TransactionStatus;
  cashier: string;
  date: string;
  time: string;
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  outstanding: number;
  daysSincePayment: number;
  risk: "low" | "medium" | "high";
  transactions: { date: string; amount: number; type: "credit" | "payment" }[];
}

export interface HourlyData {
  hour: string;
  sales: number;
  transactions: number;
}

export interface DayOfWeekData {
  day: string;
  sales: number;
  transactions: number;
}

const customerNames = [
  "Wanjiku M.", "Odhiambo J.", "Mutua P.", "Akinyi R.", "Kamau D.",
  "Nekesa S.", "Hassan A.", "Wambui K.", "Otieno B.", "Muthoni L.",
  "Kipchoge N.", "Nyambura G.", "Barasa T.", "Chebet F.", "Amina H.",
  "Njoroge C.", "Adhiambo E.", "Kimani J.", "Wekesa R.", "Nafula B.",
];

const productPool = inventoryProducts.slice(0, 25).map((p) => ({
  id: p.id,
  name: p.name,
  nameSw: p.nameSw,
  price: p.sellingPrice,
}));

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransaction(idx: number, dayOffset: number = 0): Transaction {
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const items: Transaction["items"] = [];
  let subtotal = 0;
  const usedProducts = new Set<string>();

  for (let i = 0; i < itemCount; i++) {
    let product: (typeof productPool)[0];
    do {
      product = randomFrom(productPool);
    } while (usedProducts.has(product.id));
    usedProducts.add(product.id);

    const qty = Math.floor(Math.random() * 3) + 1;
    items.push({ productId: product.id, name: product.name, qty, price: product.price });
    subtotal += qty * product.price;
  }

  const discount = Math.random() > 0.8 ? Math.round(subtotal * 0.05) : 0;
  const vat = 0;
  const total = subtotal - discount + vat;
  const methods: PaymentMethod[] = ["mpesa", "mpesa", "mpesa", "cash", "cash", "credit", "bank"];
  const method = randomFrom(methods);
  const cashTendered = method === "cash" ? Math.ceil(total / 50) * 50 + (Math.random() > 0.5 ? 50 : 0) : undefined;

  const now = new Date();
  now.setDate(now.getDate() - dayOffset);
  const hour = 7 + Math.floor(Math.random() * 13);
  const min = Math.floor(Math.random() * 60);
  now.setHours(hour, min, 0);

  return {
    id: `TXN${String(1000 + idx).padStart(4, "0")}`,
    receiptNo: `RCP${String(2000 + idx).padStart(5, "0")}`,
    customer: Math.random() > 0.3 ? randomFrom(customerNames) : "Walk-in Customer",
    customerPhone: Math.random() > 0.4 ? `07${Math.floor(Math.random() * 90000000) + 10000000}` : undefined,
    items,
    subtotal,
    vat,
    discount,
    total,
    method,
    cashTendered,
    changeDue: cashTendered ? cashTendered - total : undefined,
    mpesaRef: method === "mpesa" ? `RJK${Math.floor(Math.random() * 900000) + 100000}` : undefined,
    bankRef: method === "bank" ? `BNK${Math.floor(Math.random() * 900000) + 100000}` : undefined,
    creditRef: method === "credit" ? `CRD${Math.floor(Math.random() * 900000) + 100000}` : undefined,
    status: Math.random() > 0.03 ? "completed" : randomFrom(["pending", "voided"]),
    cashier: "Mama Njeri",
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  };
}

export const sampleTransactions: Transaction[] = Array.from({ length: 60 }, (_, i) =>
  generateTransaction(i, Math.floor(i / 10))
).sort((a, b) => b.time.localeCompare(a.time) || b.date.localeCompare(a.date));

export const creditCustomers: CreditCustomer[] = [
  { id: "cc1", name: "Mama Atieno", phone: "0722 111 222", creditLimit: 5000, outstanding: 3200, daysSincePayment: 3, risk: "low", transactions: [
    { date: "2026-03-25", amount: 1500, type: "credit" }, { date: "2026-03-24", amount: 1200, type: "credit" }, { date: "2026-03-23", amount: 500, type: "credit" },
    { date: "2026-03-20", amount: 2000, type: "payment" }, { date: "2026-03-18", amount: 800, type: "credit" },
  ]},
  { id: "cc2", name: "Baba Karanja", phone: "0733 222 333", creditLimit: 3000, outstanding: 2800, daysSincePayment: 12, risk: "high", transactions: [
    { date: "2026-03-26", amount: 1000, type: "credit" }, { date: "2026-03-22", amount: 800, type: "credit" }, { date: "2026-03-15", amount: 1000, type: "credit" },
  ]},
  { id: "cc3", name: "Mama Fatuma", phone: "0711 333 444", creditLimit: 8000, outstanding: 4500, daysSincePayment: 5, risk: "medium", transactions: [
    { date: "2026-03-24", amount: 2000, type: "credit" }, { date: "2026-03-22", amount: 1500, type: "credit" }, { date: "2026-03-19", amount: 1000, type: "credit" },
    { date: "2026-03-17", amount: 3000, type: "payment" },
  ]},
  { id: "cc4", name: "Mwalimu Omondi", phone: "0720 444 555", creditLimit: 2000, outstanding: 500, daysSincePayment: 1, risk: "low", transactions: [
    { date: "2026-03-26", amount: 500, type: "credit" }, { date: "2026-03-25", amount: 1500, type: "payment" },
  ]},
  { id: "cc5", name: "Sister Mary", phone: "0734 555 666", creditLimit: 10000, outstanding: 7200, daysSincePayment: 8, risk: "medium", transactions: [
    { date: "2026-03-25", amount: 3000, type: "credit" }, { date: "2026-03-22", amount: 2200, type: "credit" }, { date: "2026-03-19", amount: 2000, type: "credit" },
    { date: "2026-03-15", amount: 5000, type: "payment" },
  ]},
];

export const hourlySalesData: HourlyData[] = [
  { hour: "7AM", sales: 2400, transactions: 8 },
  { hour: "8AM", sales: 4200, transactions: 14 },
  { hour: "9AM", sales: 5800, transactions: 18 },
  { hour: "10AM", sales: 7200, transactions: 22 },
  { hour: "11AM", sales: 6500, transactions: 20 },
  { hour: "12PM", sales: 8100, transactions: 25 },
  { hour: "1PM", sales: 5400, transactions: 16 },
  { hour: "2PM", sales: 4800, transactions: 15 },
  { hour: "3PM", sales: 6200, transactions: 19 },
  { hour: "4PM", sales: 7800, transactions: 24 },
  { hour: "5PM", sales: 9200, transactions: 28 },
  { hour: "6PM", sales: 8500, transactions: 26 },
  { hour: "7PM", sales: 4100, transactions: 12 },
  { hour: "8PM", sales: 2200, transactions: 7 },
];

export const dayOfWeekSales: DayOfWeekData[] = [
  { day: "Mon", sales: 22500, transactions: 42 },
  { day: "Tue", sales: 25200, transactions: 48 },
  { day: "Wed", sales: 21800, transactions: 39 },
  { day: "Thu", sales: 28500, transactions: 52 },
  { day: "Fri", sales: 35100, transactions: 65 },
  { day: "Sat", sales: 42600, transactions: 78 },
  { day: "Sun", sales: 18200, transactions: 35 },
];

export const monthlySalesData = [
  { month: "Oct", sales: 320000, lastYear: 290000 },
  { month: "Nov", sales: 345000, lastYear: 310000 },
  { month: "Dec", sales: 420000, lastYear: 380000 },
  { month: "Jan", sales: 310000, lastYear: 280000 },
  { month: "Feb", sales: 355000, lastYear: 320000 },
  { month: "Mar", sales: 380000, lastYear: 340000 },
];

export function getTodayTotal(transactions: Transaction[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return transactions
    .filter((t) => t.date === today && t.status === "completed")
    .reduce((sum, t) => sum + t.total, 0);
}

export function getTransactionCount(transactions: Transaction[], dateRange: string): number {
  return filterByDateRange(transactions, dateRange).filter((t) => t.status === "completed").length;
}

export function getAverageBasket(transactions: Transaction[], dateRange: string): number {
  const filtered = filterByDateRange(transactions, dateRange).filter((t) => t.status === "completed");
  if (filtered.length === 0) return 0;
  return Math.round(filtered.reduce((sum, t) => sum + t.total, 0) / filtered.length);
}

export function filterByDateRange(transactions: Transaction[], range: string): Transaction[] {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  switch (range) {
    case "today":
      return transactions.filter((t) => t.date === todayStr);
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      return transactions.filter((t) => t.date === yStr);
    }
    case "week": {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      return transactions.filter((t) => t.date >= w.toISOString().slice(0, 10));
    }
    case "month": {
      const m = new Date(today);
      m.setMonth(m.getMonth() - 1);
      return transactions.filter((t) => t.date >= m.toISOString().slice(0, 10));
    }
    default:
      return transactions;
  }
}

export function getAvailableProducts() {
  return inventoryProducts.map((p) => ({
    id: p.id,
    name: p.name,
    nameSw: p.nameSw,
    sku: p.sku,
    price: p.sellingPrice,
    stock: p.quantity,
    category: p.categorySw,
  }));
}
