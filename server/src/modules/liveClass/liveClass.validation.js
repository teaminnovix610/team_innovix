import { z } from "zod";

export const createLiveClassSchema = z.object({
    body: z.object({
        batchId: z.string(),

        title: z
            .string()
            .trim()
            .min(3)
            .max(100),

        description: z
            .string()
            .trim()
            .optional(),

        scheduledAt: z.string(),

        duration: z
            .number()
            .min(15)
            .max(300),
    }),
});