import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    traineeName: {
      type: String,
      required: true,
      trim: true,
    },
    traineeEmail: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: String,
      default: "A",
      trim: true,
    },
    score: {
      type: Number,
      default: 85,
    },
    issuedBy: {
      type: String,
      default: "Ministry of Earth Sciences (MoES)",
      trim: true,
    },
    status: {
      type: String,
      enum: ["ISSUED", "REVOKED"],
      default: "ISSUED",
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ traineeId: 1, courseId: 1 });

export default mongoose.model("Certificate", certificateSchema);
