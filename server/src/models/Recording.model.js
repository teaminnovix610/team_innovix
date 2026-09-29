import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["RECORDED_LECTURE", "PRESENTATION", "STUDY_MATERIAL", "OTHER"],
      default: "RECORDED_LECTURE",
    },

    subject: {
      type: String,
      default: "General",
      trim: true,
    },

    topic: {
      type: String,
      default: "",
      trim: true,
    },

    youtubeVideoId: {
      type: String,
      default: null,
    },

    youtubeUrl: {
      type: String,
      default: null,
    },

    videoUrl: {
      type: String,
      default: null,
    },

    fileUrl: {
      type: String,
      default: null,
    },

    order: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PUBLISHED", "UNPUBLISHED"],
      default: "PUBLISHED",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Recording", recordingSchema);
