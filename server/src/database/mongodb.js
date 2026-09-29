import mongoose from "mongoose";
import env from "../config/env.js";
import logger from "../config/logger.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);

    logger.info("MongoDB Connected");
    logger.info(`Database: ${connection.connection.name}`);
    logger.info(`Host: ${connection.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed");
    logger.error(error.message);

    process.exit(1);
  }
};

export default connectDB;
