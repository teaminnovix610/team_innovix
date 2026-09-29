import mongoose from "mongoose";

const { Schema } = mongoose;

const assessmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["weekly", "chapter", "unit", "monthly", "mock", "practice", "homework", "scholarship", "subject"],
      default: "subject",
    },
    audience: { type: String, enum: ["BATCH", "PUBLIC", "ALL"], default: "ALL" },
    subject: { type: String, required: true },

    classLevel: { type: String },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch" },

    classRange: {
      min: { type: Number },
      max: { type: Number },
    },

    teacherId: { type: Schema.Types.ObjectId, ref: "TeacherProfile", required: true },
    duration: { type: Number, default: null },
    totalMarks: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    deadline: { type: Date, default: null },
    attemptsAllowed: { type: Number, default: 1 },
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      marksPerWrong: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "CLOSED"], default: "DRAFT" },
  },
  { timestamps: true }
);

assessmentSchema.index({ batchId: 1, status: 1 });
assessmentSchema.index({ audience: 1, status: 1 });
assessmentSchema.index({ teacherId: 1, status: 1 });

export default mongoose.model("Assessment", assessmentSchema);