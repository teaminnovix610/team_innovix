import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Pulls a normalized identifier (email/phone/account) off the body so we
 * can key limiters by "account being targeted", not just IP. Falls back
 * to "unknown" if missing/malformed so the limiter never throws before
 * validation middleware runs.
 */
function getAccountKey(req, field = "email") {
    const value = req.body?.[field];
    return typeof value === "string" ? value.trim().toLowerCase() : "unknown";
}

/* ------------------------------------------------------------------ */
/* LOGIN — two-tier: per-account brute force + per-IP spraying ceiling */
/* ------------------------------------------------------------------ */

// Layer 1: IP + email bucket. Stops brute-forcing one specific account,
// and (since it's not pure-IP) prevents students on shared/campus WiFi
// from draining each other's attempt count.
function loginKeyGenerator(req) {
    return `${ipKeyGenerator(req)}:${getAccountKey(req, "email")}`;
}

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    keyGenerator: loginKeyGenerator,
    // Only failed attempts erode the bucket — a user who mistypes a
    // couple of times then succeeds shouldn't be penalized for it later.
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts for this account. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Layer 2: pure IP bucket. Catches an attacker spraying guesses across
// thousands of different emails from one IP — Layer 1 alone can't see
// this pattern since each email gets its own bucket.
export const loginIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: ipKeyGenerator,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts from this network. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/* ------------------------------------------------------------------ */
/* OTP VERIFY — two-tier: per-account guessing + per-IP ceiling        */
/* ------------------------------------------------------------------ */

// Layer 1: IP + account. A 6-digit OTP (1M combinations) is brute-forceable
// quickly without a strict per-account limit on verify attempts.
function otpKeyGenerator(req) {
    return `${ipKeyGenerator(req)}:${getAccountKey(req, "email")}`;
}

export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: otpKeyGenerator,
    message: {
        success: false,
        message: "Too many attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Layer 2: pure IP ceiling, looser — catches an attacker cycling through
// many different accounts' OTPs from one IP, without penalizing a whole
// shared network (e.g. college WiFi) the way a tight pure-IP limit would.
export const otpIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    keyGenerator: ipKeyGenerator,
    message: {
        success: false,
        message: "Too many attempts from this network. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/* ------------------------------------------------------------------ */
/* FORGOT PASSWORD — two-tier: per-account spam + per-IP ceiling       */
/* ------------------------------------------------------------------ */

// Layer 1: IP + account. forgot-password spam costs real email-sending
// quota/money, so keep this tight per target account.
function forgotPasswordKeyGenerator(req) {
    return `${ipKeyGenerator(req)}:${getAccountKey(req, "email")}`;
}

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: forgotPasswordKeyGenerator,
    message: {
        success: false,
        message: "Too many password reset requests for this account. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Layer 2: pure IP ceiling — catches an attacker automating reset
// requests across many different email addresses from one IP.
export const forgotPasswordIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    keyGenerator: ipKeyGenerator,
    message: {
        success: false,
        message: "Too many password reset requests from this network. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/* ------------------------------------------------------------------ */
/* RESET PASSWORD — lower stakes (requires a valid resetToken already) */
/* ------------------------------------------------------------------ */

export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: ipKeyGenerator,
    message: {
        success: false,
        message: "Too many attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/* ------------------------------------------------------------------ */
/* GLOBAL — loose safety net for every other /api/v1 route            */
/* ------------------------------------------------------------------ */

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    keyGenerator: ipKeyGenerator,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});