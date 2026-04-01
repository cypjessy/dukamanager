import { z } from "zod";

export const cashPaymentSchema = z.object({
  method: z.literal("cash"),
  cashTendered: z.coerce.number().min(1, "Enter amount tendered"),
});

export const mpesaPaymentSchema = z.object({
  method: z.literal("mpesa"),
  phone: z.string().regex(/^(?:\+254|254|0)([7][0-9]{8})$/, "Enter valid phone number"),
});

export const creditPaymentSchema = z.object({
  method: z.literal("credit"),
  customerId: z.string().min(1, "Select a customer"),
});

export const bankPaymentSchema = z.object({
  method: z.literal("bank"),
  reference: z.string().min(1, "Enter reference number"),
});

export const paymentSchema = z.discriminatedUnion("method", [
  cashPaymentSchema,
  mpesaPaymentSchema,
  creditPaymentSchema,
  bankPaymentSchema,
]);

export interface CashPayment { method: "cash"; cashTendered: number; }
export interface MpesaPayment { method: "mpesa"; phone: string; }
export interface CreditPayment { method: "credit"; customerId: string; }
export interface BankPayment { method: "bank"; reference: string; }
export type PaymentInput = CashPayment | MpesaPayment | CreditPayment | BankPayment;
