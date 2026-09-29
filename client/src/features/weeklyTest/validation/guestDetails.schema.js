import { z } from "zod";

export const guestDetailsSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    phone: z
        .string()
        .trim()
        .min(10, "Enter a valid phone number")
        .max(15, "Enter a valid phone number")
        .regex(/^\d+$/, "Phone number should contain only digits"),
    classLevel: z.string().trim().min(1, "Class is required").max(20),
});