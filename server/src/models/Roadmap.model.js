import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    steps: [
      {
        order: { type: Number, required: true },
        title: { type: String, required: true },
        description: String,
        subject: String,
        topic: String,
        type: {
          type: String,
          enum: ["ASSESSMENT", "RESOURCE", "LIVE_CLASS", "PRACTICE"],
          default: "RESOURCE",
        },
        referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
        referenceUrl: String,
        isCompleted: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    generatedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);
