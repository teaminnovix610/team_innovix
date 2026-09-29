import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["ANNOUNCEMENT", "ACHIEVEMENT", "FEATURED_CONTENT", "NOTIFICATION"],
      default: "ANNOUNCEMENT",
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    authorName: {
      type: String,
      default: "Admin / MoES Cell",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Announcement", announcementSchema);
