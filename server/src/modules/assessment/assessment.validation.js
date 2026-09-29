import { z } from "zod";

export const createAssessmentSchema = z.object({
    body: z
        .object({
            title: z.string().trim().min(1).max(150),

            type: z
                .enum([
                    "weekly",
                    "chapter",
                    "unit",
                    "monthly",
                    "mock",
                    "practice",
                    "homework",
                    "scholarship",
                    "subject",
                ])
                .default("subject"),

            audience: z.enum(["BATCH", "PUBLIC", "ALL"]).default("ALL"),

            subject: z.string().trim().min(1).max(100),

            classLevel: z.string().trim().min(1).max(20).optional(),
            batchId: z.string().min(1).optional(),

            deadline: z.coerce.date().optional(),

            duration: z.coerce.number().int().positive().optional(),
            startDate: z.coerce.date().optional(),
            startTime: z.string().optional(),
            endTime: z.string().optional(),

            attemptsAllowed: z.coerce.number().int().positive().default(1),

            negativeMarking: z
                .object({
                    enabled: z.boolean().default(false),
                    marksPerWrong: z.number().nonnegative().default(0),
                })
                .default({ enabled: false, marksPerWrong: 0 }),
        }),
});

export const addQuestionSchema = z.object({
    body: z.object({
        questionText: z.string().trim().min(1),
        isLatex: z.boolean().default(false),
        imageUrl: z.string().url().optional().nullable(),

        options: z
            .array(
                z.object({
                    label: z.string().min(1),
                    text: z.string().min(1),
                })
            )
            .min(2, "At least 2 options are required"),

        correctAnswer: z.string().min(1, "Correct answer is required"),
        marks: z.number().positive().default(1),
        order: z.number().int().nonnegative(),
    }),
});

export const updateQuestionSchema = z.object({
    body: z.object({
        questionText: z.string().trim().min(1).optional(),
        isLatex: z.boolean().optional(),
        imageUrl: z.string().url().optional().nullable(),

        options: z
            .array(
                z.object({
                    label: z.string().min(1),
                    text: z.string().min(1),
                })
            )
            .min(2, "At least 2 options are required")
            .optional(),

        correctAnswer: z.string().min(1).optional(),
        marks: z.number().positive().optional(),
        order: z.number().int().nonnegative().optional(),
    }),
});