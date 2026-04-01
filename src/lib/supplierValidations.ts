import { z } from "zod";

const KENYAN_PHONE = /^(?:\+254|254|0)([7][0-9]{8})$/;
const KRA_PIN = /^[A-Z][0-9]{9}[A-Z]$/;

export const supplierFormSchema = z.object({
  // Step 1: Business Information
  name: z.string().min(2, "Jina la biashara linahitajika / Business name required").max(100),
  supplierType: z.enum(["wholesaler", "manufacturer", "distributor", "agent"]).default("wholesaler"),
  categoriesSupplied: z.array(z.string()).min(1, "Select at least one category / Chagua angalau aina moja"),
  regNumber: z.string().max(30).optional().or(z.literal("")),
  kraPin: z.string().regex(KRA_PIN, "Invalid KRA PIN (e.g. P051234567A)").optional().or(z.literal("")),

  // Step 2: Contact & Terms
  contactPerson: z.string().min(2, "Jina la mtu linahitajika / Contact name required").max(100),
  contactRole: z.enum(["owner", "manager", "sales_rep", "driver"]).default("owner"),
  phone: z.string().regex(KENYAN_PHONE, "Enter valid Kenyan phone (07XX XXX XXX)"),
  phoneAlt: z.string().optional().or(z.literal("")),
  mpesaNumber: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Barua pepe si sahihi / Invalid email").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  county: z.string().optional().or(z.literal("")),
  deliveryTerms: z.enum(["same_day", "next_day", "2_3_days", "weekly"]).default("next_day"),
  paymentTerms: z.enum(["cod", "net_7", "net_14", "net_30", "credit"]).default("cod"),
  minOrderAmount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export const SUPPLIER_TYPES = [
  { value: "wholesaler", label: "Wholesaler", labelSw: "Mjumbe" },
  { value: "manufacturer", label: "Manufacturer", labelSw: "Mtengenezaji" },
  { value: "distributor", label: "Distributor", labelSw: "Msambazaji" },
  { value: "agent", label: "Agent", labelSw: "Wakala" },
];

export const PRODUCT_CATEGORIES = [
  { value: "cereals", label: "Cereals & Grains", labelSw: "Nafaka", icon: "grain" },
  { value: "cooking_oil", label: "Cooking Oil", labelSw: "Mafuta", icon: "oil" },
  { value: "soap", label: "Soap & Detergents", labelSw: "Sabuni", icon: "soap" },
  { value: "beverages", label: "Beverages", labelSw: "Vinywaji", icon: "cup" },
  { value: "snacks", label: "Snacks", labelSw: "Vitafunio", icon: "snack" },
  { value: "household", label: "Household Items", labelSw: "Vya Nyumbani", icon: "home" },
  { value: "farming", label: "Farming Inputs", labelSw: "Mbolea", icon: "plant" },
  { value: "emergency", label: "Emergency Supplies", labelSw: "Dharura", icon: "firstaid" },
];

export const CONTACT_ROLES = [
  { value: "owner", label: "Owner", labelSw: "Mmiliki" },
  { value: "manager", label: "Manager", labelSw: "Meneja" },
  { value: "sales_rep", label: "Sales Rep", labelSw: "Mwakilishi" },
  { value: "driver", label: "Driver", labelSw: "Dereva" },
];

export const DELIVERY_TERMS = [
  { value: "same_day", label: "Same Day", labelSw: "Siku Moja" },
  { value: "next_day", label: "Next Day", labelSw: "Siku ya Pili" },
  { value: "2_3_days", label: "2-3 Days", labelSw: "Siku 2-3" },
  { value: "weekly", label: "Weekly", labelSw: "Kila Wiki" },
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: "cod", label: "Cash on Delivery", labelSw: "Lipa Ukipokea" },
  { value: "net_7", label: "Net 7", labelSw: "Siku 7" },
  { value: "net_14", label: "Net 14", labelSw: "Siku 14" },
  { value: "net_30", label: "Net 30", labelSw: "Siku 30" },
  { value: "credit", label: "Credit Limit", labelSw: "Kikomo" },
];

export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kiambu", "Machakos",
  "Kajiado", "Nyeri", "Meru", "Embu", "Kericho", "Nandi", "Kakamega",
  "Bungoma", "Busia", "Siaya", "Kilifi", "Kwale", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Kitui",
  "Makueni", "Nyandarua", "Nyamira", "Trans Nzoia", "Uasin Gishu",
  "Turkana", "Samburu", "West Pokot", "Laikipia",
];

export const MPESA_RANGES = [
  { value: "same_day", label: "Same Day", labelSw: "Siku Moja", days: 0 },
  { value: "next_day", label: "Next Day", labelSw: "Siku ya Pili", days: 1 },
  { value: "2_3_days", label: "2-3 Days", labelSw: "Siku 2-3", days: 3 },
  { value: "weekly", label: "Weekly", labelSw: "Kila Wiki", days: 7 },
];

export const paymentTermLabels: Record<string, { label: string; labelSw: string; color: string }> = {
  cod: { label: "Cash on Delivery", labelSw: "Lipa Ukipokea", color: "bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400" },
  net_7: { label: "Net 7 Days", labelSw: "Siku 7", color: "bg-savanna-100 dark:bg-savanna-900/30 text-savanna-700 dark:text-savanna-400" },
  net_14: { label: "Net 14 Days", labelSw: "Siku 14", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400" },
  net_30: { label: "Net 30 Days", labelSw: "Siku 30", color: "bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400" },
  credit: { label: "Credit Available", labelSw: "Mkopo", color: "bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400" },
};
