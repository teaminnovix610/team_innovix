import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    questionText: { type: String, required: true },
    isLatex: { type: Boolean, default: false },
    imageUrl: { type: String, default: null },
    options: {
      type: [{ label: String, text: String }],
      validate: (v) => v.length >= 2,
    },
    correctAnswer: { type: String, required: true },
    marks: { type: Number, required: true, default: 1 },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);