import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Some deployed databases retain a unique teacherCode index. Always
    // populate it so newly created profiles never collide on a null value.
    teacherCode: {
      type: String,
      required: true,
      unique: true,
      default: () => `TCH-${new mongoose.Types.ObjectId().toString()}`,
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
