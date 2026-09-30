import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import logger from "./config/logger.js";
import routes from "./routes/index.js";
import { globalLimiter } from "./shared/middleware/rateLimit.middleware.js";
import verifyOrigin from "./shared/middleware/verifyOrigin.middleware.js";

const app = express();

// Railway (and most hosts) put your app behind a reverse proxy, so
// req.ip would otherwise report the proxy's IP for every request —
// making IP-based rate limiting useless (everyone would share one
// bucket). This tells Express to trust the X-Forwarded-For header so
// rate limiting (and any other IP-based logic) sees the real client IP.
app.set("trust proxy", 1);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Compression
app.use(compression());

// CORS
app.use(
  cors({
    origin: ["https://CapacityConnect.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);

// CSRF mitigation — rejects state-changing requests whose Origin header
// doesn't match our known frontends. Needed because our cookies use
// sameSite: "none" (required for the cross-domain Vercel<->Railway
// setup), which otherwise lets any site's browser-driven request carry
// a logged-in user's cookies.
app.use(verifyOrigin);

// Parse JSON
app.use(express.json({ limit: "5mb" }));

// Parse Form Data
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Cookies
app.use(cookieParser());

// Global rate limit — a loose ceiling across all /api/v1 routes.
// Specific, tighter limiters (login, OTP) are applied per-route in
// auth.routes.js on top of this.
app.use("/api/v1", globalLimiter);

app.use("/api/v1", routes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CapacityConnect API Running 🚀"
    });
});

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

app.use(notFound);
app.use(errorHandler);

export default app;