import env from "./config/env.js";
import app from "./app.js";
import connectDB from "./database/mongodb.js";
import logger from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      logger.info(`🚀 CAPACITY CONNECT Server started on port ${env.PORT}`);
      logger.info(`Environment : ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
