import { z } from "zod";

export const createRecordingSchema = z.object({
  body: z.object({
    batchId: z.string().optional(),
    playlistId: z.string().nullable().optional(),
    title: z.string().trim().min(2).max(150),
    description: z.string().optional(),
    type: z.string().optional(),
    subject: z.string().optional(),
    topic: z.string().optional(),
    videoUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
  }),
});

export const updateRecordingSchema = z.object({
  body: z.object({
    playlistId: z.string().nullable().optional(),
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    subject: z.string().optional(),
    topic: z.string().optional(),
    videoUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
  }),
});