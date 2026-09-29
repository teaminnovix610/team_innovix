import { z } from "zod";

export const liveClassSchema = z.object({

    title: z
        .string()
        .min(3, "Title is required"),

    description: z
        .string()
        .optional(),

    scheduledAt: z
        .string(),

    duration: z
        .number(),

});