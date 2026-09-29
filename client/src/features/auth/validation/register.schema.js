import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().optional(),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
    password: z.string().min(1, "Password is required"),
    role: z.enum(["TRAINEE", "TRAINER", "ADMIN", "STUDENT", "TEACHER"]),
    organization: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce.number().optional(),
    specialization: z.string().optional(),
    bio: z.string().optional(),
  });