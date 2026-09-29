import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        classLevel: {
            type: String,
            required: true,
            trim: true,
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        description: {
            type: String,
            default: "Capacity building and technical competency training program.",
            trim: true,
        },

        category: {
            type: String,
            default: "Earth Sciences",
            trim: true,
        },

        durationHours: {
            type: Number,
            default: 30,
        },

        syllabus: [
            {
                type: String,
            },
        ],

        capacity: {
            type: Number,
            default: 100,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Batch", batchSchema);