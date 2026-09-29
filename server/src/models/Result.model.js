import mongoose from "mongoose";

const { Schema } = mongoose;

const resultSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", default: null },
    guest: {
      name: { type: String },
      phone: { type: String },
      classLevel: { type: String },
    },
    attemptId: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    skippedCount: { type: Number, required: true },
    percentage: { type: Number, required: true },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

resultSchema.index({ assessmentId: 1, score: -1 });
resultSchema.index({ assessmentId: 1, studentId: 1 });
resultSchema.index({ assessmentId: 1, "guest.phone": 1 });

export default mongoose.model("Result", resultSchema);