import type { Locale } from "@/types";

type DashboardTranslationKeys =
  | "dashboard"
  | "inventory"
  | "sales"
  | "suppliers"
  | "expenses"
  | "employees"
  | "customers"
  | "returns"
  | "documents"
  | "reports"
  | "settings"
  | "help"
  | "todaysSales"
  | "lowStock"
  | "pendingOrders"
  | "activeCustomers"
  | "searchPlaceholder"
  | "notifications"
  | "profile"
  | "logout"
  | "switchShop"
  | "addProduct"
  | "addSale"
  | "addSupplier"
  | "quickActions"
  | "recentTransactions"
  | "salesOverview"
  | "daily"
  | "weekly"
  | "monthly"
  | "mpesa"
  | "cash"
  | "credit"
  | "completed"
  | "pending"
  | "failed"
  | "productName"
  | "category"
  | "quantity"
  | "buyingPrice"
  | "sellingPrice"
  | "supplier"
  | "save"
  | "cancel"
  | "uploadImage"
  | "items"
  | "amount"
  | "payment"
  | "status"
  | "time"
  | "customer"
  | "noNotifications"
  | "markAllRead"
  | "youAreOffline"
  | "queuedActions"
  | "backOnline"
  | "lowStockAlert"
  | "units"
  | "revenue"
  | "fromYesterday"
  | "actionRequired"
  | "awaitingDelivery"
  | "todayVsYesterday"
  | "fromLastWeek"
  | "noData"
  | "loading"
  | "error"
  | "retry"
  | "installApp"
  | "installAppDesc";

const dashboardTranslations: Record<
  Locale,
  Record<DashboardTranslationKeys, string>
> = {
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    sales: "Sales",
    suppliers: "Suppliers",
    expenses: "Expenses",
    employees: "Employees",
    customers: "Customers",
    returns: "Returns",
    documents: "Documents",
    reports: "Reports",
    settings: "Settings",
    help: "Help",
    todaysSales: "Today's Sales",
    lowStock: "Low Stock Items",
    pendingOrders: "Pending Orders",
    activeCustomers: "Active Customers",
    searchPlaceholder: "Search products, sales, customers...",
    notifications: "Notifications",
    profile: "Profile",
    logout: "Logout",
    switchShop: "Switch Shop",
    addProduct: "Add Product",
    addSale: "New Sale",
    addSupplier: "Add Supplier",
    quickActions: "Quick Actions",
    recentTransactions: "Recent Transactions",
    salesOverview: "Sales Overview",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    mpesa: "M-Pesa",
    cash: "Cash",
    credit: "Credit",
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
    productName: "Product Name",
    category: "Category",
    quantity: "Quantity",
    buyingPrice: "Buying Price (KSh)",
    sellingPrice: "Selling Price (KSh)",
    supplier: "Supplier",
    save: "Save Product",
    cancel: "Cancel",
    uploadImage: "Upload Image",
    items: "Items",
    amount: "Amount",
    payment: "Payment",
    status: "Status",
    time: "Time",
    customer: "Customer",
    noNotifications: "No new notifications",
    markAllRead: "Mark all as read",
    youAreOffline: "You are offline",
    queuedActions: "actions will sync when back online",
    backOnline: "Back online - syncing...",
    lowStockAlert: "Low Stock Alert",
    units: "units left",
    revenue: "revenue",
    fromYesterday: "from yesterday",
    actionRequired: "Action Required",
    awaitingDelivery: "Awaiting Delivery",
    todayVsYesterday: "vs yesterday",
    fromLastWeek: "from last week",
    noData: "No data available",
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    installApp: "Install DukaManager",
    installAppDesc: "Add to your home screen for quick access",
  },
  sw: {
    dashboard: "Dashibodi",
    inventory: "Hesabu",
    sales: "Mauzo",
    suppliers: "Wauzaji",
    expenses: "Gharama",
    employees: "Wafanyakazi",
    customers: "Wateja",
    returns: "Rejesho",
    documents: "Hati",
    reports: "Ripoti",
    settings: "Mipangilio",
    help: "Msaada",
    todaysSales: "Mauzo ya Leo",
    lowStock: "Bidhaa Zinazopungua",
    pendingOrders: "Agizo Zinazosubiri",
    activeCustomers: "Wateja Hai",
    searchPlaceholder: "Tafuta bidhaa, mauzo, wateja...",
    notifications: "Arifa",
    profile: "Wasifu",
    logout: "Toka",
    switchShop: "Badilisha Duka",
    addProduct: "Ongeza Bidhaa",
    addSale: "Uuzaji Mpya",
    addSupplier: "Ongeza Msambazaji",
    quickActions: "Vitendo vya Haraka",
    recentTransactions: "Miamala ya Hivi Karibuni",
    salesOverview: "Muhtasari wa Mauzo",
    daily: "Kila Siku",
    weekly: "Kila Wiki",
    monthly: "Kila Mwezi",
    mpesa: "M-Pesa",
    cash: "Pesa Taslimu",
    credit: "Deni",
    completed: "Imekamilika",
    pending: "Inasubiri",
    failed: "Imeshindwa",
    productName: "Jina la Bidhaa",
    category: "Aina",
    quantity: "Kiasi",
    buyingPrice: "Bei ya Kununua (KSh)",
    sellingPrice: "Bei ya Kuuza (KSh)",
    supplier: "Msambazaji",
    save: "Hifadhi Bidhaa",
    cancel: "Ghairi",
    uploadImage: "Pakia Picha",
    items: "Vitu",
    amount: "Kiasi",
    payment: "Malipo",
    status: "Hali",
    time: "Muda",
    customer: "Mteja",
    noNotifications: "Hakuna arifa mpya",
    markAllRead: "Weka zote kusoma",
    youAreOffline: "Huna mtandaoni",
    queuedActions: "vitendo vitasawazishwa utakaporejea mtandaoni",
    backOnline: "Umerudi mtandaoni - inasawazisha...",
    lowStockAlert: "Onyo la Hesabu Ndogo",
    units: "vipande vimabaki",
    revenue: "mapato",
    fromYesterday: "kutoka jana",
    actionRequired: "Inahitaji Hatua",
    awaitingDelivery: "Inasubiri Kuletwa",
    todayVsYesterday: "dhidi ya jana",
    fromLastWeek: "kutoka wiki iliyopita",
    noData: "Hakuna data",
    loading: "Inapakia...",
    error: "Kuna hitilafu",
    retry: "Jaribu tena",
    installApp: "Sakinisha DukaManager",
    installAppDesc: "Ongeza kwenye skrini yako kwa ufikiaji wa haraka",
  },
};

export function dt(
  key: DashboardTranslationKeys,
  locale: Locale = "en"
): string {
  return dashboardTranslations[locale][key];
}
