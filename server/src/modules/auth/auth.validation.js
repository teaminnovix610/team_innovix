import { z } from "zod";

const stringOrArray = z.union([z.string(), z.array(z.string())]).optional();

export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name cannot exceed 50 characters"),

    lastName: z
      .string()
      .trim()
      .max(50, "Last name cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),

    email: z.string().trim().toLowerCase().email("Invalid email address"),

    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

    password: z.string().min(1, "Password is required"),

    role: z.enum(["TRAINEE", "TRAINER", "ADMIN", "STUDENT", "TEACHER", "PARENT"]),

    organization: z.string().optional(),

    classLevel: z.string().trim().max(20).optional(),

    section: z.string().trim().max(10).optional(),

    board: z.enum(["CBSE", "ICSE", "STATE", "OTHER"]).optional(),

    schoolName: z.string().trim().max(100).optional(),

    qualification: z.string().trim().max(150).optional(),

    experience: z.union([z.number(), z.string()]).optional(),

    specialization: stringOrArray,

    skills: stringOrArray,

    interests: stringOrArray,

    bio: z.string().max(500).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    otp: z
      .string()
      .trim()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must contain only digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(1, "Password must be at least 4 characters"),
  }),
});