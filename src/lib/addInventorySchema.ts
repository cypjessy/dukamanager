import { z } from "zod";

// Kenyan market categories with icon keys
export const INVENTORY_CATEGORIES = [
  { key: "cereals", label: "Cereals & Grains", labelSw: "Nafaka", icon: "grain", markup: 25 },
  { key: "cooking_oil", label: "Cooking Oil", labelSw: "Mafuta ya Kupika", icon: "oil", markup: 20 },
  { key: "soap", label: "Soap & Detergents", labelSw: "Sabuni", icon: "soap", markup: 30 },
  { key: "beverages", label: "Beverages", labelSw: "Vinywaji", icon: "cup", markup: 35 },
  { key: "snacks", label: "Snacks & Confectionery", labelSw: "Vitafunio", icon: "snack", markup: 40 },
  { key: "household", label: "Household Items", labelSw: "Vya Nyumbani", icon: "home", markup: 35 },
  { key: "farming", label: "Farming Inputs", labelSw: "Mbegu na Mbolea", icon: "plant", markup: 20 },
  { key: "emergency", label: "Emergency Supplies", labelSw: "Dharura", icon: "firstaid", markup: 50 },
  { key: "personal_care", label: "Personal Care", labelSw: "Huduma ya Kibinafsi", icon: "personal", markup: 35 },
  { key: "dairy", label: "Dairy & Fresh", labelSw: "Maziwa na Bidhaa Mpya", icon: "dairy", markup: 15 },
  { key: "meat", label: "Meat & Protein", labelSw: "Nyama", icon: "meat", markup: 20 },
  { key: "other", label: "Other", labelSw: "Nyingine", icon: "other", markup: 30 },
] as const;

export const UNIT_OPTIONS = [
  { value: "pieces", label: "Pieces", labelSw: "Vipande" },
  { value: "kg", label: "Kilograms", labelSw: "Kilogramu" },
  { value: "liters", label: "Liters", labelSw: "Lita" },
  { value: "boxes", label: "Boxes", labelSw: "Masanduku" },
  { value: "bottles", label: "Bottles", labelSw: "Chupa" },
  { value: "packs", label: "Packets", labelSw: "Vifurushi" },
  { value: "other", label: "Other", labelSw: "Nyingine" },
] as const;

export const QUICK_QUANTITIES = [10, 50, 100, 500, 1000];

export const WAREHOUSE_PRESETS = [
  "Shelf A", "Shelf B", "Shelf C", "Back Room", "Cold Storage", "Display", "Store Room",
];

export const newProductSchema = z.object({
  // Step 1: Product Details
  imageFile: z.instanceof(File).optional(),
  imageUrl: z.string().optional(),
  name: z.string().min(1, "Jina la bidhaa linahitajika / Product name is required").max(100),
  nameSw: z.string().max(100).optional(),
  category: z.string().min(1, "Chagua aina ya bidhaa / Select a category"),
  unit: z.string().min(1, "Chagua kipimo / Select a unit"),
  customUnit: z.string().optional(),
  sku: z.string().optional(),

  // Step 2: Pricing
  buyingPrice: z.coerce.number().min(1, "Weka bei ya kununulia / Enter cost price"),
  sellingPrice: z.coerce.number().min(1, "Weka bei ya kuuza / Enter selling price"),
  wholesalePrice: z.coerce.number().min(0).optional(),
  wholesaleMinQty: z.coerce.number().min(0).optional(),

  // Step 3: Stock Info
  quantity: z.coerce.number().min(0, "Weka idadi / Enter quantity"),
  reorderPoint: z.coerce.number().min(0),
  warehouse: z.string().optional(),
  expiryDate: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().max(500).optional(),

  // New supplier inline form
  newSupplierName: z.string().optional(),
  newSupplierPhone: z.string().optional(),
  newSupplierPaybill: z.string().optional(),

  // Step 4: Review confirmation
  confirmed: z.boolean().refine((v) => v === true, {
    message: "Thibitisha taarifa / Confirm the information",
  }),
}).refine((data) => data.sellingPrice >= data.buyingPrice, {
  message: "Bei ya kuuza lazima iwe zaidi ya bei ya kununulia / Selling price must be higher than cost",
  path: ["sellingPrice"],
}).refine((data) => {
  if (data.unit === "other" && !data.customUnit) return false;
  return true;
}, {
  message: "Weka kipimo chako / Enter your custom unit",
  path: ["customUnit"],
});

export type NewProductFormData = z.infer<typeof newProductSchema>;

export type WizardStep = 1 | 2 | 3 | 4;

export const STEP_LABELS: Record<WizardStep, { label: string; labelSw: string }> = {
  1: { label: "Product Details", labelSw: "Taarifa za Bidhaa" },
  2: { label: "Pricing", labelSw: "Bei" },
  3: { label: "Stock Info", labelSw: "Hesabu" },
  4: { label: "Review", labelSw: "Hakiki" },
};
