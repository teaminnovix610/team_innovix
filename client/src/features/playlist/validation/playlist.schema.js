import { z } from "zod";

export const playlistSchema = z.object({

    title: z
        .string()
        .trim()
        .min(2, "Title is too short")
        .max(100),

});