import { z } from "zod";

export const shopSettingsSchema = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  legalName: z.string().optional(),
  kraPin: z.string().regex(/^[A-Z][0-9]{9}[A-Z]$/, "Invalid KRA PIN").optional().or(z.literal("")),
  regNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^(?:\+254|254|0)([7][0-9]{8})$/, "Invalid Kenyan phone"),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
});

export const mpesaConfigSchema = z.object({
  tillNumber: z.string().min(1, "Till or Paybill required"),
  provider: z.string().min(1, "Select provider"),
  shortcode: z.string().optional(),
  passkey: z.string().optional(),
});

export type ShopSettingsValues = z.infer<typeof shopSettingsSchema>;
export type MpesaConfigValues = z.infer<typeof mpesaConfigSchema>;
