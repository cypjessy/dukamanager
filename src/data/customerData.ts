export type CustomerSegment = "vip" | "frequent" | "credit" | "regular" | "new" | "inactive";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  nickname: string;
  phone: string;
  phoneAlt: string;
  whatsapp: string;
  email: string;
  location: string;
  segment: CustomerSegment;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  customerSince: string;
  lastPurchase: string;
  daysSinceLastPurchase: number;
  totalSpent: number;
  transactionCount: number;
  avgBasketSize: number;
  creditLimit: number;
  creditBalance: number;
  creditStatus: "good" | "warning" | "overdue";
  preferredPayment: "mpesa" | "cash" | "credit";
  notes: string;
  monthlySpending: number[];
  favoriteCategories: string[];
}

export interface CreditApplication {
  id: string;
  customerId: string;
  customerName: string;
  requestedLimit: number;
  incomeSource: string;
  references: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  items: number;
  amount: number;
  method: "mpesa" | "cash" | "credit";
  receiptNo: string;
}

export const segmentConfig: Record<CustomerSegment, { label: string; labelSw: string; color: string; bgGradient: string }> = {
  vip: { label: "VIP", labelSw: "VIP", color: "text-savanna-700 dark:text-savanna-300", bgGradient: "from-savanna-500 to-savanna-400" },
  frequent: { label: "Frequent", labelSw: "Mara kwa Mara", color: "text-terracotta-600 dark:text-terracotta-400", bgGradient: "from-terracotta-500 to-terracotta-400" },
  credit: { label: "Credit", labelSw: "Mkopo", color: "text-sunset-600 dark:text-sunset-400", bgGradient: "from-sunset-400 to-sunset-300" },
  regular: { label: "Regular", labelSw: "Kawaida", color: "text-forest-600 dark:text-forest-400", bgGradient: "from-forest-500 to-forest-400" },
  new: { label: "New", labelSw: "Mpya", color: "text-blue-600 dark:text-blue-400", bgGradient: "from-blue-500 to-blue-400" },
  inactive: { label: "Inactive", labelSw: "Haijatumika", color: "text-warm-500 dark:text-warm-400", bgGradient: "from-warm-400 to-warm-300" },
};

export const loyaltyTierConfig: Record<LoyaltyTier, { label: string; pointsRequired: number; benefits: string; color: string }> = {
  bronze: { label: "Bronze", pointsRequired: 0, benefits: "1% discount on purchases over KSh 1,000", color: "text-warm-600" },
  silver: { label: "Silver", pointsRequired: 500, benefits: "2% discount + free delivery within 2km", color: "text-warm-400" },
  gold: { label: "Gold", pointsRequired: 2000, benefits: "5% discount + priority service + birthday gift", color: "text-savanna-500" },
  platinum: { label: "Platinum", pointsRequired: 5000, benefits: "10% discount + free delivery + exclusive offers", color: "text-terracotta-500" },
};

export const sampleCustomers: Customer[] = [
  {
    id: "c1", customerId: "CUS-001", name: "Mama Wanjiku", nickname: "Mama Wanjiku", phone: "0722 111 001", phoneAlt: "0733 111 002", whatsapp: "254722111001", email: "",
    location: "Umoja Estate", segment: "vip", loyaltyTier: "gold", loyaltyPoints: 2850, customerSince: "2024-03-15", lastPurchase: "2026-03-26", daysSinceLastPurchase: 1,
    totalSpent: 185000, transactionCount: 142, avgBasketSize: 1303, creditLimit: 5000, creditBalance: 1200, creditStatus: "good", preferredPayment: "mpesa",
    notes: "Buys cereals and cooking oil in bulk end-month. Sends daughter on Saturdays.", monthlySpending: [18500, 22000, 19800, 21000, 17500, 20200], favoriteCategories: ["Cereals", "Cooking Oil", "Soap"],
  },
  {
    id: "c2", customerId: "CUS-002", name: "Baba Karanja", nickname: "Karanja", phone: "0733 222 001", phoneAlt: "", whatsapp: "254733222001", email: "",
    location: "Kayole", segment: "frequent", loyaltyTier: "silver", loyaltyPoints: 680, customerSince: "2024-08-20", lastPurchase: "2026-03-25", daysSinceLastPurchase: 2,
    totalSpent: 78500, transactionCount: 95, avgBasketSize: 826, creditLimit: 3000, creditBalance: 0, creditStatus: "good", preferredPayment: "mpesa",
    notes: "Comes every 3 days. Prefers Pembe flour.", monthlySpending: [7200, 8500, 7800, 9200, 8100, 7500], favoriteCategories: ["Cereals", "Beverages"],
  },
  {
    id: "c3", customerId: "CUS-003", name: "Mama Fatuma", nickname: "Fatuma", phone: "0711 333 001", phoneAlt: "0720 333 002", whatsapp: "254711333001", email: "fatuma@gmail.com",
    location: "Eastleigh", segment: "credit", loyaltyTier: "bronze", loyaltyPoints: 320, customerSince: "2025-01-10", lastPurchase: "2026-03-20", daysSinceLastPurchase: 7,
    totalSpent: 42000, transactionCount: 38, avgBasketSize: 1105, creditLimit: 8000, creditBalance: 4500, creditStatus: "warning", preferredPayment: "credit",
    notes: "Reliable credit customer. Pays on 5th of each month.", monthlySpending: [4500, 5200, 4800, 3900, 5100, 4200], favoriteCategories: ["Cooking Oil", "Soap", "Dairy"],
  },
  {
    id: "c4", customerId: "CUS-004", name: "Mwalimu Omondi", nickname: "Mwalimu", phone: "0720 444 001", phoneAlt: "", whatsapp: "254720444001", email: "",
    location: "Donholm", segment: "regular", loyaltyTier: "bronze", loyaltyPoints: 180, customerSince: "2025-06-01", lastPurchase: "2026-03-22", daysSinceLastPurchase: 5,
    totalSpent: 28000, transactionCount: 52, avgBasketSize: 538, creditLimit: 0, creditBalance: 0, creditStatus: "good", preferredPayment: "cash",
    notes: "Teacher. Comes during lunch break. Buys snacks and airtime.", monthlySpending: [2800, 3200, 2900, 3100, 2700, 3000], favoriteCategories: ["Snacks", "Emergency"],
  },
  {
    id: "c5", customerId: "CUS-005", name: "Sister Mary", nickname: "Sister", phone: "0734 555 001", phoneAlt: "", whatsapp: "254734555001", email: "mary@school.ke",
    location: "Buruburu", segment: "vip", loyaltyTier: "platinum", loyaltyPoints: 5200, customerSince: "2024-01-20", lastPurchase: "2026-03-27", daysSinceLastPurchase: 0,
    totalSpent: 245000, transactionCount: 186, avgBasketSize: 1317, creditLimit: 10000, creditBalance: 2000, creditStatus: "good", preferredPayment: "mpesa",
    notes: "School supplies buyer. Large orders every term. Very loyal.", monthlySpending: [22000, 25000, 23500, 28000, 21000, 24500], favoriteCategories: ["Snacks", "Beverages", "Household"],
  },
  {
    id: "c6", customerId: "CUS-006", name: "Hassan Omar", nickname: "Hassan", phone: "0712 666 001", phoneAlt: "", whatsapp: "254712666001", email: "",
    location: "South B", segment: "credit", loyaltyTier: "silver", loyaltyPoints: 520, customerSince: "2024-11-05", lastPurchase: "2026-03-10", daysSinceLastPurchase: 17,
    totalSpent: 56000, transactionCount: 45, avgBasketSize: 1244, creditLimit: 5000, creditBalance: 4800, creditStatus: "overdue", preferredPayment: "credit",
    notes: "Payment delayed last month. Needs follow-up.", monthlySpending: [5500, 6200, 4800, 3200, 5800, 4100], favoriteCategories: ["Cooking Oil", "Cereals"],
  },
  {
    id: "c7", customerId: "CUS-007", name: "Mama Nekesa", nickname: "Nekesa", phone: "0723 777 001", phoneAlt: "", whatsapp: "254723777001", email: "",
    location: "Komarock", segment: "frequent", loyaltyTier: "silver", loyaltyPoints: 890, customerSince: "2024-09-15", lastPurchase: "2026-03-24", daysSinceLastPurchase: 3,
    totalSpent: 92000, transactionCount: 110, avgBasketSize: 836, creditLimit: 0, creditBalance: 0, creditStatus: "good", preferredPayment: "mpesa",
    notes: "Runs a small kiosk. Buys wholesale from us.", monthlySpending: [8800, 9500, 9200, 10100, 8600, 9800], favoriteCategories: ["Cereals", "Cooking Oil", "Soap"],
  },
  {
    id: "c8", customerId: "CUS-008", name: "Peter Njoroge", nickname: "Njoroge", phone: "0711 888 001", phoneAlt: "", whatsapp: "254711888001", email: "",
    location: "Kasarani", segment: "regular", loyaltyTier: "bronze", loyaltyPoints: 150, customerSince: "2025-04-10", lastPurchase: "2026-03-21", daysSinceLastPurchase: 6,
    totalSpent: 22000, transactionCount: 35, avgBasketSize: 629, creditLimit: 0, creditBalance: 0, creditStatus: "good", preferredPayment: "cash",
    notes: "Comes with family on weekends.", monthlySpending: [2200, 2500, 2100, 2800, 2300, 2600], favoriteCategories: ["Snacks", "Beverages", "Dairy"],
  },
  {
    id: "c9", customerId: "CUS-009", name: "Akinyi Rose", nickname: "Akinyi", phone: "0720 999 001", phoneAlt: "", whatsapp: "254720999001", email: "",
    location: "Mwiki", segment: "new", loyaltyTier: "bronze", loyaltyPoints: 45, customerSince: "2026-02-15", lastPurchase: "2026-03-19", daysSinceLastPurchase: 8,
    totalSpent: 3500, transactionCount: 6, avgBasketSize: 583, creditLimit: 0, creditBalance: 0, creditStatus: "good", preferredPayment: "mpesa",
    notes: "New customer. Referred by Mama Wanjiku.", monthlySpending: [0, 0, 0, 0, 1200, 2300], favoriteCategories: ["Cereals", "Personal Care"],
  },
  {
    id: "c10", customerId: "CUS-010", name: "Otieno Baba", nickname: "Otieno", phone: "0733 101 001", phoneAlt: "", whatsapp: "254733101001", email: "",
    location: "Pipeline", segment: "inactive", loyaltyTier: "bronze", loyaltyPoints: 210, customerSince: "2024-06-20", lastPurchase: "2026-02-01", daysSinceLastPurchase: 55,
    totalSpent: 35000, transactionCount: 42, avgBasketSize: 833, creditLimit: 0, creditBalance: 0, creditStatus: "good", preferredPayment: "cash",
    notes: "Was regular. Need win-back campaign.", monthlySpending: [3500, 3800, 3200, 0, 0, 0], favoriteCategories: ["Cereals", "Emergency"],
  },
  {
    id: "c11", customerId: "CUS-011", name: "Grace Muthoni", nickname: "Grace", phone: "0712 202 001", phoneAlt: "0734 202 002", whatsapp: "254712202001", email: "grace@business.ke",
    location: "Westlands", segment: "vip", loyaltyTier: "gold", loyaltyPoints: 3100, customerSince: "2024-02-10", lastPurchase: "2026-03-26", daysSinceLastPurchase: 1,
    totalSpent: 198000, transactionCount: 156, avgBasketSize: 1269, creditLimit: 8000, creditBalance: 0, creditStatus: "good", preferredPayment: "mpesa",
    notes: "Restaurant owner. Buys in bulk weekly. Very important customer.", monthlySpending: [18000, 20500, 19200, 22000, 17500, 20800], favoriteCategories: ["Cereals", "Cooking Oil", "Dairy", "Beverages"],
  },
  {
    id: "c12", customerId: "CUS-012", name: "Kimani Wa Kamau", nickname: "Kimani", phone: "0722 303 001", phoneAlt: "", whatsapp: "254722303001", email: "",
    location: "Githurai", segment: "frequent", loyaltyTier: "bronze", loyaltyPoints: 320, customerSince: "2025-03-01", lastPurchase: "2026-03-23", daysSinceLastPurchase: 4,
    totalSpent: 45000, transactionCount: 68, avgBasketSize: 662, creditLimit: 2000, creditBalance: 500, creditStatus: "good", preferredPayment: "mpesa",
    notes: "Boda boda rider. Quick purchases, mostly airtime and snacks.", monthlySpending: [4200, 4800, 4500, 5100, 4300, 4600], favoriteCategories: ["Emergency", "Snacks", "Beverages"],
  },
];

export const sampleTransactions: CustomerTransaction[] = [
  { id: "ctx1", customerId: "c1", date: "2026-03-26", items: 4, amount: 680, method: "mpesa", receiptNo: "RCP20001" },
  { id: "ctx2", customerId: "c1", date: "2026-03-23", items: 6, amount: 1250, method: "mpesa", receiptNo: "RCP19980" },
  { id: "ctx3", customerId: "c1", date: "2026-03-20", items: 3, amount: 450, method: "mpesa", receiptNo: "RCP19945" },
  { id: "ctx4", customerId: "c5", date: "2026-03-27", items: 8, amount: 2400, method: "mpesa", receiptNo: "RCP20015" },
  { id: "ctx5", customerId: "c5", date: "2026-03-25", items: 5, amount: 1800, method: "mpesa", receiptNo: "RCP19998" },
  { id: "ctx6", customerId: "c3", date: "2026-03-20", items: 4, amount: 920, method: "credit", receiptNo: "RCP19940" },
  { id: "ctx7", customerId: "c6", date: "2026-03-10", items: 3, amount: 1100, method: "credit", receiptNo: "RCP19850" },
  { id: "ctx8", customerId: "c2", date: "2026-03-25", items: 2, amount: 350, method: "mpesa", receiptNo: "RCP20005" },
  { id: "ctx9", customerId: "c11", date: "2026-03-26", items: 12, amount: 4200, method: "mpesa", receiptNo: "RCP20010" },
  { id: "ctx10", customerId: "c7", date: "2026-03-24", items: 7, amount: 1680, method: "mpesa", receiptNo: "RCP19990" },
];

export const creditApplications: CreditApplication[] = [
  { id: "ca1", customerId: "c9", customerName: "Akinyi Rose", requestedLimit: 2000, incomeSource: "Small business", references: "Mama Wanjiku (existing customer)", status: "pending", appliedDate: "2026-03-20" },
  { id: "ca2", customerId: "c12", customerName: "Kimani Wa Kamau", requestedLimit: 3000, incomeSource: "Boda boda", references: "Baba Karanja (existing customer)", status: "pending", appliedDate: "2026-03-25" },
];
