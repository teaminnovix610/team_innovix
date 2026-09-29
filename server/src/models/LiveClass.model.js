import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        meeting: {
            provider: {
                type: String,
                enum: ["JITSI", "LIVEKIT"],
                default: "JITSI",
            },

            roomName: {
                type: String,
                required: true,
                unique: true,
            },

            joinUrl: {
                type: String,
                required: false,
            },
        },

        scheduledAt: {
            type: Date,
            required: true,
        },

        duration: {
            type: Number,
            required: true, // minutes
        },

        status: {
            type: String,
            enum: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"],
            default: "SCHEDULED",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("LiveClass", liveClassSchema);