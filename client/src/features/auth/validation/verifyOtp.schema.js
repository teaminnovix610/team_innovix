import { z } from "zod";

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});