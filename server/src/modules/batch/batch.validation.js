import { z } from "zod";

export const createBatchSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1)
            .max(100),

        classLevel: z
            .string()
            .trim()
            .min(1)
            .max(20),
    }),
});


export const assignStudentSchema = z.object({
    body: z.object({
        studentId: z.string().min(1, "Student Id is required"),
    }),
});