export type ExpenseCategory =
  | "rent" | "electricity" | "water" | "salaries" | "transport"
  | "stock_purchase" | "marketing" | "repairs" | "licenses"
  | "fuel" | "communication" | "miscellaneous";

export type ExpenseStatus = "draft" | "pending" | "approved" | "rejected" | "reimbursed";
export type PaymentMethod = "cash" | "mpesa" | "bank" | "mobile_banking";
export type ExpenseType = "business" | "personal";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface Expense {
  id: string;
  date: string;
  dayOfWeek: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  type: ExpenseType;
  paymentMethod: PaymentMethod;
  reference: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  approvedBy?: string;
  rejectionReason?: string;
  notes: string;
}

export interface ExpenseBudget {
  category: ExpenseCategory;
  monthlyBudget: number;
  spent: number;
}

export interface RecurringExpense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  frequency: RecurrenceFrequency;
  nextDueDate: string;
  isActive: boolean;
}

export const categoryConfig: Record<ExpenseCategory, { label: string; labelSw: string; icon: string; color: string; bgColor: string }> = {
  rent: { label: "Rent", labelSw: "Kodi", icon: "🏢", color: "text-terracotta-600 dark:text-terracotta-400", bgColor: "bg-terracotta-100 dark:bg-terracotta-900/30" },
  electricity: { label: "Electricity", labelSw: "Umeme", icon: "⚡", color: "text-sunset-600 dark:text-sunset-400", bgColor: "bg-sunset-100 dark:bg-sunset-900/30" },
  water: { label: "Water", labelSw: "Maji", icon: "💧", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  salaries: { label: "Salaries", labelSw: "Mishahara", icon: "👥", color: "text-forest-600 dark:text-forest-400", bgColor: "bg-forest-100 dark:bg-forest-900/30" },
  transport: { label: "Transport", labelSw: "Usafiri", icon: "🚛", color: "text-savanna-600 dark:text-savanna-400", bgColor: "bg-savanna-100 dark:bg-savanna-900/30" },
  stock_purchase: { label: "Stock Purchase", labelSw: "Ununuzi wa Bidhaa", icon: "📦", color: "text-warm-700 dark:text-warm-300", bgColor: "bg-warm-200 dark:bg-warm-700" },
  marketing: { label: "Marketing", labelSw: "Uuzaji", icon: "📢", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
  repairs: { label: "Repairs", labelSw: "Matengenezo", icon: "🔧", color: "text-warm-600 dark:text-warm-400", bgColor: "bg-warm-100 dark:bg-warm-800" },
  licenses: { label: "Licenses", labelSw: "Leseni", icon: "📋", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  fuel: { label: "Fuel", labelSw: "Mafuta", icon: "⛽", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
  communication: { label: "Communication", labelSw: "Mawasiliano", icon: "📱", color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
  miscellaneous: { label: "Miscellaneous", labelSw: "Mchanganyiko", icon: "📌", color: "text-warm-500 dark:text-warm-400", bgColor: "bg-warm-100 dark:bg-warm-800" },
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const descriptions: Record<ExpenseCategory, string[]> = {
  rent: ["Monthly shop rent - Gikomba", "Quarterly rent advance"],
  electricity: ["KPLC token purchase - 50 units", "KPLC token purchase - 100 units", "Generator fuel top-up"],
  water: ["Nairobi Water monthly bill", "Water jerrycan purchase"],
  salaries: ["Casual worker - John (loading)", "Casual worker - Mary (stocking)", "Security guard - night shift"],
  transport: ["Gikomba market transport", "Kongowea stock collection", "Eastleigh supplier visit"],
  stock_purchase: ["Wholesale stock - Bidco", "Wholesale stock - Unga Group", "Emergency stock run"],
  marketing: ["Business cards printing", "Social media boost", "Banner for shop"],
  repairs: ["Shelf repair", "Lock replacement", "Display fridge maintenance"],
  licenses: ["County single business permit", "Fire safety certificate", "Health inspection fee"],
  fuel: ["Motorcycle fuel - delivery", "Generator diesel"],
  communication: ["Safaricom airtime - shop line", "WiFi monthly subscription", "M-Pesa business charges"],
  miscellaneous: ["Market levy - Gikomba", "Plastic bags purchase", "Cleaning supplies"],
};

function genExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const methods: PaymentMethod[] = ["mpesa", "mpesa", "cash", "cash", "bank"];
  const statuses: ExpenseStatus[] = ["approved", "approved", "approved", "approved", "pending", "draft"];
  const cats = Object.keys(categoryConfig) as ExpenseCategory[];

  for (let i = 0; i < 45; i++) {
    const dayOffset = Math.floor(i / 2);
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const desc = descriptions[cat][Math.floor(Math.random() * descriptions[cat].length)];

    const amountRanges: Record<ExpenseCategory, [number, number]> = {
      rent: [8000, 15000], electricity: [500, 2500], water: [200, 800],
      salaries: [1500, 5000], transport: [200, 1500], stock_purchase: [5000, 50000],
      marketing: [500, 3000], repairs: [300, 5000], licenses: [2000, 15000],
      fuel: [300, 1500], communication: [100, 1000], miscellaneous: [100, 2000],
    };
    const [min, max] = amountRanges[cat];
    const amount = Math.round((min + Math.random() * (max - min)) / 10) * 10;

    expenses.push({
      id: `EXP${String(1000 + i).padStart(4, "0")}`,
      date: date.toISOString().slice(0, 10),
      dayOfWeek: dayNames[date.getDay()],
      description: desc,
      category: cat,
      amount,
      type: "business",
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      reference: `REF${Math.floor(Math.random() * 900000 + 100000)}`,
      status: i < 2 ? "pending" : statuses[Math.floor(Math.random() * statuses.length)],
      isRecurring: cat === "rent" || (cat === "electricity" && Math.random() > 0.5),
      recurrenceFrequency: cat === "rent" ? "monthly" : undefined,
      approvedBy: i < 3 ? undefined : "Mama Njeri",
      notes: "",
    });
  }
  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}

export const sampleExpenses: Expense[] = genExpenses();

export const budgets: ExpenseBudget[] = [
  { category: "rent", monthlyBudget: 12000, spent: 12000 },
  { category: "electricity", monthlyBudget: 3000, spent: 2450 },
  { category: "water", monthlyBudget: 800, spent: 620 },
  { category: "salaries", monthlyBudget: 15000, spent: 12500 },
  { category: "transport", monthlyBudget: 5000, spent: 4200 },
  { category: "stock_purchase", monthlyBudget: 150000, spent: 128000 },
  { category: "marketing", monthlyBudget: 2000, spent: 800 },
  { category: "repairs", monthlyBudget: 3000, spent: 1200 },
  { category: "licenses", monthlyBudget: 1500, spent: 0 },
  { category: "fuel", monthlyBudget: 2000, spent: 1650 },
  { category: "communication", monthlyBudget: 1500, spent: 1100 },
  { category: "miscellaneous", monthlyBudget: 3000, spent: 1850 },
];

export const recurringExpenses: RecurringExpense[] = [
  { id: "rec1", description: "Shop Rent", category: "rent", amount: 12000, frequency: "monthly", nextDueDate: "2026-04-01", isActive: true },
  { id: "rec2", description: "Security Guard", category: "salaries", amount: 8000, frequency: "monthly", nextDueDate: "2026-04-05", isActive: true },
  { id: "rec3", description: "WiFi Subscription", category: "communication", amount: 2500, frequency: "monthly", nextDueDate: "2026-04-03", isActive: true },
  { id: "rec4", description: "Business Permit", category: "licenses", amount: 10000, frequency: "yearly", nextDueDate: "2026-12-31", isActive: true },
  { id: "rec5", description: "Market Levy", category: "miscellaneous", amount: 200, frequency: "daily", nextDueDate: "2026-03-28", isActive: true },
];

export const monthlyTrend = [
  { month: "Oct", expenses: 162000, revenue: 320000, net: 158000 },
  { month: "Nov", expenses: 175000, revenue: 345000, net: 170000 },
  { month: "Dec", expenses: 198000, revenue: 420000, net: 222000 },
  { month: "Jan", expenses: 158000, revenue: 310000, net: 152000 },
  { month: "Feb", expenses: 172000, revenue: 355000, net: 183000 },
  { month: "Mar", expenses: 185000, revenue: 380000, net: 195000 },
];

export const expenseBreakdown = [
  { name: "Stock", value: 128000, color: "#56524b" },
  { name: "Rent", value: 12000, color: "#C75B39" },
  { name: "Salaries", value: 12500, color: "#2D5A3D" },
  { name: "Transport", value: 4200, color: "#D4A574" },
  { name: "Electricity", value: 2450, color: "#E85D04" },
  { name: "Other", value: 5450, color: "#9a958a" },
];

export function getTotalExpenses(expenses: Expense[], dateRange: string): number {
  const now = new Date();
  let filtered = expenses.filter((e) => e.status !== "rejected");

  if (dateRange === "today") filtered = filtered.filter((e) => e.date === now.toISOString().slice(0, 10));
  else if (dateRange === "week") {
    const w = new Date(now);
    w.setDate(w.getDate() - 7);
    filtered = filtered.filter((e) => e.date >= w.toISOString().slice(0, 10));
  } else if (dateRange === "month") {
    const m = new Date(now);
    m.setMonth(m.getMonth() - 1);
    filtered = filtered.filter((e) => e.date >= m.toISOString().slice(0, 10));
  }
  return filtered.reduce((s, e) => s + e.amount, 0);
}
