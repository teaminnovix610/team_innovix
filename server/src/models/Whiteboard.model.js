import mongoose from "mongoose";
const { Schema } = mongoose;

const whiteboardSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "LiveClass",
      required: true,
      unique: true,
      index: true,
    },
    elements: {
      type: Schema.Types.Mixed, // Excalidraw's vector element array — appState is never persisted
      default: [],
    },
    updatedBy: {
      type: String, // device identity, e.g. "teacher-main"
    },
  },
  { timestamps: true } // gives us updatedAt (and createdAt) for free
);

export default mongoose.model("Whiteboard", whiteboardSchema);