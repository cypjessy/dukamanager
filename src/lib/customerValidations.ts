import { z } from "zod";

const KENYAN_PHONE = /^(?:\+254|254|0)([7][0-9]{8})$/;

export const customerFormSchema = z.object({
  name: z.string().min(2, "Jina linahitajika / Name is required").max(100),
  nameSw: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().regex(KENYAN_PHONE, "Enter valid Kenyan phone (07XX XXX XXX)"),
  phoneAlt: z.string().optional().or(z.literal("")),
  email: z.string().email("Barua pepe si sahihi / Invalid email").optional().or(z.literal("")),
  customerType: z.enum(["regular", "credit"]).default("regular"),
  creditLimit: z.coerce.number().min(0).max(50000).default(0),
  address: z.string().max(200).optional().or(z.literal("")),
  landmark: z.string().max(100).optional().or(z.literal("")),
  ward: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  referralSource: z.string().optional().or(z.literal("")),
  enrollLoyalty: z.boolean().default(false),
  preferredPayment: z.enum(["mpesa", "cash", "credit"]).default("mpesa"),
}).refine((data) => {
  if (data.customerType === "credit" && data.creditLimit < 500) return false;
  return true;
}, {
  message: "Credit limit must be at least KSh 500 / Kikomo kidogo ni KSh 500",
  path: ["creditLimit"],
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const REFERRAL_SOURCES = [
  { value: "word_of_mouth", label: "Word of Mouth", labelSw: "Kinywa kwa Kinywa" },
  { value: "social_media", label: "Social Media", labelSw: "Mitandao ya Kijamii" },
  { value: "walk_in", label: "Walk-in", labelSw: "Alitembea" },
  { value: "advertisement", label: "Advertisement", labelSw: "Tangazo" },
  { value: "other", label: "Other", labelSw: "Nyingine" },
];

export const KENYAN_WARDS = [
  "Umoja", "Kayole", "Eastleigh", "Donholm", "Buruburu", "South B", "South C",
  "Komarock", "Kasarani", "Mwiki", "Pipeline", "Westlands", "Githurai",
  "Embakasi", "Dandora", "Mathare", "Kibera", "Karen", "Runda", "Lavington",
  "Kilimani", "Hurlingham", "Kileleshwa", "Langata", "South C", "Mlolongo",
  "Athi River", "Kitengela", "Rongai", "Thika", "Kiambu", "Ruiru", "Juja",
];
