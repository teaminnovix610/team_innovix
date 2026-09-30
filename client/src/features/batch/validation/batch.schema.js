import { z } from "zod";

export const batchSchema = z.object({

    name: z.string().min(2),

    classLevel: z
        .string()
        .min(1)
        .regex(/^[0-9]+$/, "Class level must be a number only, e.g. 1, 10, 12"),

});

export const assignedBatchSchema = batchSchema.extend({
    teacherId: z.string().regex(/^[a-f\d]{24}$/i, "Choose an approved trainer"),
});
