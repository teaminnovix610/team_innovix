import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    traineeName: {
      type: String,
      default: "Trainee",
    },
    courseTitle: {
      type: String,
      required: true,
      default: "Capacity Building Course",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["COURSE", "TRAINER", "RESOURCE", "ASSESSMENT", "GENERAL"],
      default: "COURSE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema);
