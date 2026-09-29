import { z } from "zod";

export const createPlaylistSchema = z.object({
    body: z.object({
        batchId: z.string(),

        title: z
            .string()
            .trim()
            .min(2)
            .max(100),
    }),
});

export const updatePlaylistSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(2)
            .max(100),
    }),
});

export const reorderPlaylistSchema = z.object({
    body: z.object({
        recordingIds: z.array(z.string()).min(1),
    }),
});