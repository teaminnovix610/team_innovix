import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory as well as current working directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/capacity_connect",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "capacity_connect_access_secret_2026",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "capacity_connect_refresh_secret_2026",

  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  JAAS_APP_ID: process.env.JAAS_APP_ID,
  JAAS_API_KEY_ID: process.env.JAAS_API_KEY_ID,
  JAAS_PRIVATE_KEY: process.env.JAAS_PRIVATE_KEY,

  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
  LIVEKIT_URL: process.env.LIVEKIT_URL,
  MEETING_PROVIDER: process.env.MEETING_PROVIDER || "jitsi",

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,

  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || "capacity_connect_reset_secret_2026",
  RESET_TOKEN_EXPIRY: process.env.RESET_TOKEN_EXPIRY || "10m",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default env;