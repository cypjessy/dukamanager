import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  nameSw: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  buyingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  wholesalePrice: z.coerce.number().min(0, "Must be 0 or more"),
  quantity: z.coerce.number().min(0, "Must be 0 or more"),
  reorderPoint: z.coerce.number().min(0, "Must be 0 or more"),
  supplierId: z.string().optional(),
  warehouse: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
});

export interface ProductFormValues {
  name: string;
  nameSw: string;
  category: string;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  quantity: number;
  reorderPoint: number;
  supplierId: string;
  warehouse: string;
  expiryDate: string;
  description: string;
}
