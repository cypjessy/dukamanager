import type { Locale } from "@/types";

export interface NavItemData {
  key: string;
  href: string;
  icon: React.ReactNode;
  label: Record<Locale, string>;
  badge?: number;
  badgeColor?: string;
  children?: NavItemData[];
  shortcut?: string;
}

export interface SidebarState {
  expanded: boolean;
  isMobile: boolean;
  activeRoute: string;
}

export const desktopNavItems: NavItemData[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: { en: "Dashboard", sw: "Dashibodi" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    shortcut: "Ctrl+1",
  },
  {
    key: "pos",
    href: "/dashboard/pos",
    label: { en: "POS", sw: "POS" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    shortcut: "Ctrl+2",
  },
  {
    key: "sales",
    href: "/dashboard/sales",
    label: { en: "Sales", sw: "Mauzo" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    shortcut: "Ctrl+3",
  },
  {
    key: "inventory",
    href: "/dashboard/inventory",
    label: { en: "Inventory", sw: "Hesabu" },
    badge: 3,
    badgeColor: "bg-sunset-400",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    shortcut: "Ctrl+4",
  },
  {
    key: "customers",
    href: "/dashboard/customers",
    label: { en: "Customers", sw: "Wateja" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    shortcut: "Ctrl+4",
  },
  {
    key: "suppliers",
    href: "/dashboard/suppliers",
    label: { en: "Suppliers", sw: "Wauzaji" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    shortcut: "Ctrl+5",
  },
  {
    key: "employees",
    href: "/dashboard/employees",
    label: { en: "Employees", sw: "Wafanyakazi" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    shortcut: "Ctrl+6",
  },
  {
    key: "cashier-management",
    href: "/dashboard/cashier-management",
    label: { en: "Cashiers", sw: "Mabenki" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <circle cx="19" cy="7" r="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "expenses",
    href: "/dashboard/expenses",
    label: { en: "Expenses", sw: "Gharama" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "returns",
    href: "/dashboard/returns",
    label: { en: "Returns", sw: "Rejesho" },
    badge: 2,
    badgeColor: "bg-savanna-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    key: "documents",
    href: "/dashboard/documents",
    label: { en: "Documents", sw: "Hati" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: "reports",
    href: "/dashboard/reports",
    label: { en: "Reports", sw: "Ripoti" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    label: { en: "Settings", sw: "Mipangilio" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    key: "help",
    href: "/dashboard/help",
    label: { en: "Help", sw: "Msaada" },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export const mobilePrimaryNav = [
  { key: "dashboard", href: "/dashboard", label: { en: "Home", sw: "Nyumbani" } },
  { key: "pos", href: "/dashboard/pos", label: { en: "POS", sw: "POS" } },
  { key: "quick", href: "#", label: { en: "Quick", sw: "Haraka" } },
  { key: "inventory", href: "/dashboard/inventory", label: { en: "Stock", sw: "Hesabu" } },
  { key: "more", href: "#", label: { en: "More", sw: "Zaidi" } },
];

export const mobileMoreItems = [
  { key: "pos", href: "/dashboard/pos", label: { en: "POS", sw: "POS" } },
  { key: "customers", href: "/dashboard/customers", label: { en: "Customers", sw: "Wateja" } },
  { key: "suppliers", href: "/dashboard/suppliers", label: { en: "Suppliers", sw: "Wauzaji" } },
  { key: "employees", href: "/dashboard/employees", label: { en: "Employees", sw: "Wafanyakazi" } },
  { key: "cashier-management", href: "/dashboard/cashier-management", label: { en: "Cashiers", sw: "Mabenki" } },
  { key: "expenses", href: "/dashboard/expenses", label: { en: "Expenses", sw: "Gharama" } },
  { key: "returns", href: "/dashboard/returns", label: { en: "Returns", sw: "Rejesho" } },
  { key: "documents", href: "/dashboard/documents", label: { en: "Documents", sw: "Hati" } },
  { key: "reports", href: "/dashboard/reports", label: { en: "Reports", sw: "Ripoti" } },
  { key: "settings", href: "/dashboard/settings", label: { en: "Settings", sw: "Mipangilio" } },
  { key: "help", href: "/dashboard/help", label: { en: "Help", sw: "Msaada" } },
];
