import { z } from "zod";

const phoneRegex = /^(?:\+254|254|0)([7][0-9]{8})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Required" })
    .refine(
      (val) => phoneRegex.test(val) || emailRegex.test(val),
      { message: "Enter a valid phone or email" }
    ),
  password: z
    .string()
    .min(6, { message: "Min 6 characters" })
    .max(128, { message: "Max 128 characters" }),
  rememberDevice: z.boolean(),
});

export interface LoginSchemaType {
  identifier: string;
  password: string;
  rememberDevice: boolean;
}
