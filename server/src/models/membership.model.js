import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        plan: {
            type: String,
            enum: ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"],
            required: true,
        },

        fee: {
            type: Number,
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED"],
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Membership", membershipSchema);