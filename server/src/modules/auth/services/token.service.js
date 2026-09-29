import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../../../config/env.js";

class TokenService {

    generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            env.JWT_ACCESS_SECRET,
            {
                expiresIn: env.ACCESS_TOKEN_EXPIRY,
            }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                userId: user._id,
            },
            env.JWT_REFRESH_SECRET,
            {
                expiresIn: env.REFRESH_TOKEN_EXPIRY,
            }
        );
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    }

    getRefreshTokenExpiry() {
        const value = env.REFRESH_TOKEN_EXPIRY || "30d";
        const match = value.match(/^(\d+)([smhd])$/);

        if (!match) {
            // fallback: 30 days
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        const amount = Number(match[1]);
        const unit = match[2];

        const unitMs = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return new Date(Date.now() + amount * unitMs[unit]);
    }

    generateResetToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                purpose: "password-reset",
            },
            env.JWT_RESET_SECRET,
            {
                expiresIn: env.RESET_TOKEN_EXPIRY || "10m",
            }
        );
    }

    verifyResetToken(token) {
        const payload = jwt.verify(token, env.JWT_RESET_SECRET);

        if (payload.purpose !== "password-reset") {
            throw new Error("Invalid token purpose");
        }

        return payload;
    }

    // Refresh tokens are already high-entropy random JWTs (not human
    // passwords), so they don't need bcrypt's intentionally slow, salted
    // hashing — that cost only helps defend against guessing weak
    // human-chosen secrets. A fast SHA-256 digest is sufficient here:
    // brute-forcing a 256-bit token is infeasible regardless of hash speed.
    // This is what was silently costing ~300-800ms per login/refresh/logout
    // call when it went through bcrypt.hash(token, 12) instead.
    hashToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    // Constant-time comparison against a SHA-256 digest — avoids timing
    // side-channels without paying bcrypt's cost.
    compareToken(token, hash) {
        const incomingHash = Buffer.from(this.hashToken(token), "hex");
        const storedHash = Buffer.from(hash, "hex");

        if (incomingHash.length !== storedHash.length) {
            return false;
        }

        return crypto.timingSafeEqual(incomingHash, storedHash);
    }

}

export default new TokenService();