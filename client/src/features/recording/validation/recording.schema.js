import { z } from "zod";

export const recordingSchema = z.object({

    title: z
        .string()
        .trim()
        .min(3, "Title is too short")
        .max(150),

    youtubeUrl: z
        .string()
        .trim()
        .url("Enter a valid URL")
        .refine(
            (url) => /youtube\.com\/watch\?v=|youtu\.be\//.test(url),
            "Must be a YouTube link"
        ),

    playlistId: z
        .string()
        .optional(),

});