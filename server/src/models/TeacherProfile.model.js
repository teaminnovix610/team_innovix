import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    qualification: String,

    experience: {
      type: Number,
      default: 0,
    },

    specialization: [
      {
        type: String,
      },
    ],

    bio: String,

    isApproved: {
      type: Boolean,
      default: false,
    },

    joinedAt: Date,

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Teacher", teacherSchema);