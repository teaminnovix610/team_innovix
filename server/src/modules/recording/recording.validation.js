import { z } from "zod";

const batchIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "A valid course ID is required");

export const createRecordingSchema = z.object({
  body: z.object({
    batchId: batchIdSchema,
    playlistId: z.string().regex(/^[a-f\d]{24}$/i, "Playlist ID must be a valid ID").nullable().optional(),
    title: z.string().trim().min(2).max(150),
    description: z.string().optional(),
    type: z.enum(["RECORDED_LECTURE", "PRESENTATION", "STUDY_MATERIAL", "OTHER"]).optional(),
    subject: z.string().trim().min(1).optional(),
    topic: z.string().optional(),
    videoUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
  }),
});

export const updateRecordingSchema = z.object({
  body: z.object({
    playlistId: z.string().regex(/^[a-f\d]{24}$/i, "Playlist ID must be a valid ID").nullable().optional(),
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().optional(),
    type: z.enum(["RECORDED_LECTURE", "PRESENTATION", "STUDY_MATERIAL", "OTHER"]).optional(),
    subject: z.string().trim().min(1).optional(),
    topic: z.string().optional(),
    videoUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
  }),
});
