import { z } from "zod";

const stringOrArray = z.union([z.string(), z.array(z.string())]).optional();

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional().or(z.literal("")),
    lastName: z.string().trim().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    organization: z.string().optional().or(z.literal("")),
    bio: z.string().optional().or(z.literal("")),
    classLevel: z.string().optional().or(z.literal("")),
    qualification: z.string().optional().or(z.literal("")),
    experience: z.union([z.number(), z.string()]).optional(),
    specialization: stringOrArray,
    skills: stringOrArray,
    interests: stringOrArray,
    subjects: stringOrArray,
    competencies: z.array(z.any()).optional(),
    qualifications: z.array(z.any()).optional(),
    workExperience: z.array(z.any()).optional(),
    certificates: z.array(z.any()).optional(),
    skillsInput: z.string().optional(),
    interestsInput: z.string().optional(),
  }),
});