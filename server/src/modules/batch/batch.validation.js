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

export const assignCourseToTrainerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        classLevel: z.string().trim().min(1).max(20).optional().default("1"),
        teacherId: z.string().regex(/^[a-f\d]{24}$/i, "A valid trainer ID is required"),
        batchId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid batch ID").optional(),
        category: z.string().trim().optional(),
        description: z.string().trim().optional(),
    }).refine((data) => data.name || data.batchId, {
        message: "Course name or batch ID is required",
        path: ["name"],
    }),
});
