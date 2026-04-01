import { z } from "zod";

export const expenseFormSchema = z.object({
  description: z.string().min(3, "Min 3 characters for audit trail"),
  category: z.string().min(1, "Select a category"),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Select payment method"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["business", "personal"]).default("business"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.string().optional(),
});

export interface ExpenseFormValues {
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  date: string;
  type: "business" | "personal";
  reference: string;
  notes: string;
  isRecurring: boolean;
  recurrenceFrequency: string;
}
