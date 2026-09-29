import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: String, default: null },
    status: { type: String, enum: ["ANSWERED", "SKIPPED"], default: "SKIPPED" },
  },
  { _id: false }
);

const guestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    classLevel: { type: String, required: true },
  },
  { _id: false }
);

const attemptSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    guest: { type: guestSchema, default: null },
    guestToken: { type: String, default: null, select: false },
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    startedAt: { type: Date, required: true },
    remainingTime: { type: Number, required: true },
    answers: [answerSchema],
    status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"], default: "IN_PROGRESS" },
    submittedAt: { type: Date },
    score: { type: Number },
    totalMarks: { type: Number },
    correctCount: { type: Number },
    wrongCount: { type: Number },
    skippedCount: { type: Number },
  },
  { timestamps: true }
);

attemptSchema.index({ studentId: 1, assessmentId: 1 });
attemptSchema.index({ "guest.phone": 1, assessmentId: 1 });

attemptSchema.pre("validate", function () {
  if (!this.studentId && !this.guest) {
    throw new Error("Attempt must belong to either a student or a guest");
  }
});

attemptSchema.statics.generateGuestToken = () => crypto.randomBytes(24).toString("hex");

export default mongoose.model("Attempt", attemptSchema);