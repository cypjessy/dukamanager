export type SupplierCategory = "wholesaler" | "distributor" | "manufacturer" | "farmer" | "importer";
export type PaymentTerms = "cod" | "net15" | "net30" | "credit";
export type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  region: string;
  distance: number;
  category: SupplierCategory;
  paymentTerms: PaymentTerms;
  kraPin: string;
  bankName: string;
  bankAccount: string;
  mpesaPaybill: string;
  mpesaTill: string;
  avgDeliveryDays: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  unit: string;
  lastPurchasePrice: number;
  available: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; name: string; qty: number; unitPrice: number }[];
  subtotal: number;
  transportCost: number;
  total: number;
  status: OrderStatus;
  paymentTerms: PaymentTerms;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  notes: string;
}

export interface SupplierPayable {
  id: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  daysOverdue: number;
}

export interface PerformanceMetric {
  supplierId: string;
  onTimeRate: number;
  accuracyRate: number;
  priceStability: number;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
}

export const supplierCategories: { key: SupplierCategory; label: string; labelSw: string }[] = [
  { key: "wholesaler", label: "Wholesalers", labelSw: "Wauzaji Jumla" },
  { key: "distributor", label: "Distributors", labelSw: "Wasambazaji" },
  { key: "manufacturer", label: "Manufacturers", labelSw: "Wazalishaji" },
  { key: "farmer", label: "Local Farmers", labelSw: "Wakulima" },
  { key: "importer", label: "Importers", labelSw: "Waagizaji" },
];

export const paymentTermLabels: Record<PaymentTerms, { label: string; labelSw: string; color: string }> = {
  cod: { label: "Cash on Delivery", labelSw: "Lipa Ukipokea", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400" },
  net15: { label: "Net 15 Days", labelSw: "Siku 15", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400" },
  net30: { label: "Net 30 Days", labelSw: "Siku 30", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400" },
  credit: { label: "Credit Available", labelSw: "Mkopo Unapatikana", color: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400" },
};

export const suppliers: Supplier[] = [
  { id: "s1", name: "Bidco Africa Ltd", contactPerson: "James Mwangi", phone: "0722 100 200", whatsapp: "254722100200", email: "orders@bidcoafrica.com", location: "Ruaraka, Nairobi", region: "Nairobi", distance: 12, category: "manufacturer", paymentTerms: "net30", kraPin: "P051234567A", bankName: "KCB Bank", bankAccount: "1234567890", mpesaPaybill: "222888", mpesaTill: "", avgDeliveryDays: 3, rating: 4.5, isActive: true, createdAt: "2025-01-15" },
  { id: "s2", name: "Unilever Kenya", contactPerson: "Sarah Ochieng", phone: "0733 200 300", whatsapp: "254733200300", email: "supply@unilever.co.ke", location: "Industrial Area, Nairobi", region: "Nairobi", distance: 8, category: "manufacturer", paymentTerms: "net30", kraPin: "P051234568B", bankName: "Standard Chartered", bankAccount: "9876543210", mpesaPaybill: "333999", mpesaTill: "", avgDeliveryDays: 2, rating: 4.7, isActive: true, createdAt: "2025-02-01" },
  { id: "s3", name: "CCBA Kenya", contactPerson: "Peter Njoroge", phone: "0711 300 400", whatsapp: "254711300400", email: "orders@ccba.co.ke", location: "Embakasi, Nairobi", region: "Nairobi", distance: 15, category: "distributor", paymentTerms: "cod", kraPin: "P051234569C", bankName: "Equity Bank", bankAccount: "1122334455", mpesaPaybill: "444111", mpesaTill: "5678901", avgDeliveryDays: 1, rating: 4.3, isActive: true, createdAt: "2025-02-15" },
  { id: "s4", name: "KETEPA Ltd", contactPerson: "Grace Chebet", phone: "0720 400 500", whatsapp: "254720400500", email: "orders@ketepa.co.ke", location: "Kericho", region: "Rift Valley", distance: 280, category: "manufacturer", paymentTerms: "net15", kraPin: "P051234570D", bankName: "KCB Bank", bankAccount: "2233445566", mpesaPaybill: "555222", mpesaTill: "", avgDeliveryDays: 5, rating: 4.1, isActive: true, createdAt: "2025-03-01" },
  { id: "s5", name: "Unga Group Ltd", contactPerson: "Daniel Kimani", phone: "0734 500 600", whatsapp: "254734500600", email: "distribution@ungagroup.com", location: "Nakuru", region: "Rift Valley", distance: 160, category: "manufacturer", paymentTerms: "net15", kraPin: "P051234571E", bankName: "Cooperative Bank", bankAccount: "3344556677", mpesaPaybill: "666333", mpesaTill: "", avgDeliveryDays: 4, rating: 4.4, isActive: true, createdAt: "2025-03-15" },
  { id: "s6", name: "KCC (New KCC)", contactPerson: "Mary Wanjiku", phone: "0712 600 700", whatsapp: "254712600700", email: "orders@newkcc.co.ke", location: "Dairy Road, Nairobi", region: "Nairobi", distance: 10, category: "manufacturer", paymentTerms: "cod", kraPin: "P051234572F", bankName: "Absa Bank", bankAccount: "4455667788", mpesaPaybill: "777444", mpesaTill: "", avgDeliveryDays: 1, rating: 4.6, isActive: true, createdAt: "2025-04-01" },
  { id: "s7", name: "Reckitt Benckiser Kenya", contactPerson: "Ali Hassan", phone: "0723 700 800", whatsapp: "254723700800", email: "supply@reckitt.co.ke", location: "Mombasa Road, Nairobi", region: "Nairobi", distance: 18, category: "distributor", paymentTerms: "net30", kraPin: "P051234573G", bankName: "NCBA Bank", bankAccount: "5566778899", mpesaPaybill: "888555", mpesaTill: "", avgDeliveryDays: 3, rating: 4.2, isActive: true, createdAt: "2025-04-15" },
  { id: "s8", name: "Safaricom Wholesale", contactPerson: "Kevin Otieno", phone: "0700 800 900", whatsapp: "254700800900", email: "wholesale@safaricom.co.ke", location: "Westlands, Nairobi", region: "Nairobi", distance: 6, category: "distributor", paymentTerms: "cod", kraPin: "P051234574H", bankName: "Safaricom M-Pesa", bankAccount: "", mpesaPaybill: "999666", mpesaTill: "1234567", avgDeliveryDays: 0, rating: 4.8, isActive: true, createdAt: "2025-05-01" },
  { id: "s9", name: "Mombasa Millers & Traders", contactPerson: "Fatma Ahmed", phone: "0711 900 100", whatsapp: "254711900100", email: "orders@mombasamillers.co.ke", location: "Mombasa", region: "Coast", distance: 480, category: "wholesaler", paymentTerms: "net15", kraPin: "P051234575I", bankName: "KCB Bank", bankAccount: "6677889900", mpesaPaybill: "111777", mpesaTill: "", avgDeliveryDays: 7, rating: 3.9, isActive: true, createdAt: "2025-05-15" },
  { id: "s10", name: "Limuru Farmers Co-op", contactPerson: "Joseph Kamau", phone: "0722 111 222", whatsapp: "254722111222", email: "info@limuruco-op.ke", location: "Limuru", region: "Central", distance: 35, category: "farmer", paymentTerms: "cod", kraPin: "P051234576J", bankName: "Equity Bank", bankAccount: "7788990011", mpesaPaybill: "222111", mpesaTill: "", avgDeliveryDays: 2, rating: 4.0, isActive: true, createdAt: "2025-06-01" },
  { id: "s11", name: "Eastleigh Wholesale Centre", contactPerson: "Abdirahman Ali", phone: "0733 333 444", whatsapp: "254733333444", email: "orders@eastleighwholesale.com", location: "Eastleigh, Nairobi", region: "Nairobi", distance: 14, category: "wholesaler", paymentTerms: "credit", kraPin: "P051234577K", bankName: "Gulf African Bank", bankAccount: "8899001122", mpesaPaybill: "333222", mpesaTill: "", avgDeliveryDays: 1, rating: 4.1, isActive: true, createdAt: "2025-06-15" },
  { id: "s12", name: "Kisumu Lake Basin Distributors", contactPerson: "Rose Akinyi", phone: "0712 444 555", whatsapp: "254712444555", email: "sales@kisumubasin.co.ke", location: "Kisumu", region: "Nyanza", distance: 350, category: "distributor", paymentTerms: "net30", kraPin: "P051234578L", bankName: "KCB Bank", bankAccount: "9900112233", mpesaPaybill: "444333", mpesaTill: "", avgDeliveryDays: 6, rating: 3.8, isActive: true, createdAt: "2025-07-01" },
  { id: "s13", name: "Gikomba Market Brokers", contactPerson: "Catherine Njeri", phone: "0720 555 666", whatsapp: "254720555666", email: "gikombabroker@gmail.com", location: "Gikomba, Nairobi", region: "Nairobi", distance: 5, category: "wholesaler", paymentTerms: "cod", kraPin: "", bankName: "", bankAccount: "", mpesaPaybill: "", mpesaTill: "7766554", avgDeliveryDays: 0, rating: 3.5, isActive: true, createdAt: "2025-07-15" },
  { id: "s14", name: "Naivasha Fresh Produce", contactPerson: "Samuel Njau", phone: "0734 666 777", whatsapp: "254734666777", email: "fresh@naivashaproduce.co.ke", location: "Naivasha", region: "Rift Valley", distance: 90, category: "farmer", paymentTerms: "cod", kraPin: "P051234580N", bankName: "Cooperative Bank", bankAccount: "0011223344", mpesaPaybill: "555444", mpesaTill: "", avgDeliveryDays: 1, rating: 4.3, isActive: true, createdAt: "2025-08-01" },
  { id: "s15", name: "Dragon Imports (China Town)", contactPerson: "Li Wei", phone: "0711 777 888", whatsapp: "254711777888", email: "orders@dragonimports.co.ke", location: "Luthuli Ave, Nairobi", region: "Nairobi", distance: 3, category: "importer", paymentTerms: "cod", kraPin: "P051234581O", bankName: "Bank of China", bankAccount: "1122334455", mpesaPaybill: "", mpesaTill: "8877665", avgDeliveryDays: 0, rating: 3.7, isActive: true, createdAt: "2025-08-15" },
];

export const supplierProducts: SupplierProduct[] = [
  { id: "sp1", supplierId: "s1", name: "Elianto Cooking Oil 1L", unit: "bottles", lastPurchasePrice: 280, available: true },
  { id: "sp2", supplierId: "s1", name: "Blueband Margarine 500g", unit: "pieces", lastPurchasePrice: 220, available: true },
  { id: "sp3", supplierId: "s1", name: "Golden Fry Oil 2L", unit: "bottles", lastPurchasePrice: 450, available: true },
  { id: "sp4", supplierId: "s2", name: "Omo Washing Powder 1kg", unit: "packs", lastPurchasePrice: 250, available: true },
  { id: "sp5", supplierId: "s2", name: "Sunlight Bar Soap x3", unit: "packs", lastPurchasePrice: 120, available: true },
  { id: "sp6", supplierId: "s2", name: "Colgate Toothpaste 100ml", unit: "pieces", lastPurchasePrice: 150, available: true },
  { id: "sp7", supplierId: "s3", name: "Coca-Cola 500ml x12", unit: "boxes", lastPurchasePrice: 420, available: true },
  { id: "sp8", supplierId: "s3", name: "Minute Maid 1L", unit: "bottles", lastPurchasePrice: 120, available: true },
  { id: "sp9", supplierId: "s3", name: "Stoney Ginger 300ml x12", unit: "boxes", lastPurchasePrice: 300, available: true },
  { id: "sp10", supplierId: "s4", name: "Ketepa Tea 250g", unit: "packs", lastPurchasePrice: 160, available: true },
  { id: "sp11", supplierId: "s5", name: "Pembe Maize Flour 2kg", unit: "packs", lastPurchasePrice: 120, available: true },
  { id: "sp12", supplierId: "s5", name: "Soko Ugali 2kg", unit: "packs", lastPurchasePrice: 110, available: true },
  { id: "sp13", supplierId: "s6", name: "KCC Milk 500ml", unit: "pieces", lastPurchasePrice: 55, available: true },
  { id: "sp14", supplierId: "s6", name: "Mala Fermented 500ml", unit: "pieces", lastPurchasePrice: 60, available: true },
  { id: "sp15", supplierId: "s7", name: "Dettol Soap x4", unit: "packs", lastPurchasePrice: 180, available: true },
  { id: "sp16", supplierId: "s7", name: "Jik Bleach 500ml", unit: "bottles", lastPurchasePrice: 85, available: true },
  { id: "sp17", supplierId: "s10", name: "Ndengu 1kg", unit: "kg", lastPurchasePrice: 120, available: true },
  { id: "sp18", supplierId: "s10", name: "Hybrid Maize Seeds 1kg", unit: "packs", lastPurchasePrice: 450, available: true },
  { id: "sp19", supplierId: "s14", name: "Fresh Tomatoes 1kg", unit: "kg", lastPurchasePrice: 80, available: true },
  { id: "sp20", supplierId: "s14", name: "Onions 1kg", unit: "kg", lastPurchasePrice: 100, available: true },
];

function genOrder(id: string, supplierId: string, supplierName: string, daysAgo: number): PurchaseOrder {
  const items = [
    { productId: "sp1", name: "Elianto Oil 1L", qty: 24, unitPrice: 280 },
    { productId: "sp2", name: "Blueband 500g", qty: 12, unitPrice: 220 },
  ];
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const transport = Math.random() > 0.5 ? 500 : 0;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const statuses: OrderStatus[] = ["delivered", "delivered", "delivered", "in_transit", "pending"];
  return {
    id: `PO${id}`,
    supplierId,
    supplierName,
    items,
    subtotal,
    transportCost: transport,
    total: subtotal + transport,
    status: statuses[Math.floor(Math.random() * 3)],
    paymentTerms: "net30",
    orderDate: date.toISOString().slice(0, 10),
    expectedDelivery: new Date(date.getTime() + 3 * 86400000).toISOString().slice(0, 10),
    actualDelivery: new Date(date.getTime() + (2 + Math.floor(Math.random() * 3)) * 86400000).toISOString().slice(0, 10),
    notes: "",
  };
}

export const purchaseOrders: PurchaseOrder[] = [
  genOrder("001", "s1", "Bidco Africa Ltd", 5),
  genOrder("002", "s2", "Unilever Kenya", 8),
  genOrder("003", "s3", "CCBA Kenya", 12),
  genOrder("004", "s5", "Unga Group Ltd", 15),
  genOrder("005", "s1", "Bidco Africa Ltd", 20),
  genOrder("006", "s7", "Reckitt Benckiser Kenya", 25),
  genOrder("007", "s6", "KCC (New KCC)", 28),
  genOrder("008", "s9", "Mombasa Millers & Traders", 35),
  genOrder("009", "s2", "Unilever Kenya", 40),
  genOrder("010", "s10", "Limuru Farmers Co-op", 45),
];

export const payables: SupplierPayable[] = [
  { id: "pay1", supplierId: "s1", supplierName: "Bidco Africa Ltd", orderId: "PO001", amount: 9360, paid: 0, balance: 9360, dueDate: "2026-04-05", daysOverdue: 0 },
  { id: "pay2", supplierId: "s2", supplierName: "Unilever Kenya", orderId: "PO002", amount: 6720, paid: 3000, balance: 3720, dueDate: "2026-04-08", daysOverdue: 0 },
  { id: "pay3", supplierId: "s7", supplierName: "Reckitt Benckiser Kenya", orderId: "PO006", amount: 4200, paid: 0, balance: 4200, dueDate: "2026-03-25", daysOverdue: 2 },
  { id: "pay4", supplierId: "s9", supplierName: "Mombasa Millers & Traders", orderId: "PO008", amount: 15600, paid: 10000, balance: 5600, dueDate: "2026-03-20", daysOverdue: 7 },
  { id: "pay5", supplierId: "s12", supplierName: "Kisumu Lake Basin Distributors", orderId: "PO011", amount: 8400, paid: 0, balance: 8400, dueDate: "2026-03-15", daysOverdue: 12 },
];

export const performanceMetrics: PerformanceMetric[] = [
  { supplierId: "s1", onTimeRate: 92, accuracyRate: 98, priceStability: 85, totalOrders: 24, totalSpend: 245000, avgOrderValue: 10208 },
  { supplierId: "s2", onTimeRate: 95, accuracyRate: 99, priceStability: 90, totalOrders: 18, totalSpend: 186000, avgOrderValue: 10333 },
  { supplierId: "s3", onTimeRate: 98, accuracyRate: 97, priceStability: 88, totalOrders: 32, totalSpend: 156000, avgOrderValue: 4875 },
  { supplierId: "s4", onTimeRate: 85, accuracyRate: 95, priceStability: 92, totalOrders: 8, totalSpend: 42000, avgOrderValue: 5250 },
  { supplierId: "s5", onTimeRate: 88, accuracyRate: 96, priceStability: 80, totalOrders: 15, totalSpend: 198000, avgOrderValue: 13200 },
  { supplierId: "s6", onTimeRate: 99, accuracyRate: 99, priceStability: 95, totalOrders: 45, totalSpend: 312000, avgOrderValue: 6933 },
  { supplierId: "s7", onTimeRate: 90, accuracyRate: 94, priceStability: 87, totalOrders: 12, totalSpend: 89000, avgOrderValue: 7417 },
  { supplierId: "s8", onTimeRate: 100, accuracyRate: 100, priceStability: 99, totalOrders: 60, totalSpend: 540000, avgOrderValue: 9000 },
  { supplierId: "s9", onTimeRate: 75, accuracyRate: 88, priceStability: 70, totalOrders: 6, totalSpend: 45000, avgOrderValue: 7500 },
  { supplierId: "s10", onTimeRate: 82, accuracyRate: 92, priceStability: 65, totalOrders: 10, totalSpend: 28000, avgOrderValue: 2800 },
];

export const priceHistory = [
  { month: "Oct", cookingOil: 260, flour: 105, soap: 170, milk: 50 },
  { month: "Nov", cookingOil: 270, flour: 110, soap: 175, milk: 52 },
  { month: "Dec", cookingOil: 280, flour: 115, soap: 180, milk: 55 },
  { month: "Jan", cookingOil: 285, flour: 120, soap: 180, milk: 55 },
  { month: "Feb", cookingOil: 290, flour: 118, soap: 185, milk: 55 },
  { month: "Mar", cookingOil: 280, flour: 120, soap: 180, milk: 55 },
];
