import mongoose from "mongoose";

const skillGapSchema = new mongoose.Schema(
  {
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, default: "", trim: true },
    targetScore: { type: Number, default: 70 },
    currentScore: { type: Number, default: 0 },
    attemptsCount: { type: Number, default: 0 },
    gapSeverity: {
      type: String,
      enum: ["CRITICAL", "MODERATE", "LOW", "NONE"],
      default: "NONE",
    },
    recommendedResources: [
      {
        recordingId: { type: mongoose.Schema.Types.ObjectId, ref: "Recording", default: null },
        title: String,
        url: String,
        type: String,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

skillGapSchema.index({ traineeId: 1, subject: 1, topic: 1 }, { unique: true });

export default mongoose.model("SkillGap", skillGapSchema);
