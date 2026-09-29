import { z } from "zod";

export const profileFormSchema = z.object({
    firstName: z.string().trim().min(2, "First name is required"),
    lastName: z.string().trim().min(2, "Last name is required"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),

    // Student
    classLevel: z.string().optional(),

    // Teacher
    qualification: z.string().optional(),
    experience: z.coerce.number().min(0).optional(),
    specialization: z.string().optional(), // comma-separated input, split before submit
    bio: z.string().optional(),
});