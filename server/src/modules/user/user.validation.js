import { z } from "zod";

export const updateUserSchema = z.object({
    body: z.object({
        firstName: z.string().trim().min(2).optional(),
        lastName: z.string().trim().min(2).optional(),
        phone: z
            .string()
            .regex(/^[6-9]\d{9}$/)
            .optional(),

        isActive: z.boolean().optional(),
    }),
});