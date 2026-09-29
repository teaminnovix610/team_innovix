import { z } from "zod";

export const saveWhiteboardSchema = z.object({
  body: z.object({
    elements: z.array(z.record(z.any())).default([]),
    updatedBy: z.string().trim().min(1).max(100).optional(),
  }),
});