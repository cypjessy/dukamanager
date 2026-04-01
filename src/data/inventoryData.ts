import type { Locale } from "@/types";

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  mpesaPaybill: string;
  email?: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  nameSw: string;
  sku: string;
  category: string;
  categorySw: string;
  unit: "pieces" | "kg" | "liters" | "boxes" | "bottles" | "packs" | "jars";
  unitLabel: Record<Locale, string>;
  quantity: number;
  reorderPoint: number;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  supplierId: string;
  lastRestocked: string;
  expiryDate?: string;
  description: string;
  salesVelocity: number;
  warehouse: string;
  imageUrl?: string;
  createdAt: string;
}

export type StockStatus = "healthy" | "low" | "critical" | "out";

export type ViewMode = "table" | "kanban";

export function getStockStatus(product: Product): StockStatus {
  if (product.quantity === 0) return "out";
  if (product.quantity <= product.reorderPoint * 0.3) return "critical";
  if (product.quantity <= product.reorderPoint) return "low";
  return "healthy";
}

export function getProfitMargin(product: Product): number {
  if (product.sellingPrice === 0) return 0;
  return Math.round(
    ((product.sellingPrice - product.buyingPrice) / product.sellingPrice) * 100
  );
}

export function getDaysUntilStockout(product: Product): number {
  if (product.salesVelocity <= 0) return 999;
  return Math.floor(product.quantity / product.salesVelocity);
}

export const suppliers: Supplier[] = [
  { id: "s1", name: "Bidco Africa", phone: "0722 100 200", mpesaPaybill: "222888", location: "Ruaraka, Nairobi" },
  { id: "s2", name: "Unilever Kenya", phone: "0733 200 300", mpesaPaybill: "333999", location: "Industrial Area" },
  { id: "s3", name: "CCBA Kenya", phone: "0711 300 400", mpesaPaybill: "444111", location: "Embakasi" },
  { id: "s4", name: "KETEPA Ltd", phone: "0720 400 500", mpesaPaybill: "555222", location: "Kericho" },
  { id: "s5", name: "Unga Group", phone: "0734 500 600", mpesaPaybill: "666333", location: "Nakuru" },
  { id: "s6", name: "KCC", phone: "0712 600 700", mpesaPaybill: "777444", location: "Dairy Rd, Nairobi" },
  { id: "s7", name: "Reckitt Kenya", phone: "0723 700 800", mpesaPaybill: "888555", location: "Mombasa Rd" },
  { id: "s8", name: "Safaricom Wholesale", phone: "0700 800 900", mpesaPaybill: "999666", location: "Westlands" },
  { id: "s9", name: "Mombasa Millers", phone: "0711 900 100", mpesaPaybill: "111777", location: "Mombasa" },
  { id: "s10", name: "Local Farmers Co-op", phone: "0722 111 222", mpesaPaybill: "222111", location: "Limuru" },
];

export const inventoryProducts: Product[] = [
  // Cereals
  { id: "p1", name: "Pembe Maize Flour 2kg", nameSw: "Pembe Unga wa Mahindi 2kg", sku: "CER-001", category: "cereals", categorySw: "Nafaka", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 45, reorderPoint: 20, buyingPrice: 120, sellingPrice: 150, wholesalePrice: 135, supplierId: "s5", lastRestocked: "2026-03-20", description: "Popular maize flour for ugali", salesVelocity: 8, warehouse: "Shelf A1", createdAt: "2025-06-01" },
  { id: "p2", name: "Soko Ugali 2kg", nameSw: "Soko Ugali 2kg", sku: "CER-002", category: "cereals", categorySw: "Nafaka", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 60, reorderPoint: 25, buyingPrice: 110, sellingPrice: 140, wholesalePrice: 125, supplierId: "s5", lastRestocked: "2026-03-21", description: "Fortified maize meal", salesVelocity: 10, warehouse: "Shelf A1", createdAt: "2025-06-01" },
  { id: "p3", name: "Jogoo Maize Flour 1kg", nameSw: "Jogoo Unga 1kg", sku: "CER-003", category: "cereals", categorySw: "Nafaka", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 35, reorderPoint: 15, buyingPrice: 65, sellingPrice: 80, wholesalePrice: 72, supplierId: "s5", lastRestocked: "2026-03-19", description: "Affordable maize flour", salesVelocity: 6, warehouse: "Shelf A2", createdAt: "2025-06-01" },
  { id: "p4", name: "Rice Pishori 2kg", nameSw: "Mchele Pishori 2kg", sku: "CER-004", category: "cereals", categorySw: "Nafaka", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 18, reorderPoint: 10, buyingPrice: 250, sellingPrice: 320, wholesalePrice: 280, supplierId: "s9", lastRestocked: "2026-03-15", description: "Premium pishori rice", salesVelocity: 4, warehouse: "Shelf A3", createdAt: "2025-07-01" },
  { id: "p5", name: "Ndengu 1kg", nameSw: "Ndengu 1kg", sku: "CER-005", category: "cereals", categorySw: "Nafaka", unit: "kg", unitLabel: { en: "kg", sw: "kilo" }, quantity: 8, reorderPoint: 10, buyingPrice: 120, sellingPrice: 160, wholesalePrice: 140, supplierId: "s10", lastRestocked: "2026-03-18", description: "Green grams", salesVelocity: 3, warehouse: "Shelf A4", createdAt: "2025-07-15" },
  { id: "p6", name: "Sugar 2kg", nameSw: "Sukari 2kg", sku: "CER-006", category: "cereals", categorySw: "Nafaka", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 30, reorderPoint: 15, buyingPrice: 210, sellingPrice: 260, wholesalePrice: 230, supplierId: "s9", lastRestocked: "2026-03-22", description: "White sugar", salesVelocity: 7, warehouse: "Shelf A5", createdAt: "2025-06-01" },

  // Cooking Oil
  { id: "p7", name: "Elianto Cooking Oil 1L", nameSw: "Mafuta ya Elianto 1L", sku: "OIL-001", category: "cooking_oil", categorySw: "Mafuta ya Kupikia", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 8, reorderPoint: 15, buyingPrice: 280, sellingPrice: 330, wholesalePrice: 300, supplierId: "s1", lastRestocked: "2026-03-18", description: "Sunflower cooking oil", salesVelocity: 5, warehouse: "Shelf B1", createdAt: "2025-06-01" },
  { id: "p8", name: "Golden Fry Oil 2L", nameSw: "Golden Fry 2L", sku: "OIL-002", category: "cooking_oil", categorySw: "Mafuta ya Kupikia", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 12, reorderPoint: 8, buyingPrice: 450, sellingPrice: 530, wholesalePrice: 485, supplierId: "s1", lastRestocked: "2026-03-20", description: "Vegetable cooking oil 2L", salesVelocity: 3, warehouse: "Shelf B1", createdAt: "2025-06-15" },
  { id: "p9", name: "Rina Cooking Oil 500ml", nameSw: "Rina Mafuta 500ml", sku: "OIL-003", category: "cooking_oil", categorySw: "Mafuta ya Kupikia", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 0, reorderPoint: 10, buyingPrice: 150, sellingPrice: 185, wholesalePrice: 165, supplierId: "s1", lastRestocked: "2026-03-10", description: "Affordable cooking oil", salesVelocity: 4, warehouse: "Shelf B2", createdAt: "2025-07-01" },

  // Soap & Detergents
  { id: "p10", name: "Omo Washing Powder 1kg", nameSw: "Omo Powder ya Kufua 1kg", sku: "SOP-001", category: "soap", categorySw: "Sabuni", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 32, reorderPoint: 10, buyingPrice: 250, sellingPrice: 300, wholesalePrice: 270, supplierId: "s2", lastRestocked: "2026-03-22", description: "Premium washing powder", salesVelocity: 4, warehouse: "Shelf C1", createdAt: "2025-06-01" },
  { id: "p11", name: "Dettol Soap x4", nameSw: "Sabuni ya Dettol x4", sku: "SOP-002", category: "soap", categorySw: "Sabuni", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 25, reorderPoint: 12, buyingPrice: 180, sellingPrice: 220, wholesalePrice: 195, supplierId: "s7", lastRestocked: "2026-03-20", description: "Antibacterial soap multipack", salesVelocity: 3, warehouse: "Shelf C1", createdAt: "2025-06-01" },
  { id: "p12", name: "Sunlight Bar Soap x3", nameSw: "Sunlight Sabuni x3", sku: "SOP-003", category: "soap", categorySw: "Sabuni", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 15, reorderPoint: 8, buyingPrice: 120, sellingPrice: 155, wholesalePrice: 135, supplierId: "s2", lastRestocked: "2026-03-19", description: "Laundry bar soap", salesVelocity: 5, warehouse: "Shelf C2", createdAt: "2025-06-15" },
  { id: "p13", name: "Jik Bleach 500ml", nameSw: "Jik 500ml", sku: "SOP-004", category: "soap", categorySw: "Sabuni", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 4, reorderPoint: 10, buyingPrice: 85, sellingPrice: 110, wholesalePrice: 95, supplierId: "s7", lastRestocked: "2026-03-14", description: "Household bleach", salesVelocity: 2, warehouse: "Shelf C3", createdAt: "2025-07-01" },
  { id: "p14", name: "Vim Dish Wash 750ml", nameSw: "Vim ya Vyombo 750ml", sku: "SOP-005", category: "soap", categorySw: "Sabuni", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 20, reorderPoint: 8, buyingPrice: 130, sellingPrice: 165, wholesalePrice: 145, supplierId: "s7", lastRestocked: "2026-03-21", description: "Dish washing liquid", salesVelocity: 3, warehouse: "Shelf C3", createdAt: "2025-07-01" },

  // Beverages
  { id: "p15", name: "Coca-Cola 500ml x12", nameSw: "Coca-Cola 500ml x12", sku: "BEV-001", category: "beverages", categorySw: "Vinywaji", unit: "boxes", unitLabel: { en: "boxes", sw: "masanduku" }, quantity: 5, reorderPoint: 10, buyingPrice: 420, sellingPrice: 540, wholesalePrice: 460, supplierId: "s3", lastRestocked: "2026-03-15", description: "Coca-Cola crate", salesVelocity: 6, warehouse: "Shelf D1", createdAt: "2025-06-01" },
  { id: "p16", name: "Ketepa Tea 250g", nameSw: "Ketepa Chai 250g", sku: "BEV-002", category: "beverages", categorySw: "Vinywaji", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 18, reorderPoint: 8, buyingPrice: 160, sellingPrice: 200, wholesalePrice: 175, supplierId: "s4", lastRestocked: "2026-03-19", description: "Kenya tea bags", salesVelocity: 3, warehouse: "Shelf D2", createdAt: "2025-06-01" },
  { id: "p17", name: "Nescafe Coffee 50g", nameSw: "Nescafe Kahawa 50g", sku: "BEV-003", category: "beverages", categorySw: "Vinywaji", unit: "jars", unitLabel: { en: "jars", sw: "mapipa" }, quantity: 6, reorderPoint: 5, buyingPrice: 320, sellingPrice: 390, wholesalePrice: 350, supplierId: "s2", lastRestocked: "2026-03-17", description: "Instant coffee", salesVelocity: 1, warehouse: "Shelf D2", createdAt: "2025-07-15" },
  { id: "p18", name: "Minute Maid 1L", nameSw: "Minute Maid 1L", sku: "BEV-004", category: "beverages", categorySw: "Vinywaji", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 22, reorderPoint: 10, buyingPrice: 120, sellingPrice: 160, wholesalePrice: 135, supplierId: "s3", lastRestocked: "2026-03-20", description: "Orange juice", salesVelocity: 4, warehouse: "Shelf D3", createdAt: "2025-07-01" },
  { id: "p19", name: "Stoney Ginger Soda 300ml x12", nameSw: "Stoney 300ml x12", sku: "BEV-005", category: "beverages", categorySw: "Vinywaji", unit: "boxes", unitLabel: { en: "boxes", sw: "masanduku" }, quantity: 3, reorderPoint: 6, buyingPrice: 300, sellingPrice: 420, wholesalePrice: 340, supplierId: "s3", lastRestocked: "2026-03-12", description: "Ginger soda crate", salesVelocity: 4, warehouse: "Shelf D1", createdAt: "2025-08-01" },
  { id: "p20", name: "Brookside Milk 500ml", nameSw: "Maziwa ya Brookside 500ml", sku: "BEV-006", category: "beverages", categorySw: "Vinywaji", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 2, reorderPoint: 20, buyingPrice: 55, sellingPrice: 70, wholesalePrice: 60, supplierId: "s6", lastRestocked: "2026-03-25", description: "Fresh milk", salesVelocity: 15, warehouse: "Fridge", createdAt: "2025-06-01" },

  // Snacks
  { id: "p21", name: "Kabras Mandazi Flour 1kg", nameSw: "Unga wa Mandazi 1kg", sku: "SNK-001", category: "snacks", categorySw: "Vitafunio", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 28, reorderPoint: 12, buyingPrice: 95, sellingPrice: 125, wholesalePrice: 108, supplierId: "s5", lastRestocked: "2026-03-21", description: "Self-raising mandazi flour", salesVelocity: 4, warehouse: "Shelf E1", createdAt: "2025-07-01" },
  { id: "p22", name: "Tropical Heat Crisps 50g x12", nameSw: "Tropical Heat 50g x12", sku: "SNK-002", category: "snacks", categorySw: "Vitafunio", unit: "boxes", unitLabel: { en: "boxes", sw: "masanduku" }, quantity: 7, reorderPoint: 5, buyingPrice: 360, sellingPrice: 480, wholesalePrice: 400, supplierId: "s1", lastRestocked: "2026-03-18", description: "Assorted crisps box", salesVelocity: 2, warehouse: "Shelf E2", createdAt: "2025-08-01" },
  { id: "p23", name: "Glucose Biscuits 200g", nameSw: "Biskuti Glukosi 200g", sku: "SNK-003", category: "snacks", categorySw: "Vitafunio", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 40, reorderPoint: 15, buyingPrice: 45, sellingPrice: 60, wholesalePrice: 50, supplierId: "s9", lastRestocked: "2026-03-22", description: "Energy biscuits", salesVelocity: 6, warehouse: "Shelf E1", createdAt: "2025-06-15" },
  { id: "p24", name: "Bounty Choc 50g x24", nameSw: "Bounty Choko 50g x24", sku: "SNK-004", category: "snacks", categorySw: "Vitafunio", unit: "boxes", unitLabel: { en: "boxes", sw: "masanduku" }, quantity: 2, reorderPoint: 3, buyingPrice: 720, sellingPrice: 960, wholesalePrice: 800, supplierId: "s1", lastRestocked: "2026-03-10", description: "Coconut chocolate bars", salesVelocity: 1, warehouse: "Shelf E3", createdAt: "2025-09-01" },

  // Household
  { id: "p25", name: "Nice & Lovely Air Freshener", nameSw: "Nice & Lovely", sku: "HOU-001", category: "household", categorySw: "Vit vya Nyumbani", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 14, reorderPoint: 6, buyingPrice: 180, sellingPrice: 230, wholesalePrice: 200, supplierId: "s7", lastRestocked: "2026-03-17", description: "Room air freshener", salesVelocity: 2, warehouse: "Shelf F1", createdAt: "2025-07-15" },
  { id: "p26", name: "Clorox Wipes 40s", nameSw: "Clorox 40", sku: "HOU-002", category: "household", categorySw: "Vit vya Nyumbani", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 9, reorderPoint: 5, buyingPrice: 250, sellingPrice: 320, wholesalePrice: 280, supplierId: "s7", lastRestocked: "2026-03-16", description: "Cleaning wipes", salesVelocity: 1, warehouse: "Shelf F1", createdAt: "2025-08-01" },
  { id: "p27", name: "Batteries AA x4", nameSw: "Betri AA x4", sku: "HOU-003", category: "household", categorySw: "Vit vya Nyumbani", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 25, reorderPoint: 10, buyingPrice: 120, sellingPrice: 160, wholesalePrice: 138, supplierId: "s8", lastRestocked: "2026-03-20", description: "Alkaline AA batteries", salesVelocity: 3, warehouse: "Shelf F2", createdAt: "2025-06-01" },
  { id: "p28", name: "Phone Charger Cable USB-C", nameSw: "Chaja ya Simu USB-C", sku: "HOU-004", category: "household", categorySw: "Vit vya Nyumbani", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 11, reorderPoint: 5, buyingPrice: 150, sellingPrice: 250, wholesalePrice: 180, supplierId: "s8", lastRestocked: "2026-03-15", description: "Fast charging cable", salesVelocity: 2, warehouse: "Shelf F2", createdAt: "2025-09-01" },
  { id: "p29", name: "LED Bulb 10W", nameSw: "Taa ya LED 10W", sku: "HOU-005", category: "household", categorySw: "Vit vya Nyumbani", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 18, reorderPoint: 8, buyingPrice: 80, sellingPrice: 130, wholesalePrice: 95, supplierId: "s8", lastRestocked: "2026-03-18", description: "Energy saving bulb", salesVelocity: 2, warehouse: "Shelf F3", createdAt: "2025-07-01" },
  { id: "p30", name: "Plastic Basin Medium", nameSw: "Bakuli la Plastiki", sku: "HOU-006", category: "household", categorySw: "Vit vya Nyumbani", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 6, reorderPoint: 4, buyingPrice: 120, sellingPrice: 180, wholesalePrice: 140, supplierId: "s9", lastRestocked: "2026-03-12", description: "Multi-purpose basin", salesVelocity: 1, warehouse: "Shelf F4", createdAt: "2025-08-01" },

  // Farming
  { id: "p31", name: "DAP Fertilizer 1kg", nameSw: "Mbolea DAP 1kg", sku: "FAR-001", category: "farming", categorySw: "Bidhaa za Kilimo", unit: "kg", unitLabel: { en: "kg", sw: "kilo" }, quantity: 30, reorderPoint: 15, buyingPrice: 350, sellingPrice: 420, wholesalePrice: 380, supplierId: "s10", lastRestocked: "2026-03-20", description: "DAP fertilizer", salesVelocity: 3, warehouse: "Back Store", createdAt: "2025-06-01" },
  { id: "p32", name: "Hybrid Maize Seeds 1kg", nameSw: "Mbegu ya Mahindi 1kg", sku: "FAR-002", category: "farming", categorySw: "Bidhaa za Kilimo", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 15, reorderPoint: 8, buyingPrice: 450, sellingPrice: 550, wholesalePrice: 490, supplierId: "s10", lastRestocked: "2026-03-10", description: "High-yield maize seeds", salesVelocity: 2, warehouse: "Back Store", createdAt: "2025-07-01" },
  { id: "p33", name: "Pesticide Spray 500ml", nameSw: "Dawa ya Kuua Wadudu 500ml", sku: "FAR-003", category: "farming", categorySw: "Bidhaa za Kilimo", unit: "bottles", unitLabel: { en: "bottles", sw: "chupa" }, quantity: 0, reorderPoint: 5, buyingPrice: 280, sellingPrice: 350, wholesalePrice: 305, supplierId: "s10", lastRestocked: "2026-02-28", description: "Crop protection spray", salesVelocity: 1, warehouse: "Back Store", createdAt: "2025-08-01" },
  { id: "p34", name: "Jembe Handle", nameSw: "Mpini wa Jembe", sku: "FAR-004", category: "farming", categorySw: "Bidhaa za Kilimo", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 10, reorderPoint: 5, buyingPrice: 150, sellingPrice: 220, wholesalePrice: 175, supplierId: "s9", lastRestocked: "2026-03-05", description: "Wooden hoe handle", salesVelocity: 1, warehouse: "Back Store", createdAt: "2025-07-15" },

  // Emergency
  { id: "p35", name: "Safaricom Airtime KSh 100", nameSw: "Airtime ya Safaricom 100", sku: "EMG-001", category: "emergency", categorySw: "Dharura", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 100, reorderPoint: 50, buyingPrice: 98, sellingPrice: 100, wholesalePrice: 99, supplierId: "s8", lastRestocked: "2026-03-25", description: "Safaricom scratch card", salesVelocity: 20, warehouse: "Counter", createdAt: "2025-06-01" },
  { id: "p36", name: "Airtel Airtime KSh 50", nameSw: "Airtime ya Airtel 50", sku: "EMG-002", category: "emergency", categorySw: "Dharura", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 50, reorderPoint: 25, buyingPrice: 49, sellingPrice: 50, wholesalePrice: 49.5, supplierId: "s8", lastRestocked: "2026-03-24", description: "Airtel scratch card", salesVelocity: 8, warehouse: "Counter", createdAt: "2025-06-01" },
  { id: "p37", name: "Paracetamol 100s", nameSw: "Paracetamol 100", sku: "EMG-003", category: "emergency", categorySw: "Dharura", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 12, reorderPoint: 5, buyingPrice: 180, sellingPrice: 250, wholesalePrice: 200, supplierId: "s7", lastRestocked: "2026-03-15", description: "Pain relief tablets", salesVelocity: 2, warehouse: "Counter", createdAt: "2025-07-01" },
  { id: "p38", name: "Matchbox x10", nameSw: "Kibiriti x10", sku: "EMG-004", category: "emergency", categorySw: "Dharura", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 45, reorderPoint: 20, buyingPrice: 30, sellingPrice: 50, wholesalePrice: 35, supplierId: "s9", lastRestocked: "2026-03-20", description: "Safety matchboxes", salesVelocity: 5, warehouse: "Counter", createdAt: "2025-06-01" },
  { id: "p39", name: "Candle Pack x6", nameSw: "Mshumaa x6", sku: "EMG-005", category: "emergency", categorySw: "Dharura", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 3, reorderPoint: 8, buyingPrice: 60, sellingPrice: 90, wholesalePrice: 70, supplierId: "s9", lastRestocked: "2026-03-08", description: "Emergency candles", salesVelocity: 3, warehouse: "Shelf F5", createdAt: "2025-06-15" },

  // Dairy
  { id: "p40", name: "KCC Milk 500ml", nameSw: "Maziwa ya KCC 500ml", sku: "DAI-001", category: "dairy", categorySw: "Maziwa", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 3, reorderPoint: 20, buyingPrice: 55, sellingPrice: 70, wholesalePrice: 60, supplierId: "s6", lastRestocked: "2026-03-25", description: "Fresh pasteurized milk", salesVelocity: 15, warehouse: "Fridge", createdAt: "2025-06-01" },
  { id: "p41", name: "Blueband Margarine 500g", nameSw: "Blueband 500g", sku: "DAI-002", category: "dairy", categorySw: "Maziwa", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 12, reorderPoint: 10, buyingPrice: 220, sellingPrice: 270, wholesalePrice: 240, supplierId: "s1", lastRestocked: "2026-03-17", description: "Margarine spread", salesVelocity: 3, warehouse: "Shelf B3", createdAt: "2025-06-01" },
  { id: "p42", name: "Mala Fermented Milk 500ml", nameSw: "Mala 500ml", sku: "DAI-003", category: "dairy", categorySw: "Maziwa", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 8, reorderPoint: 10, buyingPrice: 60, sellingPrice: 80, wholesalePrice: 68, supplierId: "s6", lastRestocked: "2026-03-24", description: "Fermented milk drink", salesVelocity: 6, warehouse: "Fridge", createdAt: "2025-07-01" },

  // Personal Care
  { id: "p43", name: "Colgate Toothpaste 100ml", nameSw: "Colgate 100ml", sku: "PER-001", category: "personal", categorySw: "Utunzaji wa Mwili", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 20, reorderPoint: 8, buyingPrice: 150, sellingPrice: 200, wholesalePrice: 170, supplierId: "s2", lastRestocked: "2026-03-19", description: "Toothpaste with fluoride", salesVelocity: 3, warehouse: "Shelf G1", createdAt: "2025-06-01" },
  { id: "p44", name: "Nice & Lovely Petroleum Jelly", nameSw: "Nice & Lovely Jelly", sku: "PER-002", category: "personal", categorySw: "Utunzaji wa Mwili", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 16, reorderPoint: 6, buyingPrice: 80, sellingPrice: 120, wholesalePrice: 95, supplierId: "s2", lastRestocked: "2026-03-18", description: "Moisturizing jelly", salesVelocity: 2, warehouse: "Shelf G1", createdAt: "2025-07-01" },
  { id: "p45", name: "Shower Guard Soap x3", nameSw: "Shower Guard x3", sku: "PER-003", category: "personal", categorySw: "Utunzaji wa Mwili", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 10, reorderPoint: 5, buyingPrice: 160, sellingPrice: 210, wholesalePrice: 180, supplierId: "s2", lastRestocked: "2026-03-16", description: "Bath soap multipack", salesVelocity: 2, warehouse: "Shelf G2", createdAt: "2025-08-01" },
  { id: "p46", name: "Sanitary Pads x10", nameSw: "Taulo za Wanawake x10", sku: "PER-004", category: "personal", categorySw: "Utunzaji wa Mwili", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 22, reorderPoint: 10, buyingPrice: 120, sellingPrice: 170, wholesalePrice: 140, supplierId: "s2", lastRestocked: "2026-03-20", description: "Feminine hygiene pads", salesVelocity: 4, warehouse: "Shelf G3", createdAt: "2025-06-01" },

  // Additional products
  { id: "p47", name: "Pencil HB x12", nameSw: "Kalamu ya Penseli x12", sku: "HOU-007", category: "household", categorySw: "Vit vya Nyumbani", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 30, reorderPoint: 10, buyingPrice: 60, sellingPrice: 100, wholesalePrice: 75, supplierId: "s9", lastRestocked: "2026-03-20", description: "HB graphite pencils", salesVelocity: 2, warehouse: "Shelf F5", createdAt: "2025-08-01" },
  { id: "p48", name: "Exercise Book 96pg x6", nameSw: "Daftari 96pg x6", sku: "HOU-008", category: "household", categorySw: "Vit vya Nyumbani", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 15, reorderPoint: 8, buyingPrice: 180, sellingPrice: 270, wholesalePrice: 210, supplierId: "s9", lastRestocked: "2026-03-18", description: "School exercise books", salesVelocity: 3, warehouse: "Shelf F5", createdAt: "2025-08-01" },
  { id: "p49", name: "Elasticated Bandages x2", nameSw: "Bendi x2", sku: "EMG-006", category: "emergency", categorySw: "Dharura", unit: "packs", unitLabel: { en: "packs", sw: "pakiti" }, quantity: 8, reorderPoint: 3, buyingPrice: 80, sellingPrice: 120, wholesalePrice: 95, supplierId: "s7", lastRestocked: "2026-03-14", description: "First aid bandages", salesVelocity: 1, warehouse: "Counter", createdAt: "2025-09-01" },
  { id: "p50", name: "Ndizi Banana Bundle", nameSw: "Mzigo wa Ndizi", sku: "DAI-004", category: "dairy", categorySw: "Maziwa", unit: "pieces", unitLabel: { en: "pcs", sw: "vipande" }, quantity: 5, reorderPoint: 3, buyingPrice: 200, sellingPrice: 300, wholesalePrice: 250, supplierId: "s10", lastRestocked: "2026-03-26", description: "Fresh bananas - perishable", salesVelocity: 2, warehouse: "Display", expiryDate: "2026-03-30", createdAt: "2025-06-01" },
];
