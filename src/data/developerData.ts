export type SubscriptionTier = "free" | "growth" | "enterprise";
export type TenantStatus = "active" | "suspended" | "pending" | "trial";
export type PaymentMethod = "mpesa" | "card" | "bank";
export type InvoiceStatus = "paid" | "pending" | "overdue" | "failed";
export type ApiKeyType = "production" | "sandbox";
export type UserRole = "developer" | "owner" | "manager" | "cashier" | "head_cashier" | "trainee" | "viewer";

export interface Developer {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  kraPin: string;
  avatar: string | null;
  subscription: SubscriptionTier;
  createdAt: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

export interface ShopTenant {
  id: string;
  name: string;
  slug: string;
  location: string;
  county: string;
  owner: string;
  phone: string;
  email: string;
  logo: string | null;
  status: TenantStatus;
  subscription: SubscriptionTier;
  createdAt: string;
  lastActive: string;
  transactionCount: number;
  monthlyRevenue: number;
  dailyTransactions: number[];
  productCount: number;
  customerCount: number;
  activeUsers: number;
  kraCompliant: boolean;
  mpesaConfigured: boolean;
  settings: TenantSettings;
}

export interface TenantSettings {
  currency: string;
  taxRate: number;
  mpesaTill: string;
  receiptFooter: string;
  categories: string[];
  notifications: { sms: boolean; email: boolean; whatsapp: boolean };
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  lastActive: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  period: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod | null;
  dueDate: string;
  paidAt: string | null;
  mpesaCode: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: ApiKeyType;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
  rateLimit: number;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastDelivery: string | null;
  failureCount: number;
}

export interface ShopActivity {
  id: string;
  tenantId: string;
  type: "login" | "transaction" | "settings" | "payment" | "user_added";
  description: string;
  user: string;
  timestamp: string;
}

export interface ShopHealthAlert {
  id: string;
  tenantId: string;
  tenantName: string;
  type: "no_transactions" | "low_inventory" | "mpesa_unconfigured" | "subscription_expiring" | "payment_failed";
  severity: "critical" | "warning" | "info";
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface PlatformMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limits: { shops: number; users: number; apiCalls: number };
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    tier: "free",
    name: "Free Tier",
    price: 0,
    features: ["1 Shop", "Basic inventory", "Cash payments", "Daily reports", "Email support"],
    limits: { shops: 1, users: 2, apiCalls: 100 },
  },
  {
    tier: "growth",
    name: "Growth",
    price: 2500,
    features: ["3 Shops", "Full inventory", "M-Pesa integration", "Advanced reports", "API access", "Priority support", "Multi-user"],
    limits: { shops: 3, users: 10, apiCalls: 5000 },
    popular: true,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 0,
    features: ["Unlimited Shops", "Custom integrations", "Dedicated API", "White-label option", "Account manager", "SLA guarantee", "Custom features"],
    limits: { shops: -1, users: -1, apiCalls: -1 },
  },
];

export const webhookEvents = [
  "sale.completed", "sale.refunded", "payment.received",
  "inventory.low_stock", "inventory.out_of_stock",
  "tenant.created", "tenant.suspended",
  "user.login", "user.created",
];

export const sampleMetrics: PlatformMetric[] = [
  { label: "Active Shops", value: "47", change: 12, icon: "shop" },
  { label: "Total Transactions", value: "12,847", change: 8, icon: "transactions" },
  { label: "Monthly Revenue", value: "KSh 117,500", change: 15, icon: "revenue" },
  { label: "API Calls Today", value: "3,421", change: -3, icon: "api" },
];

export const sampleTenants: ShopTenant[] = [
  { id: "t1", name: "Mama Njeri's Duka", slug: "mama-njeri", location: "Gikomba, Nairobi", county: "Nairobi", owner: "Grace Njeri", phone: "0722111001", email: "njeri@duka.ke", logo: null, status: "active", subscription: "growth", createdAt: "2025-06-15", lastActive: "2026-03-29", transactionCount: 3420, monthlyRevenue: 45000, dailyTransactions: [12, 18, 15, 22, 19, 25, 14], productCount: 156, customerCount: 89, activeUsers: 3, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "123456", receiptFooter: "Thank you for shopping with us!", categories: ["Cereals", "Soap", "Cooking Oil"], notifications: { sms: true, email: true, whatsapp: false } } },
  { id: "t2", name: "Kamau General Store", slug: "kamau-store", location: "Kayole, Nairobi", county: "Nairobi", owner: "John Kamau", phone: "0733222001", email: "kamau@gmail.com", logo: null, status: "active", subscription: "growth", createdAt: "2025-08-20", lastActive: "2026-03-29", transactionCount: 2180, monthlyRevenue: 32000, dailyTransactions: [8, 12, 10, 14, 11, 16, 9], productCount: 98, customerCount: 67, activeUsers: 2, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "654321", receiptFooter: "Karibu tena!", categories: ["Snacks", "Beverages"], notifications: { sms: true, email: false, whatsapp: true } } },
  { id: "t3", name: "Faith Mini Mart", slug: "faith-mart", location: "Donholm, Nairobi", county: "Nairobi", owner: "Faith Wambui", phone: "0711333001", email: "faith@mart.ke", logo: null, status: "trial", subscription: "free", createdAt: "2026-02-01", lastActive: "2026-03-28", transactionCount: 340, monthlyRevenue: 8500, dailyTransactions: [3, 5, 4, 6, 5, 7, 4], productCount: 45, customerCount: 23, activeUsers: 1, kraCompliant: false, mpesaConfigured: false, settings: { currency: "KES", taxRate: 16, mpesaTill: "", receiptFooter: "Thanks!", categories: [], notifications: { sms: false, email: true, whatsapp: false } } },
  { id: "t4", name: "Otieno Provisions", slug: "otieno-prov", location: "Eastleigh, Nairobi", county: "Nairobi", owner: "Peter Otieno", phone: "0720444001", email: "otieno@prov.ke", logo: null, status: "active", subscription: "enterprise", createdAt: "2025-03-10", lastActive: "2026-03-29", transactionCount: 5600, monthlyRevenue: 78000, dailyTransactions: [20, 28, 24, 32, 29, 35, 22], productCount: 312, customerCount: 145, activeUsers: 5, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "789012", receiptFooter: "Quality goods, fair prices!", categories: ["Electronics", "Household"], notifications: { sms: true, email: true, whatsapp: true } } },
  { id: "t5", name: "Wambui's Cosmetics", slug: "wambui-cosmetics", location: "Buruburu, Nairobi", county: "Nairobi", owner: "Wanjiku Wambui", phone: "0734555001", email: "wambui@cosmetics.ke", logo: null, status: "suspended", subscription: "growth", createdAt: "2025-11-05", lastActive: "2026-02-15", transactionCount: 890, monthlyRevenue: 12000, dailyTransactions: [0, 0, 0, 0, 0, 0, 0], productCount: 78, customerCount: 45, activeUsers: 2, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "345678", receiptFooter: "Beauty for everyone!", categories: ["Cosmetics", "Personal Care"], notifications: { sms: true, email: true, whatsapp: false } } },
  { id: "t6", name: "Hassan Hardware", slug: "hassan-hardware", location: "Eastleigh, Nairobi", county: "Nairobi", owner: "Hassan Mohamed", phone: "0720666001", email: "hassan@hardware.ke", logo: null, status: "active", subscription: "growth", createdAt: "2025-09-12", lastActive: "2026-03-29", transactionCount: 1890, monthlyRevenue: 56000, dailyTransactions: [15, 20, 18, 24, 21, 27, 16], productCount: 423, customerCount: 112, activeUsers: 3, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "456789", receiptFooter: "Building dreams together!", categories: ["Hardware", "Building Materials"], notifications: { sms: true, email: true, whatsapp: true } } },
  { id: "t7", name: "Mombasa Textiles", slug: "mombasa-textiles", location: "Mombasa CBD", county: "Mombasa", owner: "Fatima Ali", phone: "0712777001", email: "fatima@textiles.co.ke", logo: null, status: "active", subscription: "enterprise", createdAt: "2025-04-20", lastActive: "2026-03-29", transactionCount: 4200, monthlyRevenue: 92000, dailyTransactions: [18, 25, 22, 30, 27, 33, 20], productCount: 567, customerCount: 203, activeUsers: 6, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "567890", receiptFooter: "Karibu sana!", categories: ["Textiles", "Fashion"], notifications: { sms: true, email: true, whatsapp: true } } },
  { id: "t8", name: "Kisumu Fresh Groceries", slug: "kisumu-fresh", location: "Kisumu CBD", county: "Kisumu", owner: "Omondi Odhiambo", phone: "0733888001", email: "omondi@fresh.co.ke", logo: null, status: "active", subscription: "free", createdAt: "2026-01-15", lastActive: "2026-03-29", transactionCount: 560, monthlyRevenue: 14000, dailyTransactions: [5, 8, 6, 9, 7, 10, 6], productCount: 89, customerCount: 34, activeUsers: 1, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "678901", receiptFooter: "Fresh from the farm!", categories: ["Groceries", "Fresh Produce"], notifications: { sms: false, email: true, whatsapp: false } } },
  { id: "t9", name: "Nakuru Pharmacy", slug: "nakuru-pharmacy", location: "Nakuru CBD", county: "Nakuru", owner: "Dr. Alice Muthoni", phone: "0711999001", email: "alice@pharmacy.co.ke", logo: null, status: "pending", subscription: "growth", createdAt: "2026-03-20", lastActive: "2026-03-25", transactionCount: 45, monthlyRevenue: 3200, dailyTransactions: [2, 3, 2, 4, 3, 5, 2], productCount: 234, customerCount: 12, activeUsers: 2, kraCompliant: false, mpesaConfigured: false, settings: { currency: "KES", taxRate: 0, mpesaTill: "", receiptFooter: "Your health, our priority", categories: ["Medicine", "Health"], notifications: { sms: true, email: true, whatsapp: false } } },
  { id: "t10", name: "Thika Electronics", slug: "thika-electronics", location: "Thika CBD", county: "Kiambu", owner: "James Mwangi", phone: "0722000001", email: "james@electronics.co.ke", logo: null, status: "active", subscription: "growth", createdAt: "2025-07-08", lastActive: "2026-03-28", transactionCount: 2450, monthlyRevenue: 68000, dailyTransactions: [16, 22, 19, 26, 23, 29, 17], productCount: 189, customerCount: 156, activeUsers: 4, kraCompliant: true, mpesaConfigured: true, settings: { currency: "KES", taxRate: 16, mpesaTill: "789123", receiptFooter: "Technology for everyone!", categories: ["Electronics", "Gadgets"], notifications: { sms: true, email: false, whatsapp: true } } },
];

export const sampleInvoices: Invoice[] = [
  { id: "inv1", tenantId: "t1", tenantName: "Mama Njeri's Duka", amount: 2500, period: "March 2026", status: "paid", paymentMethod: "mpesa", dueDate: "2026-03-05", paidAt: "2026-03-03", mpesaCode: "QJK7X9M2NP" },
  { id: "inv2", tenantId: "t2", tenantName: "Kamau General Store", amount: 2500, period: "March 2026", status: "paid", paymentMethod: "mpesa", dueDate: "2026-03-05", paidAt: "2026-03-04", mpesaCode: "RKL8Y0N3QR" },
  { id: "inv3", tenantId: "t4", tenantName: "Otieno Provisions", amount: 8000, period: "March 2026", status: "pending", paymentMethod: null, dueDate: "2026-03-31", paidAt: null, mpesaCode: null },
  { id: "inv4", tenantId: "t5", tenantName: "Wambui's Cosmetics", amount: 2500, period: "February 2026", status: "overdue", paymentMethod: null, dueDate: "2026-02-05", paidAt: null, mpesaCode: null },
  { id: "inv5", tenantId: "t1", tenantName: "Mama Njeri's Duka", amount: 2500, period: "February 2026", status: "paid", paymentMethod: "card", dueDate: "2026-02-05", paidAt: "2026-02-02", mpesaCode: null },
  { id: "inv6", tenantId: "t2", tenantName: "Kamau General Store", amount: 2500, period: "February 2026", status: "paid", paymentMethod: "mpesa", dueDate: "2026-02-05", paidAt: "2026-02-03", mpesaCode: "TML3Z1P4ST" },
];

export const sampleApiKeys: ApiKey[] = [
  { id: "ak1", name: "Production API", key: "dkm_live_a1b2c3d4e5f6g7h8i9j0", type: "production", createdAt: "2025-06-15", lastUsed: "2026-03-29", requestCount: 45200, rateLimit: 1000, isActive: true },
  { id: "ak2", name: "Sandbox Testing", key: "dkm_test_x9y8z7w6v5u4t3s2r1q0", type: "sandbox", createdAt: "2025-06-15", lastUsed: "2026-03-28", requestCount: 12300, rateLimit: 500, isActive: true },
];

export const sampleWebhooks: Webhook[] = [
  { id: "wh1", url: "https://api.mama-njeri.ke/webhooks/duka", events: ["sale.completed", "payment.received"], isActive: true, secret: "whsec_abc123", lastDelivery: "2026-03-29T08:30:00Z", failureCount: 0 },
  { id: "wh2", url: "https://hooks.slack.com/services/T01/B02/xyz", events: ["inventory.low_stock"], isActive: true, secret: "whsec_def456", lastDelivery: "2026-03-28T14:15:00Z", failureCount: 0 },
];

export const sampleHealthAlerts: ShopHealthAlert[] = [
  { id: "ha1", tenantId: "t3", tenantName: "Faith Mini Mart", type: "mpesa_unconfigured", severity: "warning", message: "M-Pesa not configured - cash only", createdAt: "2026-03-28", resolved: false },
  { id: "ha2", tenantId: "t9", tenantName: "Nakuru Pharmacy", type: "no_transactions", severity: "critical", message: "No transactions for 4 days", createdAt: "2026-03-25", resolved: false },
  { id: "ha3", tenantId: "t9", tenantName: "Nakuru Pharmacy", type: "mpesa_unconfigured", severity: "warning", message: "M-Pesa not configured", createdAt: "2026-03-22", resolved: false },
  { id: "ha4", tenantId: "t5", tenantName: "Wambui's Cosmetics", type: "subscription_expiring", severity: "critical", message: "Subscription expired - shop suspended", createdAt: "2026-02-15", resolved: false },
];

export const sampleActivities: ShopActivity[] = [
  { id: "a1", tenantId: "t1", type: "transaction", description: "KSh 1,250 sale via M-Pesa", user: "Grace Njeri", timestamp: "2026-03-29T08:30:00Z" },
  { id: "a2", tenantId: "t1", type: "login", description: "Logged in from mobile", user: "Grace Njeri", timestamp: "2026-03-29T08:15:00Z" },
  { id: "a3", tenantId: "t2", type: "transaction", description: "KSh 890 sale via Cash", user: "John Kamau", timestamp: "2026-03-29T07:45:00Z" },
  { id: "a4", tenantId: "t4", type: "settings", description: "Updated receipt footer", user: "Peter Otieno", timestamp: "2026-03-28T16:20:00Z" },
  { id: "a5", tenantId: "t6", type: "payment", description: "M-Pesa till payment KSh 2,500", user: "Hassan Mohamed", timestamp: "2026-03-28T14:10:00Z" },
  { id: "a6", tenantId: "t7", type: "user_added", description: "Added new cashier Aisha", user: "Fatima Ali", timestamp: "2026-03-28T11:30:00Z" },
  { id: "a7", tenantId: "t10", type: "transaction", description: "KSh 3,400 sale via M-Pesa", user: "James Mwangi", timestamp: "2026-03-28T10:20:00Z" },
];

export const kenyaCounties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado",
  "Uasin Gishu", "Nyeri", "Meru", "Kilifi", "Kakamega", "Bungoma", "Trans Nzoia",
];
