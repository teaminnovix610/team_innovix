import { z } from "zod";

export const saveAnswerSchema = z.object({
    body: z.object({
        questionId: z.string().min(1, "Question Id is required"),
        selectedOption: z.string().min(1).optional().nullable(),
        remainingTime: z.number().int().nonnegative().optional(),
    }),
});

export const startGuestAttemptSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).max(100),
        phone: z.string().trim().min(10).max(15),
        classLevel: z.string().trim().min(1).max(20),
    }),
});