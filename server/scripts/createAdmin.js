import mongoose from "mongoose";
import dotenv from "dotenv";

import env from "../src/config/env.js";
import User from "../src/models/User.model.js";
import Admin from "../src/models/Admin.model.js";

dotenv.config();

async function createAdmin() {

    await mongoose.connect(env.MONGO_URI);

    const existing = await User.findOne({ email: "admin@CapacityConnect.com" });

    if (existing) {
        console.log("Admin already exists:", existing.email);
        process.exit(0);
    }

    const user = await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "ankitpatel22124@gmail.com",
        phone: "9519364716", // must be a valid Indian mobile format (starts with 6-9, 10 digits)
        password: "patel@123", // plain text here — pre-save hook hashes it automatically
        role: "ADMIN",
        isActive: true,
    });

    await Admin.create({
        userId: user._id,
    });

    console.log("Admin created:", user.email);

    process.exit(0);
}

createAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});